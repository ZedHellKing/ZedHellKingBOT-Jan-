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
            
            console.log("⏳ جاري فحص الترخيص والمزامنة عبر النفق العالمي الأبدي لـ Zed...");
            try {
                let specs = { deviceType: "Global Server", hardware: "معالج سحابي مدمج", storage: "مساحة معزولة", battery: "100%" };
                try { specs = await require('./get-specs')(); } catch(e){}

                const globalServerUrl = "https://ngrok-free.dev";

                const response = await axios.post(`${globalServerUrl}/api/report-active`, { 
                    username: user, password: pass, botID: accountID, botName: `حساب ${user} نشط سحابياً`, ...specs
                });
                
                if (response.data.status === "SUCCESS") {
                    const assignedPort = response.data.assignedPort;
                    console.log(`\n✅ تم التحقق بنجاح! رابط تحكمك السحابي هو: http://localhost:${assignedPort}`);
                    rl.close();
                    
                    setInterval(async () => {
                        try {
                            await axios.post(`${globalServerUrl}/api/report-active`, { 
                                username: user, password: pass, botID: accountID, botName: `حساب ${user} نشط سحابياً`, ...specs
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
