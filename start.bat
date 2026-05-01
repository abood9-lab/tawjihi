@echo off
REM 🚀 Batch Script لتشغيل TawjihiGuide Platform
REM يشغل السيرفر وخادم الويب معاً

echo.
echo ╔═══════════════════════════════════════════╗
echo ║   TawjihiGuide Startup Script              ║
echo ║   جاري تشغيل المنصة...                    ║
echo ╚═══════════════════════════════════════════╝
echo.

REM التحقق من وجود node_modules
if not exist "node_modules" (
    echo 📦 تثبيت المكتبات الأساسية...
    call npm install
)

echo.
echo 🚀 جاري بدء السيرفرات...
echo.

REM فتح terminal جديد لسيرفر GROQ API
echo 🤖 بدء سيرفر GROQ API على http://localhost:3001
start "GROQ API Server" cmd /k "npm start"

REM الانتظار قليلاً قبل بدء خادم الويب
timeout /t 2 /nobreak

REM فتح terminal جديد لخادم الويب
echo 🌐 بدء خادم الويب على http://localhost:5500
start "Web Server" cmd /k "npx --yes serve . -l 5500"

echo.
echo ✅ جميع السيرفرات تم بدء تشغيلها!
echo.
echo 📝 التعليمات:
echo   • سيرفر GROQ API: http://localhost:3001
echo   • تطبيق الويب:   http://localhost:5500
echo   • Dashboard:      http://localhost:5500/dashboard.html
echo   • AI Chat:        متاح في صفحة Dashboard
echo.
echo 💡 لإيقاف التطبيق، أغلق نوافذ الـ terminal
echo.

pause
