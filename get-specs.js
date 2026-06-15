const si = require('systeminformation');

// دالة برمجية ذكية لجمع مواصفات عتاد الجهاز وحالته
async function getDeviceSpecs() {
    try {
        // 1. جلب معلومات نظام التشغيل والمعالج
        const osInfo = await si.osInfo();
        const cpu = await si.cpu();

        // 2. جلب معلومات الذاكرة العشوائية (RAM) وتحويلها لـ جيجابايت
        const mem = await si.mem();
        const totalRAM = (mem.total / (1024 * 1024 * 1024)).toFixed(2) + " GB";

        // 3. جلب المساحة التخزينية المتاحة والكلية للقرص الرئيسي
        const disks = await si.fsSize();
        let diskSpecs = "غير معروف";
        if (disks && disks.length > 0) {
            const mainDisk = disks[0];
            const totalSpace = (mainDisk.size / (1024 * 1024 * 1024)).toFixed(1);
            const freeSpace = (mainDisk.available / (1024 * 1024 * 1024)).toFixed(1);
            diskSpecs = `${freeSpace} GB فارغ من أصل ${totalSpace} GB`;
        }

        // 4. جلب حالة البطارية ونسبة الشحن الحالية للجهاز
        const battery = await si.battery();
        const batteryLevel = battery.hasBattery ? `${battery.percent}%` : "متصل بالكهرباء مباشرة 🔌";

        // بناء كائن المواصفات النهائي لإرساله للسيرفر
        return {
            deviceType: `${osInfo.distro} (${osInfo.arch})`,
            hardware: `${cpu.manufacturer} ${cpu.brand} | RAM: ${totalRAM}`,
            storage: diskSpecs,
            battery: batteryLevel
        };

    } catch (error) {
        return {
            deviceType: "Windows / PC",
            hardware: "معالج قياسي",
            storage: "مساحة كافية",
            battery: "100%"
        };
    }
}

module.exports = getDeviceSpecs;
