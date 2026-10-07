#!/usr/bin/env bash
# =============================================================================
# 大啥杯 DA SHA CUP · 服务器初始化（Ubuntu 22.04 / 24.04，已在 47.242.90.95 实测）
# -----------------------------------------------------------------------------
# 作用：装 nginx → 写站点配置（80 默认站点，IP 也能直接访问）→ 建站点目录 →
#      放行本机 ufw（如启用）→ 校验并启动。可反复执行（幂等）。
# 用法：sudo bash setup-ubuntu.sh          # root 直接 bash setup-ubuntu.sh
# 之后用 tools/deploy.ps1 上传站点文件即可。
# =============================================================================
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

SITE_ROOT=/var/www/dashabei
CONF=/etc/nginx/sites-available/dashabei

echo "=== 1/5 系统信息 ==="
. /etc/os-release
echo "$PRETTY_NAME $(uname -m) | user=$(id -un) | $(date '+%F %T')"

echo "=== 2/5 安装 nginx ==="
if command -v nginx >/dev/null 2>&1; then
  echo "已安装：$(nginx -v 2>&1)"
else
  # 默认源不可用时自动切到阿里云内网镜像（阿里云 ECS 上速度更快）
  if ! apt-get update -qq 2>/dev/null; then
    echo "默认 apt 源不可用，切换阿里云镜像…"
    cp -a /etc/apt/sources.list "/etc/apt/sources.list.bak.$(date +%s)" 2>/dev/null || true
    cat > /etc/apt/sources.list <<EOF
deb http://mirrors.cloud.aliyuncs.com/ubuntu/ ${VERSION_CODENAME} main restricted universe multiverse
deb http://mirrors.cloud.aliyuncs.com/ubuntu/ ${VERSION_CODENAME}-updates main restricted universe multiverse
deb http://mirrors.cloud.aliyuncs.com/ubuntu/ ${VERSION_CODENAME}-security main restricted universe multiverse
EOF
    apt-get update -qq
  fi
  apt-get install -y -qq nginx
  echo "安装完成：$(nginx -v 2>&1)"
fi

echo "=== 3/5 站点目录 ==="
mkdir -p "$SITE_ROOT"
if [ ! -f "$SITE_ROOT/index.html" ]; then
  printf '%s\n' '<!doctype html><html lang="zh-CN"><meta charset="utf-8">' \
    '<title>大啥杯 DA SHA CUP · 部署中</title>' \
    '<body style="background:#0a0c10;color:#e8a33d;font:700 22px system-ui;padding:48px">' \
    '大啥杯 DA SHA CUP · 站点文件正在上传…</body></html>' > "$SITE_ROOT/index.html"
fi
ls -ld "$SITE_ROOT"

echo "=== 4/5 写入 nginx 站点配置 ==="
cat > "$CONF" <<'NGINX'
# 大啥杯 DA SHA CUP · 静态单页站点
# 有域名后：把 server_name _ 改成你的域名，再 sudo certbot --nginx -d 你的域名
server {
    listen      80 default_server;
    listen      [::]:80 default_server;
    server_name _;

    root  /var/www/dashabei;
    index index.html;

    charset utf-8;
    access_log /var/log/nginx/dashabei.access.log;
    error_log  /var/log/nginx/dashabei.error.log;

    location / {
        try_files $uri $uri/ =404;
    }

    location ^~ /assets/ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
        access_log off;
        try_files $uri =404;
    }

    location = /data/site-data.json {
        add_header Cache-Control "no-cache, must-revalidate";
        try_files $uri =404;
    }

    location = /index.html {
        add_header Cache-Control "no-cache, must-revalidate";
    }

    gzip            on;
    gzip_vary       on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types      text/plain text/css text/javascript application/javascript
                    application/json image/svg+xml application/xml;

    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options        SAMEORIGIN always;
    add_header Referrer-Policy        strict-origin-when-cross-origin always;
    add_header Permissions-Policy     "geolocation=(), microphone=(), camera=()" always;
}
NGINX
# 关掉发行版自带的默认站点，避免抢占 80 的 default_server
rm -f /etc/nginx/sites-enabled/default
ln -sfn "$CONF" /etc/nginx/sites-enabled/dashabei

if command -v ufw >/dev/null 2>&1 && ufw status 2>/dev/null | grep -q 'Status: active'; then
  ufw allow 80/tcp  >/dev/null 2>&1 || true
  ufw allow 443/tcp >/dev/null 2>&1 || true
  echo "ufw 已启用：已放行 80/443"
else
  echo "ufw 未启用（无需处理；公网可达性取决于阿里云安全组）"
fi

echo "=== 5/5 校验并启动 nginx ==="
nginx -t
systemctl enable nginx >/dev/null 2>&1 || true
systemctl restart nginx
sleep 1
echo "服务状态：$(systemctl is-active nginx)"
ss -lntp 2>/dev/null | grep -E ':80[[:space:]]' || true

echo "--- 服务器本机自检 ---"
curl -sS -o /dev/null -w "http://127.0.0.1/            -> HTTP %{http_code}\n" http://127.0.0.1/            || true
curl -sS -o /dev/null -w "http://127.0.0.1/index.html   -> HTTP %{http_code}\n" http://127.0.0.1/index.html   || true
echo "=== 完成：接下来在本地执行 tools/deploy.ps1 上传站点文件 ==="
