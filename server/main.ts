import { promises as fs } from "fs"
import Jimp from "jimp"
import { config, path, worker, hash, create_browser} from "./utils"
import _ws from "./websocket"
import { basename } from "path"
import { exec } from "child_process"
import isPortReachable from "is-port-reachable"

// 監聽並回傳
export default function (ws: _ws) {
    ws.on("upload_config", async ($data) => config($data.data))
    ws.on("config", async () => { return config() })
    ws.on("get_file",() => {
        return new Promise((resolve) => exec(`${path("launch")} choose_image`,
        (e, stdout) => resolve(JSON.parse(stdout))))
    })

    ws.on("build", async ($data) => {
        const wait_clear = clear_output()

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
                        ws.send("logger", {
                            title: "下載圖片失敗",
                            content: "請檢查網址是否正確",
                        })
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
                case 2: {//工作坊展示欄
                    // width 1920 height any
                    // cut x 489 y 380 
                    // cut w 628 h any - 380
                    // cut main 630
                    const bg_hight = image.bitmap.height
                    const cut_bg = await Jimp.read(628, bg_hight - 380)
                    cut_bg.composite(image, -489, -380)
                    bg.buffer = await cut_bg.getBufferAsync(cut_bg.getMIME())
                    break
                }
            }
        }

        console.log("構建選項:", data.option)
        await wait_clear //等待 output 刪除檔案
        await worker("build", data.option, data.imgs.map(img => { return { name: img.name, data: img.data, } }))

        console.log("構建完成")
        exec(`start explorer "${path("output")}"`)

        return true
    })

    ws.on("compression", async ($data) => {
        const wait_clear = clear_output()
        const data = $data.data

        
        console.log("壓縮選項:", data.option)
        await wait_clear //等待 output 刪除檔案
        await worker("compression", data.option, data.imgs)

        console.log("壓縮完成")
        exec(`start explorer "${path("output")}"`)

        return true
    })

    //上傳藝術作品
    ws.on('login_steam',($data)=>{
        return new Promise(async(resolve)=>{
            const data = $data.data
            const host = "https://steamcommunity.com"
            const url = host + "/login/"
            const browser = await create_browser()
            const page = await browser.newPage()
            
            await page.goto(url);

            let inputs:Promise<string>[] = []
            for (const key of ["username","password"]) {
                const val = (data as {[input:string]:string})[key]
                const req = page.$eval('#input_' + key, (el, value) => (el as HTMLInputElement).value = value as string, val)
                inputs.push(req)
            }
            (await page.$("#remember_login"))?.click()

            //輸入帳號密碼
            Promise.all(inputs)
            .then(async()=>(await page.$("#login_btn_signin>button"))?.click());

            page.waitForNavigation().then(async()=>{
                //轉址等同成功
                await save()
                resolve({
                    success:true,
                    guard:{need:false}
                })
            }).catch(()=>{})

            page.waitForSelector(".loginTwoFactorCodeModal",{
                visible:true
            }).then(()=>{
                const get = "login_guard$" + hash()
                ws.on(get as "login_guard",async(data)=>{
                    await page.$eval("#twofactorcode_entry",(el,val)=>{
                        (el as HTMLInputElement).value = val as string
                    },data.data);

                    const selector = `#login_twofactorauth_buttonset_entercode>[data-modalstate="submit"]`;
                    (await page.$(selector))?.click()

                    let success = true
                    await page.waitForNavigation({
                        timeout:10000
                    }).catch(()=>success = false)
                    
                    if(success){
                        ws.off(get as "login_guard")
                        await save()
                    }
                    return { success }
                })
                resolve({
                    success:true,
                    guard:{get,need:true}
                })

            }).catch(()=>{})

            async function save() {
                const $config = await config("cookies") || {}
                $config[data.username] = await page.cookies()
                config([{
                    key:"cookies",
                    val:$config
                }])
                browser.close()
            }
        })
    })
    
    ws.on('upload_artwork',async (req)=>{
        const data = req.data
        let port = 21871
        while (true) {
            if (!await isPortReachable(port, { host: '127.0.0.1' })) break
            port++
        }
        const browser = await create_browser({
            args:["--remote-debugging-port=" + port.toString()]
        })
        const page = await browser.newPage()

        const all_cookies = await config("cookies")
        const cookies = all_cookies[data.username]
        await page.setCookie(...cookies)

        const url = "https://steamcommunity.com/sharedfiles/edititem/767/3/"
        await page.goto(url)
                
        const success = page.url().includes(url)?true:false
        console[success?"log":"warn"](success?"登錄成功":"登錄失敗")
        if(!success){
            delete all_cookies[data.username]
            config([{
                key:"cookies",
                val:all_cookies,
            }])
            return {success:false,error:"Not_logged_in"}
        }

        const options = {
            ...data.option,
            port,
        }
        await worker("upload_artwork", options, req.data.files)
        browser.close()
        return {success:true}
    })
}

async function clear_output() {
    if (await config("before_clear_output") === false) return
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
    return Promise.all(output.wait)
}