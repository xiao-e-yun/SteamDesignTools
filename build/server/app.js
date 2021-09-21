"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const utils_1 = require("./utils");
// 功能實現
class default_1 {
    constructor() {
        this.steam_profile_size = [
            { name: "精選藝術作品展示欄", value: 630 },
            { name: "藝術作品展示欄", value: 615 },
        ];
    }
    async build(data) {
        const size = this.steam_profile_size[data.option.main];
        const new_imgs = imgs.map(img => {
            return {
                size,
                name: img.name,
                base64img: img.data,
            };
        });
        return this.worker("build", option, new_imgs);
    }
    worker(type, option, data) {
        let thread_count = 5;
        console.log("多線程處理:" + data.length);
        const worker_threads = [];
        while (thread_count > 0) {
            const take = Math.floor(data.length / thread_count);
            const worker_data = data.splice(0, take);
            thread_count--;
            if (worker_data.length === 0) {
                if (data.length === 0)
                    break;
                continue;
            }
            worker_threads.push(new Promise((resolve) => {
                new worker_threads_1.Worker(utils_1.path("server", "threads.js"), { workerData: { type, data: { option, imgs_data: worker_data } } })
                    .on("exit", (e) => resolve(e));
            }));
        }
        return Promise.all(worker_threads);
    }
}
exports.default = default_1;
//# sourceMappingURL=app.js.map