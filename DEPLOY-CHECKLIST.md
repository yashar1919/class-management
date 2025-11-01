# ✅ Checklist Deploy سیستم Push Notification

## 🚀 قبل از Deploy

- [ ] **VAPID Keys تولید شده** (از local کپی کن یا جدید تولید کن)
- [ ] **MongoDB production ready** است
- [ ] **All dependencies نصب شده** (`npm install`)
- [ ] **Local test موفق** (نوتیف کار می‌کند)

## 🔧 در Vercel Dashboard

### Environment Variables:

- [ ] `VAPID_PUBLIC_KEY` - کلید عمومی
- [ ] `VAPID_PRIVATE_KEY` - کلید خصوصی
- [ ] `VAPID_EMAIL` - ایمیل admin
- [ ] `NEXTAUTH_URL` - دامنه production
- [ ] `MONGODB_URI` - اتصال MongoDB
- [ ] `RESEND_API_KEY` - (اختیاری) ایمیل
- [ ] `MELIPAYAMAK_USERNAME` - (اختیاری) SMS
- [ ] `MELIPAYAMAK_PASSWORD` - (اختیاری) SMS

### Files Added:

- [ ] `vercel.json` - تنظیمات Vercel
- [ ] `DEPLOYMENT.md` - راهنمای deploy
- [ ] Service Worker بهینه شده

## 🌐 بعد از Deploy

### تست اولیه:

- [ ] سایت بالا می‌آید `https://your-app.vercel.app`
- [ ] Login/Signup کار می‌کند
- [ ] `/settings` در دسترس است
- [ ] Service Worker register می‌شود

### تست Push Notification:

- [ ] مجوز نوتیفیکیشن درخواست می‌شود
- [ ] مجوز داده می‌شود (Allow)
- [ ] اشتراک فعال می‌شود (Subscribe)
- [ ] دکمه "ارسال تست" کار می‌کند
- [ ] نوتیفیکیشن دریافت می‌شود

### تست پیشرفته:

- [ ] `/test-notifications.html` کار می‌کند
- [ ] ارسال خودکار هر 10 ثانیه فعال است
- [ ] نوتیف clicking به صفحه درست می‌رود
- [ ] PWA نصب می‌شود (Add to Home Screen)

## 🐛 در صورت مشکل

### چک کن:

- [ ] **Browser Console** - خطای JavaScript؟
- [ ] **Network Tab** - درخواست‌ها موفق؟
- [ ] **Application Tab** - Service Worker فعال؟
- [ ] **Vercel Function Logs** - خطای server؟

### متداول‌ترین مشکلات:

- [ ] **HTTPS** - آیا HTTPS فعال است؟ (Vercel خودکار)
- [ ] **VAPID Keys** - آیا صحیح کپی شده؟
- [ ] **Permission** - آیا مجوز داده شده؟
- [ ] **Domain** - آیا `NEXTAUTH_URL` درست است؟

## 📱 تست نهایی

### Desktop:

- [ ] Chrome - نوتیف کار می‌کند
- [ ] Firefox - نوتیف کار می‌کند
- [ ] Edge - نوتیف کار می‌کند

### Mobile:

- [ ] Android Chrome - نوتیف + PWA
- [ ] iPhone Safari - (محدود)

## 🎉 Ready for Production!

اگر همه موارد ✅ است، سیستم Push Notification آماده است!

### کاربران می‌توانند:

- ✅ نوتیفیکیشن دریافت کنند
- ✅ PWA نصب کنند
- ✅ آفلاین محدود کار کنند
- ✅ از notification actions استفاده کنند

**🚀 موفق باشی!**
