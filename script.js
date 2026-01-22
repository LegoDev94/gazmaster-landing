// ==========================================
// GazMaster - Main JavaScript
// ==========================================

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = '8446823734:AAFzJPrKkn8y6djjsH81OcUnXq6T666fVjA';
const TELEGRAM_CHAT_ID = '-5083519453'; // Групповой чат для заявок

// ==========================================
// Mobile Menu
// ==========================================
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        const icon = mobileMenuBtn.querySelector('i');
        if (mobileMenu.classList.contains('hidden')) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        } else {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        }
    });

    // Close mobile menu when clicking on links
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            mobileMenuBtn.querySelector('i').classList.remove('fa-times');
            mobileMenuBtn.querySelector('i').classList.add('fa-bars');
        });
    });
}

// ==========================================
// Header Scroll Effect
// ==========================================
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// ==========================================
// Modal Functions
// ==========================================
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const modalService = document.getElementById('modalService');
const successModal = document.getElementById('successModal');

function openModal(service = '') {
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');

    if (service) {
        modalService.value = service;
        document.getElementById('modalSubtitle').textContent = `Услуга: ${service}`;
    } else {
        modalService.value = '';
        document.getElementById('modalSubtitle').textContent = 'Мы перезвоним вам в течение 15 минут';
    }

    setTimeout(() => {
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function closeModal() {
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');

    setTimeout(() => {
        modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
    }, 300);
}

function openSuccessModal() {
    successModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
}

function closeSuccessModal() {
    successModal.classList.add('hidden');
    document.body.classList.remove('modal-open');
}

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeSuccessModal();
    }
});

// ==========================================
// Phone Mask
// ==========================================
function formatPhone(input) {
    let value = input.value.replace(/\D/g, '');
    let formattedValue = '';

    if (value.length > 0) {
        if (value[0] === '7' || value[0] === '8') {
            formattedValue = '+7 ';
            value = value.substring(1);
        } else if (value[0] === '9') {
            formattedValue = '+7 ';
        } else {
            formattedValue = '+7 ';
            value = value.substring(1);
        }
    }

    if (value.length > 0) {
        formattedValue += '(' + value.substring(0, 3);
    }
    if (value.length >= 3) {
        formattedValue += ') ' + value.substring(3, 6);
    }
    if (value.length >= 6) {
        formattedValue += '-' + value.substring(6, 8);
    }
    if (value.length >= 8) {
        formattedValue += '-' + value.substring(8, 10);
    }

    input.value = formattedValue;
}

// Apply phone mask to all phone inputs
document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('input', () => formatPhone(input));
    input.addEventListener('focus', () => {
        if (!input.value) {
            input.value = '+7 ';
        }
    });
});

// ==========================================
// Send to Telegram
// ==========================================
async function sendToTelegram(formData) {
    const message = `
🔥 *Новая заявка с сайта ГазМастер*

👤 *Имя:* ${formData.name}
📱 *Телефон:* ${formData.phone}
${formData.email ? `📧 *Email:* ${formData.email}` : ''}
${formData.service ? `🔧 *Услуга:* ${formData.service}` : ''}
${formData.message ? `💬 *Сообщение:* ${formData.message}` : ''}

📅 *Дата:* ${new Date().toLocaleString('ru-RU')}
🌐 *Источник:* ${window.location.href}
    `.trim();

    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        const data = await response.json();

        if (data.ok) {
            return { success: true };
        } else {
            console.error('Telegram API error:', data);
            return { success: false, error: data.description };
        }
    } catch (error) {
        console.error('Network error:', error);
        return { success: false, error: error.message };
    }
}

// ==========================================
// Form Submission Handler
// ==========================================
function handleFormSubmit(form, formName) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Отправка...';
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');

        // Collect form data
        const formData = {
            name: form.querySelector('input[name="name"]').value,
            phone: form.querySelector('input[name="phone"]').value,
            email: form.querySelector('input[name="email"]')?.value || '',
            service: form.querySelector('select[name="service"]')?.value ||
                     form.querySelector('input[name="service"]')?.value || '',
            message: form.querySelector('textarea[name="message"]')?.value || ''
        };

        // Send to Telegram
        const result = await sendToTelegram(formData);

        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');

        if (result.success) {
            // Reset form
            form.reset();

            // Close modal if open
            if (!modal.classList.contains('hidden')) {
                closeModal();
            }

            // Show success modal
            setTimeout(() => {
                openSuccessModal();
            }, 300);

            // Show toast notification
            showToast('Заявка успешно отправлена!', 'success');
        } else {
            // Show error toast
            showToast('Ошибка отправки. Попробуйте позвонить нам.', 'error');
            console.error('Form submission error:', result.error);
        }
    });
}

