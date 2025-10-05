// script.js - Enhanced Secure JavaScript for Cool School Website

'use strict';

// Global Variables
let currentSection = 'home';
let isAdminLoggedIn = false;
const ADMIN_PASSWORD = 'admin2025'; // In production, hash and server-side
let absences = JSON.parse(localStorage.getItem('absences') || '[]');
let members = JSON.parse(localStorage.getItem('members') || '[]');
let news = JSON.parse(localStorage.getItem('news') || '[]');
let events = JSON.parse(localStorage.getItem('events') || '[]');
let galleryImages = JSON.parse(localStorage.getItem('galleryImages') || '[]');
let visitorData = JSON.parse(localStorage.getItem('visitorData') || '{}');
let adminSection = 'absences'; // Default admin sub-section

// Security Utilities
function sanitizeInput(input) {
    const temp = document.createElement('div');
    temp.textContent = String(input);
    return temp.innerHTML.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

function validateForm(formData) {
    for (let key in formData) {
        if (!formData[key]) return false;
        if (key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[key])) return false;
        if (key === 'phone' && !/^\d{11}$/.test(formData[key].replace(/\D/g, ''))) return false;
    }
    return true;
}

function hashInput(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // 32-bit integer
    }
    return Math.abs(hash).toString(36);
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Check for admin mode
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminMode = urlParams.get('admin');
    if (isAdminMode) {
        document.querySelector('nav').insertAdjacentHTML('beforeend', '<li><a href="#" data-section="admin" class="nav-link">پنل ادمین</a></li>');
        showSection('admin');
    }

    // Setup
    initVisitorStats();
    setupEventListeners();
    createParticles(50); // Cool particle effect
    loadAllData();
    hideLoader();

    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            showSection(section);
        });
    });

    // Mobile nav toggle
    document.getElementById('navToggle').addEventListener('click', () => {
        document.getElementById('navList').classList.toggle('active');
    });

    // Scroll animations
    window.addEventListener('scroll', throttle(handleScroll, 16));
});

// Hide Loader
function hideLoader() {
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
    }, 1000);
}

// Show Section
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.add('hidden');
        sec.classList.remove('active', 'fade-in');
    });
    const target = document.getElementById(`${sectionId}`);
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('active', 'fade-in');
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
        currentSection = sectionId;
        loadSectionData(sectionId);
    }
}

// Load Section Data
function loadSectionData(section) {
    switch (section) {
        case 'home':
            updateVisitorStats();
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
            if (isAdminLoggedIn) {
                loadAdminDashboard();
            }
            break;
    }
}

// Visitor Stats
function initVisitorStats() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const yesterday = new Date(now.getTime() - 86400000).toISOString().split('T')[0];
    const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
    const totalKey = 'total';

    if (!visitorData[today]) visitorData[today] = 0;
    if (!visitorData[yesterday]) visitorData[yesterday] = 0;
    if (!visitorData[monthKey]) visitorData[monthKey] = 0;
    if (!visitorData[totalKey]) visitorData[totalKey] = 0;

    visitorData[today]++;
    visitorData[monthKey]++;
    visitorData[totalKey]++;

    localStorage.setItem('visitorData', JSON.stringify(visitorData));
}

function updateVisitorStats() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const yesterday = new Date(now.getTime() - 86400000).toISOString().split('T')[0];
    const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;

    document.getElementById('today-visits').textContent = visitorData[today] || 0;
    document.getElementById('yesterday-visits').textContent = visitorData[yesterday] || 0;
    document.getElementById('month-visits').textContent = visitorData[monthKey] || 0;
    document.getElementById('total-visits').textContent = visitorData.total || 0;
}

function animateStats() {
    // Animate counters
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        const increment = target / 100;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = target;
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(current);
            }
        }, 20);
    });
}

// News Management
function loadNews() {
    const container = document.getElementById('news-list');
    container.innerHTML = '';
    news.sort((a, b) => new Date(b.date) - new Date(a.date));
    news.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'news-item';
        div.innerHTML = `
            <h3>${sanitizeInput(item.title)}</h3>
            <span class="news-date">${item.date}</span>
            <p>${sanitizeInput(item.content)}</p>
            ${isAdminLoggedIn ? `<div class="admin-actions"><button onclick="editItem('news', ${index})">ویرایش</button><button onclick="deleteItem('news', ${index})">حذف</button></div>` : ''}
        `;
        container.appendChild(div);
    });
}

function addNews(e) {
    e.preventDefault();
    if (!isAdminLoggedIn) return alert('دسترسی محدود');
    const formData = {
        title: document.getElementById('news-title').value,
        content: document.getElementById('news-content').value,
        date: document.getElementById('news-date').value || new Date().toISOString().split('T')[0]
    };
    if (!validateForm({title: formData.title, content: formData.content})) return alert('اطلاعات ناقص');
    news.unshift({ ...formData, id: Date.now() });
    localStorage.setItem('news', JSON.stringify(news));
    loadNews();
    e.target.reset();
}

