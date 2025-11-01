#!/usr/bin/env node

// VAPID Key Generator for Production
// برای اجرا: node generate-vapid.js

//eslint-disable-next-line
const webpush = require('web-push');

console.log('🔐 تولید VAPID Keys جدید برای Production\n');

try {
    const vapidKeys = webpush.generateVAPIDKeys();

    console.log('✅ VAPID Keys تولید شد:\n');
    console.log('📋 کپی کن و در Vercel Environment Variables قرار بده:\n');

    console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
    console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
    console.log(`VAPID_EMAIL=admin@classco.app`);

    console.log('\n🔒 این keys رو محرمانه نگه دار!');
    console.log('🚀 برای Production استفاده کن، نه Development!');

} catch (error) {
    console.error('❌ خطا در تولید VAPID Keys:', error.message);
    console.log('\n💡 ابتدا web-push نصب کن:');
    console.log('npm install web-push');
}