# 🚀 راهنمای Deploy سیستم Push Notification روی Vercel

## 📋 Prerequisites

- ✅ HTTPS (Vercel خودکار فراهم می‌کند)
- ✅ Domain Name (Vercel subdomain کافی است)
- ✅ MongoDB Atlas (برای production)

## 🔧 مراحل Deployment

### 1️⃣ تنظیم Environment Variables در Vercel

برو به: **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

```bash
# VAPID Keys (از local کپی کن)
VAPID_PUBLIC_KEY=BDz-fu5f5h3mMLrIiRlWWu1N7r39mpqj7Q-vQjJHZumcUPaioY7va7eEXT30box18MASeNc2XHf5noexH7rPHYI
VAPID_PRIVATE_KEY=tIyzdth3MzE9uE5sNWhhR1GR0Gr5Yn-dogwqEn2Ce5Y
VAPID_EMAIL=admin@classco.app

# Next.js URL (جایگزین YOUR-DOMAIN با domain واقعی)
NEXTAUTH_URL=https://YOUR-DOMAIN.vercel.app

# MongoDB (همان production database)
MONGODB_URI=mongodb+srv://classco_students:yt1234567890YT@studentsdatadb.9rlnuin.mongodb.net/studentsDataDB?retryWrites=true&w=majority&tlsAllowInvalidCertificates=true

# Email & SMS (همان keys فعلی)
RESEND_API_KEY=re_8nXr1jxQ_FbcDdsaShBLAip1NRWb3xjJh
MELIPAYAMAK_USERNAME=9017916871
MELIPAYAMAK_PASSWORD=T5FGC
```

### 2️⃣ Deploy کردن

```bash
git add .
git commit -m "Add push notification system"
git push origin main
```

**Vercel خودکار deploy می‌کند! 🎉**

### 3️⃣ تست در Production

پس از deploy:

1. **برو به domain production:** `https://your-app.vercel.app`
2. **ورود/ثبت‌نام کن**
3. **برو به Settings:** `/settings`
4. **مجوز نوتیفیکیشن بده**
5. **اشتراک رو فعال کن**
6. **تست کن:** دکمه "ارسال نوتیفیکیشن تست"

### 4️⃣ تست صفحه خودکار

```
https://your-app.vercel.app/test-notifications.html
```

## 🐛 Troubleshooting

### اگر Service Worker کار نکرد:

```javascript
// Developer Tools → Application → Service Workers
// unregister → refresh page
```

### اگر نوتیفیکیشن نیامد:

1. ✅ HTTPS فعال است؟
2. ✅ مجوز داده شده؟
3. ✅ اشتراک فعال است؟
4. ✅ VAPID keys صحیح است؟

### چک کردن logs:

```
Vercel Dashboard → Functions → View Function Logs
```

## 📱 API Endpoints در Production

```bash
# VAPID Public Key
GET https://your-app.vercel.app/api/notifications/vapid-key

# Subscribe
POST https://your-app.vercel.app/api/notifications/subscribe

# Send Notification
POST https://your-app.vercel.app/api/notifications/send

# Auto Send (تست)
GET https://your-app.vercel.app/api/notifications/auto-send
```

## 🎯 نکات مهم Production

### 1. Security:

- ✅ VAPID keys محرمانه نگه دار
- ✅ Domain whitelist کن
- ✅ Rate limiting اضافه کن

### 2. Performance:

- ✅ Service Worker کش می‌کند
- ✅ Serverless functions بهینه شده
- ✅ MongoDB connection pooling

### 3. Monitoring:

- ✅ Vercel Analytics
- ✅ Error Tracking
- ✅ Push success rate

## 🚀 نهایی

پس از deploy موفق، کاربران می‌تونن:

1. **PWA نصب کنن** (Add to Home Screen)
2. **نوتیفیکیشن دریافت کنن** (حتی وقتی app بسته است)
3. **آفلاین کار کنن** (محدود)

**تبریک! سیستم Push Notification در production آماده است! 🎉**

---

## 📞 Support

اگر مشکلی پیش اومد:

1. Vercel logs رو چک کن
2. Browser Developer Tools
3. MongoDB Atlas logs
4. Service Worker status

**موفق باشی! 🚀**
