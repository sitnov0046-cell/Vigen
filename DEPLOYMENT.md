# 🚀 Инструкция по деплою приложения с HTTPS

## Вариант 1: Vercel (Рекомендуется) ⭐

### Шаг 1: Подготовка проекта
```bash
# Убедись, что все изменения закоммичены
git add .
git commit -m "feat: подготовка к деплою"
git push origin main
```

### Шаг 2: Регистрация на Vercel
1. Перейди на [vercel.com](https://vercel.com)
2. Нажми "Sign Up" и войди через GitHub
3. Дай доступ к своему репозиторию

### Шаг 3: Импорт проекта
1. На главной странице Vercel нажми **"Add New Project"**
2. Выбери свой репозиторий `Vigen`
3. Vercel автоматически определит Next.js

### Шаг 4: Настройка переменных окружения
В разделе **Environment Variables** добавь:

```
DATABASE_URL=postgresql://...твоя_строка_подключения_из_.env
```

### Шаг 5: Deploy
1. Нажми **"Deploy"**
2. Дождись окончания сборки (2-3 минуты)
3. Получишь HTTPS URL вида: `https://vigen-xxx.vercel.app`

### Шаг 6: Настройка своего домена (опционально)
1. В настройках проекта → **Domains**
2. Добавь свой домен
3. Настрой DNS записи согласно инструкциям Vercel
4. HTTPS будет настроен автоматически!

---

## Вариант 2: Netlify

### Шаг 1: Регистрация
1. Перейди на [netlify.com](https://netlify.com)
2. Войди через GitHub

### Шаг 2: Импорт проекта
1. **Add new site** → **Import an existing project**
2. Выбери GitHub и свой репозиторий
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`

### Шаг 3: Environment Variables
Добавь `DATABASE_URL` в **Site settings** → **Environment variables**

### Шаг 4: Deploy
Нажми **Deploy site** и получи HTTPS URL

---

## Вариант 3: Railway (для более сложных проектов)

### Шаг 1: Регистрация
1. Перейди на [railway.app](https://railway.app)
2. Войди через GitHub

### Шаг 2: Создание проекта
1. **New Project** → **Deploy from GitHub repo**
2. Выбери репозиторий
3. Railway автоматически определит Next.js

### Шаг 3: Настройка базы данных (если нужна)
Railway может создать PostgreSQL базу автоматически:
1. **New** → **Database** → **PostgreSQL**
2. Переменная `DATABASE_URL` будет создана автоматически

### Шаг 4: Deploy
Railway автоматически деплоит при каждом пуше в main

---

## Вариант 4: Собственный VPS с Nginx

Если хочешь использовать свой сервер на Timeweb:

### 1. Установка Node.js на сервере
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Клонирование проекта
```bash
cd /var/www
git clone https://github.com/твой-username/Vigen.git
cd Vigen/webapp
npm install
npm run build
```

### 3. Установка PM2
```bash
sudo npm install -g pm2
pm2 start npm --name "vigen-app" -- start
pm2 save
pm2 startup
```

### 4. Установка Nginx
```bash
sudo apt update
sudo apt install nginx
```

### 5. Настройка Nginx
Создай файл `/etc/nginx/sites-available/vigen`:

```nginx
server {
    listen 80;
    server_name твой-домен.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Активируй конфиг:
```bash
sudo ln -s /etc/nginx/sites-available/vigen /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Установка SSL с Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d твой-домен.ru
```

Certbot автоматически настроит HTTPS!

---

## После деплоя: Подключение к Telegram боту

### 1. Получи HTTPS URL
После деплоя у тебя будет URL вида:
- Vercel: `https://vigen-xxx.vercel.app`
- Netlify: `https://vigen-xxx.netlify.app`
- Свой домен: `https://твой-домен.ru`

### 2. Настрой Web App в боте
В коде Telegram бота используй:

```python
from telegram import WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup

# Создай кнопку с Web App
keyboard = InlineKeyboardMarkup([
    [InlineKeyboardButton(
        text="🎬 Открыть приложение",
        web_app=WebAppInfo(url="https://твой-url.vercel.app")
    )]
])

await update.message.reply_text(
    "Добро пожаловать! Нажми кнопку ниже:",
    reply_markup=keyboard
)
```

### 3. Проверка
1. Открой бота в Telegram
2. Нажми на кнопку с Web App
3. Приложение должно открыться внутри Telegram!

---

## 🔧 Troubleshooting

### Ошибка "Prisma Client not found"
Добавь в `package.json`:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### Ошибка подключения к базе данных
Проверь, что `DATABASE_URL` в переменных окружения Vercel совпадает с локальной

### Telegram не открывает Web App
- Проверь, что URL начинается с `https://`
- Убедись, что сертификат SSL валидный
- Проверь в Telegram Desktop для отладки

---

## 📝 Checklist перед деплоем

- [ ] Все изменения закоммичены и запушены
- [ ] `.env` файл НЕ добавлен в Git (проверь `.gitignore`)
- [ ] `DATABASE_URL` добавлен в переменные окружения платформы
- [ ] `npm run build` работает локально без ошибок
- [ ] База данных доступна из интернета (не только localhost)

---

## 🎉 Готово!

После успешного деплоя твоё приложение будет доступно по HTTPS и готово к подключению к Telegram боту!
