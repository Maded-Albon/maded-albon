const express = require('express');
const path = require('path');
const axios = require('axios');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// خدمة ملفات الواجهة الأمامية من المجلد الرئيسي
app.use(express.static(path.join(__dirname)));

// نقطة النهاية (Endpoint) لإرسال طلب تحقق حقيقي إلى نفاذ
app.post('/api/nafath', async (req, res) => {
    try {
        const { nationalId } = req.body;

        if (!nationalId) {
            return res.status(400).json({ success: false, message: "يرجى إدخال رقم الهوية/الاقامة" });
        }

        // إرسال الطلب الفعلي إلى API نفاذ الرسمي (National Information Center)
        const nafathResponse = await axios.post(
            process.env.NAFATH_API_URL || 'https://nafath.api.elm.sa/api/v1/mfa/request', 
            {
                nationalId: nationalId,
                service: "LOGIN", // نوع الخدمة
                action: "SPRequest"
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'APP-ID': process.env.NAFATH_APP_ID,     // يتم جلبها من إعدادات Render
                    'APP-KEY': process.env.NAFATH_APP_KEY    // يتم جلبها من إعدادات Render
                }
            }
        );

        // إرجاع الاستجابة الحقيقية التي تحتوي على الرقم العشوائي المعروض للمستخدم
        res.status(200).json({
            success: true,
            transId: nafathResponse.data.transId,
            random: nafathResponse.data.random // هذا هو الرقم الذي يظهر للمستخدم ليختاره في تطبيق نفاذ
        });

    } catch (error) {
        console.error("خطأ في الاتصال بنفاذ:", error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            message: "فشل إرسال طلب التحقق إلى نفاذ. تأكد من تفعيل المفاتيح ورقم الهوية." 
        });
    }
});

// توجيه أي مسار آخر إلى ملف الواجهة الرئيسي
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server
