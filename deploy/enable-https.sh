#!/usr/bin/env bash
# =============================================================================
# 大啥杯 DA SHA CUP · 一键上 HTTPS（域名解析生效后执行）
# -----------------------------------------------------------------------------
# 前置条件：域名 A 记录已经指向本机公网 IP（47.242.90.95），且阿里云安全组放行 80/443。
# 用法：
#   sudo bash enable-https.sh dashabei.example.com                # 不填邮箱（不推荐，但可用）
#   sudo bash enable-https.sh dashabei.example.com me@mail.com    # 推荐：填证书到期通知邮箱
# 它做什么：改 server_name → 装 certbot → 申请 Let's Encrypt 证书 →
#          自动改写 nginx（443 + 80 跳 443）→ 校验 → 打印自动续期定时器。
# =============================================================================
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

DOMAIN="${1:-}"
EMAIL="${2:-}"
if [ -z "$DOMAIN" ]; then
  echo "用法：sudo bash enable-https.sh <域名> [证书通知邮箱]" >&2
  exit 1
fi
CONF=/etc/nginx/sites-available/dashabei
[ -f "$CONF" ] || { echo "找不到 $CONF，请先执行 deploy/setup-ubuntu.sh" >&2; exit 1; }

echo "=== 0/5 域名解析检查 ==="
MY_IP="$(curl -sS -4 --max-time 10 ifconfig.me || true)"
DNS_IP="$(getent hosts "$DOMAIN" | awk '{print $1}' | head -1 || true)"
echo "本机公网 IP : ${MY_IP:-未知}"
echo "$DOMAIN 解析到: ${DNS_IP:-未解析}"
if [ -z "$DNS_IP" ]; then
  echo "⚠ 域名还没有解析，先到域名服务商加一条 A 记录指向 ${MY_IP:-本机 IP}，等 1~10 分钟后再跑本脚本。"
  exit 2
fi
if [ -n "$MY_IP" ] && [ "$DNS_IP" != "$MY_IP" ]; then
  echo "⚠ 解析到 $DNS_IP，与本机 $MY_IP 不一致，证书签发可能失败（若走了 CDN/反代请忽略）。"
fi

echo "=== 1/5 改写 server_name 为 $DOMAIN ==="
cp -a "$CONF" "$CONF.bak.$(date +%s)"
sed -i "s/^\( *\)server_name .*;/\1server_name $DOMAIN;/" "$CONF"
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
certbot --nginx -d "$DOMAIN" "${ARGS[@]}" --redirect

echo "=== 4/5 校验 ==="
nginx -t && systemctl reload nginx
curl -sS -o /dev/null -w "http://$DOMAIN/          -> HTTP %{http_code}\n" "http://$DOMAIN/"  || true
curl -sS -o /dev/null -w "https://$DOMAIN/         -> HTTP %{http_code}\n" "https://$DOMAIN/" || true
echo -n "https://$DOMAIN/data/site-data.json -> HTTP "
curl -sS -o /dev/null -w "%{http_code}\n" "https://$DOMAIN/data/site-data.json" || true
echo -n "证书到期日："
echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -enddate || true

echo "=== 5/5 自动续期（certbot 会装 systemd timer，一般不用管） ==="
systemctl list-timers 'certbot*' --no-pager 2>/dev/null | head -3 || true
echo "完成 ✅ 记得把 README 第 11.1 节的地址换成 https://$DOMAIN/"
