const express = require('express');
const path = require('path');
const axios = require('axios'); // تأكد من وجوده في package.json
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// خدمة ملفات الواجهة الأمامية من المجلد الحالي
app.use(express.static(path.join(__dirname)));

// نقطة النهاية (Endpoint) الخاصة بطلب التحقق عبر نفاذ
app.post('/api/nafath', async (req, res) => {
    try {
        const { nationalId } = req.body;

        // هنا يتم ربط الطلب الحقيقي بـ API نفاذ الرسمي باستخدام بيانات الاعتماد من البيئة
        /* 
        const response = await axios.post('رابط_بوابة_نفاذ_الرسمي', {
            nationalId: nationalId,
            appId: process.env.NAFATH_APP_ID,
            appKey: process.env.NAFATH_APP_KEY
        });
        */

        // نموذج استجابة جاهز للربط الفعلي (يمكنك تعديله حسب وثيقة ربط نفاذ الرسمية)
        res.status(200).json({
            success: true,
            message: "تم إرسال طلب نفاذ بنجاح، يرجى قبول الطلب من تطبيق نفاذ.",
            transId: "NF-" + Math.floor(Math.random() * 1000000),
            random: Math.floor(Math.random() * 90 + 10) // الرقم العشوائي للتحقق
        });

    } catch (error) {
        console.error("Nafath Error:", error.message);
        res.status(500).json({ success: false, message: "فشل الاتصال بخدمة نفاذ" });
    }
});

// توجيه الصفحة الرئيسية لملف الـ HTML
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});