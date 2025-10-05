document.addEventListener('DOMContentLoaded', () => {
    // --- Global Elements ---
    const mainHeader = document.getElementById('main-header');
    const mainNav = document.getElementById('main-nav');
    const navLinks = mainNav ? mainNav.querySelector('.nav-links') : null;
    const hamburgerMenu = mainNav ? mainNav.querySelector('.hamburger-menu') : null;
    const notificationBar = document.getElementById('notification-bar');

    // --- API Endpoints and Data Retrieval ---
    // فرض می‌کنیم `save_data.php` و `data.json` در همان دایرکتوری `index.html` هستند.
    const DATA_FILE_URL = 'data.json'; // URL برای خواندن داده‌ها (مستقیم)
    const ADMIN_API_URL = 'save_data.php'; // URL برای نوشتن داده‌ها (از طریق PHP)

    const ADMIN_PASSWORD = 'admin123'; // رمز عبور ادمین - **همچنان ناامن! فقط برای نمایش و تست!**

    // Global data variable (will be populated from server)
    let siteData = {
        notification: { text: "", visible: false },
        newsData: [],
        eventsData: [],
        absenteesData: [],
        staffData: [],
        galleryImages: []
    };

    // Function to fetch data from the server
    async function fetchSiteData() {
        try {
            // برای خواندن، مستقیماً فایل data.json را درخواست می‌کنیم
            const response = await fetch(DATA_FILE_URL); 
            if (!response.ok) {
                // اگر فایل data.json وجود نداشت یا قابل دسترسی نبود
                if (response.status === 404) {
                    console.warn('data.json not found, initializing with empty data.');
                    siteData = { // Initialize with empty structure
                        notification: { text: "خوش آمدید!", visible: true },
                        newsData: [], eventsData: [], absenteesData: [], staffData: [], galleryImages: []
                    };
                    // optionally save this initial empty state to the server
                    await saveSiteData(siteData, false); // Do not alert on initial empty save
                    updateAllUI();
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            siteData = await response.json();
            console.log('Site data fetched:', siteData);
            updateAllUI(); // After fetching, update all UI elements
        } catch (error) {
            console.error('Failed to fetch site data:', error);
            alert('خطا در بارگذاری اطلاعات سایت. لطفاً بعداً دوباره امتحان کنید. (ممکن است فایل data.json وجود نداشته باشد یا قابل دسترسی نباشد.)');
            // Fallback to default empty data or show an error message to the user
            siteData = {
                notification: { text: "خطا در بارگذاری اطلاع‌رسانی.", visible: true },
                newsData: [],
                eventsData: [],
                absenteesData: [],
                staffData: [],
                galleryImages: []
            };
            updateAllUI(); // Still attempt to render empty UI
        }
    }

    // Function to save all data to the server (Admin only)
    async function saveSiteData(dataToSave, showAlert = true) { // Add showAlert parameter
        try {
            const response = await fetch(ADMIN_API_URL, {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    password: ADMIN_PASSWORD, // Sending password (insecure!)
                    data: dataToSave
                })
            });

            if (!response.ok) {
                const errorResponse = await response.json(); // PHP returns JSON error messages
                throw new Error(`HTTP error! status: ${response.status} - ${errorResponse.message || 'Unknown error'}`);
            }

            console.log('Data saved successfully to server.');
            if (showAlert) alert('اطلاعات با موفقیت ذخیره و به‌روز شد.');
            await fetchSiteData(); // Refresh local data and UI after successful save
            return true;
        } catch (error) {
            console.error('Failed to save site data:', error);
            alert(`خطا در ذخیره اطلاعات: ${error.message}`);
            return false;
        }
    }

    // --- Utility functions for generating IDs (still useful) ---
    function generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    // --- Central UI Update Function ---
    // This function will be called after initial fetch and after any admin changes
    function updateAllUI() {
        // Update Notification Bar
        if (notificationBar) {
            if (siteData.notification.visible && siteData.notification.text) {
                notificationBar.querySelector('p').innerHTML = `${siteData.notification.text} <span class="close-btn" aria-label="بستن">&times;</span>`;
                notificationBar.classList.remove('hidden');
            } else {
                notificationBar.classList.add('hidden');
            }
        }
        // Re-render all sections with the new siteData
        renderNews(siteData.newsData);
        renderEvents(siteData.eventsData);
        updateCountdown(); // Call updateCountdown directly now
        updateAbsenteesDisplay(); // This function already filters/sorts from siteData.absenteesData
        renderStaff(siteData.staffData);
        renderGallery(siteData.galleryImages);

        // Also update admin panel forms if active
        if (adminOverlay && adminOverlay.classList.contains('active')) {
            initAdminPanel(); // Re-populate admin forms with fresh data
        }
    }

    // --- Header & Navigation Logic (بدون تغییر) ---
    // ... (همان کدهای قبلی) ...

    // Notification Bar Logic (تغییرات جزئی برای استفاده از siteData)
    if (notificationBar) {
        if (!notificationBar.querySelector('.close-btn')) {
             const pTag = notificationBar.querySelector('p');
             if (pTag) pTag.innerHTML += ' <span class="close-btn" aria-label="بستن">&times;</span>';
        }

        // Initialize from siteData
        if (siteData.notification.visible && siteData.notification.text) {
            notificationBar.querySelector('p').innerHTML = `${siteData.notification.text} <span class="close-btn" aria-label="بستن">&times;</span>`;
            notificationBar.classList.remove('hidden');
        } else {
            notificationBar.classList.add('hidden');
        }

        notificationBar.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-btn')) {
                notificationBar.classList.add('hidden');
                siteData.notification.visible = false; // Update local data
                // اگر می‌خواهید این تغییر در سرور ذخیره شود، باید اینجا saveSiteData(siteData) را فراخوانی کنید
                // await saveSiteData(siteData); // Uncomment to save closing of notification bar
            }
        });
    }

    // --- Hero Slider Logic (بدون تغییر) ---
    const sliderItems = document.querySelectorAll('.slider-item');
    const prevSlideBtn = document.querySelector('.slider-nav.prev');
    const nextSlideBtn = document.querySelector('.slider-nav.next');
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        if (sliderItems.length === 0) return;
        
        sliderItems.forEach((item, i) => {
            item.classList.remove('active');
            if (i === index) {
                item.classList.add('active');
            }
        });
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.querySelectorAll('.animated-text, .btn').forEach(el => {
                el.classList.remove('animated-text', 'fadeIn');
                void el.offsetWidth;
                el.classList.add('animated-text');
                if (el.classList.contains('btn')) {
                    el.classList.add('fadeIn');
                }
            });
        }
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % sliderItems.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + sliderItems.length) % sliderItems.length;
        showSlide(currentSlide);
    }

    if (sliderItems.length > 0) {
        showSlide(currentSlide); 
        slideInterval = setInterval(nextSlide, 5000); 

        if (prevSlideBtn) {
            prevSlideBtn.addEventListener('click', () => {
                clearInterval(slideInterval); 
                prevSlide();
                slideInterval = setInterval(nextSlide, 5000); 
            });
        }

        if (nextSlideBtn) {
            nextSlideBtn.addEventListener('click', () => {
                clearInterval(slideInterval); 
                nextSlide();
                slideInterval = setInterval(nextSlide, 5000); 
            });
        }
    }

    // --- News & Announcements Logic (تغییرات جزئی برای استفاده از siteData.newsData) ---
    const newsContainer = document.getElementById('news-container');
    const newsSearchInput = document.getElementById('news-search');

    function renderNews(newsArray) {
        if (!newsContainer) return;
        newsContainer.innerHTML = '';
        if (newsArray.length === 0) {
            newsContainer.innerHTML = '<p class="no-results">هیچ خبری یافت نشد.</p>';
            return;
        }
        const itemsToDisplay = newsArray.slice(0, 5); 
        itemsToDisplay.forEach(news => {
            const newsCard = document.createElement('div');
            newsCard.classList.add('news-card');
            newsCard.innerHTML = `
                <img src="${news.image}" alt="${news.title}">
                <div class="news-card-content">
                    <h3>${news.title}</h3>
                    <p>${news.description}</p>
                    <span class="date">${news.date}</span>
                </div>
            `;
            newsContainer.appendChild(newsCard);
        });
    }

    if (newsSearchInput) {
        newsSearchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredNews = siteData.newsData.filter(news =>
                news.title.toLowerCase().includes(searchTerm) ||
                news.description.toLowerCase().includes(searchTerm) ||
                news.date.toLowerCase().includes(searchTerm)
            );
            renderNews(filteredNews);
        });
    }

    // --- Events & Countdown Logic (تغییرات جزئی برای استفاده از siteData.eventsData) ---
    const eventsListContainer = document.getElementById('events-list-container');
    const countdownDays = document.getElementById('days');
    const countdownHours = document.getElementById('hours');
    const countdownMinutes = document.getElementById('minutes');
    const countdownSeconds = document.getElementById('seconds');
    const countdownMessage = document.getElementById('countdown-message');
    const countdownTimerElement = document.getElementById('countdown-timer');
    const countdownCardH3 = document.querySelector('.countdown-card h3');


    function formatPersianDate(isoDateString, includeTime = false) {
        const date = new Date(isoDateString);
        let options = { year: 'numeric', month: 'long', day: 'numeric' };
        if (includeTime) {
            options = { ...options, hour: '2-digit', minute: '2-digit', hour12: false };
        }
        try {
            return date.toLocaleDateString('fa-IR', options);
        } catch (e) {
            console.warn("Could not format date to fa-IR, falling back to default:", e);
            return date.toLocaleString('en-US', options); 
        }
    }

    function renderEvents(eventsArray) {
        if (!eventsListContainer) return;
        eventsListContainer.innerHTML = '';
        const now = new Date().getTime();
        const upcomingEvents = [...eventsArray].filter(event => new Date(event.date).getTime() > now)
                                                 .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        const itemsToDisplay = upcomingEvents.slice(0, 3);

        if (itemsToDisplay.length === 0) {
            eventsListContainer.innerHTML = '<p class="no-results">هیچ رویداد آینده‌ای یافت نشد.</p>';
            return;
        }

        itemsToDisplay.forEach(event => {
            const eventDate = new Date(event.date);
            const day = eventDate.toLocaleDateString('fa-IR', { day: 'numeric' });
            const month = eventDate.toLocaleDateString('fa-IR', { month: 'short' });
            const time = eventDate.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', hour12: false });

            const eventItem = document.createElement('div');
            eventItem.classList.add('event-item');
            eventItem.innerHTML = `
                <div class="event-date-box">
                    <span class="day">${day}</span>
                    <span class="month">${month}</span>
                </div>
                <div class="event-content">
                    <h3>${event.title}</h3>
                    <p>${event.description} <br> <span>(زمان: ${time})</span></p>
                </div>
            `;
            eventsListContainer.appendChild(eventItem);
        });
    }

    let countdownUpdateInterval; // Clearer name
    function updateCountdown() {
        if (!countdownTimerElement) return;

        clearInterval(countdownUpdateInterval); // Clear any existing interval

        const now = new Date().getTime();
        const upcomingEvents = siteData.eventsData.filter(event => new Date(event.date).getTime() > now);
        upcomingEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

        const nextEvent = upcomingEvents[0];

        if (!nextEvent) {
            countdownTimerElement.innerHTML = '<p class="no-results">رویداد مهم بعدی در آینده نزدیک نیست.</p>';
            if (countdownCardH3) countdownCardH3.textContent = 'رویداد مهم بعدی:';
            if (countdownMessage) countdownMessage.textContent = 'زمان باقی‌مانده تا آغاز رویداد بزرگ سال.';
            return;
        }

        const countdownDate = new Date(nextEvent.date).getTime();
        
        const displayTimer = () => {
            const distance = countdownDate - new Date().getTime();

            if (distance < 0) {
                countdownTimerElement.innerHTML = '<p class="no-results">رویداد آغاز شده یا به پایان رسیده است!</p>';
                if (countdownCardH3) countdownCardH3.textContent = 'رویداد مهم بعدی:';
                if (countdownMessage) countdownMessage.textContent = '';
                clearInterval(countdownUpdateInterval); 
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            if (countdownDays) countdownDays.textContent = String(days).padStart(2, '0');
            if (countdownHours) countdownHours.textContent = String(hours).padStart(2, '0');
            if (countdownMinutes) countdownMinutes.textContent = String(minutes).padStart(2, '0');
            if (countdownSeconds) countdownSeconds.textContent = String(seconds).padStart(2, '0');
            
            if (countdownCardH3) countdownCardH3.textContent = `رویداد مهم بعدی: ${nextEvent.title}`;
            if (countdownMessage) countdownMessage.textContent = `زمان باقی‌مانده تا آغاز: ${nextEvent.title}.`;
        };

        displayTimer();
        countdownUpdateInterval = setInterval(displayTimer, 1000);
    }

    // --- Absentees Logic (تغییرات جزئی برای استفاده از siteData.absenteesData) ---
    const absenteeTableBody = document.getElementById('absentee-table-body');
    const absenteeSearchInput = document.getElementById('absentee-search');
    const absenteeSortSelect = document.getElementById('absentee-sort');

    function renderAbsentees(absenteesArray) {
        if (!absenteeTableBody) return;
        absenteeTableBody.innerHTML = '';
        if (absenteesArray.length === 0) {
            absenteeTableBody.innerHTML = '<tr><td colspan="3" class="no-results">هیچ غایبی یافت نشد.</td></tr>';
            return;
        }
        absenteesArray.forEach(absentee => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${absentee.name}</td>
                <td>${absentee.class}</td>
                <td>${absentee.date}</td>
            `;
            absenteeTableBody.appendChild(row);
        });
    }

    function updateAbsenteesDisplay() {
        let currentAbsentees = [...siteData.absenteesData]; 

        const searchTerm = absenteeSearchInput ? absenteeSearchInput.value.toLowerCase() : '';
        if (searchTerm) {
            currentAbsentees = currentAbsentees.filter(absentee =>
                absentee.name.toLowerCase().includes(searchTerm) ||
                absentee.class.toLowerCase().includes(searchTerm) ||
                absentee.date.toLowerCase().includes(searchTerm)
            );
        }

        const sortBy = absenteeSortSelect ? absenteeSortSelect.value : 'name';
        currentAbsentees.sort((a, b) => {
            if (sortBy === 'date') {
                return b.date.localeCompare(a.date, 'fa'); 
            } else {
                return a[sortBy].localeCompare(b[sortBy], 'fa', { sensitivity: 'base' });
            }
        });

        renderAbsentees(currentAbsentees);
    }

    if (absenteeSearchInput) {
        absenteeSearchInput.addEventListener('input', updateAbsenteesDisplay);
    }
    if (absenteeSortSelect) {
        absenteeSortSelect.addEventListener('change', updateAbsenteesDisplay);
    }

    // --- Staff Directory Logic (تغییرات جزئی برای استفاده از siteData.staffData) ---
    const staffContainer = document.getElementById('staff-container');

    function renderStaff(staffArray) {
        if (!staffContainer) return;
        staffContainer.innerHTML = '';
        if (staffArray.length === 0) {
            staffContainer.innerHTML = '<p class="no-results">کارکنانی یافت نشد.</p>';
            return;
        }
        staffArray.forEach(staff => {
            const staffCard = document.createElement('div');
            staffCard.classList.add('staff-card');
            staffCard.innerHTML = `
                <img src="${staff.image}" alt="${staff.name}" class="staff-card-img">
                <h3>${staff.name}</h3>
                <span class="position">${staff.position}</span>
                <div class="staff-details">
                    ${staff.education ? `<p><strong>تحصیلات:</strong> ${staff.education}</p>` : ''}
                    ${staff.contact ? `<p><strong>تماس:</strong> <a href="mailto:${staff.contact}">${staff.contact}</a></p>` : ''}
                </div>
            `;
            staffContainer.appendChild(staffCard);
        });
    }

    // --- Gallery Logic (تغییرات جزئی برای استفاده از siteData.galleryImages) ---
    const galleryGrid = document.getElementById('gallery-grid');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-nav.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-nav.lightbox-next');
    let currentImageIndex = 0;

    function renderGallery(imagesArray) {
        if (!galleryGrid) return;
        galleryGrid.innerHTML = '';
        if (imagesArray.length === 0) {
            galleryGrid.innerHTML = '<p class="no-results">هیچ تصویری در گالری یافت نشد.</p>';
            return;
        }
        imagesArray.forEach((imageSrc, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.classList.add('gallery-item');
            galleryItem.dataset.index = index; 
            galleryItem.innerHTML = `<img src="${imageSrc}" alt="تصویر مدرسه ${index + 1}">`;
            galleryGrid.appendChild(galleryItem);
        });
    }
    
    if (galleryGrid) {
        galleryGrid.addEventListener('click', (e) => {
            const item = e.target.closest('.gallery-item');
            if (item) {
                currentImageIndex = parseInt(item.dataset.index);
                showLightboxImage(currentImageIndex);
                lightbox.classList.add('active');
            }
        });
    }

    function showLightboxImage(index) {
        if (!lightboxImg || siteData.galleryImages.length === 0) return;

        if (index < 0) {
            index = siteData.galleryImages.length - 1; 
        } else if (index >= siteData.galleryImages.length) {
            index = 0; 
        }
        currentImageIndex = index;
        lightboxImg.src = siteData.galleryImages[currentImageIndex];
    }

    if (lightboxClose) {
        lightboxClose.addEventListener('click', () => {
            lightbox.classList.remove('active');
        });
    }

    if (lightboxPrev) { 
        lightboxPrev.addEventListener('click', (e) => {
            e.stopPropagation(); 
            showLightboxImage(currentImageIndex - 1); 
        });
    }
    if (lightboxNext) { 
        lightboxNext.addEventListener('click', (e) => {
            e.stopPropagation(); 
            showLightboxImage(currentImageIndex + 1); 
        });
    }
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
            }
        });
    }
    document.addEventListener('keydown', (e) => {
        if (lightbox && lightbox.classList.contains('active')) {
            if (e.key === 'Escape') {
                lightbox.classList.remove('active');
            } else if (e.key === 'ArrowRight') { 
                showLightboxImage(currentImageIndex - 1);
            } else if (e.key === 'ArrowLeft') { 
                showLightboxImage(currentImageIndex + 1);
            }
        }
    });

    // --- Contact Form Logic (بدون تغییر) ---
    const contactForm = document.getElementById('contact-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const formStatusMessage = document.getElementById('form-status-message');

    function showFormStatus(message, type) {
        if (!formStatusMessage) return;
        formStatusMessage.textContent = message;
        formStatusMessage.className = `form-status-message ${type}`;
        formStatusMessage.style.display = 'block';
        setTimeout(() => {
            formStatusMessage.style.display = 'none';
        }, 5000); 
    }

    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); 

            let isValid = true;

            document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
            if (formStatusMessage) formStatusMessage.style.display = 'none';

            if (nameInput && nameInput.value.trim() === '') {
                document.getElementById('name-error').textContent = 'لطفاً نام خود را وارد کنید.';
                isValid = false;
            }

            if (emailInput && emailInput.value.trim() === '') {
                document.getElementById('email-error').textContent = 'لطفاً ایمیل خود را وارد کنید.';
                isValid = false;
            } else if (emailInput && !validateEmail(emailInput.value.trim())) {
                document.getElementById('email-error').textContent = 'آدرس ایمیل معتبر نیست.';
                isValid = false;
            }

            if (messageInput && messageInput.value.trim() === '') {
                document.getElementById('message-error').textContent = 'لطفاً پیام خود را وارد کنید.';
                isValid = false;
            }

            if (isValid) {
                console.log('Form Submitted:', {
                    name: nameInput ? nameInput.value : 'N/A',
                    email: emailInput ? emailInput.value : 'N/A',
                    message: messageInput ? messageInput.value : 'N/A'
                });
                showFormStatus('پیام شما با موفقیت ارسال شد. به زودی با شما تماس خواهیم گرفت.', 'success');
                contactForm.reset(); 
            } else {
                showFormStatus('لطفاً تمامی فیلدهای الزامی را به درستی پر کنید.', 'error');
            }
        });
    }

    // --- Admin Panel Logic ---
    const adminOverlay = document.getElementById('admin-overlay');
    const closeAdminBtn = adminOverlay ? adminOverlay.querySelector('.close-admin-btn') : null;
    const adminNotificationText = document.getElementById('admin-notification-text');
    const adminNotificationVisibility = document.getElementById('admin-notification-visibility');
    const saveNotificationBtn = document.getElementById('save-notification-btn');

    const adminNewsForm = document.getElementById('admin-news-form');
    const adminNewsId = document.getElementById('admin-news-id');
    const adminNewsTitle = document.getElementById('admin-news-title');
    const adminNewsDate = document.getElementById('admin-news-date');
    const adminNewsImage = document.getElementById('admin-news-image');
    const adminNewsDescription = document.getElementById('admin-news-description');
    const adminNewsList = document.getElementById('admin-news-list');

    const adminEventForm = document.getElementById('admin-event-form');
    const adminEventId = document.getElementById('admin-event-id');
    const adminEventTitle = document.getElementById('admin-event-title');
    const adminEventDate = document.getElementById('admin-event-date');
    const adminEventDescription = document.getElementById('admin-event-description');
    const adminEventsList = document.getElementById('admin-events-list');

    const adminAbsenteeForm = document.getElementById('admin-absentee-form');
    const adminAbsenteeId = document.getElementById('admin-absentee-id');
    const adminAbsenteeName = document.getElementById('admin-absentee-name');
    const adminAbsenteeClass = document.getElementById('admin-absentee-class');
    const adminAbsenteeDate = document.getElementById('admin-absentee-date');
    const adminAbsenteeList = document.getElementById('admin-absentee-list');

    const adminStaffForm = document.getElementById('admin-staff-form');
    const adminStaffId = document.getElementById('admin-staff-id');
    const adminStaffName = document.getElementById('admin-staff-name');
    const adminStaffPosition = document.getElementById('admin-staff-position');
    const adminStaffImage = document.getElementById('admin-staff-image');
    const adminStaffEducation = document.getElementById('admin-staff-education');
    const adminStaffContact = document.getElementById('admin-staff-contact');
    const adminStaffList = document.getElementById('admin-staff-list');

    const adminGalleryForm = document.getElementById('admin-gallery-form');
    const adminGalleryId = document.getElementById('admin-gallery-id'); 
    const adminGalleryImageUrl = document.getElementById('admin-gallery-image-url');
    const adminGalleryList = document.getElementById('admin-gallery-list');


    const ADMIN_PASSWORD = 'admin123'; // Hardcoded admin password - INSECURE for real apps!

    // --- Admin Panel Initialization & Display (بروزرسانی برای استفاده از siteData) ---
    function initAdminPanel() {
        if (!adminOverlay) return; 
        
        if (adminNotificationText) adminNotificationText.value = siteData.notification.text;
        if (adminNotificationVisibility) adminNotificationVisibility.checked = siteData.notification.visible;

        renderAdminNewsList();
        renderAdminEventsList();
        renderAdminAbsenteesList();
        renderAdminStaffList();
        renderAdminGalleryList();
    }

    // --- Notification Bar Admin (بروزرسانی برای استفاده از siteData) ---
    if (saveNotificationBtn) {
        saveNotificationBtn.addEventListener('click', async () => { 
            siteData.notification.text = adminNotificationText ? adminNotificationText.value.trim() : '';
            siteData.notification.visible = adminNotificationVisibility ? adminNotificationVisibility.checked : false;
            
            await saveSiteData(siteData); 
        });
    }

    // --- News Admin (بروزرسانی برای استفاده از siteData) ---
    function renderAdminNewsList() {
        if (!adminNewsList) return;
        adminNewsList.innerHTML = '';
        const sortedNews = [...siteData.newsData].sort((a, b) => b.date.localeCompare(a.date, 'fa'));

        sortedNews.forEach(news => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${news.title} (${news.date})</span>
                <div class="item-actions">
                    <button data-id="${news.id}" class="edit-btn">ویرایش</button>
                    <button data-id="${news.id}" class="delete-btn">حذف</button>
                </div>
            `;
            adminNewsList.appendChild(li);
        });
        renderNews(siteData.newsData);
    }

    if (adminNewsForm) {
        adminNewsForm.addEventListener('submit', async (e) => { 
            e.preventDefault();
            const id = adminNewsId ? adminNewsId.value : '';
            const title = adminNewsTitle ? adminNewsTitle.value.trim() : '';
            const date = adminNewsDate ? adminNewsDate.value.trim() : '';
            const image = adminNewsImage ? adminNewsImage.value.trim() : '';
            const description = adminNewsDescription ? adminNewsDescription.value.trim() : '';

            if (!title || !date || !image || !description) {
                alert('لطفاً تمامی فیلدهای خبر را پر کنید.');
                return;
            }

            if (id) {
                const index = siteData.newsData.findIndex(n => String(n.id) === id);
                if (index !== -1) {
                    siteData.newsData[index] = { ...siteData.newsData[index], title, date, image, description };
                }
            } else {
                const newNews = { id: generateUniqueId(), title, date, image, description };
                siteData.newsData.unshift(newNews);
            }
            if (await saveSiteData(siteData)) { 
                renderAdminNewsList();
                adminNewsForm.reset();
                if (adminNewsId) adminNewsId.value = '';
            }
        });
    }

    if (adminNewsList) {
        adminNewsList.addEventListener('click', async (e) => { 
            if (e.target.classList.contains('edit-btn')) {
                const id = e.target.dataset.id;
                const news = siteData.newsData.find(n => String(n.id) === id);
                if (news && adminNewsId && adminNewsTitle && adminNewsDate && adminNewsImage && adminNewsDescription) {
                    adminNewsId.value = news.id;
                    adminNewsTitle.value = news.title;
                    adminNewsDate.value = news.date;
                    adminNewsImage.value = news.image;
                    adminNewsDescription.value = news.description;
                }
            } else if (e.target.classList.contains('delete-btn')) {
                const id = e.target.dataset.id;
                if (confirm('آیا از حذف این خبر اطمینان دارید؟')) {
                    siteData.newsData = siteData.newsData.filter(n => String(n.id) !== id);
                    if (await saveSiteData(siteData)) { 
                        renderAdminNewsList();
                    }
                }
            }
        });
    }

    // --- Events Admin (بروزرسانی برای استفاده از siteData) ---
    function renderAdminEventsList() {
        if (!adminEventsList) return;
        adminEventsList.innerHTML = '';
        const sortedEvents = [...siteData.eventsData].sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedEvents.forEach(event => {
            const li = document.createElement('li');
            const formattedDate = formatPersianDate(event.date, true);
            li.innerHTML = `
                <span>${event.title} (${formattedDate})</span>
                <div class="item-actions">
                    <button data-id="${event.id}" class="edit-btn">ویرایش</button>
                    <button data-id="${event.id}" class="delete-btn">حذف</button>
                </div>
            `;
            adminEventsList.appendChild(li);
        });
        renderEvents(siteData.eventsData);
        updateCountdown();
    }

    if (adminEventForm) {
        adminEventForm.addEventListener('submit', async (e) => { 
            e.preventDefault();
            const id = adminEventId ? adminEventId.value : '';
            const title = adminEventTitle ? adminEventTitle.value.trim() : '';
            const date = adminEventDate ? adminEventDate.value : '';
            const description = adminEventDescription ? adminEventDescription.value.trim() : '';

            if (!title || !date || !description) {
                alert('لطفاً تمامی فیلدهای رویداد را پر کنید.');
                return;
            }

            if (id) {
                const index = siteData.eventsData.findIndex(ev => String(ev.id) === id);
                if (index !== -1) {
                    siteData.eventsData[index] = { ...siteData.eventsData[index], title, date, description };
                }
            } else {
                const newEvent = { id: generateUniqueId(), title, date, description };
                siteData.eventsData.unshift(newEvent);
            }
            if (await saveSiteData(siteData)) { 
                renderAdminEventsList();
                adminEventForm.reset();
                if (adminEventId) adminEventId.value = '';
            }
        });
    }

    if (adminEventsList) {
        adminEventsList.addEventListener('click', async (e) => { 
            if (e.target.classList.contains('edit-btn')) {
                const id = e.target.dataset.id;
                const event = siteData.eventsData.find(ev => String(ev.id) === id);
                if (event && adminEventId && adminEventTitle && adminEventDate && adminEventDescription) {
                    adminEventId.value = event.id;
                    adminEventTitle.value = event.title;
                    const eventDate = new Date(event.date);
                    const yyyy = eventDate.getFullYear();
                    const mm = String(eventDate.getMonth() + 1).padStart(2, '0');
                    const dd = String(eventDate.getDate()).padStart(2, '0');
                    const hh = String(eventDate.getHours()).padStart(2, '0');
                    const min = String(eventDate.getMinutes()).padStart(2, '0');
                    adminEventDate.value = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
                    adminEventDescription.value = event.description;
                }
            } else if (e.target.classList.contains('delete-btn')) {
                const id = e.target.dataset.id;
                if (confirm('آیا از حذف این رویداد اطمینان دارید؟')) {
                    siteData.eventsData = siteData.eventsData.filter(ev => String(ev.id) !== id);
                    if (await saveSiteData(siteData)) { 
                        renderAdminEventsList();
                    }
                }
            }
        });
    }

    // --- Absentees Admin (بروزرسانی برای استفاده از siteData) ---
    function renderAdminAbsenteesList() {
        if (!adminAbsenteeList) return;
        adminAbsenteeList.innerHTML = '';
        const sortedAbsentees = [...siteData.absenteesData].sort((a, b) => b.date.localeCompare(a.date, 'fa'));

        sortedAbsentees.forEach(absentee => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${absentee.name} (${absentee.class}) - ${absentee.date}</span>
                <div class="item-actions">
                    <button data-id="${absentee.id}" class="edit-btn">ویرایش</button>
                    <button data-id="${absentee.id}" class="delete-btn">حذف</button>
                </div>
            `;
            adminAbsenteeList.appendChild(li);
        });
        updateAbsenteesDisplay(); 
    }

    if (adminAbsenteeForm) {
        adminAbsenteeForm.addEventListener('submit', async (e) => { 
            e.preventDefault();
            const id = adminAbsenteeId ? adminAbsenteeId.value : '';
            const name = adminAbsenteeName ? adminAbsenteeName.value.trim() : '';
            const className = adminAbsenteeClass ? adminAbsenteeClass.value.trim() : '';
            const date = adminAbsenteeDate ? adminAbsenteeDate.value.trim() : '';

            if (!name || !className || !date) {
                alert('لطفاً تمامی فیلدهای غایب را پر کنید.');
                return;
            }

            if (id) {
                const index = siteData.absenteesData.findIndex(a => String(a.id) === id);
                if (index !== -1) {
                    siteData.absenteesData[index] = { ...siteData.absenteesData[index], name, class: className, date };
                }
            } else {
                const newAbsentee = { id: generateUniqueId(), name, class: className, date };
                siteData.absenteesData.unshift(newAbsentee);
            }
            if (await saveSiteData(siteData)) { 
                renderAdminAbsenteesList();
                adminAbsenteeForm.reset();
                if (adminAbsenteeId) adminAbsenteeId.value = '';
            }
        });
    }

    if (adminAbsenteeList) {
        adminAbsenteeList.addEventListener('click', async (e) => { 
            if (e.target.classList.contains('edit-btn')) {
                const id = e.target.dataset.id;
                const absentee = siteData.absenteesData.find(a => String(a.id) === id);
                if (absentee && adminAbsenteeId && adminAbsenteeName && adminAbsenteeClass && adminAbsenteeDate) {
                    adminAbsenteeId.value = absentee.id;
                    adminAbsenteeName.value = absentee.name;
                    adminAbsenteeClass.value = absentee.class;
                    adminAbsenteeDate.value = absentee.date;
                }
            } else if (e.target.classList.contains('delete-btn')) {
                const id = e.target.dataset.id;
                if (confirm('آیا از حذف این غایب اطمینان دارید؟')) {
                    siteData.absenteesData = siteData.absenteesData.filter(a => String(a.id) !== id);
                    if (await saveSiteData(siteData)) { 
                        renderAdminAbsenteesList();
                    }
                }
            }
        });
    }

    // --- Staff Admin (بروزرسانی برای استفاده از siteData) ---
    const staffContainer = document.getElementById('staff-container');

    function renderStaff(staffArray) {
        if (!staffContainer) return;
        staffContainer.innerHTML = '';
        if (staffArray.length === 0) {
            staffContainer.innerHTML = '<p class="no-results">کارکنانی یافت نشد.</p>';
            return;
        }
        staffArray.forEach(staff => {
            const staffCard = document.createElement('div');
            staffCard.classList.add('staff-card');
            staffCard.innerHTML = `
                <img src="${staff.image}" alt="${staff.name}" class="staff-card-img">
                <h3>${staff.name}</h3>
                <span class="position">${staff.position}</span>
                <div class="staff-details">
                    ${staff.education ? `<p><strong>تحصیلات:</strong> ${staff.education}</p>` : ''}
                    ${staff.contact ? `<p><strong>تماس:</strong> <a href="mailto:${staff.contact}">${staff.contact}</a></p>` : ''}
                </div>
            `;
            staffContainer.appendChild(staffCard);
        });
    }

    if (adminStaffForm) {
        adminStaffForm.addEventListener('submit', async (e) => { 
            e.preventDefault();
            const id = adminStaffId ? adminStaffId.value : '';
            const name = adminStaffName ? adminStaffName.value.trim() : '';
            const position = adminStaffPosition ? adminStaffPosition.value.trim() : '';
            const image = adminStaffImage ? adminStaffImage.value.trim() : '';
            const education = adminStaffEducation ? adminStaffEducation.value.trim() : '';
            const contact = adminStaffContact ? adminStaffContact.value.trim() : '';

            if (!name || !position || !image) {
                alert('لطفاً فیلدهای نام، سمت و لینک تصویر کارکنان را پر کنید.');
                return;
            }

            if (id) {
                const index = siteData.staffData.findIndex(s => String(s.id) === id);
                if (index !== -1) {
                    siteData.staffData[index] = { ...siteData.staffData[index], name, position, image, education, contact };
                }
            } else {
                const newStaff = { id: generateUniqueId(), name, position, image, education, contact };
                siteData.staffData.push(newStaff);
            }
            if (await saveSiteData(siteData)) { 
                renderAdminStaffList();
                adminStaffForm.reset();
                if (adminStaffId) adminStaffId.value = '';
            }
        });
    }

    if (adminStaffList) {
        adminStaffList.addEventListener('click', async (e) => { 
            if (e.target.classList.contains('edit-btn')) {
                const id = e.target.dataset.id;
                const staff = siteData.staffData.find(s => String(s.id) === id);
                if (staff && adminStaffId && adminStaffName && adminStaffPosition && adminStaffImage && adminStaffEducation && adminStaffContact) {
                    adminStaffId.value = staff.id;
                    adminStaffName.value = staff.name;
                    adminStaffPosition.value = staff.position;
                    adminStaffImage.value = staff.image;
                    adminStaffEducation.value = staff.education || '';
                    adminStaffContact.value = staff.contact || '';
                }
            } else if (e.target.classList.contains('delete-btn')) {
                const id = e.target.dataset.id;
                if (confirm('آیا از حذف این کارمند اطمینان دارید؟')) {
                    siteData.staffData = siteData.staffData.filter(s => String(s.id) !== id);
                    if (await saveSiteData(siteData)) { 
                        renderAdminStaffList();
                    }
                }
            }
        });
    }

    // --- Gallery Admin (بروزرسانی برای استفاده از siteData) ---
    const adminGalleryForm = document.getElementById('admin-gallery-form');
    const adminGalleryImageUrl = document.getElementById('admin-gallery-image-url');
    const adminGalleryList = document.getElementById('admin-gallery-list');

    function renderAdminGalleryList() {
        if (!adminGalleryList) return;
        adminGalleryList.innerHTML = '';
        if (siteData.galleryImages.length === 0) {
            adminGalleryList.innerHTML = '<li>هیچ تصویری در گالری ثبت نشده است.</li>';
            return;
        }

        siteData.galleryImages.forEach((imageSrc, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <img src="${imageSrc}" alt="تصویر گالری" style="width: 60px; height: 40px; object-fit: cover; border-radius: 3px;">
                <span>${imageSrc}</span>
                <div class="item-actions">
                    <button data-index="${index}" class="delete-btn">حذف</button>
                </div>
            `;
            adminGalleryList.appendChild(li);
        });
        renderGallery(siteData.galleryImages);
    }

    if (adminGalleryForm) {
        adminGalleryForm.addEventListener('submit', async (e) => { 
            e.preventDefault();
            const imageUrl = adminGalleryImageUrl ? adminGalleryImageUrl.value.trim() : '';

            if (!imageUrl) {
                alert('لطفاً لینک تصویر را وارد کنید.');
                return;
            }

            if (!siteData.galleryImages.includes(imageUrl)) {
                siteData.galleryImages.push(imageUrl);
                if (await saveSiteData(siteData)) { 
                    renderAdminGalleryList();
                    adminGalleryForm.reset();
                }
            } else {
                alert('این تصویر از قبل در گالری موجود است.');
            }
        });
    }

    if (adminGalleryList) {
        adminGalleryList.addEventListener('click', async (e) => { 
            if (e.target.classList.contains('delete-btn')) {
                const indexToDelete = parseInt(e.target.dataset.index);
                if (confirm('آیا از حذف این تصویر اطمینان دارید؟')) {
                    siteData.galleryImages.splice(indexToDelete, 1);
                    if (await saveSiteData(siteData)) { 
                        renderAdminGalleryList();
                    }
                }
            }
        });
    }

    // --- Admin Panel Opening/Closing (با تغییرات اولیه در مدیریت URL) ---
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('admin')) {
        const password = prompt('لطفاً رمز عبور مدیریت را وارد کنید:');
        if (password === ADMIN_PASSWORD) {
            if (adminOverlay) adminOverlay.classList.add('active');
            initAdminPanel(); 
        } else {
            if (password !== null) {
                alert('رمز عبور اشتباه است.');
            }
            if (window.history.replaceState) {
                const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
                window.history.replaceState({path:newUrl},'',newUrl);
            }
        }
    }

    if (closeAdminBtn) {
        closeAdminBtn.addEventListener('click', () => {
            if (adminOverlay) adminOverlay.classList.remove('active');
            if (window.history.replaceState) {
                const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
                window.history.replaceState({path:newUrl},'',newUrl);
            }
        });
    }
    
    // --- Initial data load when DOM is ready ---
    fetchSiteData(); // Load data from server and then render UI

}); // End DOMContentLoaded
