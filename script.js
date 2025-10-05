document.addEventListener('DOMContentLoaded', () => {
    // --- Global Elements ---
    const mainHeader = document.getElementById('main-header');
    const mainNav = document.getElementById('main-nav');
    const navLinks = mainNav ? mainNav.querySelector('.nav-links') : null;
    const hamburgerMenu = mainNav ? mainNav.querySelector('.hamburger-menu') : null;
    const notificationBar = document.getElementById('notification-bar');

    // --- Data Storage (for dynamic content & client-side admin panel) ---
    // Initialize data from localStorage or use default samples
    const defaultNotificationMessage = "به سایت مدرسه شهید علی اکبر نجفی خوش آمدید! شروع سال تحصیلی جدید را تبریک می‌گوییم.";
    let notificationText = localStorage.getItem('notificationText') || defaultNotificationMessage;
    let isNotificationVisible = localStorage.getItem('isNotificationVisible') !== 'false'; // Default to visible if not explicitly 'false'

    let newsData = JSON.parse(localStorage.getItem('newsData')) || [
        { id: 'news1', title: 'افتتاح آزمایشگاه فیزیک جدید', date: '۱۴۰۲/۰۸/۰۱', image: 'https://picsum.photos/id/200/400/250', description: 'با حضور مسئولین و دانش‌آموزان، آزمایشگاه مجهز فیزیک مدرسه افتتاح شد.' },
        { id: 'news2', title: 'برگزاری المپیاد ریاضی داخلی', date: '۱۴۰۲/۰۷/۲۵', image: 'https://picsum.photos/id/201/400/250', description: 'المپیاد ریاضی با هدف شناسایی استعدادهای برتر در مدرسه برگزار گردید.' },
        { id: 'news3', title: 'کسب رتبه برتر در مسابقات رباتیک استانی', date: '۱۴۰۲/۰۷/۱۸', image: 'https://picsum.photos/id/202/400/250', description: 'تیم رباتیک مدرسه شهید نجفی، موفق به کسب مقام اول در مسابقات استانی شد.' },
        { id: 'news4', title: 'کارگاه خلاقیت و نوآوری', date: '۱۴۰۲/۰۷/۱۰', image: 'https://picsum.photos/id/203/400/250', description: 'کارگاهی دو روزه با محوریت خلاقیت و ایده‌پردازی برای دانش‌آموزان برگزار شد.' },
        { id: 'news5', title: 'آغاز ثبت نام کلاس‌های فوق برنامه', date: '۱۴۰۲/۰۷/۰۵', image: 'https://picsum.photos/id/204/400/250', description: 'ثبت نام برای کلاس‌های تقویتی و هنری آغاز شد. علاقه‌مندان می‌توانند اقدام کنند.' }
    ];

    let eventsData = JSON.parse(localStorage.getItem('eventsData')) || [
        { id: 'event1', title: 'جشنواره پروژه‌های علمی دانش‌آموزی', date: '2025-12-15T09:00:00', description: 'نمایش دستاوردهای علمی و پژوهشی دانش‌آموزان در سطح استان.' },
        { id: 'event2', title: 'همایش اولیا و مربیان', date: '2025-11-20T16:00:00', description: 'گفتگو و تبادل نظر بین خانواده‌ها و کادر آموزشی مدرسه.' },
        { id: 'event3', title: 'اردوی فرهنگی و تفریحی پاییزه', date: '2025-11-05T08:30:00', description: 'بازدید از اماکن تاریخی و تفریحی کرمانشاه با دانش‌آموزان.' }
    ];

    let absenteesData = JSON.parse(localStorage.getItem('absenteesData')) || [
        { id: 'absentee1', name: 'سارا احمدی', class: 'دهم تجربی', date: '۱۴۰۲/۰۸/۰۱' },
        { id: 'absentee2', name: 'امیر محمدی', class: 'یازدهم ریاضی', date: '۱۴۰۲/۰۷/۳۰' },
        { id: 'absentee3', name: 'زهرا رضایی', class: 'نهم', date: '۱۴۰۲/۰۷/۲۹' },
        { id: 'absentee4', name: 'علی حسینی', class: 'دهم انسانی', date: '۱۴۰۲/۰۷/۲۹' }
    ];

    let staffData = JSON.parse(localStorage.getItem('staffData')) || [
        { id: 'staff1', name: 'دکتر فاطمه اکبری', position: 'مدیر مدرسه', image: 'https://picsum.photos/id/64/200/200', education: 'دکترای مدیریت آموزشی', contact: 'akbari.f@najafischool.ir' },
        { id: 'staff2', name: 'مهندس حسین رضایی', position: 'معاون آموزشی', image: 'https://picsum.photos/id/83/200/200', education: 'کارشناسی ارشد مهندسی', contact: 'rezaei.h@najafischool.ir' },
        { id: 'staff3', name: 'خانم مریم نوری', position: 'معلم ریاضی', image: 'https://picsum.photos/id/82/200/200', education: 'کارشناسی ریاضیات', contact: 'nouri.m@najafischool.ir' },
        { id: 'staff4', name: 'آقای سعید کریمی', position: 'معلم علوم', image: 'https://picsum.photos/id/81/200/200', education: 'کارشناسی ارشد فیزیک', contact: 'karimi.s@najafischool.ir' }
    ];

    let galleryImages = JSON.parse(localStorage.getItem('galleryImages')) || [
        'https://picsum.photos/id/219/800/600',  // School playground/activity
        'https://picsum.photos/id/212/800/600',  // Classroom interior
        'https://picsum.photos/id/237/800/600',  // Students walking in hallway
        'https://picsum.photos/id/238/800/600',  // Library/study area
        'https://picsum.photos/id/257/800/600'   // Science lab equipment
    ];


    // --- Header & Navigation Logic ---
    // Toggle mobile menu
    if (hamburgerMenu && navLinks) {
        hamburgerMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburgerMenu.classList.toggle('active');
        });
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('#main-nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }

            // Close mobile menu after clicking a link
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                hamburgerMenu.classList.remove('active');
            }
        });
    });

    // Notification Bar Logic
    if (notificationBar) {
        // Ensure the close button is present even if content is updated
        if (!notificationBar.querySelector('.close-btn')) {
             const pTag = notificationBar.querySelector('p');
             if (pTag) pTag.innerHTML += ' <span class="close-btn" aria-label="بستن">&times;</span>';
        }

        if (isNotificationVisible && notificationText) {
            notificationBar.querySelector('p').innerHTML = `${notificationText} <span class="close-btn" aria-label="بستن">&times;</span>`;
            notificationBar.classList.remove('hidden');
        } else {
            notificationBar.classList.add('hidden');
        }

        notificationBar.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-btn')) {
                notificationBar.classList.add('hidden');
                localStorage.setItem('isNotificationVisible', 'false');
            }
        });
    }

    // --- Hero Slider Logic ---
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
        // Restart animation for text on slide change
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.querySelectorAll('.animated-text, .btn').forEach(el => {
                // Remove existing animation classes
                el.classList.remove('animated-text', 'fadeIn');
                // Trigger reflow to restart animation
                void el.offsetWidth;
                // Add classes back
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
        showSlide(currentSlide); // Initialize first slide
        slideInterval = setInterval(nextSlide, 5000); // Auto slide every 5 seconds

        if (prevSlideBtn) {
            prevSlideBtn.addEventListener('click', () => {
                clearInterval(slideInterval); // Stop auto-slide on manual interaction
                prevSlide();
                slideInterval = setInterval(nextSlide, 5000); // Restart auto-slide
            });
        }

        if (nextSlideBtn) {
            nextSlideBtn.addEventListener('click', () => {
                clearInterval(slideInterval); // Stop auto-slide on manual interaction
                nextSlide();
                slideInterval = setInterval(nextSlide, 5000); // Restart auto-slide
            });
        }
    }

    // --- News & Announcements Logic ---
    const newsContainer = document.getElementById('news-container');
    const newsSearchInput = document.getElementById('news-search');

    function renderNews(newsArray) {
        if (!newsContainer) return;
        newsContainer.innerHTML = ''; // Clear existing news
        if (newsArray.length === 0) {
            newsContainer.innerHTML = '<p class="no-results">هیچ خبری یافت نشد.</p>';
            return;
        }
        // Display only the first 5 news items, or fewer if less than 5 exist
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

    // Initial render
    renderNews(newsData);

    // Search/Filter News
    if (newsSearchInput) {
        newsSearchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredNews = newsData.filter(news =>
                news.title.toLowerCase().includes(searchTerm) ||
                news.description.toLowerCase().includes(searchTerm) ||
                news.date.toLowerCase().includes(searchTerm)
            );
            renderNews(filteredNews);
        });
    }

    // --- Events & Countdown Logic ---
    const eventsListContainer = document.getElementById('events-list-container');
    const countdownDays = document.getElementById('days');
    const countdownHours = document.getElementById('hours');
    const countdownMinutes = document.getElementById('minutes');
    const countdownSeconds = document.getElementById('seconds');
    const countdownMessage = document.getElementById('countdown-message');
    const countdownTimerElement = document.getElementById('countdown-timer');
    const countdownCardH3 = document.querySelector('.countdown-card h3');


    function formatPersianDate(isoDateString, includeTime = false) {
        // Use native Intl.DateTimeFormat for best effort Persian date formatting
        const date = new Date(isoDateString);
        let options = { year: 'numeric', month: 'long', day: 'numeric' };
        if (includeTime) {
            options = { ...options, hour: '2-digit', minute: '2-digit', hour12: false };
        }
        try {
            return date.toLocaleDateString('fa-IR', options);
        } catch (e) {
            console.warn("Could not format date to fa-IR, falling back to default:", e);
            return date.toLocaleString('en-US', options); // Fallback
        }
    }

    function renderEvents(eventsArray) {
        if (!eventsListContainer) return;
        eventsListContainer.innerHTML = '';
        const now = new Date().getTime();
        // Filter for future events and sort to display upcoming ones first
        const upcomingEvents = [...eventsArray].filter(event => new Date(event.date).getTime() > now)
                                                 .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Display only the first 3 upcoming events, or fewer if less than 3 exist
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

    // Initial render
    renderEvents(eventsData);

    // Countdown Timer
    function updateCountdown() {
        if (!countdownTimerElement) return;

        const now = new Date().getTime();
        const upcomingEvents = eventsData.filter(event => new Date(event.date).getTime() > now);
        upcomingEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

        const nextEvent = upcomingEvents[0];

        if (!nextEvent) {
            countdownTimerElement.innerHTML = '<p class="no-results">رویداد مهم بعدی در آینده نزدیک نیست.</p>';
            if (countdownCardH3) countdownCardH3.textContent = 'رویداد مهم بعدی:';
            if (countdownMessage) countdownMessage.textContent = 'زمان باقی‌مانده تا آغاز رویداد بزرگ سال.';
            return;
        }

        const countdownDate = new Date(nextEvent.date).getTime();
        const distance = countdownDate - now;

        if (distance < 0) {
            countdownTimerElement.innerHTML = '<p class="no-results">رویداد آغاز شده یا به پایان رسیده است!</p>';
            if (countdownCardH3) countdownCardH3.textContent = 'رویداد مهم بعدی:';
            if (countdownMessage) countdownMessage.textContent = '';
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
    }

    // Update countdown every second
    const countdownInterval = setInterval(updateCountdown, 1000);
    // Initial call to avoid delay
    updateCountdown();

    // --- Absentees Logic ---
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

    // Initial render
    renderAbsentees(absenteesData);

    // Search/Filter & Sort Absentees
    function updateAbsenteesDisplay() {
        let currentAbsentees = [...absenteesData]; // Work with a copy

        // Apply search filter
        const searchTerm = absenteeSearchInput ? absenteeSearchInput.value.toLowerCase() : '';
        if (searchTerm) {
            currentAbsentees = currentAbsentees.filter(absentee =>
                absentee.name.toLowerCase().includes(searchTerm) ||
                absentee.class.toLowerCase().includes(searchTerm) ||
                absentee.date.toLowerCase().includes(searchTerm)
            );
        }

        // Apply sort
        const sortBy = absenteeSortSelect ? absenteeSortSelect.value : 'name';
        currentAbsentees.sort((a, b) => {
            if (sortBy === 'date') {
                // IMPORTANT: This is a simplistic string comparison for Persian dates (YYYY/MM/DD).
                // For a robust, accurate chronological sort across different Jalaali years/months,
                // a full Jalaali calendar library would be required to convert to Gregorian for Date objects.
                // For this client-side demo, direct string comparison assuming consistent YYYY/MM/DD works for 'newest first'.
                return b.date.localeCompare(a.date, 'fa'); // Assumes 'newer' date string is 'larger'
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

    // --- Staff Directory Logic ---
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

    // Initial render
    renderStaff(staffData);

    // --- Gallery Logic ---
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
            galleryItem.dataset.index = index; // Store index for navigation
            galleryItem.innerHTML = `<img src="${imageSrc}" alt="تصویر مدرسه ${index + 1}">`;
            galleryGrid.appendChild(galleryItem);
        });
    }

    // Initial render
    renderGallery(galleryImages);

    // Open Lightbox
    if (galleryGrid) {
        galleryGrid.addEventListener('click', (e) => {
            const item = e.target.closest('.gallery-item');
            if (item) {
                currentImageIndex = parseInt(item.dataset.index);
                showLightboxImage(currentImageIndex);
                lightbox.classList.add('active'); // Use class to toggle display: flex
            }
        });
    }

    // Show image in lightbox
    function showLightboxImage(index) {
        if (!lightboxImg || galleryImages.length === 0) return;

        if (index < 0) {
            index = galleryImages.length - 1; // Wrap around to last image
        } else if (index >= galleryImages.length) {
            index = 0; // Wrap around to first image
        }
        currentImageIndex = index;
        lightboxImg.src = galleryImages[currentImageIndex];
    }

    // Close Lightbox
    if (lightboxClose) {
        lightboxClose.addEventListener('click', () => {
            lightbox.classList.remove('active');
        });
    }

    // Lightbox Navigation (Adjusted for RTL convention: prev button shows next image logically)
    if (lightboxPrev) { // This is the 'right' arrow in LTR, but 'prev' button visually
        lightboxPrev.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent closing lightbox if click outside image
            showLightboxImage(currentImageIndex + 1); // For RTL, clicking 'prev' (right arrow) usually means moving to the next item
        });
    }
    if (lightboxNext) { // This is the 'left' arrow in LTR, but 'next' button visually
        lightboxNext.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent closing lightbox
            showLightboxImage(currentImageIndex - 1); // For RTL, clicking 'next' (left arrow) usually means moving to the previous item
        });
    }
    // Close lightbox on outside click (excluding nav buttons)
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
            }
        });
    }
    // Keyboard navigation (Escape to close, arrows for next/prev)
    document.addEventListener('keydown', (e) => {
        if (lightbox && lightbox.classList.contains('active')) {
            if (e.key === 'Escape') {
                lightbox.classList.remove('active');
            } else if (e.key === 'ArrowLeft') { // For RTL, ArrowLeft (visual left) is often treated as "next"
                showLightboxImage(currentImageIndex - 1); // Previous image logically in LTR, but visually 'next' in RTL gallery
            } else if (e.key === 'ArrowRight') { // For RTL, ArrowRight (visual right) is often treated as "previous"
                showLightboxImage(currentImageIndex + 1); // Next image logically in LTR, but visually 'prev' in RTL gallery
            }
        }
    });

    // --- Contact Form Logic ---
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
        }, 5000); // Hide after 5 seconds
    }

    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent default form submission

            let isValid = true;

            // Clear previous errors
            document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
            if (formStatusMessage) formStatusMessage.style.display = 'none';

            // Validate Name
            if (nameInput && nameInput.value.trim() === '') {
                document.getElementById('name-error').textContent = 'لطفاً نام خود را وارد کنید.';
                isValid = false;
            }

            // Validate Email
            if (emailInput && emailInput.value.trim() === '') {
                document.getElementById('email-error').textContent = 'لطفاً ایمیل خود را وارد کنید.';
                isValid = false;
            } else if (emailInput && !validateEmail(emailInput.value.trim())) {
                document.getElementById('email-error').textContent = 'آدرس ایمیل معتبر نیست.';
                isValid = false;
            }

            // Validate Message
            if (messageInput && messageInput.value.trim() === '') {
                document.getElementById('message-error').textContent = 'لطفاً پیام خود را وارد کنید.';
                isValid = false;
            }

            if (isValid) {
                // In a real application, you would send this data to a server using fetch or XMLHttpRequest
                console.log('Form Submitted:', {
                    name: nameInput ? nameInput.value : 'N/A',
                    email: emailInput ? emailInput.value : 'N/A',
                    message: messageInput ? messageInput.value : 'N/A'
                });
                showFormStatus('پیام شما با موفقیت ارسال شد. به زودی با شما تماس خواهیم گرفت.', 'success');
                contactForm.reset(); // Clear form fields
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
    const adminGalleryId = document.getElementById('admin-gallery-id'); // Not strictly needed for gallery as we only add/delete by URL
    const adminGalleryImageUrl = document.getElementById('admin-gallery-image-url');
    const adminGalleryList = document.getElementById('admin-gallery-list');


    const ADMIN_PASSWORD = 'admin123'; // Hardcoded admin password - INSECURE for real apps!

    // --- Utility functions for localStorage ---
    function saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            alert('خطا در ذخیره اطلاعات. فضای ذخیره‌سازی محلی ممکن است پر باشد. (Failing to save ' + key + ')');
        }
    }

    function generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    // --- Admin Panel Initialization & Display ---
    function initAdminPanel() {
        if (!adminOverlay) return; // Exit if admin panel elements are not found

        // Populate notification bar fields
        if (adminNotificationText) adminNotificationText.value = notificationText;
        if (adminNotificationVisibility) adminNotificationVisibility.checked = isNotificationVisible;

        renderAdminNewsList();
        renderAdminEventsList();
        renderAdminAbsenteesList();
        renderAdminStaffList();
        renderAdminGalleryList();
    }

    // --- Notification Bar Admin ---
    if (saveNotificationBtn) {
        saveNotificationBtn.addEventListener('click', () => {
            notificationText = adminNotificationText ? adminNotificationText.value.trim() : '';
            isNotificationVisible = adminNotificationVisibility ? adminNotificationVisibility.checked : false;
            saveToLocalStorage('notificationText', notificationText);
            saveToLocalStorage('isNotificationVisible', isNotificationVisible);

            // Update live notification bar
            if (notificationBar) {
                if (isNotificationVisible && notificationText) {
                    notificationBar.querySelector('p').innerHTML = `${notificationText} <span class="close-btn" aria-label="بستن">&times;</span>`;
                    notificationBar.classList.remove('hidden');
                } else {
                    notificationBar.classList.add('hidden');
                }
            }
            alert('اطلاعات نوار اطلاع‌رسانی ذخیره شد.');
        });
    }

    // --- News Admin ---
    function renderAdminNewsList() {
        if (!adminNewsList) return;
        adminNewsList.innerHTML = '';
        // Sort news by date, newest first for admin panel display
        const sortedNews = [...newsData].sort((a, b) => b.date.localeCompare(a.date, 'fa'));

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
        renderNews(newsData); // Re-render public news section
    }

    if (adminNewsForm) {
        adminNewsForm.addEventListener('submit', (e) => {
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
                // Update existing news
                const index = newsData.findIndex(n => String(n.id) === id);
                if (index !== -1) {
                    newsData[index] = { ...newsData[index], title, date, image, description };
                }
            } else {
                // Add new news
                const newNews = { id: generateUniqueId(), title, date, image, description };
                newsData.unshift(newNews); // Add to the beginning to show newest first
            }
            saveToLocalStorage('newsData', newsData);
            renderAdminNewsList();
            adminNewsForm.reset();
            if (adminNewsId) adminNewsId.value = ''; // Clear ID for next add
            alert('خبر ذخیره شد.');
        });
    }

    if (adminNewsList) {
        adminNewsList.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-btn')) {
                const id = e.target.dataset.id;
                const news = newsData.find(n => String(n.id) === id);
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
                    newsData = newsData.filter(n => String(n.id) !== id);
                    saveToLocalStorage('newsData', newsData);
                    renderAdminNewsList();
                    alert('خبر حذف شد.');
                }
            }
        });
    }

    // --- Events Admin ---
    function renderAdminEventsList() {
        if (!adminEventsList) return;
        adminEventsList.innerHTML = '';
        // Sort events by date, newest first for admin panel display
        const sortedEvents = [...eventsData].sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedEvents.forEach(event => {
            const li = document.createElement('li');
            const formattedDate = formatPersianDate(event.date, true); // Use formatPersianDate helper
            li.innerHTML = `
                <span>${event.title} (${formattedDate})</span>
                <div class="item-actions">
                    <button data-id="${event.id}" class="edit-btn">ویرایش</button>
                    <button data-id="${event.id}" class="delete-btn">حذف</button>
                </div>
            `;
            adminEventsList.appendChild(li);
        });
        renderEvents(eventsData); // Re-render public events section
        updateCountdown(); // Update countdown as well
    }

    if (adminEventForm) {
        adminEventForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = adminEventId ? adminEventId.value : '';
            const title = adminEventTitle ? adminEventTitle.value.trim() : '';
            const date = adminEventDate ? adminEventDate.value : ''; // datetime-local gives ISO string
            const description = adminEventDescription ? adminEventDescription.value.trim() : '';

            if (!title || !date || !description) {
                alert('لطفاً تمامی فیلدهای رویداد را پر کنید.');
                return;
            }

            if (id) {
                // Update existing event
                const index = eventsData.findIndex(ev => String(ev.id) === id);
                if (index !== -1) {
                    eventsData[index] = { ...eventsData[index], title, date, description };
                }
            } else {
                // Add new event
                const newEvent = { id: generateUniqueId(), title, date, description };
                eventsData.unshift(newEvent); // Add to the beginning to show newest first
            }
            saveToLocalStorage('eventsData', eventsData);
            renderAdminEventsList();
            adminEventForm.reset();
            if (adminEventId) adminEventId.value = ''; // Clear ID for next add
            alert('رویداد ذخیره شد.');
        });
    }

    if (adminEventsList) {
        adminEventsList.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-btn')) {
                const id = e.target.dataset.id;
                const event = eventsData.find(ev => String(ev.id) === id);
                if (event && adminEventId && adminEventTitle && adminEventDate && adminEventDescription) {
                    adminEventId.value = event.id;
                    adminEventTitle.value = event.title;
                    // Format ISO date for datetime-local input (YYYY-MM-DDTHH:MM)
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
                    eventsData = eventsData.filter(ev => String(ev.id) !== id);
                    saveToLocalStorage('eventsData', eventsData);
                    renderAdminEventsList();
                    alert('رویداد حذف شد.');
                }
            }
        });
    }

    // --- Absentees Admin ---
    function renderAdminAbsenteesList() {
        if (!adminAbsenteeList) return;
        adminAbsenteeList.innerHTML = '';
        // Sort absentees by date, newest first for admin panel display
        const sortedAbsentees = [...absenteesData].sort((a, b) => b.date.localeCompare(a.date, 'fa'));

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
        updateAbsenteesDisplay(); // Re-render public absentees section (which includes search/sort)
    }

    if (adminAbsenteeForm) {
        adminAbsenteeForm.addEventListener('submit', (e) => {
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
                // Update existing absentee
                const index = absenteesData.findIndex(a => String(a.id) === id);
                if (index !== -1) {
                    absenteesData[index] = { ...absenteesData[index], name, class: className, date };
                }
            } else {
                // Add new absentee
                const newAbsentee = { id: generateUniqueId(), name, class: className, date };
                absenteesData.unshift(newAbsentee); // Add to the beginning to show newest first
            }
            saveToLocalStorage('absenteesData', absenteesData);
            renderAdminAbsenteesList();
            adminAbsenteeForm.reset();
            if (adminAbsenteeId) adminAbsenteeId.value = ''; // Clear ID for next add
            alert('اطلاعات غایب ذخیره شد.');
        });
    }

    if (adminAbsenteeList) {
        adminAbsenteeList.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-btn')) {
                const id = e.target.dataset.id;
                const absentee = absenteesData.find(a => String(a.id) === id);
                if (absentee && adminAbsenteeId && adminAbsenteeName && adminAbsenteeClass && adminAbsenteeDate) {
                    adminAbsenteeId.value = absentee.id;
                    adminAbsenteeName.value = absentee.name;
                    adminAbsenteeClass.value = absentee.class;
                    adminAbsenteeDate.value = absentee.date;
                }
            } else if (e.target.classList.contains('delete-btn')) {
                const id = e.target.dataset.id;
                if (confirm('آیا از حذف این غایب اطمینان دارید؟')) {
                    absenteesData = absenteesData.filter(a => String(a.id) !== id);
                    saveToLocalStorage('absenteesData', absenteesData);
                    renderAdminAbsenteesList();
                    alert('غایب حذف شد.');
                }
            }
        });
    }

    // --- Staff Admin ---
    function renderAdminStaffList() {
        if (!adminStaffList) return;
        adminStaffList.innerHTML = '';
        // Sort staff alphabetically by name for admin panel display
        const sortedStaff = [...staffData].sort((a, b) => a.name.localeCompare(b.name, 'fa', { sensitivity: 'base' }));

        sortedStaff.forEach(staff => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${staff.name} (${staff.position})</span>
                <div class="item-actions">
                    <button data-id="${staff.id}" class="edit-btn">ویرایش</button>
                    <button data-id="${staff.id}" class="delete-btn">حذف</button>
                </div>
            `;
            adminStaffList.appendChild(li);
        });
        renderStaff(staffData); // Re-render public staff section
    }

    if (adminStaffForm) {
        adminStaffForm.addEventListener('submit', (e) => {
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
                // Update existing staff
                const index = staffData.findIndex(s => String(s.id) === id);
                if (index !== -1) {
                    staffData[index] = { ...staffData[index], name, position, image, education, contact };
                }
            } else {
                // Add new staff
                const newStaff = { id: generateUniqueId(), name, position, image, education, contact };
                staffData.push(newStaff); // Add to end, then sort for display
            }
            saveToLocalStorage('staffData', staffData);
            renderAdminStaffList();
            adminStaffForm.reset();
            if (adminStaffId) adminStaffId.value = ''; // Clear ID for next add
            alert('اطلاعات کارکنان ذخیره شد.');
        });
    }

    if (adminStaffList) {
        adminStaffList.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-btn')) {
                const id = e.target.dataset.id;
                const staff = staffData.find(s => String(s.id) === id);
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
                    staffData = staffData.filter(s => String(s.id) !== id);
                    saveToLocalStorage('staffData', staffData);
                    renderAdminStaffList();
                    alert('کارمند حذف شد.');
                }
            }
        });
    }

    // --- Gallery Admin ---
    function renderAdminGalleryList() {
        if (!adminGalleryList) return;
        adminGalleryList.innerHTML = '';
        if (galleryImages.length === 0) {
            adminGalleryList.innerHTML = '<li>هیچ تصویری در گالری ثبت نشده است.</li>';
            return;
        }

        galleryImages.forEach((imageSrc, index) => {
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
        renderGallery(galleryImages); // Re-render public gallery section
    }

    if (adminGalleryForm) {
        adminGalleryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const imageUrl = adminGalleryImageUrl ? adminGalleryImageUrl.value.trim() : '';

            if (!imageUrl) {
                alert('لطفاً لینک تصویر را وارد کنید.');
                return;
            }

            // Simple check for duplicate, though direct equality might be too strict for URLs
            if (!galleryImages.includes(imageUrl)) {
                galleryImages.push(imageUrl); // Add new image URL
                saveToLocalStorage('galleryImages', galleryImages);
                renderAdminGalleryList();
                adminGalleryForm.reset();
                alert('تصویر به گالری اضافه شد.');
            } else {
                alert('این تصویر از قبل در گالری موجود است.');
            }
        });
    }

    if (adminGalleryList) {
        adminGalleryList.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
                const indexToDelete = parseInt(e.target.dataset.index);
                if (confirm('آیا از حذف این تصویر اطمینان دارید؟')) {
                    galleryImages.splice(indexToDelete, 1); // Remove image by index
                    saveToLocalStorage('galleryImages', galleryImages);
                    renderAdminGalleryList();
                    alert('تصویر حذف شد.');
                }
            }
        });
    }

    // --- Admin Panel Opening/Closing ---
    // Check for '?admin' in URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('admin')) {
        const password = prompt('لطفاً رمز عبور مدیریت را وارد کنید:');
        if (password === ADMIN_PASSWORD) {
            if (adminOverlay) adminOverlay.classList.add('active');
            initAdminPanel(); // Initialize forms and lists
        } else if (password !== null) { // If user didn't cancel the prompt
            alert('رمز عبور اشتباه است.');
        }
    }

    if (closeAdminBtn) {
        closeAdminBtn.addEventListener('click', () => {
            if (adminOverlay) adminOverlay.classList.remove('active');
            // Optionally, remove the ?admin from the URL for cleaner browsing after closing
            if (window.history.replaceState) {
                const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
                window.history.replaceState({path:newUrl},'',newUrl);
            }
        });
    }
}); // End DOMContentLoaded
