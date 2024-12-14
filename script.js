// Initialize custom game map
const initGameMap = () => {
    // Set map bounds
    const mapBounds = [
        [-128, -128],  // South West
        [128, 128]    // North East
    ];

    // Create the map
    const map = L.map('map', {
        crs: L.CRS.Simple,
        maxBounds: mapBounds,
        maxBoundsViscosity: 1.0,
        minZoom: -2,
        maxZoom: 2,
        zoom: -1,
        center: [0, 0],
        attributionControl: false,
        zoomControl: false  // Отключаем кнопки зума
    });

    // Add the image overlay
    const imageUrl = 'map/0.png';  // Используем базовое изображение карты
    const imageBounds = [[-128, -128], [128, 128]];
    L.imageOverlay(imageUrl, imageBounds).addTo(map);

    // Fit bounds to show the entire map
    map.fitBounds(imageBounds);

    // Debug information
    map.on('zoomend', function() {
        console.log('Current zoom level:', map.getZoom());
    });

    // Prevent the map from being dragged outside bounds
    map.on('drag', function() {
        map.panInsideBounds(mapBounds, { animate: false });
    });

    return map;
};

// Initialize map and music player when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize map
    const map = initGameMap();
    
    // Category Headers Toggle
    const categoryHeaders = document.querySelectorAll('.category-header');
    categoryHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const items = header.nextElementSibling;
            const icon = header.querySelector('i');
            
            // Toggle items visibility
            if (items.style.display === 'none') {
                items.style.display = 'block';
                icon.classList.remove('fa-chevron-right');
                icon.classList.add('fa-chevron-down');
            } else {
                items.style.display = 'none';
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-right');
            }
        });
    });

    // Обработчик для сворачивания/разворачивания категорий
    document.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', () => {
            const items = header.nextElementSibling;
            const isCollapsed = header.classList.contains('collapsed');
            
            if (isCollapsed) {
                header.classList.remove('collapsed');
                items.style.display = 'block';
            } else {
                header.classList.add('collapsed');
                items.style.display = 'none';
            }
        });
    });

    // Tab Navigation
    const tabs = document.querySelectorAll('.nav-tab');
    const contentSections = document.querySelectorAll('.content-section, #map');

    // Инициализация вкладок
    const addTabClickHandler = () => {
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                setActiveTab(tab.id);
                openTab(tab.id);
            });
        });
    };

    // Удаляем все предыдущие обработчики кликов, если они есть
    tabs.forEach(tab => {
        tab.replaceWith(tab.cloneNode(true));
    });

    // Добавляем обработчики кликов после загрузки DOM
    addTabClickHandler();

    // Показываем карту по умолчанию при загрузке
    const mapSection = document.getElementById('map');
    const mapTab = document.querySelector('.nav-tab:first-child');
    
    if (mapSection && mapTab) {
        // Показываем карту
        mapSection.style.display = 'block';
        mapSection.classList.add('active-content');
        
        // Делаем первую вкладку активной
        tabs.forEach(t => t.classList.remove('active'));
        mapTab.classList.add('active');
    }

    // Обработчик клика по логотипу
    document.querySelector('.logo-link').addEventListener('click', (e) => {
        e.preventDefault();
        
        // Находим вкладку "Новости"
        const newsTab = Array.from(tabs).find(tab => tab.textContent.trim() === 'Новости');
        
        if (newsTab) {
            // Убираем активный класс со всех вкладок
            tabs.forEach(tab => tab.classList.remove('active'));
            
            // Делаем вкладку "Новости" активной
            newsTab.classList.add('active');
            
            // Скрываем все секции контента
            contentSections.forEach(section => {
                section.classList.remove('active-content');
                section.style.display = 'none';
            });
            
            // Показываем секцию новостей
            const newsSection = document.getElementById('news');
            if (newsSection) {
                newsSection.classList.add('active-content');
                newsSection.style.display = 'flex';
            }
            
            // Сохранение активной вкладки в localStorage
            setActiveTab(newsTab.id);
        }
    });

    // Initialize music player
    const musicPlayer = new MusicPlayer();
});

// Сохранение активной вкладки в localStorage
function setActiveTab(tabId) {
    localStorage.setItem('activeTab', tabId);
}

// Восстановление активной вкладки при загрузке страницы
window.onload = function() {
    const activeTab = localStorage.getItem('activeTab');
    if (activeTab) {
        openTab(activeTab);
    }
};

