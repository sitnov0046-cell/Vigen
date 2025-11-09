#!/bin/bash

# Скрипт для деплоя Next.js приложения на Timeweb с HTTPS
# Запускать на сервере под root или sudo

set -e

echo "🚀 Начинаем настройку приложения на Timeweb..."

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Запрос домена
echo -e "${YELLOW}Введите ваш домен (например: example.com):${NC}"
read DOMAIN

echo -e "${YELLOW}Введите email для SSL сертификата:${NC}"
read EMAIL

# 1. Обновление системы
echo -e "${GREEN}[1/8] Обновление системы...${NC}"
apt update && apt upgrade -y

# 2. Установка Node.js 20
echo -e "${GREEN}[2/8] Установка Node.js 20...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

echo "Node.js версия: $(node -v)"
echo "NPM версия: $(npm -v)"

# 3. Установка PM2
echo -e "${GREEN}[3/8] Установка PM2...${NC}"
npm install -g pm2

# 4. Создание директории для проекта
echo -e "${GREEN}[4/8] Настройка директории проекта...${NC}"
mkdir -p /var/www/liks
cd /var/www/liks

# Создание .env файла
echo -e "${YELLOW}Введите DATABASE_URL (строку подключения к PostgreSQL):${NC}"
read DATABASE_URL

cat > .env << EOF
DATABASE_URL="${DATABASE_URL}"
NODE_ENV=production
PORT=3000
EOF

echo ".env файл создан"

# 5. Установка Nginx
echo -e "${GREEN}[5/8] Установка Nginx...${NC}"
apt install -y nginx

# 6. Настройка Nginx
echo -e "${GREEN}[6/8] Настройка Nginx...${NC}"
cat > /etc/nginx/sites-available/liks << EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Активация конфига
ln -sf /etc/nginx/sites-available/liks /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Проверка конфига Nginx
nginx -t

# Перезапуск Nginx
systemctl restart nginx
systemctl enable nginx

echo -e "${GREEN}Nginx настроен и запущен${NC}"

# 7. Установка SSL сертификата
echo -e "${GREEN}[7/8] Установка SSL сертификата...${NC}"
apt install -y certbot python3-certbot-nginx

# Получение SSL сертификата
certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email ${EMAIL} --redirect

echo -e "${GREEN}SSL сертификат установлен!${NC}"

# 8. Инструкции по загрузке кода
echo -e "${GREEN}[8/8] Настройка завершена!${NC}"
echo ""
echo -e "${YELLOW}===========================================${NC}"
echo -e "${YELLOW}Теперь загрузите код проекта на сервер:${NC}"
echo -e "${YELLOW}===========================================${NC}"
echo ""
echo "1. На локальной машине:"
echo "   cd /path/to/webapp"
echo "   git init (если еще не инициализирован)"
echo "   git add ."
echo "   git commit -m 'initial commit'"
echo ""
echo "2. Или используйте rsync:"
echo "   rsync -avz --exclude 'node_modules' --exclude '.next' webapp/ root@your-server:/var/www/liks/"
echo ""
echo "3. На сервере выполните:"
echo "   cd /var/www/liks"
echo "   npm install"
echo "   npx prisma generate"
echo "   npm run build"
echo "   pm2 start npm --name liks-app -- start"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
echo -e "${GREEN}Ваше приложение будет доступно по адресу: https://${DOMAIN}${NC}"
echo ""
echo "Полезные команды PM2:"
echo "  pm2 status          - статус приложений"
echo "  pm2 logs liks-app  - просмотр логов"
echo "  pm2 restart liks-app - перезапуск"
echo "  pm2 stop liks-app  - остановка"
