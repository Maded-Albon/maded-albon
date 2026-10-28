const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

const POEMS_FILE = path.join(__dirname, 'poems.json');
const FARMS_FILE = path.join(__dirname, 'farms-requests.json');

// التأكد من وجود ملفات البيانات عند تشغيل السيرفر
if (!fs.existsSync(POEMS_FILE)) {
    fs.writeFileSync(POEMS_FILE, JSON.stringify([]), 'utf8');
}
if (!fs.existsSync(FARMS_FILE)) {
    fs.writeFileSync(FARMS_FILE, JSON.stringify([]), 'utf8');
}

// 1. مسار جلب القصائد والأبيات لعرضها في الموقع
app.get('/api/poems', (req, res) => {
    fs.readFile(POEMS_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: "فشل قراءة الأبيات" });
        res.json(JSON.parse(data || '[]'));
    });
});

// 2. مسار حفظ بيت شعر جديد
app.post('/api/poems', (req, res) => {
    const { poetName, poemText } = req.body;
    
    if (!poemText) {
        return res.status(400).json({ success: false, error: "يرجى كتابة الأبيات" });
    }

    fs.readFile(POEMS_FILE, 'utf8', (err, data) => {
        const poems = err ? [] : JSON.parse(data || '[]');
        const newPoem = {
            id: Date.now(),
            poetName: poetName || "زائر الموقع",
            poemText: poemText,
            date: new Date().toLocaleDateString('ar-SA')
        };
        
        poems.unshift(newPoem);

        fs.writeFile(POEMS_FILE, JSON.stringify(poems, null, 2), (writeErr) => {
            if (writeErr) return res.status(500).json({ success: false, error: "فشل الحفظ" });
            res.json({ success: true, poem: newPoem });
        });
    });
});

// 3. مسار استقبال وحفظ طلبات المزارع الجديدة
app.post('/api/farm-requests', (req, res) => {
    const { name, location, trees, height, map } = req.body;
    
    if (!name || !location || !trees || !height) {
        return res.status(400).json({ success: false, error: "الحقول المطلوبة ناقصة" });
    }

    fs.readFile(FARMS_FILE, 'utf8', (err, data) => {
        const requests = err ? [] : JSON.parse(data || '[]');
        const newRequest = {
            id: Date.now(),
            name,
            location,
            trees,
            height,
            map: map || "",
            date: new Date().toLocaleDateString('ar-SA')
        };
        
        requests.unshift(newRequest);

        fs.writeFile(FARMS_FILE, JSON.stringify(requests, null, 2), (writeErr) => {
            if (writeErr) return res.status(500).json({ success: false, error: "فشل حفظ الطلب" });
            res.json({ success: true, request: newRequest });
        });
    });
});

// توجيه باقي المسارات إلى صفحة index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
