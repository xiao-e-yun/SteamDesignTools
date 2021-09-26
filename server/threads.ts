import { workerData } from 'worker_threads'
import { WorkerDataType } from 'VS/protocol'
import { hash, path } from './utils'
import { extname, basename } from "path"
import Jimp from 'jimp'
import { exec as $exec } from 'child_process'

// 多線程運算
(async($type:keyof WorkerDataType)=>{
    const worker_data = workerData.data as unknown
    switch ($type) {
        case "build":{
            const { option:$option, data:$data } = worker_data as WorkerDataType[typeof $type]
            for (const data of $data) {                
                let img:Jimp
                if($option.base64) img = await decode_image(data.data).catch(e=>{throw e}) //base64
                else img = await Jimp.read(data.data).catch(e=>{throw e}) // url
                img.resize($option.size,Jimp.AUTO)
                if($option.background.buffer){ //有背景
                    const burff = Buffer.from($option.background.buffer as Uint8Array)
                    const bg = await Jimp.read(burff).catch(e=>{throw e})
                    const canvas = await Jimp.read($option.size,img.bitmap.height,"#000")
                    canvas.composite(bg, 0, 0)
                    canvas.composite(img,0,0)
                    img = canvas
                }

                //
                if($option.main === 0 && $option.auto_cut){
                    const height = img.bitmap.height
                    const left_img = img.clone().crop(0,0,506,height)
                    const right_img = img.crop(515,0,100,height + ($option.right_more_img_clip?-70:0))

                    const $extname = extname(data.name)
                    const $basename = basename(data.name,$extname)

                    left_img.writeAsync(path("output",$basename+"$left"+$extname))
                    right_img.writeAsync(path("output",$basename+"$right"+$extname))
                }else{
                    img.writeAsync(path("output",data.name))
                }
            }
            break;
        }
        case "compression":{
            const { option:$option, data:$data } = worker_data as WorkerDataType["compression"]
            const pngquant = path("lib","pngquant.exe")
            for (const data of $data) {                
                const tmp = path("tmp","compression$" + data.name)
                const out = path("output",data.name )

                let img:Jimp
                if($option.base64) img = await decode_image(data.data).catch(e=>{throw e}) //base64
                else img = await Jimp.read(data.data).catch(e=>{throw e}) // url
                if(img.getMIME() === Jimp.MIME_JPEG){
                    await img.quality($option.quality[1]).writeAsync(out)
                }else{
                    await img.writeAsync(tmp)
                    await exec(tmp,out)
                }
            }

            function exec(tmp_path:string,output_path:string):Promise<void> {
                const quality = $option.quality[0] + "-" + $option.quality[1]
                const speed = $option.speed
                return new Promise(resolve=>{
                    const cmd = `\"${pngquant}\" --quality ${quality} --speed ${speed} - < \"${tmp_path}\" > \"${output_path}\"`
                    $exec(cmd,{ encoding: 'utf8' },
                    (e,s,stderr)=>{
                        if(e) console.error(e,stderr)
                        resolve()
                    })
                })
            }
            break;
        }
    }
})(workerData.type)



async function decode_image(base64img:string) {
    const base64str = base64img.split(",")[1]
    const buf = Buffer.from(base64str, 'base64');
    return await Jimp.read(buf)
}