// Apply to all forms
const heroForm = document.getElementById('heroForm');
const modalForm = document.getElementById('modalForm');
const contactForm = document.getElementById('contactForm');

if (heroForm) handleFormSubmit(heroForm, 'hero');
if (modalForm) handleFormSubmit(modalForm, 'modal');
if (contactForm) handleFormSubmit(contactForm, 'contact');

// ==========================================
// Toast Notifications
// ==========================================
function showToast(message, type = 'success') {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ==========================================
// Smooth Scroll for Anchor Links
// ==========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ==========================================
// Intersection Observer for Animations
// ==========================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('section > .container').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});

// ==========================================
// Stats Counter Animation
// ==========================================
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);

    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start) + (element.dataset.suffix || '');
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + (element.dataset.suffix || '');
        }
    }

    updateCounter();
}

// ==========================================
// Lazy Loading Images
// ==========================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ==========================================
// Parallax Effect for Hero Section
// ==========================================
const heroSection = document.querySelector('section.relative.min-h-screen');
if (heroSection) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroImg = heroSection.querySelector('img');
        if (heroImg && scrolled < window.innerHeight) {
            heroImg.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
    });
}

// ==========================================
// Form Validation Enhancement
// ==========================================
function validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 11;
}

function validateName(name) {
    return name.trim().length >= 2;
}

// Add real-time validation
document.querySelectorAll('form').forEach(form => {
    const nameInput = form.querySelector('input[name="name"]');
    const phoneInput = form.querySelector('input[name="phone"]');

    if (nameInput) {
        nameInput.addEventListener('blur', () => {
            if (!validateName(nameInput.value)) {
                nameInput.classList.add('border-red-500');
            } else {
                nameInput.classList.remove('border-red-500');
                nameInput.classList.add('border-green-500');
            }
        });
    }

    if (phoneInput) {
        phoneInput.addEventListener('blur', () => {
            if (!validatePhone(phoneInput.value)) {
                phoneInput.classList.add('border-red-500');
            } else {
                phoneInput.classList.remove('border-red-500');
                phoneInput.classList.add('border-green-500');
            }
        });
    }
});

// ==========================================
// Quiz Functionality
// ==========================================
const quizData = {
    currentStep: 1,
    totalSteps: 6,
    answers: {}
};

const quizSteps = document.querySelectorAll('.quiz-step');
const quizProgress = document.getElementById('quizProgress');
const currentStepDisplay = document.getElementById('currentStep');
const progressPercent = document.getElementById('progressPercent');
const quizPrevBtn = document.getElementById('quizPrev');
const quizNextBtn = document.getElementById('quizNext');
const quizNavigation = document.getElementById('quizNavigation');

// Quiz option selection - handle both old and new card styles
document.querySelectorAll('.quiz-option input').forEach(input => {
    input.addEventListener('change', function() {
        // Store answer
        quizData.answers[this.name] = this.value;
    });
});

function updateQuizUI() {
    // Update progress bar
    const progress = (quizData.currentStep / quizData.totalSteps) * 100;
    quizProgress.style.width = `${progress}%`;

    // Update step display
    currentStepDisplay.textContent = quizData.currentStep;

    // Update progress percentage
    if (progressPercent) {
        progressPercent.textContent = Math.round(progress);
    }

    // Show/hide steps
    quizSteps.forEach(step => {
        const stepNum = parseInt(step.dataset.step);
        step.classList.toggle('hidden', stepNum !== quizData.currentStep);
    });

    // Show/hide prev button
    quizPrevBtn.classList.toggle('hidden', quizData.currentStep === 1);

    // Hide next button on last step (form step)
    if (quizData.currentStep === quizData.totalSteps) {
        quizNavigation.classList.add('hidden');
    } else {
        quizNavigation.classList.remove('hidden');
    }
}

// Next button
if (quizNextBtn) {
    quizNextBtn.addEventListener('click', () => {
        if (quizData.currentStep < quizData.totalSteps) {
            quizData.currentStep++;
            updateQuizUI();
        }
    });
}

// Prev button
if (quizPrevBtn) {
    quizPrevBtn.addEventListener('click', () => {
        if (quizData.currentStep > 1) {
            quizData.currentStep--;
            updateQuizUI();
        }
    });
}

