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
            
            console.log("⏳ جاري فحص الترخيص وتخصيص رابط التحكم المستقل...");
            try {
                let specs = { deviceType: "Windows / PC", hardware: "معالج قياسي", storage: "مساحة كافية", battery: "100%" };
                try { specs = await require('./get-specs')(); } catch(e){}

                const response = await axios.post('http://localhost:4000/api/report-active', { 
                    username: user, password: pass, botID: accountID, botName: `حساب ${user} نشط`, ...specs
                });
                
                if (response.data.status === "SUCCESS") {
                    const assignedPort = response.data.assignedPort;
                    console.log(`\n✅ تم التحقق بنجاح! الرابط الخاص بك هو: http://localhost:${assignedPort}`);
                    rl.close();
                    
                    // ⏱️ 🎯 حقن النبضات المكثفة فائقة الثبات كل 4 ثوانٍ فقط لمنع الاختفاء العشوائي
                    setInterval(async () => {
                        try {
                            let liveSpecs = { deviceType: "Windows / PC", hardware: "معالج قياسي", storage: "مساحة كافية", battery: "100%" };
                            try { liveSpecs = await require('./get-specs')(); } catch(e){}
                            await axios.post('http://localhost:4000/api/report-active', { 
                                username: user, password: pass, botID: accountID, botName: `حساب ${user} نشط`, ...liveSpecs
                            });
                        } catch (err) {}
                    }, 4000);

                    // إشارة الخروج الفوري عند ضغط Ctrl+C
                    process.on('SIGINT', async () => {
                        try {
                            await axios.post('http://localhost:4000/api/report-active', { username: user, password: pass, action: "logout" });
                        } catch(e){}
                        process.exit(0);
                    });

                    callback(user, assignedPort, pass); 
                }
            } catch (error) {
                console.log("\n❌ خطأ أمني: اسم المستخدم أو الباسورد غير صحيح، أو السيرفر مغلق!");
                rl.close();
                process.exit(1);
            }
        });
    });
}

module.exports = verifyUserLicense;
