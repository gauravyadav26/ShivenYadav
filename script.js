// Theme Switching
document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle functionality
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = themeToggle.querySelector('i');

    // Check for saved theme preference, default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Theme toggle click handler
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    // Update theme icon
    function updateThemeIcon(theme) {
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Message Board
    const messageForm = document.getElementById('guestbook-form');
    const messageBoard = document.querySelector('.message-board');

    // Storage Helpers
    const storageHelpers = {
        // Local Storage
        saveToLocalStorage: (message) => {
            try {
                const messages = JSON.parse(localStorage.getItem('messages') || '[]');
                messages.unshift(message);
                // Keep only the last 50 messages
                if (messages.length > 50) messages.length = 50;
                localStorage.setItem('messages', JSON.stringify(messages));
            } catch (error) {
                console.warn('Failed to save to localStorage:', error);
            }
        },

        getFromLocalStorage: () => {
            try {
                return JSON.parse(localStorage.getItem('messages') || '[]');
            } catch (error) {
                console.warn('Failed to load from localStorage:', error);
                return [];
            }
        },

        // IndexedDB
        initIndexedDB: () => {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open('babyMessagesDB', 1);

                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains('messages')) {
                        db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
                    }
                };
            });
        },

        saveToIndexedDB: async (message) => {
            try {
                const db = await storageHelpers.initIndexedDB();
                const transaction = db.transaction(['messages'], 'readwrite');
                const store = transaction.objectStore('messages');
                await store.add(message);
            } catch (error) {
                console.warn('Failed to save to IndexedDB:', error);
            }
        },

        getFromIndexedDB: async () => {
            try {
                const db = await storageHelpers.initIndexedDB();
                const transaction = db.transaction(['messages'], 'readonly');
                const store = transaction.objectStore('messages');
                const request = store.getAll();
                
                return new Promise((resolve, reject) => {
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                });
            } catch (error) {
                console.warn('Failed to load from IndexedDB:', error);
                return [];
            }
        }
    };

    // Display messages
    function displayMessages(messages) {
        const messagesContainer = document.createElement('div');
        messagesContainer.className = 'messages';
        
        messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.innerHTML = `
                <h3>${message.name} <span class="timestamp">${new Date(message.date).toLocaleDateString()}</span></h3>
                <p>${message.text}</p>
            `;
            messagesContainer.appendChild(messageElement);
        });

        // Clear existing messages and add new ones
        messageBoard.innerHTML = '';
        messageBoard.appendChild(messagesContainer);
    }

    // Load messages from all available sources
    async function loadMessages() {
        let messages = [];

        try {
            messages = await storageHelpers.getFromIndexedDB();
        } catch (error) {
            console.warn('Failed to load from IndexedDB:', error);
        }

        if (messages.length === 0) {
            messages = storageHelpers.getFromLocalStorage();
        }

        // Sort messages by date (newest first)
        messages.sort((a, b) => new Date(b.date) - new Date(a.date));
        displayMessages(messages);
    }

    // Handle new message submission
    messageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = messageForm.querySelector('input').value;
        const text = messageForm.querySelector('textarea').value;
        
        const newMessage = {
            name,
            text,
            date: new Date().toISOString()
        };
        
        // Save to IndexedDB
        try {
            await storageHelpers.saveToIndexedDB(newMessage);
        } catch (error) {
            console.warn('Failed to save to IndexedDB:', error);
        }

        // Save to localStorage as backup
        storageHelpers.saveToLocalStorage(newMessage);
        
        // Reload messages to show the new one
        await loadMessages();
        messageForm.reset();
    });

    // Initial load of messages
    loadMessages();
});

// Mobile Navigation
const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');

menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!menuBtn.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
    }
});

// Close menu when clicking a link
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Sample Milestones Data
const milestones = [
    {
        title: 'First Smile',
        date: '2 months',
        description: 'The day your beautiful smile lit up our world.',
        image: 'images/first-smile.jpg'
    },
    {
        title: 'First Word',
        date: '8 months',
        description: 'Your first word was "Mama" - a moment we\'ll never forget!',
        image: 'images/first-word.jpg'
    },
    {
        title: 'First Steps',
        date: '12 months',
        description: 'Watching you take your first steps was magical.',
        image: 'images/first-steps.jpg'
    },
    {
        title: 'First Birthday',
        date: '1 year',
        description: 'Celebrating your first year of bringing joy to our lives.',
        image: 'images/first-birthday.jpg'
    }
];

