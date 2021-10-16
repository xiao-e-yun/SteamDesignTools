const exec = require('child_process').exec;
const chokidar = require('chokidar')
const $path = require('path')
const fs = require('fs').promises;
(async()=>{
	process.chdir(__dirname+"/../")
	if ((await fs.readdir(".")).indexOf("build") == -1)  await fs.mkdir("build")
	if ((await fs.readdir("./build")).indexOf("lib") == -1)  await fs.mkdir("build/lib")
	
	console.log("監聽server");
	exec(`tsc -w"`,{cwd:'./server'},(err,stdout,stderr)=>console.log(err,stdout,stderr))
	
	console.log("監聽view");
	exec(`npx vue-cli-service build --dest ../build/www --target app --watch --mode development`,{cwd:"./view"},(err,stdout,stderr)=>console.log(err,stdout,stderr))
	
	console.log('監聽lib')
	const watcher = chokidar.watch(`./lib`)
	watcher.on('add', async (path) => {
		const filename = $path.basename(path)
		await fs.copyFile(path, `./build/lib/${filename}`)
	})
	watcher.on('unlink', async (path) => {
		const filename = $path.basename(path)
		await fs.unlink(`./build/lib/${filename}`)
	});
})();