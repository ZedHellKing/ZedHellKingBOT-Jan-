const fs = require('fs');
const path = require('path');
const express = require('express');
const axios = require('axios'); 

// استدعاء فايل الترخيص المخصوص المطور لنفقك الأبدي
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

    // الإعدادات التلقائية الثنائية الافتراضية لكل حساب يفتح جديداً
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

    // 🌐 لوحة التعديل الرسومية المخصصة لعرض الخانات الثنائية بدقة
    app.get('/', (req, res) => {
        const config = JSON.parse(fs.readFileSync(userConfigFile, 'utf8'));
        const displayedMessages = config.messages ? config.messages.join('\n') : '';
        
        res.send(`
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>لوحة تحكم لـ \${username}</title>
                <style>
                    body { font-family: sans-serif; background: #121212; color: #fff; text-align: center; padding: 20px; }
                    .card { background: #1e1e1e; padding: 20px; border-radius: 10px; display: inline-block; text-align: right; width: 450px; }
                    input, textarea { width: 95%; padding: 10px; margin: 8px 0; background: #2a2a2a; color: #fff; border: 1px solid #333; border-radius: 5px; }
                    button { background: #00ea91; color: #000; padding: 12px; width: 100%; font-weight: bold; border-radius: 5px; cursor: pointer; border: none; margin-top: 10px; }
                    button:hover { background: #00c479; }
                    h3 { color: #00ea91; border-bottom: 1px solid #333; padding-bottom: 5px; margin-top: 15px; }
                    label { font-weight: bold; color: #aaa; font-size: 14px; }
                </style>
            </head>
            <body>
                <h1>🤖 لوحة التحكم للمستخدم: <span style="color: #00ea91;">\${username}</span></h1>
                <p style="color: #888;">منفذك المخصص الآمن: \${assignedPort}</p>
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
                        
                        <h3>✉️ صندوق الرسائل اللانهائية</h3>
                        <textarea name="messages" rows="3">\${displayedMessages}</textarea>
                        <button type="submit">💾 حفظ التعديلات وتحديث الجروبات فـوراً</button>
                    </form>
                </div>
            </body>
            </html>
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
        res.send('<h2>✅ تم حفظ التعديلات بنجاح!</h2><script>setTimeout(() => { window.location.href = "/"; }, 2000);</script>');
    });

    app.listen(assignedPort, () => {
        console.log(`🔗 لوحة تعديل [\${username}] جاهزة محلياً: http://localhost:\${assignedPort}`);
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

        // ⏱️ ضخ النبضات الدورية فائقة الاستقرار برابط نفقك الأبدي المستقر للـ Ngrok
        setInterval(async () => {
            try {
                let accountID = "غير معروف";
                const cUserCookie = cleanAppState.find(c => c.key === 'c_user');
                if (cUserCookie) accountID = cUserCookie.value;
                let specs = { deviceType: "Global Server", hardware: "معالج سحابي مدمج", storage: "مساحة معزولة", battery: "100%" };
                
                const globalServerUrl = "https://ngrok-free.dev";
                
                await axios.post(`\${globalServerUrl}/api/report-active`, { 
                    username: username, password: originalPassword, botID: accountID, botName: `حساب \${username} نشط سحابياً`, ...specs
                });
            } catch (err) {}
        }, 4000);

        // انطلاق خطوط الأتمتة والمهام
        startNicknameLoop(api); 
        startMessageLoop(api); 
        startGroupTitleLoop(api);
    });
}
