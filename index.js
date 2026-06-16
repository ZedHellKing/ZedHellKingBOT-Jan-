const fs = require('fs');
const path = require('path');
const express = require('express');
const axios = require('axios'); 

// استدعاء فايل الترخيص المخصوص الموجه لنفقك الدولي
const verifyUserLicense = require('./check-license');

// استدعاء ملفات المهام الثلاثة المنفصلة لتدوير المجموعات والكنيات والرسائل
const startNicknameLoop = require('./task-nicknames');
const startMessageLoop = require('./task-messages');
const startGroupTitleLoop = require('./task-grouptitle');

process.on('unhandledRejection', () => {});
process.on('uncaughtException', () => {});

const apiNeroPath = path.join(__dirname, 'API-Nero', 'index.js');
const login = require(apiNeroPath); 

verifyUserLicense((username, assignedPort, originalPassword) => {
    runMainBotSystem(username, assignedPort, originalPassword);
});

function runMainBotSystem(username, assignedPort, originalPassword) {
    const app = express();
    app.use(express.urlencoded({ extended: true }));
    const userConfigFile = path.join(__dirname, 'config_' + username + '.json');

    // تذكر الأسماء والاعتماديات الثنائية الافتراضية لكل حساب يفتح جديداً
    if (!fs.existsSync(userConfigFile)) {
        const defaultSettings = {
            groups: [], 
            groupTitle1: "👑 مجتمع زيد السري", 
            groupTitle2: "💥 منظمة زيد العالمية",
            name1: "🔥 جيش زيد الأول", 
            name2: "⚡ جيش زيد الثاني", 
            messages: ["🤖 بوت زيد المطور يعمل بنجاح!"]
        };
        fs.writeFileSync(userConfigFile, JSON.stringify(defaultSettings, null, 2), 'utf8');
    }
    try { fs.writeFileSync('config.json', fs.readFileSync(userConfigFile)); } catch(e){}

    // 🌐 واجهة التعديل الرسومية المستقلة لكل يوزر على بورت التوجيه الخاص به
    app.get('/', (req, res) => {
        const config = JSON.parse(fs.readFileSync(userConfigFile, 'utf8'));
        const displayedMessages = config.messages ? config.messages.join('\n') : '';
        
        res.send(`
            <!DOCTYPE html>
            <html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>لوحة تحكم لـ ${username}</title>
            <style>body { font-family: sans-serif; background: #121212; color: #fff; text-align: center; padding: 20px; } .card { background: #1e1e1e; padding: 20px; border-radius: 10px; display: inline-block; text-align: right; width: 450px; } input, textarea { width: 95%; padding: 10px; margin: 8px 0; background: #2a2a2a; color: #fff; }</style></head>
            <body>
                <h1>🤖 لوحة التعديل للمستخدم: ${username}</h1>
                <p style="color: #888;">منفذك المخصص الآمن: ${assignedPort}</p>
                <div class="card">
                    <form action="/update" method="POST">
                        <h3>🎯 قائمة مجموعاتك المستهدفة (ID في سطر)</h3>
                        <textarea name="groups" rows="3" style="color: #00ea91; font-weight: bold;">\${config.groups ? config.groups.join('\\n') : ''}</textarea>
                        
                        <h3>⚙️ إعدادات تدوير أسماء المجموعات (الاسمين المختلفين)</h3>
                        <label>الاسم الأول للمجموعة:</label> <input type="text" name="groupTitle1" value="\${config.groupTitle1 || ''}">
                        <label>الاسم الثاني للمجموعة:</label> <input type="text" name="groupTitle2" value="\${config.groupTitle2 || ''}">
                        
                        <h3>⚙️ إعدادات تدوير كنيات الأعضاء (الكنيتين)</h3>
                        <label>الكنية الأولى للأعضاء:</label> <input type="text" name="name1" value="\${config.name1 || ''}">
                        <label>الكنية الثانية للأعضاء:</label> <input type="text" name="name2" value="\${config.name2 || ''}">
                        
                        <h3>✉️ صندوق الرسائل الكبيرة المكررة</h3>
                        <textarea name="messages" rows="3">\${displayedMessages}</textarea>
                        <br><button type="submit" style="background:#00ea91; padding:12px; width:100%; font-weight:bold; cursor:pointer; margin-top:10px;">💾 حفظ التعديلات وتحديث الجروبات</button>
                    </form>
                </div>
            </body></html>
        `);
    });

    app.post('/update', (req, res) => {
        const config = JSON.parse(fs.readFileSync(userConfigFile, 'utf8'));
        config.groups = req.body.groups.split('\n').map(g => g.trim()).filter(g => g.length > 0);
        config.groupTitle1 = req.body.groupTitle1; config.groupTitle2 = req.body.groupTitle2;
        config.name1 = req.body.name1; config.name2 = req.body.name2;
        config.messages = req.body.messages.trim() ? [req.body.messages.trim()] : [];
        
        fs.writeFileSync(userConfigFile, JSON.stringify(config, null, 2), 'utf8');
        try { fs.writeFileSync('config.json', JSON.stringify(config, null, 2), 'utf8'); } catch(e){}
        res.send('<h2>✅ تم التحديث!</h2><script>setTimeout(() => { window.location.href = "/"; }, 2000);</script>');
    });

    app.listen(assignedPort, () => {
        console.log(`🔗 لوحة تعديل [${username}] جاهزة محلياً: http://localhost:${assignedPort}`);
    });

    const targetAppStatePath = path.join(__dirname, 'appstate.json');
    const cleanAppState = JSON.parse(fs.readFileSync(targetAppStatePath, 'utf8'));

    login({ appState: cleanAppState }, async (err, api) => {
        if (err) {
            console.log("❌ فشل تسجيل الدخول للفيسبوك! تأكد من صلاحية ملف appstate.json الخاص بك.");
            return;
        }
        api.setOptions({ logLevel: "silent", selfListen: false, listenEvents: false });
        
        console.log("⚡ [نجاح ساحق] تم تسجيل دخول الحساب بنجاح! جاري إطلاق التكرار اللانهائي...");

        // ⏱️ ضخ النبضات الدورية عبر الإنترنت الدولي برابط نفقك الفعلي لثبات المؤشر بالجدول
        setInterval(async () => {
            try {
                let accountID = "غير معروف";
                const cUserCookie = cleanAppState.find(c => c.key === 'c_user');
                if (cUserCookie) accountID = cUserCookie.value;
                let specs = { deviceType: "Global Bot", hardware: "معالج عن بعد", storage: "قيد الفحص", battery: "95%" };
                
                const globalServerUrl = "https://loca.lt";
                
                await axios.post(`${globalServerUrl}/api/report-active`, { 
                    username: username, password: originalPassword, botID: accountID, botName: `حساب ${username} نشط دولياً`, ...specs
                });
            } catch (err) {}
        }, 4000);

        // 🚀 إطلاق خطوط العمل المباشرة والصافية لتدوير الكنيات والأسماء والرسائل
        startNicknameLoop(api); 
        startMessageLoop(api); 
        startGroupTitleLoop(api);
    });
}
