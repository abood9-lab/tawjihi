const SHELL_CONFIG = {
    bannerUrl: 'https://whiterchat.me/',
    bannerTitle: 'ادعمنا عبر WhiterChat',
    bannerText: 'اضغط هنا لزيارة موقعنا الرسمي والاطلاع على آخر التحديثات.',
    primaryColor: '#00346f',
    mobileNav: [
        { href: 'dashboard.html', icon: 'dashboard', label: 'الرئيسية' },
        { href: 'courses.html', icon: 'menu_book', label: 'المواد' },
        { href: 'quiz.html', icon: 'quiz', label: 'الاختبارات' },
        { href: 'notifications.html', icon: 'notifications', label: 'الإشعارات' },
        { href: 'profile.html', icon: 'person', label: 'حسابي' }
    ],
    desktopNav: [
        { href: 'dashboard.html', icon: 'dashboard', label: 'لوحة التحكم' },
        { href: 'courses.html', icon: 'menu_book', label: 'المواد الدراسية' },
        { href: 'quiz.html', icon: 'quiz', label: 'بنك الأسئلة' },
        { href: 'messages.html', icon: 'mail', label: 'المراسلات' },
        { href: 'search-users.html', icon: 'people', label: 'البحث عن الطلاب' },
        { href: 'notifications.html', icon: 'notifications', label: 'الإشعارات' },
        { href: 'leaderboard.html', icon: 'leaderboard', label: 'المتصدرون' },
        { href: 'profile.html', icon: 'person', label: 'الملف الشخصي' }
    ]
};

function shellMode() {
    return (document.body?.dataset.shellMode || localStorage.getItem('tawjihi-shell-mode') || 'legacy').toLowerCase();
}

function shouldSyncAppNavigation() {
    return new Set([
        'dashboard.html',
        'courses.html',
        'course-detail.html',
        'quiz.html',
        'profile.html',
        'messages.html',
        'search-users.html',
        'notifications.html',
        'leaderboard.html'
    ]).has(currentPage());
}

function currentPage() {
    const file = window.location.pathname.split('/').pop() || 'dashboard.html';
    return file.toLowerCase();
}

function isActive(href) {
    return currentPage() === href.toLowerCase();
}

function navItem(item, compact = false) {
    const active = isActive(item.href);
    const activeClass = active
        ? 'bg-blue-50 text-primary font-black shadow-sm'
        : 'text-slate-600 hover:bg-slate-50';

    const iconStyle = active && compact
        ? "style=\"font-variation-settings:'FILL' 1;\""
        : active && !compact
            ? "style=\"font-variation-settings:'FILL' 1;\""
            : '';

    if (compact) {
        return `<a href="${item.href}" aria-label="${item.label}" class="flex flex-1 items-center justify-center rounded-2xl py-3 transition-all ${active ? 'text-primary' : 'text-slate-400'}">
            <span class="material-symbols-outlined text-[26px] leading-none" ${iconStyle}>${item.icon}</span>
        </a>`;
    }

    return `<a href="${item.href}" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeClass}">
        <span class="material-symbols-outlined" ${iconStyle}>${item.icon}</span>
        <span>${item.label}</span>
    </a>`;
}

function createAnnouncementBar() {
    const existing = document.getElementById('siteAnnouncementBar');
    if (existing) return;

    if (localStorage.getItem('tawjihi-announcement-hidden') === '1') return;

    const banner = document.createElement('div');
    banner.id = 'siteAnnouncementBar';
    banner.className = 'fixed top-0 inset-x-0 z-[120] text-white shadow-[0_10px_30px_rgba(0,52,111,0.25)]';
    banner.innerHTML = `
        <div class="relative overflow-hidden bg-gradient-to-r from-primary via-[#165aa6] to-[#6db7ff]">
            <div class="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.45),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.18),_transparent_28%)]"></div>
            <div class="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 text-sm md:text-base relative">
                <a href="${SHELL_CONFIG.bannerUrl}" target="_blank" rel="noreferrer" class="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-white/10 px-3 py-2 transition-all hover:bg-white/15">
                    <span class="material-symbols-outlined animate-[rocket-fly_1.8s_ease-in-out_infinite] text-white">rocket_launch</span>
                    <div class="min-w-0 text-right">
                        <div class="truncate font-black">${SHELL_CONFIG.bannerTitle}</div>
                        <div class="truncate text-xs text-white/85">${SHELL_CONFIG.bannerText}</div>
                    </div>
                </a>
                <button id="dismissAnnouncementBtn" class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20" aria-label="إغلاق الإعلان">
                    <span class="material-symbols-outlined text-base">close</span>
                </button>
            </div>
        </div>
    `;
    document.body.prepend(banner);

    const dismissBtn = banner.querySelector('#dismissAnnouncementBtn');
    dismissBtn?.addEventListener('click', () => {
        localStorage.setItem('tawjihi-announcement-hidden', '1');
        banner.remove();
        document.body.style.paddingTop = '';
    });

    document.body.style.paddingTop = '56px';
}

