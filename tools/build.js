const $exec = require('child_process').exec
const $fs = require('fs')
const fs = $fs.promises;

(async()=>{
    process.chdir(__dirname+"/../")
    const has = await fs.readdir(".")
    if (has.indexOf("dist") == -1)  await fs.mkdir("dist")
    else {await fs.rmdir("dist", {recursive: true});await fs.mkdir("dist")}
    if (has.indexOf("build") == -1)  await fs.mkdir("build")
    if ((await fs.readdir("./build")).indexOf("lib") == -1)  await fs.mkdir("build/lib")
    
    console.log("原始檔編譯中")

    const promise = []
    promise.push(
        exec("tsc -p " + "./server/tsconfig.json").then($done),
        exec(`npm run lint && npx vue-cli-service build --mode production --dest ../build/www --target app --modern --fix`,{cwd:"./view"}).then($done),
        fs.readdir("./lib").then((files)=>{
            files.map(file => {
                return fs.copyFile("./lib/" + file, "./build/lib/" + file)
            })
            Promise.all(files)
        }),
    )

    Promise.all(promise).then(done)
    function $done({error,stderr,stdout}){console.log(error, "\n\n\n", stderr, "\n\n\n", stdout)}
})();

async function done() {
    console.log("原始檔編譯完成")
    console.log("二進制編譯中")
    const promise = []
    promise.push(exec("pkg package.json -o=dist/core"))
    promise.push(exec("cargo build --release",{cwd:"./launcher"}).then(async()=>{
        await fs.rename("./launcher/dist/release/launcher.exe", "./dist/SteamDesignTools.exe")
        await fs.rename("./build/www", "./dist/www")
        await fs.rename("./build/lib", "./dist/lib")
    }))
    await Promise.all(promise)
    
    console.log("二進制編譯完成")
}

function exec(cmd,options) {
    return new Promise((resolve) => {
        $exec(cmd,options, (error, stdout, stderr) => {
            resolve({error, stdout, stderr})
        })
    })
}