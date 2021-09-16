import jimp from 'jimp';
import path from 'path';

const root_path = path.join(__dirname, '../')
const tmp_path = path.join(root_path + "tmp/")
const config_path = path.join(root_path + "config.json")
export default class {
    constructor() {

    }
    resize(type: number, imgs: {
        name: string;
        data: string;
    }[]) {
        const size = this.steam_profile_size[type]
        imgs.forEach(data => {
            const base64str = data.data.split(",")[1]
            const buf = Buffer.from(base64str, 'base64');

            jimp.read(buf, (err, image) => {
                if (err) throw err;
                else {
                    if (image.bitmap.width !== size.value) image.resize(size.value, jimp.AUTO)
                    tmp_path + ""
                    image.write(tmp_path + data.name)
                }
            })
        })
    }
    private steam_profile_size = {
        0: { name: "精選藝術作品展示欄", value: 630 },
        1: { name: "藝術作品展示欄", value: 615 },
    } as { [key: number]: { name: string, value: number } }
}