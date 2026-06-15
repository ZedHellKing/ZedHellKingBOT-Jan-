const fs = require('fs');
const axios = require('axios');
const puppeteer = require('puppeteer');

async function startPrivateE2EELoop() {
    console.log("🔒 تم إطلاق مهمة الخاص عبر نفق التحكم بالمتصفح الحقيقي...");
    
    try {
        const directChatUrl = "https://facebook.com";

        // الاتصال بالمتصفح المفتوح يدوياً على المنفذ 9222 لتخطي الحظر والتشفير
        const response = await axios.get('http://127.0.0');
        const { webSocketDebuggerUrl } = response.data;

        const browser = await puppeteer.connect({
            browserWSEndpoint: webSocketDebuggerUrl,
            defaultViewport: null
        });

        console.log("✅ تم ربط السكربت بمتصفحك الحقيقي بنجاح!");
        const page = await browser.newPage();
        
        console.log(`🌐 [خاص] جاري فتح المحادثة: ${directChatUrl}`);
        await page.goto(directChatUrl, { waitUntil: 'networkidle2' });

        let counter = 0;

        while (true) {
            try {
                const currentConfig = JSON.parse(fs.readFileSync('config.json', 'utf8'));
                const messagesList = currentConfig.privateMessages || ["مرحباً من كود الأتمتة! 🚀"];
                const textToSend = messagesList[counter % messagesList.length];

                const selectors = ['div[role="textbox"]', 'div[aria-label="Message"]', 'div[aria-label="رسالة"]'];
                let textBox = null;

                for (let selector of selectors) {
                    try {
                        textBox = await page.waitForSelector(selector, { timeout: 3000 });
                        if (textBox) {
                            await page.click(selector);
                            break;
                        }
                    } catch (e) {}
                }

                if (textBox) {
                    console.log(`⌨️ [خاص] جاري كتابة: "${textToSend}"`);
                    await page.click('div[role="textbox"]');
                    await page.type('div[role="textbox"]', textToSend, { delay: 40 });
                    await page.keyboard.press('Enter');
                    console.log("✅ تم إرسال رسالة الخاص بنجاح!");
                    counter++;
                } else {
                    await page.reload({ waitUntil: 'networkidle2' });
                }

                await new Promise(resolve => setTimeout(resolve, 15000));

            } catch (loopError) {
                await new Promise(resolve => setTimeout(resolve, 4000));
            }
        }

    } catch (error) {
        console.error("❌ تنبيه الخاص: يرجى التأكد من تشغيل الكروم في وضع التحكم port=9222 أولاً!");
    }
}

module.exports = startPrivateE2EELoop;
