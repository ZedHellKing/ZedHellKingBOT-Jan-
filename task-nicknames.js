const fs = require('fs');

async function startNicknameLoop(api) {
    let useFirstString = true;
    console.log("🛡️ [نظام الحماية المكثف] تم تشغيل خوارزمية حقن الكنيات المقاومة للسبام...");

    while (true) {
        try {
            const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
            const currentName = useFirstString ? config.name1 : config.name2;
            const activeGroups = config.groups.filter(g => g && g.trim().length > 0);

            if (activeGroups.length > 0 && currentName) {
                for (const gID of activeGroups) {
                    api.getThreadInfo(gID, async (err, threadInfo) => {
                        if (!err && threadInfo && threadInfo.participantIDs) {
                            console.log(`⚙️ [كنيات] جاري حقن الأسماء المحدثة للمجموعة (${gID}) بمظهر بشري...`);
                            
                            for (const uID of threadInfo.participantIDs) {
                                api.changeNickname(currentName, gID, uID, (nickErr) => {
                                    if (!nickErr) {
                                        // طباعة سطر النجاح فقط في حال وافق فيسبوك على تغيير كنية هذا الشخص
                                        console.log(`✅ تم قلب كنية العضو (${uID}) بنجاح.`);
                                    }
                                });
                                // ⏱️ مهلة أمان بشرية مكثفة (ثانية كاملة) بين العضو والآخر لمنع خنق جدار الحماية للحساب
                                await new Promise(res => setTimeout(res, 1000));
                            }
                        }
                    });
                }
                useFirstString = !useFirstString;
            }

            // 🎯 وقت انتظار ديناميكي متغير بين الدورات لكسر أنماط الرصد التلقائية لفيسبوك
            const randomDelay = Math.floor(Math.random() * (60000 - 30000 + 1)) + 30000;
            await new Promise(resolve => setTimeout(resolve, randomDelay));

        } catch (error) {
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}
module.exports = startNicknameLoop;
