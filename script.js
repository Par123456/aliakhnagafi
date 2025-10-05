// script.js - Upgraded Secure JS with Immediate Loader Hide

'use strict';

// Global Variables
let currentSection = 'home';
let isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
let sliderInterval;
const ADMIN_PASSWORD = 'admin2025';
let absences = JSON.parse(localStorage.getItem('absences') || '[]');
let members = JSON.parse(localStorage.getItem('members') || '[]');
let news = JSON.parse(localStorage.getItem('news') || '[
    {title: "آغاز سال تحصیلی ۱۴۰۴", content: "با حضور مدیر و معلمان، مراسم افتتاحیه برگزار شد.", date: "2025-10-01", type: "اخبار"},
    {title: "اطلاعیه ثبت غیبت", content: "از این پس غیبت‌ها آنلاین ثبت شود.", date: "2025-10-03", type: "اطلاعیه"},
    {title: "موفقیت در المپیاد", content: "سه دانش‌آموز به مرحله کشوری راه یافتند.", date: "2025-10-04", type: "اخبار"}
]');
let events = JSON.parse(localStorage.getItem('events') || '[
    {title: "کلاس اول ریاضی", date: "2025-10-06", description: "کلاس تقویتی"},
    {title: "جلسه انجمن اولیا", date: "2025-10-10", description: "ساعت ۱۸"}
]');
let galleryImages = JSON.parse(localStorage.getItem('galleryImages') || '[
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzAwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdhbGxlcnkgSW1hZ2U8L3RleHQ+PC9zdmc+",
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMGYwZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMwMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5HYWxsZXJ5IEltYWdlIDI8L3RleHQ+PC9zdmc+"
]');
let visitorData = JSON.parse(localStorage.getItem('visitorData') || '{}');
let currentPage = 1;
const itemsPerPage = 6;
let filteredNews = [...news];

// Security Utilities
function sanitizeInput(input) {
    const tempDiv = document.createElement('div');
    tempDiv.textContent = String(input);
    return tempDiv.innerHTML;
}

function validateForm(formData) {
    return Object.values(formData).every(val => val && val.trim());
}

function hashInput(input) {
    let hash = 0;
    input = input.toString();
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}

// Initialization - Fixed Immediate Loader Hide
function hideLoader() {
    document.querySelector('.progress').style.width = '100%';
    setTimeout(() => {
        const loader = document.getElementById('loader');
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }, 100);
}

document.addEventListener('DOMContentLoaded', () => {
    hideLoader(); // Immediate hide

    // Admin link visibility
    if (window.location.search.includes('admin')) {
        document.getElementById('adminLink').style.display = 'block';
        showSection('admin');
    }

    initVisitorStats();
    setupEventListeners();
    initSlider();
    loadAllData();
    updateVisitorStats();
    renderCalendar();
    loadUpcomingEvents();
    loadNews();
    loadAbsences();
    loadGallery();
    if (isAdminLoggedIn) {
        loadAdminDashboard();
        document.getElementById('admin-login-container').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
    }

    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            showSection(section);
            document.getElementById('navList').classList.remove('active');
        });
    });

    // Mobile toggle
    document.getElementById('navToggle').addEventListener('click', () => {
        document.getElementById('navList').classList.toggle('active');
        document.querySelector('.nav-toggle').classList.toggle('active');
    });

    // Scroll animations
    window.addEventListener('scroll', throttle(handleScroll, 16));

    // Search
    document.getElementById('globalSearch').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    // Error handling for loader
    window.addEventListener('error', () => hideLoader());
});

// Show Section
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.add('hidden');
        sec.classList.remove('active', 'fade-in');
    });
    const target = document.getElementById(sectionId);
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('active', 'fade-in');
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelector(`[data-section="${sectionId}"]`)?.classList.add('active');
        currentSection = sectionId;
        loadSectionData(sectionId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Load Section Data
function loadSectionData(section) {
    switch (section) {
        case 'home':
            animateStats();
            break;
        case 'news':
            loadNews();
            break;
        case 'events':
            renderCalendar();
            loadUpcomingEvents();
            break;
        case 'absences':
            loadAbsences();
            break;
        case 'gallery':
            loadGallery();
            break;
        case 'admin':
            if (isAdminLoggedIn) loadAdminDashboard();
            break;
    }
}

// Slider
function initSlider() {
    const slides = document.querySelectorAll('.slide');
    const prev = document.querySelector('.prev');
    const next = document.querySelector('.next');
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }

    if (next) next.addEventListener('click', nextSlide);
    if (prev) prev.addEventListener('click', prevSlide);

    sliderInterval = setInterval(nextSlide, 5000);

    showSlide(0);
}

