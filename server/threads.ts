import { workerData } from 'worker_threads'
import DataType from 'VS/protocol'
import { path } from './utils'
import { extname, basename } from "path"
import Jimp from 'jimp'

// 多線程運算
(async()=>{
    const $type = workerData.type as keyof DataType
    const { option:$option, data:$data } = workerData.data as DataType[typeof $type]["worker"]
    switch ($type) {
        case "build":{
            for (const data of $data) {                
                let img = await decode_image(data.base64img).catch(e=>{throw e})
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
                    const right_img = img.crop(515,0,100,height)

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
    }
})()



async function decode_image(base64img:string) {
    const base64str = base64img.split(",")[1]
    const buf = Buffer.from(base64str, 'base64');
    return await Jimp.read(buf)
}