// Populate Milestones
const timeline = document.querySelector('.timeline');
milestones.forEach(milestone => {
    const milestoneElement = document.createElement('div');
    milestoneElement.className = 'timeline-item';
    milestoneElement.innerHTML = `
        <div class="timeline-content">
            <h3>${milestone.title}</h3>
            <p class="date">${milestone.date}</p>
            <p>${milestone.description}</p>
            <img src="${milestone.image}" alt="${milestone.title}">
        </div>
    `;
    timeline.appendChild(milestoneElement);
});

// Sample Gallery Data
const galleryItems = [
    {
        category: 'baby-days',
        image: {
            webp: {
                small: 'images/baby-days-1-300.webp',
                medium: 'images/baby-days-1-500.webp',
                large: 'images/baby-days-1-800.webp'
            },
            jpg: {
                small: 'images/baby-days-1-300.jpg',
                medium: 'images/baby-days-1-500.jpg',
                large: 'images/baby-days-1-800.jpg'
            }
        },
        title: 'Sleeping Angel'
    },
    {
        category: 'family-time',
        image: {
            webp: {
                small: 'images/family-1-300.webp',
                medium: 'images/family-1-500.webp',
                large: 'images/family-1-800.webp'
            },
            jpg: {
                small: 'images/family-1-300.jpg',
                medium: 'images/family-1-500.jpg',
                large: 'images/family-1-800.jpg'
            }
        },
        title: 'Family Picnic'
    },
    {
        category: 'outdoor-fun',
        image: {
            webp: {
                small: 'images/outdoor-1-300.webp',
                medium: 'images/outdoor-1-500.webp',
                large: 'images/outdoor-1-800.webp'
            },
            jpg: {
                small: 'images/outdoor-1-300.jpg',
                medium: 'images/outdoor-1-500.jpg',
                large: 'images/outdoor-1-800.jpg'
            }
        },
        title: 'Park Adventure'
    }
];

// Populate Gallery
const galleryGrid = document.querySelector('.gallery-grid');
galleryItems.forEach(item => {
    const galleryElement = document.createElement('div');
    galleryElement.className = 'gallery-item';
    galleryElement.setAttribute('data-category', item.category);
    galleryElement.innerHTML = `
        <picture>
            <source 
                srcset="${item.image.webp.small} 300w,
                        ${item.image.webp.medium} 500w,
                        ${item.image.webp.large} 800w"
                sizes="(max-width: 500px) 300px,
                       (max-width: 800px) 500px,
                       800px"
                type="image/webp">
            <source 
                srcset="${item.image.jpg.small} 300w,
                        ${item.image.jpg.medium} 500w,
                        ${item.image.jpg.large} 800w"
                sizes="(max-width: 500px) 300px,
                       (max-width: 800px) 500px,
                       800px"
                type="image/jpeg">
            <img src="${item.image.jpg.medium}" 
                 alt="${item.title}"
                 loading="lazy"
                 width="500"
                 height="500">
        </picture>
        <div class="gallery-item-overlay">
            <h3>${item.title}</h3>
        </div>
    `;
    galleryGrid.appendChild(galleryElement);
});

// Gallery Filtering
const categoryButtons = document.querySelectorAll('.category-btn');
categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');
        
        const category = button.getAttribute('data-category');
        const items = document.querySelectorAll('.gallery-item');
        
        items.forEach(item => {
            if (category === 'all' || item.getAttribute('data-category') === category) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

// Add some decorative elements
function addDecorativeElements() {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        const star = document.createElement('div');
        star.className = 'decorative-star';
        star.innerHTML = '⭐';
        star.style.position = 'absolute';
        star.style.fontSize = '24px';
        star.style.opacity = '0.5';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        section.appendChild(star);
    });
}

// Call the function to add decorative elements
addDecorativeElements(); 