// Пример функции для открытия вкладки
function openTab(tabId) {
    const tabs = document.querySelectorAll('.nav-tab');
    const contentSections = document.querySelectorAll('.content-section, #map');
    
    tabs.forEach(tab => {
        if (tab.id === tabId) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    contentSections.forEach(section => {
        if (section.id === tabId) {
            section.style.display = 'block';
            section.classList.add('active-content');
        } else {
            section.style.display = 'none';
            section.classList.remove('active-content');
        }
    });
}

// Music Player
class MusicPlayer {
    constructor() {
        this.songs = [
            './music/song1.mp3',
            './music/song2.mp3',
            './music/song3.mp3'
        ];
        this.currentSong = 0;
        this.audio = new Audio();
        this.nextAudio = new Audio();
        this.audio.volume = 0.1;
        this.nextAudio.volume = 0;
        this.isPlaying = false;
        this.crossfadeDuration = 3000; // 3 seconds crossfade
        this.isCrossfading = false;
        this.initialize();
    }

    initialize() {
        // Add error handling for audio loading
        this.audio.addEventListener('error', (e) => {
            console.error('Error loading audio:', e);
            console.error('Current src:', this.audio.src);
        });

        // Monitor current time to prepare for crossfade
        this.audio.addEventListener('timeupdate', () => {
            if (this.isPlaying && !this.isCrossfading) {
                const timeLeft = this.audio.duration - this.audio.currentTime;
                if (timeLeft < this.crossfadeDuration / 1000) {
                    this.startCrossfade();
                }
            }
        });

        // Prevent volume changes
        this.audio.addEventListener('volumechange', () => {
            if (!this.isCrossfading && this.audio.volume !== 0.1) {
                this.audio.volume = 0.1;
            }
        });

        const toggleButton = document.getElementById('toggleMusic');
        toggleButton.addEventListener('click', () => {
            if (this.isPlaying) {
                this.pause();
            } else {
                this.play();
            }
        });

        // Preload first song
        this.audio.src = this.songs[this.currentSong];
        this.audio.load();
        // Preload next song
        this.preloadNext();
    }

    preloadNext() {
        const nextIndex = (this.currentSong + 1) % this.songs.length;
        this.nextAudio.src = this.songs[nextIndex];
        this.nextAudio.load();
    }

    startCrossfade() {
        if (this.isCrossfading) return;
        this.isCrossfading = true;

        // Start playing the next track
        this.nextAudio.play();
        
        // Gradually fade out current track and fade in next track
        const fadeSteps = 50;
        const stepDuration = this.crossfadeDuration / fadeSteps;
        const volumeStep = 0.1 / fadeSteps;

        let currentStep = 0;
        
        const fadeInterval = setInterval(() => {
            currentStep++;
            
            // Fade out current track
            this.audio.volume = Math.max(0, 0.1 - (volumeStep * currentStep));
            
            // Fade in next track
            this.nextAudio.volume = Math.min(0.1, volumeStep * currentStep);

            if (currentStep >= fadeSteps) {
                clearInterval(fadeInterval);
                this.finishCrossfade();
            }
        }, stepDuration);
    }

    finishCrossfade() {
        // Stop and reset the old audio
        this.audio.pause();
        this.audio.currentTime = 0;

        // Swap audio elements
        [this.audio, this.nextAudio] = [this.nextAudio, this.audio];
        
        // Update current song index
        this.currentSong = (this.currentSong + 1) % this.songs.length;
        
        // Preload the next song
        this.preloadNext();
        
        this.isCrossfading = false;
    }

    play() {
        console.log('Attempting to play:', this.songs[this.currentSong]);
        
        try {
            if (!this.isPlaying) {
                const playPromise = this.audio.play();
                
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        this.isPlaying = true;
                        document.getElementById('toggleMusic').querySelector('i').className = 'fas fa-volume-up';
                        document.getElementById('toggleMusic').classList.remove('muted');
                        console.log('Playing successfully started');
                    }).catch(error => {
                        console.error('Error playing audio:', error);
                    });
                }
            }
        } catch (error) {
            console.error('Error in play function:', error);
        }
    }

    pause() {
        try {
            this.audio.pause();
            this.nextAudio.pause();
            this.isPlaying = false;
            document.getElementById('toggleMusic').querySelector('i').className = 'fas fa-volume-mute';
            document.getElementById('toggleMusic').classList.add('muted');
            console.log('Audio paused');
        } catch (error) {
            console.error('Error in pause function:', error);
        }
    }
}

// Search Functionality
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search-box input');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        // Add search logic here
        console.log('Searching for:', searchTerm);
    });
});