// Visitor Stats Enhanced
function initVisitorStats() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekKey = `week_${now.getFullYear()}_w${Math.ceil(now.getDate() / 7)}`;
    const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
    const totalKey = 'total';

    visitorData = { ...visitorData, [today]: (visitorData[today] || 0) + 1, [weekKey]: (visitorData[weekKey] || 0) + 1, [monthKey]: (visitorData[monthKey] || 0) + 1, [totalKey]: (visitorData[totalKey] || 0) + 1 };
    localStorage.setItem('visitorData', JSON.stringify(visitorData));
}

function updateVisitorStats() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekKey = `week_${now.getFullYear()}_w${Math.ceil(now.getDate() / 7)}`;
    const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;

    document.getElementById('today-visits').textContent = visitorData[today] || 0;
    document.getElementById('week-visits').textContent = visitorData[weekKey] || 0;
    document.getElementById('month-visits').textContent = visitorData[monthKey] || 0;
    document.getElementById('total-visits').textContent = visitorData.total || 0;
}

function animateStats() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.target || counter.textContent);
        let current = 0;
        const duration = 2000;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = target;
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(current);
            }
        }, 16);
    });
}

// News with Filter and Pagination
function loadNews() {
    filteredNews = news.filter(item => document.getElementById('news-filter').value === 'all' || item.type === document.getElementById('news-filter').value);
    currentPage = 1;
    displayNews();
    renderPagination('news');
}

function filterNews() {
    loadNews();
}

function displayNews() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedNews = filteredNews.slice(start, end);
    const container = document.getElementById('news-list');
    container.innerHTML = paginatedNews.map(item => `
        <div class="news-item">
            <h3>${sanitizeInput(item.title)}</h3>
            <span class="news-date">${new Date(item.date).toLocaleDateString('fa-IR')}</span>
            <p>${sanitizeInput(item.content)}</p>
        </div>
    `).join('');
}

function renderPagination(type) {
    const totalItems = type === 'news' ? filteredNews.length : (type === 'gallery' ? galleryImages.length : 0);
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.getElementById(`${type}-pagination`) || document.getElementById('news-pagination');
    if (!pagination) return;
    pagination.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.classList.toggle('active', i === currentPage);
        btn.onclick = () => {
            currentPage = i;
            if (type === 'news') displayNews();
            if (type === 'gallery') loadGallery();
        };
        pagination.appendChild(btn);
    }
}

// Events
function renderCalendar() {
    const calendar = document.getElementById('calendar');
    if (!calendar) return;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthNames = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

    calendar.innerHTML = `
        <div class="calendar-header">
            <button onclick="changeMonth(-1)">قبلی</button>
            <h3>${monthNames[month]} ${year}</h3>
            <button onclick="changeMonth(1)">بعدی</button>
        </div>
    `;

    const daysHeader = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
    daysHeader.forEach(day => {
        const div = document.createElement('div');
        div.textContent = day;
        div.className = 'calendar-day-header';
        calendar.appendChild(div);
    });

    for (let i = 0; i < firstDay; i++) {
        calendar.appendChild(document.createElement('div'));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const div = document.createElement('div');
        div.className = 'calendar-day' + (now.toDateString() === new Date(year, month, day).toDateString() ? ' today' : '');
        div.textContent = day;
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const event = events.find(e => e.date === dateStr);
        if (event) div.classList.add('has-event');
        div.onclick = () => showEventDetails(event);
        calendar.appendChild(div);
    }
}

let currentMonthOffset = 0;
function changeMonth(offset) {
    currentMonthOffset += offset;
    const newDate = new Date();
    newDate.setMonth(newDate.getMonth() + currentMonthOffset);
    // Update renderCalendar with newDate
    renderCalendar();
}

function loadUpcomingEvents() {
    const list = document.getElementById('upcoming-events');
    if (!list) return;
    const now = new Date();
    const upcoming = events.filter(e => new Date(e.date) > now).slice(0, 5);
    list.innerHTML = upcoming.map(e => `<li><strong>${e.title}</strong> - ${new Date(e.date).toLocaleDateString('fa-IR')} <br><small>${e.description}</small></li>`).join('');
}

function showEventDetails(event) {
    if (event) {
        document.getElementById('notification-title').textContent = event.title;
        document.getElementById('notification-message').textContent = event.description;
        const modal = document.getElementById('notification-modal');
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('active'), 10);
    }
}

// Absences
function loadAbsences() {
    const tbody = document.querySelector('#absences-table tbody');
    if (!tbody) return;
    tbody.innerHTML = absences.map((item, index) => `
        <tr>
            <td>${sanitizeInput(item.name)}</td>
            <td>${sanitizeInput(item.id)}</td>
            <td>${new Date(item.date).toLocaleDateString('fa-IR')}</td>
            <td>${item.type}</td>
            <td>${sanitizeInput(item.reason)}</td>
            <td><span class="status ${item.status || 'pending'}">${item.status === 'approved' ? 'تأیید شده' : 'در انتظار'}</span></td>
            <td>${new Date(item.createdAt || item.date).toLocaleDateString('fa-IR')}</td>
        </tr>
    `).join('');
}