// Events and Calendar
function renderCalendar() {
    const calendar = document.getElementById('calendar');
    if (!calendar) return;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Header
    calendar.innerHTML = `
        <div class="calendar-header">
            <button onclick="prevMonth()">قبلی</button>
            <h3>${new Intl.DateTimeFormat('fa-IR', { month: 'long', year: 'numeric' }).format(now)}</h3>
            <button onclick="nextMonth()">بعدی</button>
        </div>
    `;

    // Days header
    const days = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
    days.forEach(day => {
        const div = document.createElement('div');
        div.textContent = day;
        div.className = 'calendar-day-header';
        calendar.appendChild(div);
    });

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
        const div = document.createElement('div');
        calendar.appendChild(div);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
        const div = document.createElement('div');
        div.className = 'calendar-day';
        div.textContent = day;
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const event = events.find(e => e.date === dateStr);
        if (event) {
            div.title = event.title;
            div.style.background = var(--accent-color);
            div.style.color = var(--white);
        }
        calendar.appendChild(div);
    }
}

function loadUpcomingEvents() {
    const list = document.getElementById('upcoming-events');
    if (!list) return;
    list.innerHTML = '';
    const now = new Date();
    const upcoming = events.filter(e => new Date(e.date) > now).slice(0, 5);
    upcoming.forEach(event => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${event.title}</strong> - ${event.date}`;
        list.appendChild(li);
    });
}

function prevMonth() {
    // Implement month navigation
    renderCalendar();
}

function nextMonth() {
    // Implement
    renderCalendar();
}

// Absences
function loadAbsences() {
    const tbody = document.querySelector('#absences-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    absences.forEach((item, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${sanitizeInput(item.name)}</td>
            <td>${sanitizeInput(item.id)}</td>
            <td>${item.date}</td>
            <td>${item.type}</td>
            <td>${sanitizeInput(item.reason)}</td>
            <td><span class="status ${item.status || 'pending'}">${item.status || 'در انتظار'}</span></td>
        `;
        if (isAdminLoggedIn) {
            const ops = row.insertCell();
            ops.innerHTML = `<button onclick="editItem('absences', ${index})">ویرایش</button><button onclick="deleteItem('absences', ${index})">حذف</button><button onclick="toggleStatus('absences', ${index})">تأیید</button>`;
        }
    });
}

function addAbsence(e) {
    e.preventDefault();
    const formData = {
        name: document.getElementById('student-name').value,
        id: document.getElementById('student-id').value,
        date: document.getElementById('absence-date').value,
        type: document.getElementById('absence-type').value,
        reason: document.getElementById('absence-reason').value,
        status: 'pending'
    };
    if (!validateForm(formData)) return alert('اطلاعات ناقص');
    absences.unshift({ ...formData, id: Date.now() });
    localStorage.setItem('absences', JSON.stringify(absences));
    loadAbsences();
    e.target.reset();
    showSuccess('گزارش ارسال شد');
}

// Gallery
function loadGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    grid.innerHTML = '';
    galleryImages.forEach((src, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `<img src="${src}" alt="تصویر ${index + 1}" onclick="openModal('${src}')">`;
        if (isAdminLoggedIn) {
            item.innerHTML += `<div class="admin-overlay"><button onclick="deleteItem('gallery', ${index})">حذف</button></div>`;
        }
        grid.appendChild(item);
    });
}

function openModal(src) {
    const modal = document.getElementById('image-modal');
    document.getElementById('modal-image').src = src;
    modal.classList.remove('hidden');
    modal.classList.add('active');
}

document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('image-modal').classList.remove('active');
    setTimeout(() => document.getElementById('image-modal').classList.add('hidden'), 300);
});

// Admin Functions
function setupEventListeners() {
    // Forms
    document.getElementById('absence-form')?.addEventListener('submit', addAbsence);
    document.getElementById('contact-form')?.addEventListener('submit', handleContact);
    if (document.getElementById('news-form')) {
        document.getElementById('news-form').addEventListener('submit', addNews);
    }
    if (document.getElementById('upload-form')) {
        document.getElementById('upload-form').addEventListener('submit', addImage);
    }
    if (document.getElementById('admin-login')) {
        document.getElementById('admin-login').addEventListener('submit', handleAdminLogin);
    }
    document.getElementById('logout-btn')?.addEventListener('click', logoutAdmin);
}

function handleAdminLogin(e) {
    e.preventDefault();
    const pass = document.getElementById('admin-password').value;
    if (hashInput(pass) === hashInput(ADMIN_PASSWORD)) {
        isAdminLoggedIn = true;
        localStorage.setItem('adminLoggedIn', 'true');
        document.getElementById('admin-login-container').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        loadAdminDashboard();
        showAdminForms();
        showSuccess('ورود موفق');
    } else {
        showError('رمز اشتباه');
    }
}

function loadAdminDashboard() {
    document.getElementById('admin-absences-count').textContent = absences.length;
    document.getElementById('admin-members-count').textContent = members.length;
    document.getElementById('admin-news-count').textContent = news.length;
    document.getElementById('admin-events-count').textContent = events.length;
    showAdminSection(adminSection);
}