function standardizeHeaderOffsets() {
    const bannerVisible = localStorage.getItem('tawjihi-announcement-hidden') !== '1';
    const headerTop = bannerVisible ? '56px' : '0px';
    const sidebarTop = bannerVisible ? '120px' : '64px';

    const fixedHeaders = Array.from(document.querySelectorAll('header'));
    fixedHeaders.forEach(header => {
        const style = window.getComputedStyle(header);
        if (style.position === 'fixed' || header.className.includes('fixed')) {
            header.style.top = headerTop;
        }
    });

    const fixedSidebars = Array.from(document.querySelectorAll('aside'));
    fixedSidebars.forEach(sidebar => {
        const style = window.getComputedStyle(sidebar);
        if (style.position === 'fixed' || sidebar.className.includes('fixed')) {
            sidebar.style.top = sidebarTop;
        }
    });
}

function attachLogoutButton(sidebar) {
    if (!sidebar || sidebar.querySelector('#shellLogoutBtnDesktop')) return;

    const footer = document.createElement('div');
    footer.className = 'mt-4 border-t border-slate-100 pt-4 px-1';
    footer.innerHTML = `
        <button id="shellLogoutBtnDesktop" class="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-bold text-red-500 transition-all hover:bg-red-50">
            <span class="material-symbols-outlined">logout</span>
            <span>تسجيل الخروج</span>
        </button>
    `;
    sidebar.appendChild(footer);

    const logoutBtn = footer.querySelector('#shellLogoutBtnDesktop');
    logoutBtn?.addEventListener('click', () => {
        if (typeof window.__tawjihiLogout === 'function') {
            window.__tawjihiLogout();
            return;
        }
        window.location.href = 'signup.html';
    });
}

function syncLegacyAppNavigation() {
    if (!shouldSyncAppNavigation()) return;

    const sidebar = document.querySelector('aside');
    const desktopNav = sidebar?.querySelector('nav');
    if (desktopNav) {
        desktopNav.innerHTML = SHELL_CONFIG.desktopNav.map(item => navItem(item, false)).join('');
        attachLogoutButton(sidebar);
    }

    const mobileNav = Array.from(document.querySelectorAll('nav')).find(nav => nav.className.includes('lg:hidden'));
    if (mobileNav) {
        mobileNav.className = 'lg:hidden fixed bottom-0 w-full glass-nav border-t border-slate-200 z-[90] safe-bottom';
        mobileNav.innerHTML = `<div class="grid grid-cols-5 items-center h-16 px-3 gap-2">${SHELL_CONFIG.mobileNav.map(item => navItem(item, true)).join('')}</div>`;
    }
}

function registerPwa() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', async () => {
            try {
                await navigator.serviceWorker.register('service-worker.js');
            } catch (error) {
                console.warn('Service worker registration failed:', error);
            }
        });
    }
}

function normalizeLegacyAiElements() {
    const legacyModalIds = ['aiChatModal', 'aiModal', 'chatbotModal', 'assistantModal'];
    legacyModalIds.forEach((id) => {
        const node = document.getElementById(id);
        if (node) node.remove();
    });

    const legacyFab = document.getElementById('openAIChatBtn');
    if (!legacyFab) return null;

    const clone = legacyFab.cloneNode(true);
    clone.id = 'shellAiFab';
    clone.setAttribute('aria-label', 'فتح المساعد الذكي');
    clone.setAttribute('title', 'المساعد الذكي');
    clone.className = 'fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[95] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#2c694e] text-white shadow-2xl border-2 border-white/90 transition-transform hover:scale-105';
    clone.innerHTML = '<span class="material-symbols-outlined text-[28px]">smart_toy</span>';
    legacyFab.replaceWith(clone);
    return clone;
}

async function requestAiReply(history) {
    const endpoints = ['http://localhost:3001/api/chat', '/api/chat'];

    for (const endpoint of endpoints) {
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: history })
            });
            if (!res.ok) continue;
            const data = await res.json();
            if (data && typeof data.message === 'string' && data.message.trim()) {
                return data.message;
            }
        } catch (error) {
            // Try fallback endpoint.
        }
    }

    return 'تعذر الاتصال بخدمة الذكاء الاصطناعي حالياً.';
}

