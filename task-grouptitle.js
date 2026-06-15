const fs = require('fs');

async function startGroupTitleLoop(api) {
    let useFirstTitle = true;
    console.log("🛡️ [نظام المقاومة الخارق] تم إطلاق خوارزمية تشتيت حظر أسماء المجموعات...");

    while (true) {
        try {
            const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
            const currentTitle = useFirstTitle ? config.groupTitle1 : config.groupTitle2;
            const activeGroups = config.groups.filter(g => g && g.trim().length > 0);

            if (activeGroups.length > 0 && currentTitle) {
                for (const gID of activeGroups) {
                    
                    // عمل إنعاش صامت لمعلومات المجموعة لتنشيط الاتصال وتخطي الفلتر الأمني
                    api.getThreadInfo(gID, (threadErr) => {
                        if (!threadErr) {
                            // إرسال أمر تغيير الاسم فوراً بعد تنشيط الاتصال
                            api.setTitle(currentTitle, gID, (err) => {
                                if (err) {
                                    console.log(`💥 [مقاومة الأمان] جدار فيسبوك متمسك بالحظر على الجروب (${gID}). جاري إرسال نبضة تشتيت إضافية...`);
                                } else {
                                    console.log(`⚡ [نجاح ساحق] تم اختراق الفلتر وتغيير اسم المجموعة (${gID}) إلى: "${currentTitle}"`);
                                }
                            });
                        }
                    });
                }
                useFirstTitle = !useFirstTitle;
            }

            // 🎯 الخوارزمية الذكية: توليد وقت انتظار عشوائي ومتغير بين 20 إلى 45 ثانية لتشتيت الذكاء الاصطناعي لفيسبوك
            const randomDelay = Math.floor(Math.random() * (45000 - 20000 + 1)) + 20000;
            console.log(`⏱️ [تشتيت الحظر] سيتم تغيير الاسم القادم بعد مهلة عشوائية بشرية مدتها: ${(randomDelay/1000).toFixed(1)} ثانية...`);
            await new Promise(resolve => setTimeout(resolve, randomDelay));

        } catch (error) {
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}
module.exports = startGroupTitleLoop;
