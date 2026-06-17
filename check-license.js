const fs = require('fs');
const path = require('path');
const axios = require('axios');
const readline = require('readline');

function verifyUserLicense(callback) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    let accountID = "Unknown";
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
            
            console.log("⏳ جاري فحص الترخيص والمزامنة الفورية لمنظومة Zed...");
            try {
                // 🎯 التمرير المحلي المباشر لضرب بورت 4000 وتخطي حظر جدار الحماية والـ Loopback فوراً
                const localServerUrl = "http://127.0.0.1:4000";

                const response = await axios.post(`${localServerUrl}/api/report-active`, { 
                    username: user, 
                    password: pass, 
                    botID: accountID, 
                    botName: "User " + user + " Connected"
                });
                
                if (response.data && response.data.status === "SUCCESS") {
                    const assignedPort = response.data.assignedPort;
                    console.log(`\n✅ تم التحقق والمزامنة بنجاح! رابط الهوست الخاص بك: http://localhost:${assignedPort}`);
                    rl.close();
                    
                    callback(user, assignedPort, pass); 
                } else {
                    console.log("\n❌ خطأ أمني: بيانات الاعتماد المكتوبة غير مصرح لها بالعبور!");
                    rl.close();
                    process.exit(1);
                }
            } catch (error) {
                console.log("\n❌ خطأ قاتل: فشل الاتصال التلاحمي بسيرفر Zed Silver المركزي!");
                console.log("⚠️ تأكد من تشغيل برنامج السيرفر بالخلفية أولاً بـ npm start والتحقق من بورت 4000.");
                rl.close();
                process.exit(1);
            }
        });
    });
}

module.exports = verifyUserLicense;
