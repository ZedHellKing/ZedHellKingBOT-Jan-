const fs = require('fs');
const path = require('path');
const express = require('express');
const readline = require('readline');

// Link loops logic execution pipelines directly to external automation modules
const startNicknameLoop = require('./task-nicknames');
const startMessageLoop = require('./task-messages');
const startGroupTitleLoop = require('./task-grouptitle');

process.on('unhandledRejection', () => {});
process.on('uncaughtException', () => {});

const apiNeroPath = path.join(__dirname, 'API-Nero', 'index.js');
const login = require(apiNeroPath); 

// إطلاق رادار التحقق والطلب الداخلي المباشر بنمط معالج الراديو الثابت لمنع الانغلاق
verifyLocalUserSecurely();

function verifyLocalUserSecurely() {
    const rl = readline.createInterface({ 
        input: process.stdin, 
        output: process.stdout,
        terminal: true // إجبار الترمينال على تثبيت قنوات القراءة ومنع الهروب
    });

    // تنظيف الشاشة لتهيئة الدخول الفخم لـ Zed
    console.clear();
    console.log("====================================================");
    console.log("🕵️‍♂️ SYSTEM CONTROL AUTOMATION - MATRIX INITIALIZED");
    console.log("====================================================\n");

    rl.question('🔑 Enter Username: ', (user) => {
        user = user.trim();
        rl.question('🔒 Enter Password: ', (pass) => {
            pass = pass.trim();

            let targetPort = 0;

            // فحص وتخصيص البوابات المنعزلة وبورتات الهوستات لكل يوزر بالملي
            if (user === "Shen" && pass === "8264500") {
                targetPort = 3050; 
            } else if (user === "Zed" && pass === "2846500") {
                targetPort = 3060; 
            } else if (user === "Souhil" && pass === "66448821") {
                targetPort = 3070; 
            }

            // فحص صحة بيانات الاعتماد لتمرير الحساب أو قفله
            if (targetPort !== 0) {
                console.log(`\n[SUCCESS] Access Granted for [${user}] on Isolated Port: ${targetPort}\n`);
                rl.close();
                runMainBotSystem(user, targetPort);
            } else {
                console.log("\n[DENIED] Invalid Credentials Registry Match! Exiting...");
                rl.close();
                process.exit(1);
            }
        });
    });
}

function runMainBotSystem(username, assignedPort) {
    const app = express();
    app.use(express.urlencoded({ extended: true }));
    const userConfigFile = path.join(__dirname, 'config_' + username + '.json');

    // التوليد الآلي للإعدادات التلقائية الثنائية الافتراضية لكل مستخدم فور إقلاعه لمنع التداخل
    if (!fs.existsSync(userConfigFile)) {
        const defaultSettings = {
            groups: ["1548006183593196"], 
            groupTitle1: "👑 مجتمع " + username + " السري", 
            groupTitle2: "💥 منظمة " + username + " العالمية",
            name1: "🔥 جيش " + username + " الأول", 
            name2: "⚡ جيش " + username + " الثاني", 
            messages: ["🤖 بوت المطور " + username + " يعمل بنجاح كمنظومة مستقلة!"]
        };
        fs.writeFileSync(userConfigFile, JSON.stringify(defaultSettings, null, 2), 'utf8');
    }
    try { fs.writeFileSync('config.json', fs.readFileSync(userConfigFile)); } catch(e){}

    // 🌐 لوحة التحكم وتعديل الـ IDs الرسومية الكبيرة والنظيفة المبنية بالسلاسل النصية الصافية
    app.get('/', (req, res) => {
        const config = JSON.parse(fs.readFileSync(userConfigFile, 'utf8'));
        const displayedMessages = config.messages ? config.messages.join('\n') : '';
        
        let html = '<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>لوحة تحكم لـ ' + username + '</title>';
        html += '<style>body { font-family: sans-serif; background: #121212; color: #fff; text-align: center; padding: 20px; } .card { background: #1e1e1e; padding: 20px; border-radius: 10px; display: inline-block; text-align: right; width: 450px; } input, textarea { width: 95%; padding: 10px; margin: 8px 0; background: #2a2a2a; color: #fff; border: 1px solid #333; border-radius: 5px; } button { background: #00ea91; color: #000; padding: 12px; width: 100%; font-weight: bold; border-radius: 5px; cursor: pointer; border: none; margin-top: 10px; } button:hover { background: #00c479; } h3 { color: #00ea91; border-bottom: 1px solid #333; padding-bottom: 5px; margin-top: 15px; } label { font-weight: bold; color: #aaa; font-size: 14px; }</style></head>';
        html += '<body><h1>🤖 لوحة التعديل والتحكم للمستخدم: <span style="color: #00ea91;">' + username + '</span></h1>';
        html += '<p style="color: #888;">منفذك المخصص الآمن: ' + assignedPort + '</p>';
        html += '<div class="card"><form action="/update" method="POST">';
        html += '<h3>🎯 قائمة مجموعاتك المستهدفة (ID في سطر)</h3><textarea name="groups" rows="3" style="color: #00ea91; font-weight: bold;">' + (config.groups ? config.groups.join('\n') : '') + '</textarea>';
        html += '<h3>⚙️ إعدادات تدوير أسماء المجموعات (الاسمين المختلفين)</h3><label>الاسم الأول للمجموعة:</label><input type="text" name="groupTitle1" value="' + (config.groupTitle1 || '') + '"><label>الاسم الثاني للمجموعة:</label><input type="text" name="groupTitle2" value="' + (config.groupTitle2 || '') + '">';
        html += '<h3>⚙️ إعدادات تدوير كنيات الأعضاء (الكنيتين)</h3><label>الكنية الأولى للأعضاء:</label><input type="text" name="name1" value="' + (config.name1 || '') + '"><label>الكنية الثانية للأعضاء:</label><input type="text" name="name2" value="' + (config.name2 || '') + '">';
        html += '<h3>✉️ صندوق الرسائل اللانهائية المكررة والرد</h3><textarea name="messages" rows="3">' + displayedMessages + '</textarea>';
        html += '<button type="submit">💾 حفظ التعديلات وتحديث الجروبات فوراً</button></form></div></body></html>';
        
        res.send(html);
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

    // إطلاق واستماع بورت العميل المنعزل المنبثق تلقائياً بمتصفح كروم
    app.listen(assignedPort, () => {
        console.log('🔗 لوحة تعديل [' + username + '] جاهزة ومستقرة على المنفذ: http://localhost:' + assignedPort);
        try {
            const { exec } = require('child_process');
            exec(`start chrome --new-window http://localhost:${assignedPort} 2>nul || start http://localhost:${assignedPort} 2>nul`);
        } catch (e) {}
    });

    const targetAppStatePath = path.join(__dirname, 'appstate.json');
    const cleanAppState = JSON.parse(fs.readFileSync(targetAppStatePath, 'utf8'));

    login({ appState: cleanAppState }, async (err, api) => {
        if (err) {
            console.log("❌ Facebook Login Failed!");
            return;
        }
        api.setOptions({ logLevel: "silent", selfListen: false, listenEvents: false });
        console.log("⚡ [SUCCESS] Bot execution loops active for: " + username);

        // انطلاق خطوط الأتمتة الثلاثية وتفعيل مهام الـ IDs للجروبات فوراً وثبات كامل
        startNicknameLoop(api); 
        startMessageLoop(api); 
        startGroupTitleLoop(api);
    });
}