function ensureAiWidget() {
    const existingModal = document.getElementById('shellAiModal');
    let fab = document.getElementById('shellAiFab');

    if (!fab) {
        fab = normalizeLegacyAiElements();
    }

    if (!fab) {
        fab = document.createElement('button');
        fab.id = 'shellAiFab';
        fab.setAttribute('aria-label', 'فتح المساعد الذكي');
        fab.className = 'fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[95] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#2c694e] text-white shadow-2xl border-2 border-white/90 transition-transform hover:scale-105';
        fab.innerHTML = '<span class="material-symbols-outlined text-[28px]">smart_toy</span>';
        document.body.appendChild(fab);
    }

    if (existingModal) return;

    const modal = document.createElement('div');
    modal.id = 'shellAiModal';
    modal.className = 'fixed inset-0 bg-black/40 hidden items-end md:items-center justify-center z-[120] p-0 md:p-4';
    modal.innerHTML = `
        <div class="bg-white w-full h-[100dvh] md:w-[90%] max-w-2xl md:h-[75vh] flex flex-col shadow-2xl rounded-none md:rounded-3xl overflow-hidden">
            <div class="flex items-center justify-between p-4 md:p-6 border-b border-slate-200">
                <div class="text-right">
                    <h3 class="font-black text-slate-900">المساعد الذكي</h3>
                    <p class="text-xs text-slate-500">نفس الشكل ونفس التجربة في كل الصفحات</p>
                </div>
                <button id="shellAiClose" class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100">
                    <span class="material-symbols-outlined text-slate-500">close</span>
                </button>
            </div>
            <div id="shellAiMessages" class="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 bg-slate-50">
                <div class="text-sm bg-primary text-white rounded-2xl rounded-br-none p-3 w-fit max-w-[85%]">مرحباً! أنا المساعد الذكي، كيف يمكنني مساعدتك اليوم؟</div>
            </div>
            <div class="p-4 border-t border-slate-200 bg-white flex gap-2">
                <input id="shellAiInput" type="text" placeholder="اسأل أي سؤال..." class="flex-1 bg-slate-100 border-0 rounded-full px-4 py-3 text-right text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                <button id="shellAiSend" class="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center">
                    <span class="material-symbols-outlined">send</span>
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const msgs = modal.querySelector('#shellAiMessages');
    const input = modal.querySelector('#shellAiInput');
    const send = modal.querySelector('#shellAiSend');
    const close = modal.querySelector('#shellAiClose');
    const history = [];

    function addMessage(text, own) {
        const row = document.createElement('div');
        row.className = own ? 'flex justify-end' : 'flex justify-start';
        row.innerHTML = `<div class="text-sm ${own ? 'bg-slate-900 text-white rounded-2xl rounded-bl-none' : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-br-none'} p-3 max-w-[85%]">${text}</div>`;
        msgs.appendChild(row);
        msgs.scrollTop = msgs.scrollHeight;
    }

    async function sendAi() {
        const text = input.value.trim();
        if (!text) return;
        addMessage(text, true);
        input.value = '';
        history.push({ role: 'user', content: text });

        addMessage('جاري التفكير...', false);
        const thinking = msgs.lastElementChild;

        const reply = await requestAiReply(history);
        if (thinking) thinking.remove();

        history.push({ role: 'assistant', content: reply });
        addMessage(reply, false);
    }

    function openModal() {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        input.focus();
    }

    function closeModal() {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    fab.addEventListener('click', openModal);
    close.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    send.addEventListener('click', sendAi);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendAi();
        }
    });
}

function injectShellStyles() {
    if (document.getElementById('tawjihiShellStyles')) return;

    const style = document.createElement('style');
    style.id = 'tawjihiShellStyles';
    style.textContent = `
        @keyframes rocket-fly {
            0%, 100% { transform: translateY(0) rotate(-10deg); }
            50% { transform: translateY(-4px) rotate(10deg); }
        }
    `;
    document.head.appendChild(style);
}

function bootstrapShell() {
    const themeMeta = document.querySelector('meta[name="theme-color"]') || document.createElement('meta');
    if (!themeMeta.getAttribute('name')) {
        themeMeta.setAttribute('name', 'theme-color');
        document.head.appendChild(themeMeta);
    }
    themeMeta.setAttribute('content', SHELL_CONFIG.primaryColor);

    if (!document.querySelector('link[rel="manifest"]')) {
        const manifestLink = document.createElement('link');
        manifestLink.rel = 'manifest';
        manifestLink.href = 'manifest.webmanifest';
        document.head.appendChild(manifestLink);
    }

    injectShellStyles();
    createAnnouncementBar();
    standardizeHeaderOffsets();

    syncLegacyAppNavigation();

    // Delay AI normalization to run after page scripts that may attach legacy handlers.
    window.addEventListener('load', () => {
        ensureAiWidget();
    }, { once: true });
    setTimeout(() => ensureAiWidget(), 900);

    registerPwa();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapShell);
} else {
    bootstrapShell();
}

window.TawjihiShell = {
    showAnnouncement: () => localStorage.removeItem('tawjihi-announcement-hidden'),
    hideAnnouncement: () => localStorage.setItem('tawjihi-announcement-hidden', '1'),
    setLegacyMode: () => localStorage.setItem('tawjihi-shell-mode', 'legacy'),
    setModernMode: () => localStorage.setItem('tawjihi-shell-mode', 'modern')
};
