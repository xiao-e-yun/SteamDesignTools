"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const jimp_1 = __importDefault(require("jimp"));
const utils_1 = require("./utils");
const path_1 = require("path");
const child_process_1 = require("child_process");
// 監聽並回傳
function default_1(ws) {
    ws.on("build", async ($data) => {
        console.log("清空output");
        const output = {
            path: utils_1.path("output"),
            files: [],
            wait: [],
        };
        output.wait.push(fs_1.promises.readdir(output.path)
            .then((files) => {
            for (const file of files) {
                output.wait.push(fs_1.promises.unlink(utils_1.path("output", file)));
            }
        })
            .catch(() => {
            output.wait.push(fs_1.promises.mkdir(output.path));
        }));
        console.log("設置構建");
        const data = $data.data;
        const bg = data.option.background;
        if (bg.url !== "") {
            const name = path_1.basename(bg.url);
            console.log("讀取背景圖片:", name);
            const tmp_path = utils_1.path("tmp", "build_tmp$" + name);
            const image = await fs_1.promises.access(tmp_path)
                .then(async () => { return await jimp_1.default.read(tmp_path); })
                .catch(async () => {
                console.log("正在下載圖片", bg.url);
                return await jimp_1.default.read(bg.url).then(img => {
                    img.writeAsync(tmp_path);
                    return img;
                }).catch(() => {
                    console.warn("下載圖片失敗");
                    return false;
                });
            });
            if (typeof image === "boolean")
                return false; // 幹，沒有讀到圖片
            //thx https://github.com/sapic/sapic/blob/fc79d64bbf5d6342edc137b568813340629d7bba/src/store/index.js#L139
            //調整圖片
            switch (data.option.main) {
                case 0: { //藝術作品展示欄
                    // width 1920 height any
                    // cut x 494 y 256 
                    // cut w 615 h any - 256
                    // cut left 506 right 100
                    const bg_hight = image.bitmap.height;
                    const cut_bg = await jimp_1.default.read(615, bg_hight - 256);
                    cut_bg.composite(image, -494, -256);
                    bg.buffer = await cut_bg.getBufferAsync(cut_bg.getMIME());
                    break;
                }
                case 1: { //精選藝術作品展示欄
                    // width 1920 height any
                    // cut x 494 y 256 
                    // cut w 630 h any - 256
                    // cut main 630
                    const bg_hight = image.bitmap.height;
                    const cut_bg = await jimp_1.default.read(630, bg_hight - 256);
                    cut_bg.composite(image, -494, -256);
                    bg.buffer = await cut_bg.getBufferAsync(cut_bg.getMIME());
                    break;
                }
            }
        }
        console.log("構建選項:", data.option);
        await Promise.all(output.wait); //等待 output 刪除檔案
        await utils_1.worker("build", data.option, data.imgs.map(img => { return { name: img.name, base64img: img.data, }; }));
        console.log("構建完成");
        child_process_1.exec(`start explorer "${utils_1.path("output")}"`);
        return true;
    });
}
exports.default = default_1;
//# sourceMappingURL=main.js.map