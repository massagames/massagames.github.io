// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let galleryItems = [];
let currentIndex = 0;
let videoPlayers = {};

// ===== ЗАГРУЗКА ДАННЫХ ИЗ JSON =====
async function loadGalleryData() {
    try {
        const response = await fetch('data/gallery.json');
        galleryItems = await response.json();
        
        // Сортируем по порядку из JSON
        galleryItems.sort((a, b) => a.order - b.order);
        
        renderCarousel();
        setupCarouselControls();
        setupLightboxControls();
    } catch (error) {
        console.error('Ошибка загрузки данных галереи:', error);
        // Заглушка на случай ошибки
        document.getElementById('carouselTrack').innerHTML = '<div style="padding: 20px; border: 1px solid #000;">Ошибка загрузки галереи</div>';
    }
}

// ===== РЕНДЕР КАРУСЕЛИ =====
function renderCarousel() {
    const track = document.getElementById('carouselTrack');
    
    track.innerHTML = galleryItems.map((item, index) => `
        <div class="carousel-item" data-index="${index}">
            <img src="${item.thumbSrc}" alt="${item.alt}" loading="lazy">
        </div>
    `).join('');
    
    // Добавляем обработчики кликов на превью
    document.querySelectorAll('.carousel-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            openLightbox(index);
        });
    });
}

// ===== УПРАВЛЕНИЕ КАРУСЕЛЬЮ =====
function setupCarouselControls() {
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    
    prevBtn.addEventListener('click', () => {
        track.scrollBy({ left: -220, behavior: 'smooth' });
    });
    
    nextBtn.addEventListener('click', () => {
        track.scrollBy({ left: 220, behavior: 'smooth' });
    });
}

// ===== LIGHTBOX FUNCTIONS =====
function openLightbox(index) {
    currentIndex = index;
    const lightbox = document.getElementById('lightbox');
    const content = document.getElementById('lightboxContent');
    const caption = document.getElementById('lightboxCaption');
    
    const item = galleryItems[index];
    
    // Очищаем предыдущий контент
    content.innerHTML = '';
    
    // Создаем элемент в зависимости от типа
    if (item.type === 'video') {
        const video = document.createElement('video');
        video.src = item.fullSrc;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.controls = true;
        content.appendChild(video);
        
        // Сохраняем ссылку для остановки при закрытии
        videoPlayers[index] = video;
    } else {
        const img = document.createElement('img');
        img.src = item.fullSrc;
        img.alt = item.alt;
        content.appendChild(img);
    }
    
    caption.textContent = item.description;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    const content = document.getElementById('lightboxContent');
    
    // Останавливаем видео при закрытии
    Object.values(videoPlayers).forEach(video => {
        video.pause();
    });
    videoPlayers = {};
    
    content.innerHTML = '';
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function navigateLightbox(direction) {
    const newIndex = currentIndex + direction;
    
    if (newIndex >= 0 && newIndex < galleryItems.length) {
        // Останавливаем текущее видео если было
        if (videoPlayers[currentIndex]) {
            videoPlayers[currentIndex].pause();
            delete videoPlayers[currentIndex];
        }
        
        openLightbox(newIndex);
    }
}

function setupLightboxControls() {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');
    
    closeBtn.addEventListener('click', closeLightbox);
    
    prevBtn.addEventListener('click', () => {
        navigateLightbox(-1);
    });
    
    nextBtn.addEventListener('click', () => {
        navigateLightbox(1);
    });
    
    // Закрытие по клику на фон
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Клавиатурная навигация
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                navigateLightbox(-1);
                break;
            case 'ArrowRight':
                navigateLightbox(1);
                break;
        }
    });
}

// ===== ЗАПУСК =====
document.addEventListener('DOMContentLoaded', loadGalleryData);