// Quiz form submission
const quizForm = document.getElementById('quizForm');
if (quizForm) {
    quizForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = quizForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Отправка...';
        submitBtn.disabled = true;

        // Collect all data
        const formData = {
            name: quizForm.querySelector('input[name="name"]').value,
            phone: quizForm.querySelector('input[name="phone"]').value,
            service: 'Квиз-расчёт стоимости',
            message: formatQuizAnswers(quizData.answers)
        };

        const result = await sendToTelegram(formData);

        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        if (result.success) {
            quizForm.reset();
            openSuccessModal();
            showToast('Заявка успешно отправлена!', 'success');
            // Reset quiz
            quizData.currentStep = 1;
            quizData.answers = {};
            updateQuizUI();
            // Clear selections
            document.querySelectorAll('.quiz-card').forEach(card => {
                card.classList.remove('border-orange-500', 'bg-orange-50', 'ring-2', 'ring-orange-500');
            });
        } else {
            showToast('Ошибка отправки. Попробуйте позвонить нам.', 'error');
        }
    });
}

function formatQuizAnswers(answers) {
    const labels = {
        distance: 'Расстояние до газа',
        location: 'Местоположение',
        object_type: 'Тип объекта',
        equipment: 'Есть оборудование',
        steps: 'Предпринимались шаги'
    };

    const values = {
        border: 'Вдоль границ',
        '20m': 'До 20 метров',
        '50m': 'До 50 метров',
        '50plus': 'Более 50 м',
        '200plus': 'Более 200 м',
        unknown: 'Нет информации',
        moscow: 'Москва',
        new_moscow: 'Новая Москва',
        moscow_region: 'Подмосковье',
        other: 'Другое',
        house: 'Дом/дача/коттедж',
        industrial: 'Промышленный объект',
        village: 'СНТ/коттеджный посёлок',
        yes: 'Да',
        no: 'Нет'
    };

    let result = '📋 ОТВЕТЫ ИЗ КВИЗА:\n';
    for (const [key, value] of Object.entries(answers)) {
        const label = labels[key] || key;
        const displayValue = values[value] || value;
        result += `• ${label}: ${displayValue}\n`;
    }
    return result;
}

// ==========================================
// Lightbox for Gallery with Swipe Support
// ==========================================
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxContainer = document.getElementById('lightboxContainer');
const lightboxCounter = document.getElementById('lightboxCounter');

// Gallery images array
let galleryImages = [];
let currentImageIndex = 0;

// Initialize gallery images
function initGallery() {
    const portfolioImages = document.querySelectorAll('#portfolio .grid img');
    galleryImages = Array.from(portfolioImages).map(img => ({
        src: img.src,
        alt: img.alt
    }));
}

// Call on page load
document.addEventListener('DOMContentLoaded', initGallery);

function openLightbox(element) {
    const img = element.querySelector('img');
    if (img && lightbox && lightboxImg) {
        // Find index of clicked image
        const clickedSrc = img.src;
        currentImageIndex = galleryImages.findIndex(g => g.src === clickedSrc);
        if (currentImageIndex === -1) currentImageIndex = 0;

        updateLightboxImage();
        lightbox.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
    }
}

function updateLightboxImage() {
    if (galleryImages.length > 0) {
        lightboxImg.src = galleryImages[currentImageIndex].src;
        lightboxImg.alt = galleryImages[currentImageIndex].alt;
        if (lightboxCounter) {
            lightboxCounter.textContent = `${currentImageIndex + 1} / ${galleryImages.length}`;
        }
    }
}

function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    updateLightboxImage();
}

function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    updateLightboxImage();
}

function closeLightbox() {
    if (lightbox) {
        lightbox.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (!lightbox || lightbox.classList.contains('hidden')) return;

    if (e.key === 'Escape') {
        closeLightbox();
    } else if (e.key === 'ArrowRight') {
        nextImage();
    } else if (e.key === 'ArrowLeft') {
        prevImage();
    }
});

// Close lightbox on background click
if (lightboxContainer) {
    lightboxContainer.addEventListener('click', (e) => {
        if (e.target === lightboxContainer) {
            closeLightbox();
        }
    });
}

// Touch swipe support
let touchStartX = 0;
let touchEndX = 0;
const swipeThreshold = 50;

if (lightboxContainer) {
    lightboxContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightboxContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
}

function handleSwipe() {
    const swipeDistance = touchEndX - touchStartX;

    if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
            // Swipe right - previous image
            prevImage();
        } else {
            // Swipe left - next image
            nextImage();
        }
    }
}

// ==========================================
// Console Welcome Message
// ==========================================
console.log('%c🔥 ГазМастер', 'font-size: 24px; font-weight: bold; color: #f97316;');
console.log('%cСайт разработан с любовью к деталям', 'font-size: 12px; color: #666;');
