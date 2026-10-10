param([Parameter(ValueFromRemainingArguments=$true)][string[]]$CliArgs)
$motionRoot = $PSScriptRoot
$env:HYPERFRAMES_FFMPEG_PATH = Join-Path $motionRoot 'tools/node_modules/ffmpeg-static/ffmpeg.exe'
$env:HYPERFRAMES_FFPROBE_PATH = Join-Path $motionRoot 'tools/node_modules/ffprobe-static/bin/win32/x64/ffprobe.exe'
$env:HYPERFRAMES_BROWSER_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
$runtimeNode = 'C:/Users/moamal/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
$cliFile = Join-Path $motionRoot '.npm-cache/_npx/702923228c2ce1e6/node_modules/hyperframes/bin/hyperframes.mjs'
& $runtimeNode $cliFile @CliArgs
exit $LASTEXITCODE
