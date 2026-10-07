<#
  大啥杯 DA SHA CUP · 一键上线 / 更新（Windows 本地 → 云服务器，scp 覆盖式上传）
  ----------------------------------------------------------------------------
  只上传站点运行真正需要的文件（index.html / styles.css / app.js / .nojekyll /
  data/ / assets/），不会上传 tools/、deploy/、README.md、.git 等开发文件，
  也不会删除服务器上的其它内容。静态文件传完即时生效，无需重启 nginx。

  首次使用前的准备（在服务器上执行过一次即可）：
    1) 把本机公钥装到服务器：
       ssh -p <端口> <用户>@<IP> "mkdir -p ~/.ssh && chmod 700 ~/.ssh && \
         echo '<你的公钥内容>' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
    2) 建站点目录并交给 nginx 用户：
       sudo mkdir -p /var/www/dashabei && sudo chown -R $USER /var/www/dashabei

  日常更新（本地）：
    pwsh -File tools/deploy.ps1 -Server 1.2.3.4 -User root -Target /var/www/dashabei

  参数：
    -Server    服务器 IP 或域名（必填）
    -Target    服务器上的站点目录（必填，例如 /var/www/dashabei）
    -User      SSH 用户名，默认 root
    -Port      SSH 端口，默认 22
    -KeyPath   私钥路径，默认 ~/.ssh/dashabei_deploy
    -DryRun    只打印将要上传的内容，不真正传输
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$Server,
  [Parameter(Mandatory = $true)][string]$Target,
  [string]$User = 'root',
  [int]$Port = 22,
  [string]$KeyPath = (Join-Path $HOME '.ssh/dashabei_deploy'),
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot          # tools/ 的上一级 = 仓库根 = 网站根
$siteFiles = @('index.html', 'styles.css', 'app.js', '.nojekyll')
$siteDirs = @('data', 'assets')

$payload = @()
foreach ($f in $siteFiles) {
  $p = Join-Path $repoRoot $f
  if (Test-Path -LiteralPath $p) { $payload += $p } else { Write-Warning "缺少文件：$f" }
}
foreach ($d in $siteDirs) {
  $p = Join-Path $repoRoot $d
  if (Test-Path -LiteralPath $p) { $payload += $p } else { Write-Warning "缺少目录：$d" }
}

Write-Host "=== 大啥杯 上线 ===" -ForegroundColor Cyan
Write-Host "本地仓库 : $repoRoot"
Write-Host "目标     : ${User}@${Server}:${Target}  (端口 $Port)"
Write-Host "私钥     : $KeyPath"
Write-Host "待上传   :"
$payload | ForEach-Object { "  - " + $_.Substring($repoRoot.Length + 1) }

if ($DryRun) { Write-Host "`n[DryRun] 未执行任何传输。" -ForegroundColor Yellow; return }

if (-not (Test-Path -LiteralPath $KeyPath)) {
  throw "私钥不存在：$KeyPath（用 ssh-keygen 生成，并把 .pub 装到服务器 authorized_keys）"
}

$sshBase = @('-i', $KeyPath, '-p', $Port, '-o', 'StrictHostKeyChecking=accept-new')
$scpBase = @('-i', $KeyPath, '-P', $Port, '-o', 'StrictHostKeyChecking=accept-new')

Write-Host "`n[1/3] 确保目标目录存在…" -ForegroundColor Cyan
& ssh @sshBase "${User}@${Server}" "mkdir -p '$Target'"
if ($LASTEXITCODE -ne 0) { throw "ssh 连接或建目录失败（退出码 $LASTEXITCODE）" }

Write-Host "[2/3] 上传站点文件（覆盖同名文件，不删除其它内容）…" -ForegroundColor Cyan
& scp @scpBase -r @payload "${User}@${Server}:${Target}/"
if ($LASTEXITCODE -ne 0) { throw "scp 上传失败（退出码 $LASTEXITCODE）" }

# ★ 关键一步：Windows 上 scp -r 建出来的目录常常是 drwx------（0700），
#   nginx 的 www-data 无法进入，try_files 会回 404 —— 现象是「文件明明传上去了却打不开」。
#   所以每次上传后统一修正权限：目录 755、文件 644，并做一次远端自检。
Write-Host "[3/3] 修正远端权限（目录 755 / 文件 644）并自检…" -ForegroundColor Cyan
$fixCmd = "find '$Target' -type d -exec chmod 755 {} + 2>/dev/null; " +
          "find '$Target' -type f -exec chmod 644 {} + 2>/dev/null; " +
          "ls -ld '$Target'; " +
          "echo -n '[远端自检] '; " +
          "curl -sS -o /dev/null -w 'index.html -> HTTP %{http_code}\n' http://127.0.0.1/index.html; " +
          "echo -n '[远端自检] '; " +
          "curl -sS -o /dev/null -w 'data/site-data.json -> HTTP %{http_code}\n' http://127.0.0.1/data/site-data.json"
& ssh @sshBase "${User}@${Server}" $fixCmd
if ($LASTEXITCODE -ne 0) { Write-Warning "权限修正或自检未完全成功（退出码 $LASTEXITCODE），请检查目标目录与 nginx 配置" }

Write-Host "`n完成 ✅ 静态文件已生效（无需重启 nginx）。" -ForegroundColor Green
Write-Host "自检：curl -I http://${Server}/  （HTTPS 配好后换 https://你的域名/）"
