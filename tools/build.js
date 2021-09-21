const $exec = require('child_process').exec
const $fs = require('fs')
const fs = $fs.promises

process.chdir(__dirname+"/../")

console.log("原始檔編譯中")

exec("tsc -p " + "./server/tsconfig.json").then(done)

exec(`npx vue-cli-service build --mode production --dest ../build/www --target app --modern --fix`,{cwd:"./view"}).then(done)

fs.readdir("./lib").then((files)=>{
    files.map(file => {
        return fs.copyFile("./lib/" + file, "./build/lib/" + file)
    })
    Promise.all(files).then(() => done({error:"", stdout:"", stderr:""}))
})

let i = 0
async function done({error, stdout, stderr}) {
    console.log(error, "\n\n\n", stderr, "\n\n\n", stdout)
    if (i < 2) return i++
    console.log("原始檔編譯完成")
    console.log("二進制編譯中")
    await exec("pkg package.json -o=dist/SteamDesignTools_has_console")

    console.log("二進制編譯完成")
    await exec("create-nodew-exe SteamDesignTools_has_console.exe SteamDesignTools.exe",{cwd:"./dist"})
    await exec(`../tools/ResourceHacker.exe -open SteamDesignTools.exe -save SteamDesignTools.exe -action addoverwrite -res ../logo.ico -mask ICONGROUP,1`,{cwd:"./dist"})
    await exec(`ie4uinit.exe -ClearIconCache -show`,{cwd:"./dist"})
}

function exec(cmd,options) {
    return new Promise((resolve) => {
        $exec(cmd,options, (error, stdout, stderr) => {
            resolve({error, stdout, stderr})
        })
    })
}