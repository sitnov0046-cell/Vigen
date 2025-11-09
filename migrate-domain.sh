#!/bin/bash

# Скрипт для миграции домена vigentop.ru → liksone.ru
# Запускать на сервере под root или sudo

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🔄 Миграция домена: vigentop.ru → liksone.ru${NC}"
echo "================================================"
echo ""

# Проверка прав
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Пожалуйста, запусти скрипт с sudo:${NC}"
    echo "sudo bash migrate-domain.sh"
    exit 1
fi

# Константы
NEW_DOMAIN="liksone.ru"
OLD_DOMAIN="vigentop.ru"

# Запрос email для SSL
echo -e "${YELLOW}Введи email для SSL сертификата:${NC}"
read EMAIL

echo ""
echo "Новый домен: $NEW_DOMAIN"
echo "Email: $EMAIL"
echo ""
echo -e "${YELLOW}Продолжить? (y/n)${NC}"
read CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "Отменено"
    exit 0
fi

# Шаг 1: Проверка DNS
echo ""
echo -e "${GREEN}[1/5] Проверка DNS для $NEW_DOMAIN...${NC}"
DNS_CHECK=$(dig +short $NEW_DOMAIN | head -n1)

if [ -z "$DNS_CHECK" ]; then
    echo -e "${RED}❌ DNS не настроен для $NEW_DOMAIN${NC}"
    echo "Пожалуйста, настрой A-записи и подожди 5-15 минут:"
    echo "  @ → IP сервера"
    echo "  www → IP сервера"
    exit 1
else
    echo -e "${GREEN}✓ DNS настроен: $NEW_DOMAIN → $DNS_CHECK${NC}"
fi

# Шаг 2: Создание конфигурации Nginx для нового домена
echo ""
echo -e "${GREEN}[2/5] Создание конфигурации Nginx для $NEW_DOMAIN...${NC}"

cat > /etc/nginx/sites-available/liks << 'EOF'
server {
    listen 80;
    server_name liksone.ru www.liksone.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

echo -e "${GREEN}✓ Конфигурация создана${NC}"

# Шаг 3: Активация конфигурации
echo ""
echo -e "${GREEN}[3/5] Активация конфигурации...${NC}"

ln -sf /etc/nginx/sites-available/liks /etc/nginx/sites-enabled/

# Проверка конфигурации
if nginx -t 2>/dev/null; then
    echo -e "${GREEN}✓ Конфигурация Nginx валидна${NC}"
    systemctl reload nginx
    echo -e "${GREEN}✓ Nginx перезапущен${NC}"
else
    echo -e "${RED}❌ Ошибка в конфигурации Nginx${NC}"
    nginx -t
    exit 1
fi

# Шаг 4: Установка SSL сертификата
echo ""
echo -e "${GREEN}[4/5] Получение SSL сертификата для $NEW_DOMAIN...${NC}"

# Установка certbot если не установлен
if ! command -v certbot &> /dev/null; then
    echo "Установка Certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi

# Получение сертификата
certbot --nginx -d $NEW_DOMAIN -d www.$NEW_DOMAIN \
    --non-interactive \
    --agree-tos \
    --email $EMAIL \
    --redirect

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ SSL сертификат установлен${NC}"
else
    echo -e "${RED}❌ Ошибка при получении SSL сертификата${NC}"
    exit 1
fi

# Шаг 5: Проверка
echo ""
echo -e "${GREEN}[5/5] Проверка работы нового домена...${NC}"

# Проверка доступности
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://$NEW_DOMAIN)

if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "301" ] || [ "$HTTP_CODE" == "302" ]; then
    echo -e "${GREEN}✓ Домен $NEW_DOMAIN доступен (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}⚠ Домен вернул код $HTTP_CODE${NC}"
fi

# Финальное сообщение
echo ""
echo -e "${GREEN}=============================================="
echo "✅ Миграция завершена!"
echo "==============================================\${NC}"
echo ""
echo "Новый домен: ${GREEN}https://$NEW_DOMAIN${NC}"
echo ""
echo "Следующие шаги:"
echo "1. Открой https://$NEW_DOMAIN в браузере и проверь работу"
echo "2. Обнови URL в Telegram боте на https://$NEW_DOMAIN"
echo "3. Протестируй бота"
echo ""
echo -e "${YELLOW}После проверки можешь удалить старый домен:${NC}"
echo "  rm /etc/nginx/sites-enabled/vigentop"
echo "  nginx -t && systemctl reload nginx"
echo "  certbot delete --cert-name $OLD_DOMAIN"
echo ""
echo -e "${GREEN}Готово! 🎉${NC}"
