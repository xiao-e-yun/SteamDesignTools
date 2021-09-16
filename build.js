const exec = require('child_process').exec

console.log("原始檔編譯中")

exec(`tsc -p " + __dirname + "server/tsconfig.json`,done)

process.cwd(__dirname + "view")
console.log(__dirname)
exec(`npx vue-cli-service build --mode production --dest ../build/www --target app --modern --fix`,done)

let i = 0
function done(e, stdout, stderr) {
    if(i === 0) return i++
    process.cwd(__dirname)
    console.log(e?stderr:stdout)
    console.log("原始檔編譯完成")
    console.log("二進制編譯中")
    exec("pkg package.json -C=GZip -o=SteamDesignTools_has_console",()=>{
        console.log("二進制編譯完成")
        exec("create-nodew-exe SteamDesignTools_has_console.exe SteamDesignTools.exe",()=>{
            console.log("修改全部完成")
        })
    })
}