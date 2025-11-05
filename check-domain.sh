#!/bin/bash

# Скрипт проверки готовности домена для Telegram Web App

# Цвета
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Проверка домена для Telegram Web App"
echo "========================================"
echo ""

# Запрос домена
echo -e "${YELLOW}Введите ваш домен (например: example.com):${NC}"
read DOMAIN

echo ""
echo "Проверяю домен: $DOMAIN"
echo ""

# 1. Проверка DNS
echo -e "${YELLOW}[1/5] Проверка DNS записей...${NC}"
if host $DOMAIN > /dev/null 2>&1; then
    IP=$(host $DOMAIN | grep "has address" | awk '{print $4}' | head -1)
    echo -e "${GREEN}✓ DNS настроен${NC}"
    echo "  IP адрес: $IP"
else
    echo -e "${RED}✗ DNS не настроен или домен не существует${NC}"
    exit 1
fi

# 2. Проверка HTTP (порт 80)
echo ""
echo -e "${YELLOW}[2/5] Проверка HTTP (порт 80)...${NC}"
if curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://$DOMAIN | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✓ HTTP доступен${NC}"
else
    echo -e "${RED}✗ HTTP недоступен${NC}"
fi

# 3. Проверка HTTPS (порт 443)
echo ""
echo -e "${YELLOW}[3/5] Проверка HTTPS (порт 443)...${NC}"
if curl -s -o /dev/null -w "%{http_code}" --max-time 5 https://$DOMAIN | grep -q "200"; then
    echo -e "${GREEN}✓ HTTPS работает${NC}"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN)
    echo "  HTTP код: $HTTP_CODE"
else
    echo -e "${RED}✗ HTTPS не работает или недоступен${NC}"
    echo -e "${YELLOW}  Нужно настроить SSL сертификат!${NC}"
fi

# 4. Проверка SSL сертификата
echo ""
echo -e "${YELLOW}[4/5] Проверка SSL сертификата...${NC}"
SSL_INFO=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ SSL сертификат валидный${NC}"
    echo "$SSL_INFO" | while read line; do
        echo "  $line"
    done

    # Проверка срока действия
    END_DATE=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
    END_TIMESTAMP=$(date -d "$END_DATE" +%s 2>/dev/null || date -j -f "%b %d %T %Y %Z" "$END_DATE" +%s 2>/dev/null)
    NOW_TIMESTAMP=$(date +%s)
    DAYS_LEFT=$(( ($END_TIMESTAMP - $NOW_TIMESTAMP) / 86400 ))

    if [ $DAYS_LEFT -gt 30 ]; then
        echo -e "${GREEN}  Осталось дней: $DAYS_LEFT${NC}"
    elif [ $DAYS_LEFT -gt 7 ]; then
        echo -e "${YELLOW}  Осталось дней: $DAYS_LEFT (скоро нужно обновить)${NC}"
    else
        echo -e "${RED}  Осталось дней: $DAYS_LEFT (срочно обновите!)${NC}"
    fi
else
    echo -e "${RED}✗ SSL сертификат отсутствует или невалидный${NC}"
fi

# 5. Проверка редиректа HTTP → HTTPS
echo ""
echo -e "${YELLOW}[5/5] Проверка редиректа HTTP → HTTPS...${NC}"
REDIRECT=$(curl -s -I -L --max-time 5 http://$DOMAIN | grep -i "location: https")
if [ ! -z "$REDIRECT" ]; then
    echo -e "${GREEN}✓ Редирект с HTTP на HTTPS настроен${NC}"
else
    echo -e "${YELLOW}⚠ Редирект не настроен (рекомендуется настроить)${NC}"
fi

# Итоговая проверка
echo ""
echo "========================================"
echo -e "${YELLOW}Проверка совместимости с Telegram:${NC}"
echo ""

# Проверяем все критичные требования
HTTPS_OK=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 https://$DOMAIN | grep -q "200" && echo "yes" || echo "no")
SSL_OK=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null && echo "yes" || echo "no")

if [ "$HTTPS_OK" = "yes" ] && [ "$SSL_OK" = "yes" ]; then
    echo -e "${GREEN}✅ Домен готов для подключения к Telegram Web App!${NC}"
    echo ""
    echo "Используй этот URL в боте:"
    echo -e "${GREEN}https://$DOMAIN${NC}"
    echo ""
    echo "Пример кода для бота (Python):"
    echo "--------------------------------"
    echo "from telegram import WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup"
    echo ""
    echo "keyboard = InlineKeyboardMarkup(["
    echo "    [InlineKeyboardButton("
    echo "        text='🎬 Открыть приложение',"
    echo "        web_app=WebAppInfo(url='https://$DOMAIN')"
    echo "    )]"
    echo "])"
else
    echo -e "${RED}❌ Домен НЕ готов для Telegram Web App${NC}"
    echo ""
    echo "Необходимо:"
    if [ "$HTTPS_OK" != "yes" ]; then
        echo -e "${RED}  • Настроить HTTPS${NC}"
    fi
    if [ "$SSL_OK" != "yes" ]; then
        echo -e "${RED}  • Установить валидный SSL сертификат${NC}"
    fi
    echo ""
    echo "Используй скрипт deploy-timeweb.sh для автоматической настройки"
fi

echo ""
