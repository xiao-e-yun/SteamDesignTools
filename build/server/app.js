"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jimp_1 = __importDefault(require("jimp"));
const path_1 = __importDefault(require("path"));
const root_path = path_1.default.join(__dirname, '../');
const tmp_path = path_1.default.join(root_path + "tmp/");
const config_path = path_1.default.join(root_path + "config.json");
class default_1 {
    constructor() {
        this.steam_profile_size = {
            0: { name: "精選藝術作品展示欄", value: 630 },
            1: { name: "藝術作品展示欄", value: 615 },
        };
    }
    resize(type, imgs) {
        const size = this.steam_profile_size[type];
        imgs.forEach(data => {
            const base64str = data.data.split(",")[1];
            const buf = Buffer.from(base64str, 'base64');
            jimp_1.default.read(buf, (err, image) => {
                if (err)
                    throw err;
                else {
                    if (image.bitmap.width !== size.value)
                        image.resize(size.value, jimp_1.default.AUTO);
                    tmp_path + "";
                    image.write(tmp_path + data.name);
                }
            });
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=app.js.map