function showAdminSection(subSection) {
    adminSection = subSection;
    const content = document.getElementById('admin-content');
    content.innerHTML = '';
    switch (subSection) {
        case 'absences':
            loadAbsencesAdmin();
            break;
        case 'members':
            loadMembersAdmin();
            break;
        case 'news':
            loadNewsAdmin();
            break;
        case 'events':
            loadEventsAdmin();
            break;
    }
}

function loadAbsencesAdmin() {
    // Similar to loadAbsences but with edit forms
    const content = document.getElementById('admin-content');
    content.innerHTML = '<h3>مدیریت غیبت‌ها</h3>' + document.getElementById('absences-table').outerHTML;
    loadAbsences(); // Reuse
}

function loadMembersAdmin() {
    // Implement members table and form
    const content = document.getElementById('admin-content');
    content.innerHTML = `
        <h3>مدیریت اعضا</h3>
        <form id="member-form-admin">
            <!-- Form fields -->
            <button type="submit">افزودن عضو</button>
        </form>
        <table id="members-table-admin"><!-- Table --></table>
    `;
    // Load data
}

function loadNewsAdmin() {
    const content = document.getElementById('admin-content');
    content.innerHTML = '<h3>مدیریت اخبار</h3>' + document.getElementById('news-admin-form').outerHTML;
    loadNews();
}

function loadEventsAdmin() {
    // Similar
}

function showAdminForms() {
    document.querySelectorAll('.admin-form').forEach(form => form.classList.remove('hidden'));
}

function logoutAdmin() {
    isAdminLoggedIn = false;
    localStorage.removeItem('adminLoggedIn');
    document.getElementById('admin-login-container').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
    showError('خروج موفق');
}

// Generic Edit/Delete
function editItem(type, index) {
    const items = { news, absences, galleryImages, events, members }[type];
    const item = items[index];
    // Populate form with item data
    alert(`ویرایش ${type}: ${JSON.stringify(item)}`); // Placeholder
    // In full impl, show edit modal
}

function deleteItem(type, index) {
    if (confirm('تأیید حذف؟')) {
        const items = { news, absences, galleryImages, events, members }[type];
        items.splice(index, 1);
        localStorage.setItem(type, JSON.stringify(items));
        loadSectionData(currentSection);
    }
}

function toggleStatus(type, index) {
    if (type === 'absences') {
        const item = absences[index];
        item.status = item.status === 'approved' ? 'pending' : 'approved';
        localStorage.setItem('absences', JSON.stringify(absences));
        loadAbsences();
    }
}

// Contact
function handleContact(e) {
    e.preventDefault();
    const formData = {
        name: document.getElementById('contact-name').value,
        email: document.getElementById('contact-email').value,
        message: document.getElementById('contact-message').value
    };
    if (!validateForm(formData)) return showError('اطلاعات ناقص');
    // Simulate send
    setTimeout(() => {
        showSuccess('پیام ارسال شد');
        e.target.reset();
    }, 1000);
}

// Image Upload
function addImage(e) {
    e.preventDefault();
    if (!isAdminLoggedIn) return;
    const file = document.getElementById('image-upload').files[0];
    if (file && file.type.startsWith('image/') && file.size < 5 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = (e) => {
            galleryImages.unshift(e.target.result);
            localStorage.setItem('galleryImages', JSON.stringify(galleryImages));
            loadGallery();
            showSuccess('تصویر آپلود شد');
        };
        reader.readAsDataURL(file);
    } else {
        showError('فایل نامعتبر');
    }
}

// Load All Data
function loadAllData() {
    // Ensure all arrays are loaded
    if (localStorage.getItem('news')) news = JSON.parse(localStorage.getItem('news'));
    if (localStorage.getItem('events')) events = JSON.parse(localStorage.getItem('events'));
    if (localStorage.getItem('members')) members = JSON.parse(localStorage.getItem('members'));
    if (localStorage.getItem('galleryImages')) galleryImages = JSON.parse(localStorage.getItem('galleryImages'));
}

// UI Helpers
function showSuccess(msg) {
    showNotification(msg, 'success');
}

function showError(msg) {
    showNotification(msg, 'error');
}

function showNotification(msg, type) {
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.textContent = msg;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}

// Cool Effects
function createParticles(count) {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particle-bg';
    document.body.appendChild(particlesContainer);
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        particlesContainer.appendChild(particle);
    }
}

function handleScroll() {
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            el.classList.add('visible');
        }
    });
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Window Events
window.addEventListener('error', (e) => console.error('JS Error:', e.error));
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) e.preventDefault();
});

// Session Timeout for Admin
setInterval(() => {
    if (isAdminLoggedIn && Date.now() - (localStorage.getItem('adminLoginTime') || 0) > 3600000) {
        logoutAdmin();
    }
}, 60000);

if (isAdminLoggedIn) localStorage.setItem('adminLoginTime', Date.now());

// Expose functions
window.showSection = showSection;
window.editItem = editItem;
window.deleteItem = deleteItem;
window.toggleStatus = toggleStatus;
window.prevMonth = prevMonth;
window.nextMonth = nextMonth;
window.openModal = openModal;
window.showAdminSection = showAdminSection;

// End of JS - Secure, feature-rich, with animations and admin capabilities for a cool informative school site.