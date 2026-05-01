# 📚 TawjihiGuide - دليل التطبيق الكامل v2.0
**منصة التعليم التعاوني المتزامن مع الذكاء الاصطناعي**

---

## 📌 جدول المحتويات

1. [الملفات والبنية](#الملفات-والبنية)
2. [الميزات الرئيسية](#الميزات-الرئيسية)
3. [المتطلبات والتثبيت](#المتطلبات-والتثبيت)
4. [البنية التقنية](#البنية-التقنية)
5. [الأمان والقواعس](#الأمان-والقواعس)
6. [الاستكشاف والأخطاء](#استكشاف-الأخطاء)

---

## 📂 الملفات والبنية

### 🔐 صفحات المصادقة
```
signup.html
├── تسجيل حساب جديد
├── تسجيل دخول (Email/Password)
├── Google OAuth
├── استعادة كلمة المرور
└── دعم العربية والإنجليزية
```

### 📖 صفحات التعليم الأساسية
```
dashboard.html
├── لوحة التحكم الرئيسية
├── عرض التقدم في المواد
├── الإحصائيات والنقاط
├── الشارات والإنجازات
└── المساعد الذكي (GROQ)

courses.html
├── قائمة المواد الدراسية
├── المواد: عربي، إنجليزي، تاريخ، دين
├── نقل سريع للمادة
└── تصميم بطاقات استجابي

course-detail.html (مهم 🔥)
├── بحث YouTube متكامل
├── عرض نتائج الفيديوهات
├── اختيار الفيديو وتحميله
├── إنشاء غرفة دراسة جديدة
├── Modal 3 حالات (تحميل/نجاح/خطأ)
├── نسخ رابط المشاركة
└── وضع السينما

study-room.html (الميزة الأساسية ⭐)
├── فيديو YouTube متزامن
├── شات مباشر متزامن
├── إدارة المشاركين
├── نظام الأدمن والأدوار
├── عرض الحالة الحية
├── حذف الرسائل (للأدمن)
└── نسخ رابط الغرفة
```

### 📊 صفحات إضافية
```
quiz.html - الاختبارات والأسئلة
profile.html - الملف الشخصي
messages.html - الرسائل المباشرة
leaderboard.html - لوحة المتصدرين
notifications.html - الإشعارات
search-users.html - البحث عن الطلاب
teacher.html - لوحة المعلم
admin-teachers.html - إدارة المعلمين
```

### 🔒 ملفات الأمان والنصوص
```
site-shell.js
├── شريط التنقل العام
├── شريط الإعلانات
├── تسجيل Service Worker
└── دعم PWA

firestore.rules
├── قواعس أمان Firestore
├── حماية Collections
├── التحكم بالأدوار
└── حماية البيانات الحساسة

server.js / localhost:3001
├── GROQ API Proxy
├── Endpoints: /api/chat
└── Health Check

package.json
└── المكتبات والتبعيات
```

### 📖 ملفات التوثيق
```
README.md (الأصلي)
├── البدء السريع
└── هيكل المشروع

README_FULL.md (هذا الملف)
├── توثيق شامل
├── جميع الميزات
└── التفاصيل الكاملة

FIREBASE_RULES_DOCUMENTATION.md
├── توثيق قواعس Firestore
├── مخططات البيانات
├── الأمثلة العملية
└── استكشاف الأخطاء
```

---

## ✨ الميزات الرئيسية

### 🎥 البحث واختيار الفيديوهات
**في صفحة `course-detail.html`**

✅ **البحث على YouTube**
- أدخل كلمة بحث (مثل: "شرح الفيزياء")
- اضغط "بحث" أو Enter
- يظهر 9 نتائج مع الصور والقنوات

✅ **اختيار الفيديو**
- اضغط "اختيار الفيديو" على أي نتيجة
- الفيديو يُحمل ويظهر الاسم والوصف
- الفيديو جاهز للمشاركة

✅ **إنشاء غرفة دراسية**
- اضغط "دعوة صديق"
- Modal يظهر مع حالة "جاري الإنشاء"
- غرفة تُنشأ في Firestore تلقائياً
- رابط فريد يظهر في Modal
- أنت تكون الأدمن تلقائياً

✅ **المشاركة السهلة**
- اضغط أيقونة النسخ
- الرابط ينسخ تلقائياً
- شارك مع صديقك
- صديقك يفتح الرابط وينضم

---

### 🏠 غرف الدراسة الجماعية
**في صفحة `study-room.html`**

#### 🎬 الفيديو المتزامن
- نفس الفيديو لجميع المشاركين
- تحميل تلقائي من URL
- YouTube Player مدمج
- وضع السينما (Full Screen)

#### 💬 الشات المتزامن
- رسائل فورية مع جميع المشاركين
- عرض اسم وصورة المرسل
- توقيت الرسالة
- رسائل منظمة زمنياً

#### 👥 إدارة المشاركين
- **عرض قائمة المشاركين**
  - الصورة والاسم والحالة
  - تمييز الأدمن بلون أخضر
  - تمييز "أنت" ببطاقة زرقاء

- **إدارة الأدوار** (للأدمن فقط)
  - رابط ترقية مشارك إلى أدمن
  - عرض عدد الأدمن
  - حذف رسائل المشاركين

- **شارة الحالة المباشرة**
  - عدد الأشخاص الموجودين
  - نقطة حمراء نابضة
  - تحديث فوري

#### 🔐 الأدوار والأذونات
- **منشئ الغرفة (Owner)**
  - ينشئ غرفة جديدة
  - أدمن تلقائياً
  - يمكن حذف الرسائل
  - يمكن ترقية آخرين

- **الأدمن (Admin)**
  - يمكن قراءة الرسائل
  - يمكن إرسال الرسائل
  - يمكن حذف رسائل الآخرين
  - يمكن ترقية آخرين (إذا كانوا أصغر)

- **المشارك (Participant)**
  - يمكن قراءة الرسائل
  - يمكن إرسال الرسائل
  - يمكن حذف رسائله فقط
  - لا يمكن حذف رسائل الآخرين

---

### 🤖 المساعد الذكي
**في كل صفحة - أيقونة بيضاوية تطفو**

✅ **تقنية GROQ**
- أسرع من GPT-4
- استجابة فورية
- يفهم السياق

✅ **الأسئلة المدعومة**
- شرح الدروس
- حل المسائل
- تحضير للاختبارات
- نصائح الدراسة

✅ **Modal دردشة جميل**
- رسائل منظمة
- عرض الرسائل والردود
- حقل إدخال كامل
- غلق سريع

---

### 📊 التقدم والإحصائيات
**في صفحة `dashboard.html`**

✅ **عرض التقدم**
- شريط تقدم كلي (0-100%)
- تقدم لكل مادة
- نقاط إجمالية
- عدد الاختبارات

✅ **الشارات والإنجازات**
- شارات مكتسبة
- متطلبات الشارات
- عرض تاريخي

✅ **لوحة المتصدرين**
- ترتيب الطلاب برقم
- أعلى النقاط
- أفضل دقة
- تحديث يومي

---

## 📦 المتطلبات والتثبيت

### ✅ متطلبات النظام
- **Node.js v14+** (للخادم)
- **npm v6+** أو **yarn v1.22+**
- **متصفح حديث** (Chrome, Firefox, Safari, Edge)
- **اتصال إنترنت مستقر**

### ✅ مفاتيح API المطلوبة

#### Firebase
```
✅ Project: tawj-d1f01
✅ API Key: AIzaSyAqXLDqKYDUyuWKjPHaifA1IAzrLstqY54
✅ Auth Domain: tawj-d1f01.firebaseapp.com
✅ Project ID: tawj-d1f01
```

#### YouTube
```
✅ API Key: AIzaSyDcB8PWSEw8a9nzjPWqyi2y4OhlWqtEPtw
✅ Endpoint: https://www.googleapis.com/youtube/v3/search
✅ Quota: 10,000 requests/day
```

#### GROQ
```
✅ API Key: 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
✅ Endpoint: http://localhost:3001/api/chat
✅ Model: mixtral-8x7b-32768
```

### 🚀 خطوات التثبيت

#### 1️⃣ نسخ المشروع
```bash
# Windows PowerShell
cd "c:\Users\96278\OneDrive\Desktop\Tor Browser\New folder (2)"

# أو macOS/Linux
cd ~/projects/tawjihi-guide
```

#### 2️⃣ تثبيت المكتبات
```bash
npm install
```

#### 3️⃣ تشغيل خادم GROQ
```bash
# Terminal 1
npm start
# أو
node server.js

# يجب أن تراه:
# 🚀 GROQ Server running on http://localhost:3001
```

#### 4️⃣ تشغيل خادم الويب
```bash
# Terminal 2
npx --yes serve . -l 5500

# أو استخدم VS Code Live Server
# Ctrl+Shift+P -> Live Server: Open with Live Server
```

#### 5️⃣ فتح التطبيق
```
http://localhost:5500
```

#### 6️⃣ نشر القواعس الأمنية
```bash
# Terminal 3
firebase login
firebase use tawj-d1f01
firebase deploy --only firestore:rules
```

---

## 🏗️ البنية التقنية

### Frontend
```
HTML5 + CSS3 + JavaScript
├── Tailwind CSS (التصميم)
├── Material Symbols (الأيقونات)
├── Firebase SDK (المصادقة + DB)
├── YouTube IFrame API (الفيديو)
└── Responsive Design (مستقبل)
```

### Backend
```
Node.js + Express
├── GROQ API Proxy (/api/chat)
├── Health Check (/api/health)
├── Port: 3001
└── CORS Enabled
```

### Database
```
Firestore (NoSQL)
├── Collections:
│   ├── study-rooms
│   ├── users
│   ├── conversations
│   ├── notifications
│   ├── leaderboard
│   └── admin-teachers
└── Security Rules: firestore.rules
```

### APIs المستخدمة
```
1. Firebase Auth (مصادقة)
2. Firestore (قاعدة البيانات)
3. YouTube Data v3 (بحث الفيديوهات)
4. GROQ (AI Chat)
5. Dicebear (صور الأفاتار)
```

---

## 🔒 الأمان والقواعس

### Firebase Security Rules

**ملف: `firestore.rules`**

#### ✅ Collections المحمية

##### 1. study-rooms
```
✅ Read: Any signed-in user
✅ Create: Creator sets self as owner
✅ Update: Owner/Admin only
❌ Delete: Owner only
```

##### 2. messages (under study-rooms)
```
✅ Read: Room participants only
✅ Create: Participants only
✅ Delete: Sender or Admin
```

##### 3. users
```
✅ Read: Any user (view profiles)
✅ Create: User self only
✅ Update: User self only
✅ Delete: User self only
```

##### 4. conversations
```
✅ Read: Participants only
✅ Create: Participant can create
✅ Update: Participants only
✅ Delete: Owner only
```

##### 5. notifications
```
✅ Read: Target user only
✅ Create: Backend only
✅ Update: User mark as read
✅ Delete: User only
```

### 🔐 ميزات الأمان الأخرى

| الميزة | التفعيل | المكان |
|--------|---------|--------|
| HTTPS | ✅ | Firebase Hosting |
| Auth Required | ✅ | جميع Collections |
| Owner Verification | ✅ | firestore.rules |
| Role-Based Access | ✅ | adminIds arrays |
| Email Verification | ✅ | signup.html |
| Password Strength | ✅ | Firebase (6+ chars) |
| Data Validation | ✅ | firestore.rules |
| Rate Limiting | ⏳ | قريباً |
| Data Encryption | ✅ | Firebase TLS |

---

## 🐛 استكشاف الأخطاء

### مشاكل شائعة وحلولها

#### ❌ "Authentication Required"
```
الحل:
1. تأكد من تسجيل الدخول (signup.html)
2. تحقق من Email Verification
3. امسح Local Storage وحاول مجدداً
4. تحقق من Firebase Connection
```

#### ❌ "Failed to create room"
```
الحل:
1. تأكد من اختيار فيديو
2. تحقق من Firestore Rules صحيحة
3. تحقق من Firebase Project نشط
4. افتح Developer Console لرؤية الخطأ الكامل
```

#### ❌ "Video not loading"
```
الحل:
1. تحقق من YouTube API Key صحيح
2. تحقق من Quota على API Console
3. تحقق من URL Parameters صحيحة
4. حاول فيديو آخر
```

#### ❌ "Chat messages not appearing"
```
الحل:
1. تحقق من أنك عضو في الغرفة
2. تحقق من firestore.rules (allow read)
3. تحقق من Firestore Connection
4. أعد تحميل الصفحة
```

#### ❌ "AI Bot not responding"
```
الحل:
1. تحقق من Terminal: npm start يعمل
2. تحقق من localhost:3001 يرد
3. تحقق من GROQ API Key صحيح
4. شاهد Console للأخطاء
```

---

## 📱 الاستجابة والموبايل

### ✅ تم التحسين لـ:
- 📱 Phones (320px و أعلى)
- 📱 Tablets (768px و أعلى)
- 💻 Desktop (1024px و أعلى)
- 🖥️ Large Screens (1400px و أعلى)

### 📐 Breakpoints Tailwind:
```
sm: 640px    (Tablets)
md: 768px    (Tablets++)
lg: 1024px   (Desktop)
xl: 1280px   (Large)
2xl: 1536px  (Extra Large)
```

---

## 🌍 الترجمة والتدويل

### ✅ اللغات المدعومة:
- 🇸🇦 العربية (RTL) - الأساسية
- 🇬🇧 English (LTR) - في signup.html

### 🔄 الانتقال بين اللغات:
```html
<html dir="rtl" lang="ar">    <!-- Arabic -->
<html dir="ltr" lang="en">    <!-- English -->
```

---

## 📈 الأداء والتحسينات

### ⚡ تحسينات التحميل:
- CDN Tailwind للتصميم السريع
- JavaScript Modules (بدون Build)
- Firebase SDK v10 (محسّن)
- YouTube IFrame Lazy Load

### 🎯 أهداف الأداء:
- Page Load: < 2s
- Chat Response: < 500ms
- Video Search: < 1s
- Participant Update: < 100ms

---

## 📞 الدعم والمساهمة

### الإبلاغ عن الأخطاء:
```
1. اذهب إلى: GitHub Issues
2. قدم الخطأ مع الخطوات
3. أرفق صورة الشاشة
4. فريق التطوير سيرد
```

### المساهمة في التطوير:
```
1. Fork المشروع
2. اضغط: git checkout -b feature/اسم-الميزة
3. ضع الكود الجديد والاختبار
4. Push وافتح Pull Request
```

---

## 📊 الإحصائيات والملفات

### حجم المشروع:
```
HTML:      ~50 KB (6 صفحات رئيسية)
CSS:       ~5 KB (Tailwind)
JavaScript: ~30 KB (Firebase + Logic)
Total:     ~85 KB (بدون المكتبات)
```

### الملفات الرئيسية:
```
Total Files: 15+
HTML Files: 9
JS/CSS: Inline (الأداء)
Config: firestore.rules + package.json
Docs: 3 ملفات توثيق
```

---

## 🎉 الملخص

**TawjihiGuide** منصة تعليمية حديثة توفر:

✅ **دراسة جماعية متزامنة** مع فيديوهات YouTube  
✅ **شات مباشر** بين الطلاب والمعلمين  
✅ **ذكاء اصطناعي متقدم** للمساعدة في الدراسة  
✅ **نظام نقاط وشارات** لتحفيز الطلاب  
✅ **أمان متكامل** مع Firestore Rules  
✅ **تصميم استجابي** لجميع الأجهزة  
✅ **سهولة الاستخدام** حتى للمبتدئين  

---

**النسخة**: 2.0  
**التاريخ**: 30 أبريل 2026  
**الحالة**: ✅ جاهز للإنتاج والنشر

جميع الحقوق محفوظة © 2026
