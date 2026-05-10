# 🚀 GROQ API Server - Documentation

سيرفر backend مخصص للتعامل مع GROQ API بدون مشاكل CORS.

## 📍 نقاط النهاية (Endpoints)

### 1. Health Check
```
GET /api/health
```

**الرد:**
```json
{
  "status": "Server is running ✅",
  "timestamp": "2026-04-29T10:30:45.123Z"
}
```

---

### 2. Chat Endpoint (الرد من GROQ)
```
POST /api/chat
```

**المدخلات (Request Body):**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "السلام عليكم، كيف أبدأ الدراسة؟"
    }
  ]
}
```

**الرد الناجح:**
```json
{
  "success": true,
  "message": "أنصحك ببدء الدرس الأول...",
  "usage": {
    "prompt_tokens": 25,
    "completion_tokens": 150,
    "total_tokens": 175
  }
}
```

**رد الخطأ:**
```json
{
  "error": "Failed to get response from GROQ API",
  "details": "..."
}
```

---

### 3. YouTube Search Endpoint
```
GET /api/youtube/search?q=<search-term>&maxResults=9
```

**المعاملات:**
- `q` (إلزامي): نص البحث
- `maxResults` (اختياري): عدد النتائج (1 - 15)

**الرد الناجح:**
```json
{
  "success": true,
  "items": [
    {
      "id": { "videoId": "abc123" },
      "snippet": {
        "title": "شرح الدرس",
        "channelTitle": "قناة تعليمية"
      }
    }
  ]
}
```

**رد الخطأ:**
```json
{
  "error": "Failed to fetch YouTube results",
  "details": "..."
}
```

---

## 🔧 معاملات الطلب (Request Parameters)

### Messages Array
كل رسالة تحتوي على:
- `role`: "user" أو "assistant"
- `content`: نص الرسالة

**مثال - محادثة متعددة الرسائل:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "ما هي أفضل طريقة للدراسة؟"
    },
    {
      "role": "assistant",
      "content": "أنصحك بـ Pomodoro technique..."
    },
    {
      "role": "user",
      "content": "شكراً! هل هناك نصائح أخرى؟"
    }
  ]
}
```

---

## 🧪 اختبار السيرفر

### من الـ Terminal (PowerShell)
```powershell
# التحقق من التشغيل
Invoke-WebRequest -Uri "http://localhost:3001/api/health"

# اختبار Chat
$body = @{
    messages = @(
        @{
            role = "user"
            content = "مرحباً"
        }
    )
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3001/api/chat" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

### من الـ cURL
```bash
# Health Check
curl http://localhost:3001/api/health

# Chat Request
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "مرحباً"}
    ]
  }'
```

### من الـ JavaScript
```javascript
const response = await fetch('http://localhost:3001/api/chat', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        messages: [
            { role: 'user', content: 'مرحباً' }
        ]
    })
});

const data = await response.json();
console.log(data.message);
```

---

## 📊 خصائص النموذج (Model Parameters)

```javascript
{
    model: 'mixtral-8x7b-32768',     // نموذج متقدم
    max_tokens: 1024,                // الحد الأقصى للرد
    temperature: 0.7                 // درجة الإبداعية
}
```

### شرح المعاملات:
- **model**: نموذج Mixtral (8 خبراء متخصصين)
- **max_tokens**: طول الرد الأقصى (كلمات)
- **temperature**: 0.7 توازن بين الدقة والإبداعية

---

## 🔒 الأمان

### كيفية حماية المفتاح:
1. **المفتاح على السيرفر فقط** - لا يُرسل إلى المتصفح
2. **متغيرات البيئة** - يُخزن في `.env`
3. **CORS محدود** - فقط من نفس المصدر
4. **معالجة الأخطاء** - لا تكشف تفاصيل API

### متغيرات البيئة المطلوبة:
```env
GROQ_API_KEY=your_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
PORT=3001
NODE_ENV=development
```

---

## 🐛 استكشاف الأخطاء

### خطأ 400 - Bad Request
**السبب**: صيغة الطلب غير صحيحة
**الحل**: تأكد من وجود حقل `messages` كمصفوفة

### خطأ 401 - Unauthorized
**السبب**: مفتاح API غير صحيح
**الحل**: تحقق من `.env` و`GROQ_API_KEY`

### خطأ 500 - Server Error
**السبب**: خطأ داخلي
**الحل**: اطلع على سجلات الـ Terminal

### CORS Error
**السبب**: طلب من مصدر غير مسموح
**الحل**: التأكد من أن الفرونت يرسل من `localhost:5500`

---

## 📈 الأداء والحدود

### حدود GROQ API:
- **RPM (Requests Per Minute)**: 30
- **TPM (Tokens Per Minute)**: 600
- **Max Tokens Per Request**: 4096

### نصائح الأداء:
1. استخدم caching للأسئلة المتكررة
2. قلل طول السياق المحفوظ
3. اختبر مع `max_tokens: 1024`

---

## 🚀 البدء السريع

```bash
# 1. التثبيت
npm install

# 2. تشغيل السيرفر
npm start

# 3. في terminal أخرى، اختبر
curl http://localhost:3001/api/health
```

---

## 📝 الملفات ذات الصلة

- `server.js` - كود السيرفر الرئيسي
- `.env` - متغيرات البيئة
- `dashboard.html` - استخدام السيرفر
- `package.json` - المكتبات المطلوبة

---

**آخر تحديث**: 29 إبريل 2026
**الإصدار**: 1.0.0
