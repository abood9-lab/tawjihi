// ⚙️ إعدادات التطبيق
// هذا الملف يحتوي على جميع المفاتيح والتكوينات الحساسة

export const CONFIG = {
    // GROQ API Configuration
    GROQ: {
        API_KEY: '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',
        API_URL: 'https://api.groq.com/openai/v1/chat/completions',
        MODEL: 'mixtral-8x7b-32768',
        MAX_TOKENS: 1024,
        TEMPERATURE: 0.7
    },

    // Firebase Configuration
    FIREBASE: {
        apiKey: "AIzaSyAqXLDqKYDUyuWKjPHaifA1IAzrLstqY54",
        authDomain: "tawj-d1f01.firebaseapp.com",
        projectId: "tawj-d1f01",
        storageBucket: "tawj-d1f01.firebasestorage.app",
        messagingSenderId: "124295262421",
        appId: "1:124295262421:web:87cd51227a13e0a710725c"
    },

    // YouTube API Configuration
    YOUTUBE: {
        API_KEY: 'AIzaSyDcB8PWSEw8a9nzjPWqyi2y4OhlWqtEPtw',
        API_URL: 'https://www.googleapis.com/youtube/v3/search'
    },

    // Cloudinary Configuration
    CLOUDINARY: {
        UPLOAD_PRESET: 'tawjihi_guide'
    },

    // Application Settings
    APP: {
        NAME: 'TawjihiGuide',
        VERSION: '1.0.0',
        DEFAULT_LANGUAGE: 'ar'
    }
};
