"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(ws, app) {
    ws.on("resize", (data) => {
        app.resize(data.data.type, data.data.imgs);
    });
}
exports.default = default_1;
//# sourceMappingURL=main.js.map