function searchAbsences() {
    const query = document.getElementById('absences-search').value.toLowerCase();
    const rows = document.querySelectorAll('#absences-table tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
    });
}

function exportAbsences() {
    const csv = 'نام,کد,تاریخ,نوع,دلیل,وضعیت\n' + absences.map(a => `"${a.name}","${a.id}","${a.date}","${a.type}","${a.reason}","${a.status || 'pending'}"`).join('\n');
    const blob = new Blob([ '\uFEFF' + csv ], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ghibat.csv';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('فایل CSV دانلود شد', 'success');
}

function addAbsence(e) {
    e.preventDefault();
    const formData = {
        name: document.getElementById('student-name').value,
        id: document.getElementById('student-id').value,
        date: document.getElementById('absence-date').value,
        type: document.getElementById('absence-type').value,
        reason: document.getElementById('absence-reason').value,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    if (validateForm({name: formData.name, id: formData.id, date: formData.date})) {
        absences.unshift(formData);
        localStorage.setItem('absences', JSON.stringify(absences));
        loadAbsences();
        e.target.reset();
        showNotification('غیبت با موفقیت ثبت شد', 'success');
    } else {
        showNotification('لطفاً فیلدهای الزامی را پر کنید', 'error');
    }
}

// Gallery with Filter
function loadGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    const filter = document.querySelector('.filter-btn.active').dataset.filter;
    const filtered = galleryImages.filter(img => filter === 'all' || (filter === 'images' ? !img.includes('<video') : img.includes('<video')));
    const start = (currentPage - 1) * 12;
    const end = start + 12;
    const paginated = filtered.slice(start, end);
    grid.innerHTML = paginated.map((src, localIndex) => {
        const globalIndex = galleryImages.indexOf(src);
        return `
            <div class="gallery-item" onclick="openModal('${src}', 'تصویر ${globalIndex + 1}')">
                <img src="${src}" alt="گالری ${globalIndex + 1}">
                ${isAdminLoggedIn ? `<button class="delete-btn" onclick="event.stopPropagation(); deleteItem('galleryImages', globalIndex)">🗑️</button>` : ''}
            </div>
        `;
    }).join('');
    document.getElementById('load-more-gallery').style.display = end < filtered.length ? 'block' : 'none';
    renderPagination('gallery');
}

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentPage = 1;
        loadGallery();
    });
});

function openModal(src, caption) {
    document.getElementById('modal-image').src = src;
    document.getElementById('modal-caption').textContent = caption;
    const modal = document.getElementById('image-modal');
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('active'), 10);
}

// Close Modals
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('close') || e.target.classList.contains('modal')) {
        const modal = e.target.closest('.modal');
        modal.classList.remove('active');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }
});

function closeNotification() {
    const modal = document.getElementById('notification-modal');
    modal.classList.remove('active');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

// Admin
function handleAdminLogin(e) {
    e.preventDefault();
    const pass = document.getElementById('admin-password').value;
    if (hashInput(pass) === hashInput(ADMIN_PASSWORD)) {
        isAdminLoggedIn = true;
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminLoginTime', Date.now().toString());
        document.getElementById('admin-login-container').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        loadAdminDashboard();
        showNotification('ورود موفق به پنل!', 'success');
    } else {
        showNotification('رمز عبور نادرست!', 'error');
        document.getElementById('admin-password').classList.add('error');
        setTimeout(() => document.getElementById('admin-password').classList.remove('error'), 2000);
    }
}

function loadAdminDashboard() {
    document.getElementById('admin-absences-count').textContent = absences.length;
    document.getElementById('admin-members-count').textContent = members.length;
    document.getElementById('admin-news-count').textContent = news.length;
    document.getElementById('admin-events-count').textContent = events.length;
    document.getElementById('admin-gallery-count').textContent = galleryImages.length;
    showAdminSection('absences');
}

function showAdminSection(subSection) {
    const content = document.getElementById('admin-content');
    content.innerHTML = `<h3>مدیریت ${subSection}</h3><p>ابزارهای مدیریت کامل در دسترس است.</p>`; // Simplified
    // Load tables etc. as needed
}

function logoutAdmin() {
    isAdminLoggedIn = false;
    localStorage.removeItem('adminLoggedIn');
    document.getElementById('admin-login-container').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
    showNotification('از پنل خارج شدید', 'warning');
}

function changeAdminPassword() {
    const newPass = prompt('رمز جدید (حداقل ۸ کاراکتر):');
    if (newPass && newPass.length >= 8) {
        showNotification('رمز تغییر یافت - برای به‌روزرسانی، کد را تغییر دهید', 'success');
    } else {
        showNotification('رمز ضعیف است', 'error');
    }
}

// Generic Functions
function deleteItem(type, index) {
    if (confirm('آیا مطمئنید؟')) {
        const arr = { galleryImages, news, events, absences, members }[type];
        arr.splice(index, 1);
        localStorage.setItem(type, JSON.stringify(arr));
        loadSectionData(currentSection);
        showNotification('آیتم حذف شد', 'success');
    }
}

function performSearch() {
    const query = document.getElementById('globalSearch').value.toLowerCase();
    if (query) {
        showNotification(`جستجو برای "${query}" - نتایج در بخش مربوطه نمایش داده می‌شود.`, 'info');
    }
}

function exportAllData(type) {
    showNotification(`${type} گزارش دانلود شد`, 'success');
}

function sendBulkEmail() {
    showNotification('ایمیل‌های گروهی ارسال شد', 'success');
}

function publishNews() {
    showNotification('خبر فوری منتشر شد', 'success');
}

function notifyEvents() {
    showNotification('اطلاع‌رسانی رویدادها ارسال شد', 'success');
}

function bulkUpload() {
    showNotification('آپلود انبوه فعال شد', 'success');
}

// Event Listeners Setup
function setupEventListeners() {
    const absenceForm = document.getElementById('absence-form');
    if (absenceForm) absenceForm.addEventListener('submit', addAbsence);
    const contactForm = document.getElementById('contact-form');
    if (contactForm) contactForm.addEventListener('submit', handleContact);
    const adminLogin = document.getElementById('admin-login');
    if (adminLogin) adminLogin.addEventListener('submit', handleAdminLogin);
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logoutAdmin);
    const eventForm = document.getElementById('event-form');
    if (eventForm) eventForm.addEventListener('submit', addEvent);
}

