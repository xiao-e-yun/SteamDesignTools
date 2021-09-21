import { promises as fs } from "fs"
import Jimp from "jimp"
import { path, worker } from "./utils"
import _ws from "./websocket"
import { basename } from "path"
import { exec } from "child_process"

// 監聽並回傳
export default function (ws: _ws) {
    ws.on("build", async ($data) => {
        console.log("清空output")
        const output = {
            path: path("output"),
            files: [] as string[],
            wait: [] as Promise<void>[],
        }
        output.wait.push(
            fs.readdir(output.path)
                .then((files) => {
                    for (const file of files) { output.wait.push(fs.unlink(path("output", file))) }
                })
                .catch(() => {
                    output.wait.push(fs.mkdir(output.path))
                })
        )


        console.log("設置構建")
        const data = $data.data
        const bg = data.option.background
        if (bg.url !== "") {
            const name = basename(bg.url)
            console.log("讀取背景圖片:", name)
            const tmp_path = path("tmp", "build_tmp$" + name)
            const image = await fs.access(tmp_path)
                .then(async () => { return await Jimp.read(tmp_path) })
                .catch(async () => {
                    console.log("正在下載圖片", bg.url)
                    return await Jimp.read(bg.url).then(img => {
                        img.writeAsync(tmp_path)
                        return img
                    }).catch(() => {
                        console.warn("下載圖片失敗")
                        return false
                    })
                })

            if (typeof image === "boolean") return false // 幹，沒有讀到圖片

            //thx https://github.com/sapic/sapic/blob/fc79d64bbf5d6342edc137b568813340629d7bba/src/store/index.js#L139
            //調整圖片
            switch (data.option.main) {
                case 0: {//藝術作品展示欄
                    // width 1920 height any
                    // cut x 494 y 256 
                    // cut w 615 h any - 256
                    // cut left 506 right 100
                    const bg_hight = image.bitmap.height
                    const cut_bg = await Jimp.read(615, bg_hight - 256)
                    cut_bg.composite(image, -494, -256)
                    bg.buffer = await cut_bg.getBufferAsync(cut_bg.getMIME())
                    break
                }
                case 1: {//精選藝術作品展示欄
                    // width 1920 height any
                    // cut x 494 y 256 
                    // cut w 630 h any - 256
                    // cut main 630
                    const bg_hight = image.bitmap.height
                    const cut_bg = await Jimp.read(630, bg_hight - 256)
                    cut_bg.composite(image, -494, -256)
                    bg.buffer = await cut_bg.getBufferAsync(cut_bg.getMIME())
                    break
                }
            }
        }

        console.log("構建選項:", data.option)
        await Promise.all(output.wait) //等待 output 刪除檔案
        await worker("build", data.option, data.imgs.map(img => { return { name: img.name, base64img: img.data, } }))

        console.log("構建完成")
        exec(`start explorer "${path("output")}"`)

        return true
    })
}