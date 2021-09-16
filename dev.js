const exec = require('child_process').exec

exec(`wt -w 0 new-tab PowerShell -c "Set-Location '${__dirname}/server' \\;tsc -w"`)
setTimeout(() => {
	exec(`wt -w 0 new-tab PowerShell -c "Set-Location '${__dirname}/view' \\;npx vue-cli-service build --dest ../build/www --target app --watch --modern --mode development --fix`)
}, 1000)