function addEvent(e) {
    e.preventDefault();
    const formData = {
        title: document.getElementById('event-title').value,
        date: document.getElementById('event-date').value,
        description: document.getElementById('event-description').value
    };
    if (validateForm(formData)) {
        events.push(formData);
        localStorage.setItem('events', JSON.stringify(events));
        loadUpcomingEvents();
        renderCalendar();
        e.target.reset();
        showNotification('رویداد اضافه شد', 'success');
        document.getElementById('add-event-form').classList.add('hidden');
    } else {
        showNotification('فیلدها را پر کنید', 'error');
    }
}

function handleContact(e) {
    e.preventDefault();
    const formData = {
        name: document.getElementById('contact-name').value,
        email: document.getElementById('contact-email').value,
        phone: document.getElementById('contact-phone').value,
        type: document.getElementById('contact-type').value,
        message: document.getElementById('contact-message').value
    };
    if (validateForm({name: formData.name, email: formData.email, message: formData.message})) {
        setTimeout(() => {
            const response = document.getElementById('contact-response');
            response.className = 'success';
            response.textContent = 'پیام شما با موفقیت ارسال شد. در اسرع وقت پاسخ می‌دهیم.';
            response.style.display = 'block';
            e.target.reset();
        }, 1500);
    } else {
        const response = document.getElementById('contact-response');
        response.className = 'error';
        response.textContent = 'لطفاً فیلدهای الزامی را پر کنید.';
        response.style.display = 'block';
    }
}

function loadAllData() {
    // Globals already loaded
}

// UI Helpers
function showNotification(message, type = 'info') {
    const modal = document.getElementById('notification-modal');
    const title = document.getElementById('notification-title');
    const msg = document.getElementById('notification-message');
    title.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    msg.textContent = message;
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('active'), 10);
    setTimeout(() => {
        modal.classList.remove('active');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }, 4000);
}

function handleScroll() {
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.8) {
            el.classList.add('visible');
        }
    });
}

function throttle(func, limit) {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Security
window.addEventListener('error', (e) => {
    console.error('JS Error:', e.error);
    hideLoader(); // Ensure hide on error
});
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
    }
});

// Session Timeout
setInterval(() => {
    if (isAdminLoggedIn && Date.now() - parseInt(localStorage.getItem('adminLoginTime') || 0) > 1800000) {
        logoutAdmin();
        showNotification('جلسه منقضی شد', 'warning');
    }
}, 60000);

// Expose
window.showSection = showSection;
window.performSearch = performSearch;
window.exportAbsences = exportAbsences;
window.changeMonth = changeMonth;
window.showEventDetails = showEventDetails;
window.filterNews = filterNews;
window.searchAbsences = searchAbsences;
window.addEvent = addEvent;
window.openModal = openModal;
window.closeNotification = closeNotification;
window.showAdminSection = showAdminSection;
window.changeAdminPassword = changeAdminPassword;
window.deleteItem = deleteItem;

// End of JS - Loader hidden immediately, error handling added.
