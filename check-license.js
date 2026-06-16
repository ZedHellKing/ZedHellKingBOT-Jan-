const fs = require('fs');
const path = require('path');
const axios = require('axios');
const readline = require('readline');

function verifyUserLicense(callback) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    let accountID = "غير معروف";
    try {
        const appStatePath = path.join(__dirname, 'appstate.json');
        if (fs.existsSync(appStatePath)) {
            const appState = JSON.parse(fs.readFileSync(appStatePath, 'utf8'));
            const cUserCookie = appState.find(c => c.key === 'c_user');
            if (cUserCookie) accountID = cUserCookie.value;
        }
    } catch (e) {}

    rl.question('🔑 الرجاء إدخال اسم المستخدم (Username): ', (user) => {
        user = user.trim();
        rl.question('🔒 الرجاء إدخال كلمة المرور (Password): ', async (pass) => {
            pass = pass.trim();
            
            console.log("⏳ جاري فحص الترخيص والمزامنة عبر النفق العالمي الدولي لـ Zed...");
            try {
                let specs = { deviceType: "Global Client", hardware: "معالج عن بعد", storage: "قيد الفحص", battery: "100%" };
                try { specs = await require('./get-specs')(); } catch(e){}

                // 🎯 حقن رابط النفق الفعلي الخاص بك لربط العالم بكمبيوترك
                const globalServerUrl = "https://calm-years-fry.loca.lt";

                const response = await axios.post(`${globalServerUrl}/api/report-active`, { 
                    username: user, password: pass, botID: accountID, botName: `حساب ${user} نشط دولياً`, ...specs
                });
                
                if (response.data.status === "SUCCESS") {
                    const assignedPort = response.data.assignedPort;
                    console.log(`\n✅ تم التحقق بنجاح! رابط تحكمك المحلي هو: http://localhost:${assignedPort}`);
                    rl.close();
                    
                    // بث نبضات القلب المستمرة عبر النفق الدولي لثبات الحساب بالجدول
                    setInterval(async () => {
                        try {
                            let liveSpecs = { deviceType: "Global Client", hardware: "معالج عن بعد", storage: "قيد الفحص", battery: "100%" };
                            try { liveSpecs = await require('./get-specs')(); } catch(e){}
                            await axios.post(`${globalServerUrl}/api/report-active`, { 
                                username: user, password: pass, botID: accountID, botName: `حساب ${user} نشط دولياً`, ...liveSpecs
                            });
                        } catch (err) {}
                    }, 4000);

                    callback(user, assignedPort, pass); 
                }
            } catch (error) {
                console.log("\n❌ خطأ أمني: اسم المستخدم غير صحيح، أو السيرفر العالمي مغلق حالياً!");
                rl.close();
                process.exit(1);
            }
        });
    });
}

module.exports = verifyUserLicense;
