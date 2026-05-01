#!/bin/bash

# 🚀 Shell Script لتشغيل TawjihiGuide Platform
# يشغل السيرفر وخادم الويب معاً على macOS و Linux

echo ""
echo "╔═══════════════════════════════════════════╗"
echo "║   TawjihiGuide Startup Script              ║"
echo "║   جاري تشغيل المنصة...                    ║"
echo "╚═══════════════════════════════════════════╝"
echo ""

# التحقق من وجود node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 تثبيت المكتبات الأساسية..."
    npm install
fi

echo ""
echo "🚀 جاري بدء السيرفرات..."
echo ""

# بدء سيرفر GROQ API في الخلفية
echo "🤖 بدء سيرفر GROQ API على http://localhost:3001"
npm start &
GROQ_PID=$!

# الانتظار قليلاً
sleep 2

# بدء خادم الويب
echo "🌐 بدء خادم الويب على http://localhost:5500"
npx --yes serve . -l 5500 &
WEB_PID=$!

echo ""
echo "✅ جميع السيرفرات تم بدء تشغيلها!"
echo ""
echo "📝 التعليمات:"
echo "  • سيرفر GROQ API: http://localhost:3001"
echo "  • تطبيق الويب:   http://localhost:5500"
echo "  • Dashboard:      http://localhost:5500/dashboard.html"
echo "  • AI Chat:        متاح في صفحة Dashboard"
echo ""
echo "💡 لإيقاف التطبيق، اضغط Ctrl+C"
echo ""

# الانتظار حتى يتم إيقاف البرنامج
wait $GROQ_PID $WEB_PID
