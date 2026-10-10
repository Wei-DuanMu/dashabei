#!/usr/bin/env bash
# =============================================================================
# 大啥杯 DA SHA CUP · 一键上 HTTPS（域名解析生效后执行）
# -----------------------------------------------------------------------------
# 前置条件：域名 A 记录已指向本机公网 IP（47.242.90.95），阿里云安全组放行 80/443。
# 用法：
#   sudo bash enable-https.sh dashacup.asia weiduanmu247@gmail.com www.dashacup.asia
#        └ 主域名        └ 证书到期通知邮箱（可留空）        └ 额外域名，可写多个（SAN）
# 它做什么：改 server_name → 装 certbot → 申请一张覆盖所有域名的 Let's Encrypt 证书
#          → 自动改写 nginx（443 + 80 跳 443）→ 逐域名自检 → 打印到期日与续期定时器
# =============================================================================
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

DOMAIN="${1:-}"
EMAIL="${2:-}"
shift 2 2>/dev/null || true
EXTRA=("$@")

if [ -z "$DOMAIN" ]; then
  echo "用法：sudo bash enable-https.sh <主域名> [邮箱] [额外域名...]" >&2
  exit 1
fi

NAMES="$DOMAIN"
for d in "${EXTRA[@]:-}"; do
  [ -n "$d" ] && NAMES="$NAMES $d"
done

CONF=/etc/nginx/sites-available/dashabei
[ -f "$CONF" ] || { echo "找不到 $CONF，请先执行 deploy/setup-ubuntu.sh" >&2; exit 1; }

echo "=== 0/5 域名解析检查 ==="
MY_IP="$(curl -sS -4 --max-time 10 ifconfig.me || true)"
echo "本机公网 IP : ${MY_IP:-未知}"
BAD=0
for n in $NAMES; do
  DNS_IP="$(getent hosts "$n" | awk '{print $1}' | head -1 || true)"
  if [ -z "$DNS_IP" ]; then
    echo "  ✗ $n 尚未解析 —— 先到域名服务商添加 A 记录指向 ${MY_IP:-本机 IP}"
    BAD=1
  elif [ -n "$MY_IP" ] && [ "$DNS_IP" != "$MY_IP" ]; then
    echo "  ⚠ $n 解析到 $DNS_IP，与本机 $MY_IP 不一致（若走 CDN/反代请忽略）"
  else
    echo "  ✓ $n -> $DNS_IP"
  fi
done
if [ "$BAD" = "1" ]; then
  echo "解析未就绪，退出（解析生效后重跑即可）。" >&2
  exit 2
fi

echo "=== 1/5 改写 server_name 为：$NAMES ==="
cp -a "$CONF" "$CONF.bak.$(date +%s)"
sed -i "s/^\( *\)server_name .*;/\1server_name $NAMES;/" "$CONF"
grep -n 'server_name' "$CONF"
nginx -t && systemctl reload nginx

echo "=== 2/5 安装 certbot ==="
if ! command -v certbot >/dev/null 2>&1; then
  apt-get update -qq
  apt-get install -y -qq certbot python3-certbot-nginx
fi
certbot --version

echo "=== 3/5 申请证书并改写 nginx（80 自动跳 443） ==="
if [ -n "$EMAIL" ]; then
  ARGS=(--non-interactive --agree-tos -m "$EMAIL")
else
  ARGS=(--non-interactive --agree-tos --register-unsafely-without-email)
fi
D_ARGS=()
for n in $NAMES; do D_ARGS+=(-d "$n"); done
certbot --nginx "${D_ARGS[@]}" "${ARGS[@]}" --redirect

echo "=== 4/5 自检 ==="
nginx -t && systemctl reload nginx
for n in $NAMES; do
  curl -sS -o /dev/null -w "http://$n/   -> HTTP %{http_code}（应为 301 跳转）\n" "http://$n/"  || true
  curl -sS -o /dev/null -w "https://$n/  -> HTTP %{http_code}\n" "https://$n/" || true
done
echo -n "证书到期日："
echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -enddate || true

echo "=== 5/5 自动续期（certbot 自带 systemd timer） ==="
systemctl list-timers 'certbot*' --no-pager 2>/dev/null | head -3 || true
echo "完成 ✅ 记得把 README 第 11.1 节的地址换成 https://$DOMAIN/"
