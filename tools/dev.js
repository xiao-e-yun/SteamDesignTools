const exec = require('child_process').exec;
const chokidar = require('chokidar')
const $path = require('path')
const fs = require('fs')

process.chdir(__dirname+"/../")

console.log("監聽server");
exec(`tsc -w"`,{cwd:'./server'},(err,stdout,stderr)=>console.log(err,stdout,stderr))

console.log("監聽view");
exec(`npx vue-cli-service build --dest ../build/www --target app --watch --modern --mode development --fix`,{cwd:"./view"},(err,stdout,stderr)=>console.log(err,stdout,stderr))

console.log('監聽lib')
const watcher = chokidar.watch(`./lib`)
watcher.on('add', (path) => {
	const filename = $path.basename(path)
	fs.copyFileSync(path, `./build/lib/${filename}`)
})
watcher.on('unlink', (path) => {
	const filename = $path.basename(path)
	fs.unlinkSync(`./build/lib/${filename}`)
});