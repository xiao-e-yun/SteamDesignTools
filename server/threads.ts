import { workerData } from 'worker_threads'
import { WorkerDataType } from 'VS/protocol'
import { hash, path } from './utils'
import { extname, basename } from "path"
import Jimp from 'jimp'
import { exec as $exec } from 'child_process'
import { writeFile } from 'fs/promises'
import puppeteer from "puppeteer-core"

// 多線程運算
(async ($type: keyof WorkerDataType) => {
    const worker_data = workerData.data as unknown
    type SwitchDataType<T extends typeof $type = typeof $type> = WorkerDataType[T]["worker"]

    switch ($type) {
        case "build": {
            const { option: $option, data: $data } = worker_data as SwitchDataType<typeof $type>
            for (const data of $data) {
                let img: Jimp
                if ($option.base64) img = await decode_image(data.data).catch(e => { throw e }) //base64
                else img = await Jimp.read(data.data).catch(e => { throw e }) // url
                img.resize($option.size, Jimp.AUTO)
                if ($option.background.buffer) { //有背景
                    const burff = Buffer.from($option.background.buffer as Uint8Array)
                    const bg = await Jimp.read(burff).catch(e => { throw e })
                    const canvas = await Jimp.read($option.size, img.bitmap.height, "#000")
                    canvas.composite(bg, 0, 0)
                    canvas.composite(img, 0, 0)
                    img = canvas
                }

                //
                if ($option.auto_cut === false) return save(path("output", data.name), img)
                switch ($option.main) {
                    case (0): {
                        const height = img.bitmap.height
                        const left_img = img.clone().crop(0, 0, 506, height)
                        const right_img = img.crop(515, 0, 100, height + ($option.right_more_img_clip ? -70 : 0))

                        const $extname = extname(data.name)
                        const $basename = basename(data.name, $extname)

                        save(path("output", $basename + "$left" + $extname), left_img)
                        save(path("output", $basename + "$right" + $extname), right_img)
                        break;
                    }
                    case (2): {
                        const height = img.bitmap.height
                        const $extname = extname(data.name)
                        const $basename = basename(data.name, $extname)
                        let $img = img
                        let offset = 0
                        for (let i = 1; i <= 5; i++) {
                            const img = i === 5 ? $img : $img.clone()
                            const clip_width = 122
                            if (i !== 1) offset += 126
                            img.crop(offset, 0, clip_width, height)
                            save(path("output", $basename + "$" + (i.toString()) + $extname),img)
                        }
                        break;
                    }
                    default: save(path("output", data.name), img)
                }
            }
            break;
        }
        case "compression": {
            const { option: $option, data: $data } = worker_data as SwitchDataType<typeof $type>
            const pngquant = path("lib", "pngquant.exe")
            for (const data of $data) {
                const out = path("output", data.name)

                if ($option.base64) {
                    const img = await decode_image(data.data).catch(e => { throw e }) //base64
                    if (img.getMIME() === Jimp.MIME_JPEG) {
                        await save(out, img.quality($option.quality[1]) as Jimp)
                    } else if ($option.base64) {
                        const tmp = path("tmp", "compression$" + data.name)
                        await save(tmp, img)
                        await exec(tmp, out)
                    }
                } else {
                    const extension = extname(data.name)
                    if (extension === ".png") await exec(data.data, out)
                    else if (extension === ".jpg" || extension === ".jpeg") {
                        const img = await Jimp.read(data.data).catch(e => { throw e })
                        await save(out, img.quality($option.quality[1]) as Jimp)
                    }
                }
            }

            function exec(tmp_path: string, output_path: string): Promise<void> {
                const quality = $option.quality[0] + "-" + $option.quality[1]
                const speed = $option.speed
                return new Promise(resolve => {
                    const cmd = `\"${pngquant}\" --quality=${quality} --speed=${speed} - < \"${tmp_path}\" > \"${output_path}\"`
                    $exec(cmd, { encoding: 'utf8' },
                        (e, _s, stderr) => {
                            if (e) console.error(e, stderr)
                            resolve()
                        })
                })
            }
            break;
        }
        case "upload_artwork": {
            const { option: $option, data: $data } = worker_data as SwitchDataType<typeof $type>

            const browserURL = 'http://127.0.0.1:' + $option.port.toString();
            const browser = await puppeteer.connect({browserURL})

            for (const item of $data) {
                let $path:string
                if($option.base64){
                    const img = await decode_image(item.data)
                    $path = path("tmp",hash()+extname(item.name))
                    await img.writeAsync($path)
                }
                else $path = item.data

                const page = await browser.newPage()
                await page.goto("https://steamcommunity.com/sharedfiles/edititem/767/3/")
                let control = [] as Promise<any>[]
                control.push(page.$eval("#title",(el,val)=>(el as HTMLInputElement).value = val as string,item.name))
                control.push((await page.$("#file"))?.uploadFile($path) as Promise<void>)
                control.push((await page.$("#agree_terms"))?.click() as Promise<void>)
                await Promise.all(control)
                await page.evaluate((type)=>{
                    switch(type as string){
                        //Typescript :3
                        case("artwork"):{
                            //@ts-ignore
                            $J('#image_width').val(1000),$J('#image_height').val(1)
                            break
                        }
                        case("screenshot"):{
                            //@ts-ignore
                            $J('#image_width').val(1000),$J('#image_height').val(1),$J('[name=file_type]').val(5)
                            break
                        }
                        case("workshop"):{
                            //@ts-ignore
                            $J('[name=consumer_app_id]').val(480),$J('[name=file_type]').val(0),$J('[name=visibility]').val(0)
                            break
                        }
                    }
                    
                    //@ts-ignore
                    SubmitItem(false)
                },$option.type)
                await page.waitForNavigation().catch(()=>{})
                await page.screenshot({path:item.name + "$upload_artwork.png"})
                await page.close()
            }
            browser.disconnect()
            break
        }
    }
})(workerData.type)

async function save(path: string, img: Jimp | Buffer): Promise<void> {
    let buffer: Buffer
    let is_png: boolean
    if (img instanceof Buffer) {
        is_png = img.slice(0, 8) === Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
        buffer = img
    } else {
        const mime = img.getMIME()
        is_png = mime === Jimp.MIME_PNG
        buffer = await img.getBufferAsync(mime)
    }
    const tranparent_buffer = Buffer.from(is_png ? [0x01, 0x49, 0x45, 0x4E, 0x44, 0x00, 0xD1, 0x1A, 0x4F, 0xE1] : [0x2C])
    await writeFile(path, Buffer.concat([buffer.slice(0,is_png ? -9 : -1), tranparent_buffer]))
}

async function decode_image(base64img: string) {
    const base64str = base64img.split(",")[1]
    const buf = Buffer.from(base64str, 'base64');
    return await Jimp.read(buf)
}