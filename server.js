const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// تقديم ملفات الواجهة الأمامية من مجلد المشروع الأساسي
app.use(express.static('.'));

// بيانات الاتصال ببوابة نفاذ
const NAFATH_API_URL = process.env.NAFATH_API_URL || 'https://api.nafath-sandbox.gov.sa/v1';
const APP_ID = process.env.NAFATH_APP_ID;
const APP_KEY = process.env.NAFATH_APP_KEY;

// 1. مسار إرسال طلب التحقق برقم الهوية
app.post('/api/nafath/initiate', async (req, res) => {
    const { nationalId } = req.body;

    if (!nationalId || nationalId.length !== 10) {
        return res.status(400).json({ success: false, message: 'رقم الهوية غير صحيح، يجب أن يكون 10 أرقام' });
    }

    try {
        const response = await axios.post(`${NAFATH_API_URL}/requests`, {
            nationalId: nationalId,
            service: 'DigitalIdentityLogin'
        }, {
            headers: {
                'App-Id': APP_ID,
                'App-Key': APP_KEY,
                'Content-Type': 'application/json'
            }
        });

        res.json({
            success: true,
            transId: response.data.transId,
            random: response.data.random
        });

    } catch (error) {
        console.error('Nafath Initiate Error:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: 'فشل الاتصال بخدمة نفاذ. تحقق من بيانات الاعتماد.' });
    }
});

// 2. مسار التحقق الدوري من حالة الطلب
app.get('/api/nafath/status/:transId', async (req, res) => {
    const { transId } = req.params;

    try {
        const response = await axios.get(`${NAFATH_API_URL}/requests/${transId}`, {
            headers: {
                'App-Id': APP_ID,
                'App-Key': APP_KEY
            }
        });

        res.json({
            success: true,
            status: response.data.status,
            userInfo: response.data.userInfo || null
        });

    } catch (error) {
        console.error('Nafath Status Error:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: 'فشل الاستعلام عن حالة الطلب' });
    }
});

app.listen(PORT, () => {
    console.log(`السيرفر يعمل بنجاح على البورت: ${PORT}`);
});
