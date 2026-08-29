// ======================
// SUPABASE CONNECTION
// ======================

const SUPABASE_URL = "https://mfcpkmhovgjfswjrbuqx.supabase.co";
console.log("SUPABASE URL:", SUPABASE_URL);
const SUPABASE_KEY = "sb_publishable_hFBWwB2dZRtFf6Wioj8W1A_GUB830Tg";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

console.log("✅ Supabase Connected Successfully");

// ======================
// GOOGLE AUTH LOGIN
// ======================
async function loginWithGoogle() {
    console.log('login button clicked');
    console.log('auth started');
    console.log('Redirecting to origin:', window.location.origin);
    try {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });

        if (error) {
            console.error('auth failure:', error.message);
        }
    } catch (err) {
        console.error('auth failure:', err);
    }
}

// --- THEME TOGGLE SYSTEM ---
const themeToggleBtn = document.getElementById('theme-toggle');
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
    });
}

 // --- 0. ADMIN SETUP ---
 const ADMIN_EMAILS = [
 "rajkamalmandrai@gmail.com"
 ];

 // Helper to check admin status by looking for a class on the body.
 // This class is the single source of truth, managed only by onAuthStateChange.
 const isAdmin = () => document.body.classList.contains('is-admin');

 // Supabase Auth State tracking. This is the central point for handling user sessions.
 supabaseClient.auth.onAuthStateChange(async (event, session) => {
 const portalBtn = document.getElementById('portal-btn');
 const logoutBtn = document.getElementById('logout-btn');

 if (event === 'INITIAL_SESSION') {
        console.log('✅ Auth session restored');
 }

 if (session) {
 // User is signed in
 if (portalBtn) portalBtn.parentElement.style.display = 'none';
 if (logoutBtn) logoutBtn.parentElement.style.display = 'list-item';

 if (event === 'SIGNED_IN') {
            console.log('✅ Login success');
            console.log('   - Email:', session.user?.email);
 }

 // Check if the logged-in user is an admin
 if (session.user && ADMIN_EMAILS.includes(session.user.email)) {
            console.log('✅ Admin restored');
 enableAdminMode();
            initChampionAdminSystem(); // Ensure admin system is initialized for champions
        } else {
            console.log('✅ Normal user restored');
 disableAdminMode();
 }
    } else {
 // User is signed out
 if (portalBtn) portalBtn.parentElement.style.display = 'list-item';
 if (logoutBtn) logoutBtn.parentElement.style.display = 'none';
 
 if (event === 'SIGNED_OUT') {
            console.log('✅ Logout success');
 }
 disableAdminMode();
    }
 });

    // --- 1. HERO PARALLAX EFFECT ---
    const hero = document.querySelector('.hero');
    if (hero) {
        const heroContent = document.querySelector('.hero-content');
        // Only apply effect on non-touch devices
        if (window.matchMedia('(pointer: fine)').matches) {
            let ticking = false;
            hero.addEventListener('mousemove', (e) => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        const { clientX, clientY } = e;
                        const { offsetWidth, offsetHeight } = hero;
                        const xPos = (clientX / offsetWidth) - 0.5;
                        const yPos = (clientY / offsetHeight) - 0.5;
                        const xOffset = -xPos * 30; // pixels
                        const yOffset = -yPos * 30; // pixels
                        
                        // The initial fade-in animation also uses transform, so we combine them.
                        heroContent.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });
        }
    }

    // --- 2. STICKY HEADER & MOBILE NAV ---
    const header = document.querySelector('.main-header');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    // --- Efficient Sticky Header using IntersectionObserver ---
    const heroSection = document.querySelector('.hero');
    const headerObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                // When the hero section is NOT intersecting (i.e., scrolled past), add the class.
                header.classList.toggle('scrolled', !entry.isIntersecting);
            });
        },
        { rootMargin: '-100px 0px 0px 0px' } // Trigger when the header is 100px past the top
    );

    if (heroSection) {
        headerObserver.observe(heroSection);
    } else { // Fallback for pages without a hero section
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    header.classList.toggle('scrolled', window.scrollY > 50);
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // Create mobile overlay
    const mobileOverlay = document.createElement('div');
    mobileOverlay.className = 'mobile-nav-overlay';
    document.body.appendChild(mobileOverlay);

    // Hamburger menu toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });

    const closeMobileMenu = () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        mobileOverlay.classList.remove('active');
        document.body.classList.remove('menu-open');
    };

    // Close menu when a link is clicked
    document.querySelectorAll('.nav-link, .dropdown-item').forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });

    // Close mobile menu when clicking outside
    mobileOverlay.addEventListener('click', closeMobileMenu);

    // --- 3. FADE-IN SECTIONS ON SCROLL ---
    const sections = document.querySelectorAll('.content-section');
    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    const navObserverSections = document.querySelectorAll('section[id]');
    const navLinksContainer = document.querySelector('.nav-links');
    
    // Create smooth sliding indicator
    let navIndicator = document.createElement('div');
    navIndicator.className = 'nav-indicator';
    if (navLinksContainer) {
        navLinksContainer.appendChild(navIndicator);
    }

    const updateNavIndicator = () => {
        if (window.innerWidth <= 992 || !navIndicator) {
            if (navIndicator) navIndicator.style.opacity = '0';
            return;
        }
        const activeLink = document.querySelector('.nav-link.active');
        if (activeLink && navLinksContainer) {
            const containerRect = navLinksContainer.getBoundingClientRect();
            const linkRect = activeLink.getBoundingClientRect();
            
            navIndicator.style.width = `${linkRect.width}px`;
            navIndicator.style.transform = `translateX(${linkRect.left - containerRect.left}px)`;
            navIndicator.style.opacity = '1';
        }
    };

    // --- 4. ACTIVE NAV LINK HIGHLIGHTING ON SCROLL ---
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.querySelectorAll('.nav-link').forEach(link => {
                    const href = link.getAttribute('href');
                    if (href && href.includes('#')) {
                        const targetId = href.split('#')[1];
                        link.classList.toggle('active', targetId === entry.target.id);
                    }
                });
                requestAnimationFrame(updateNavIndicator);
            }
        });
    }, { rootMargin: "-50% 0px -50% 0px" });

    navObserverSections.forEach(section => {
        navObserver.observe(section);
    });

    window.addEventListener('resize', updateNavIndicator);
    window.addEventListener('load', updateNavIndicator);
    setTimeout(updateNavIndicator, 100);

    // --- 4.5 EXPANDABLE COURSE DETAILS ---
    window.animateExpandCounterGlobal = (counter) => {
        try {
            if (counter.dataset.animating === 'true') return;
            counter.dataset.animating = 'true';
            
            const targetAttr = counter.dataset.target || counter.getAttribute('data-target');
            if (!targetAttr) return;
            
            const target = parseFloat(targetAttr);
            const decimalsAttr = counter.dataset.decimals || counter.getAttribute('data-decimals') || "0";
            const decimals = parseInt(decimalsAttr, 10);
            const suffix = counter.dataset.suffix || counter.getAttribute('data-suffix') || "";
            
            console.log(`[Course Counter] counter initialized. Target: ${target}`);
            console.log('[Course Counter] animation started');
            
            const duration = 2000;
            let startTime = null;
            
            const updateCount = (currentTime) => {
                if (!startTime) startTime = currentTime;
                const elapsedTime = currentTime - startTime;
                const progress = Math.min(elapsedTime / duration, 1);
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                
                const currentVal = easeOutQuart * target;
                counter.innerText = currentVal.toFixed(decimals) + suffix;
                
                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                } else {
                    counter.innerText = target.toFixed(decimals) + suffix;
                    console.log('[Course Counter] animation completed');
                }
            };
            requestAnimationFrame(updateCount);
        } catch (err) {
            console.error('[Course Counter] exact errors:', err);
        }
    };

    const setupExpandableCourses = () => {
        try {
            const courseCards = document.querySelectorAll('.course-card');

            courseCards.forEach(card => {
                const counters = card.querySelectorAll('.expand-counter');
                
                counters.forEach(counter => {
                    const decimalsAttr = counter.dataset.decimals || counter.getAttribute('data-decimals') || "0";
                    const decimals = parseInt(decimalsAttr, 10);
                    const suffix = counter.dataset.suffix || counter.getAttribute('data-suffix') || "";
                    counter.innerText = (0).toFixed(decimals) + suffix;
                });

                // --- Logic for Desktop (hover interaction) ---
                if (window.innerWidth > 768 && window.matchMedia('(hover: hover)').matches) {
                    const expandCard = () => {
                        if (!card.classList.contains('expanded')) {
                            card.classList.add('expanded');
                            console.log('[Course] course expanded');
                            const dynamicCounters = card.querySelectorAll('.expand-counter:not(.animated)');
                            dynamicCounters.forEach(counter => {
                                if (window.animateExpandCounterGlobal) {
                                    window.animateExpandCounterGlobal(counter);
                                    counter.classList.add('animated');
                                }
                            });
                        }
                    };

                    const collapseCard = () => {
                        if (card.classList.contains('expanded')) {
                            card.classList.remove('expanded');
                            console.log('[Course] course collapsed');
                        }
                    };

                    card.addEventListener('mouseenter', expandCard);
                    card.addEventListener('mouseleave', collapseCard);
                } 
                // --- Logic for Mobile (always visible, animate counters on scroll) ---
                else {
                    const mobileCounters = card.querySelectorAll('.expand-counter');
                    const counterObserver = new IntersectionObserver((entries, observer) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                if (window.animateExpandCounterGlobal && !entry.target.classList.contains('animated')) {
                                    window.animateExpandCounterGlobal(entry.target);
                                    entry.target.classList.add('animated');
                                }
                                observer.unobserve(entry.target);
                            }
                        });
                    }, { threshold: 0.5 });

                    mobileCounters.forEach(counter => {
                        counterObserver.observe(counter);
                    });
                }
            });
        } catch (error) {
            console.error('[Course Expansion] exact errors:', error);
        }
    };

    // --- CHAMPIONS ADMIN ---
    let allChampionBanners = [];

    // --- 5. CHAMPIONS BANNER SLIDER ---
    const initChampionsSlider = () => {
        const sliderWrapper = document.querySelector('.champions-slider-wrapper');
        if (!sliderWrapper) return;
    
        const track = document.getElementById('champions-slider-track');
        const dotsContainer = document.getElementById('champions-slider-dots');
        const nextBtn = document.getElementById('champions-next-btn');
        const prevBtn = document.getElementById('champions-prev-btn');
        
        let slides = [];
        let dots = [];
        let currentIndex = 0;
        let slideInterval;
        let touchStartX = 0;
        let touchEndX = 0;
    
        const showSkeleton = () => {
            track.innerHTML = `
                <div class="champion-slide skeleton" style="aspect-ratio: 16 / 7;"></div>
            `;
        };
    
        const goToSlide = (index) => {
            if (!slides.length) return;
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;
    
            track.style.transform = `translateX(-${index * 100}%)`;
            dots.forEach(dot => dot.classList.remove('active'));
            if (dots[index]) dots[index].classList.add('active');
            currentIndex = index;
        };
    
        const nextSlide = () => goToSlide(currentIndex + 1);
        const prevSlide = () => goToSlide(currentIndex - 1);
    
        const startAutoPlay = () => {
            stopAutoPlay();
            slideInterval = setInterval(nextSlide, 5000); // 5 seconds
        };
    
        const stopAutoPlay = () => {
            clearInterval(slideInterval);
        };
    
        const handleTouchStart = (e) => {
            touchStartX = e.changedTouches[0].screenX;
        };
    
        const handleTouchEnd = (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipeGesture();
        };
    
        const handleSwipeGesture = () => {
            if (touchEndX < touchStartX - 50) nextSlide(); // Swiped left
            if (touchEndX > touchStartX + 50) prevSlide(); // Swiped right
            // Reset for next interval
            startAutoPlay();
        };
    
        async function loadChampions() {
            console.log('[Champions] Loading banners...');
            showSkeleton();
            try {
                const { data, error } = await supabaseClient
                    .from('champion_banners')
                    .select('*')
                    .eq('is_active', true)
                    .order('display_order', { ascending: true });
    
                if (error) throw error;
    
                if (!data || data.length === 0) {
                    // Clear data for admin system to know it's empty
                    allChampionBanners = [];

                    console.log('[Champions] No active banners found. Displaying placeholder.');
                    if (track) {
                        track.innerHTML = `
                            <div class="champion-slide" style="background-color: var(--bg-secondary); display: flex; align-items: center; justify-content: center; color: var(--text-secondary); aspect-ratio: 16 / 7;">
                                <p>Our champions will be showcased here soon!</p>
                            </div>
                        `;
                    }
                    // Hide slider controls for the static placeholder
                    if(nextBtn) nextBtn.style.display = 'none';
                    if(prevBtn) prevBtn.style.display = 'none';
                    if(dotsContainer) dotsContainer.style.display = 'none';
                    return;
                }
    
                // Store data for admin system to access for edits
                allChampionBanners = data;

                console.log(`[Champions] ✅ ${data.length} banners loaded.`);
                track.innerHTML = '';
                dotsContainer.innerHTML = '';
    
                // Ensure slider controls are visible by resetting inline styles
                if(nextBtn) nextBtn.style.display = '';
                if(prevBtn) prevBtn.style.display = '';
                if(dotsContainer) dotsContainer.style.display = '';

                // Expose the loader function for external refresh
                sliderWrapper.loadChampions = loadChampions;

                data.forEach((banner, index) => {
                    const adminControls = isAdmin() ? `
                        <div class="champion-slide-admin-actions">
                            <button class="btn-admin-action edit" data-id="${banner.id}" aria-label="Edit Banner">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button class="btn-admin-action delete" data-id="${banner.id}" aria-label="Delete Banner">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 18 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    ` : '';

                    // Create Slide
                    const slide = document.createElement('div');
                    slide.className = 'champion-slide';
                    const isFirst = index === 0;
                    slide.innerHTML = `
                        ${adminControls}
                        <img src="${banner.image_url}" alt="${banner.title ? banner.title + ' - YSR Academy Thane Achievement' : 'YSR Academy Thane Champion Student Achievement'}" ${isFirst ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
                        <h3 class="champion-title">${banner.title}</h3>
                    `;
                    track.appendChild(slide);
    
                    // Create Dot
                    const dot = document.createElement('button');
                    dot.className = 'dot';
                    dot.setAttribute('aria-label', `Go to banner ${index + 1}`);
                    dot.addEventListener('click', () => {
                        goToSlide(index);
                        startAutoPlay(); // Reset timer on manual navigation
                    });
                    dotsContainer.appendChild(dot);
                });
    
                slides = Array.from(track.children);
                dots = Array.from(dotsContainer.children);
    
                // Initial state
                goToSlide(0);
                startAutoPlay();
    
            } catch (err) {
                console.error('[Champions] ❌ Error loading banners:', err);
                sliderWrapper.innerHTML = '<p style="text-align:center; color: var(--accent-danger);">Could not load champion banners.</p>';
            }
        }

        // Setup event listeners once to avoid duplication on reload.
        nextBtn.addEventListener('click', () => { nextSlide(); startAutoPlay(); });
        prevBtn.addEventListener('click', () => { prevSlide(); startAutoPlay(); });
        sliderWrapper.addEventListener('mouseenter', stopAutoPlay);
        sliderWrapper.addEventListener('mouseleave', startAutoPlay);
        track.addEventListener('touchstart', handleTouchStart, { passive: true });
        track.addEventListener('touchend', handleTouchEnd, { passive: true });

        loadChampions();
    };

    const initChampionAdminSystem = () => {
        const addBtn = document.getElementById('btn-add-champion');
        if (!addBtn) return;
    
        const modalOverlay = document.getElementById('champion-modal-overlay');
        const closeModalBtn = document.getElementById('close-champion-modal');
        const form = document.getElementById('champion-edit-form');
        const modalTitle = document.getElementById('champion-modal-title');
        const idInput = document.getElementById('edit-champion-id');
        const photoInput = document.getElementById('edit-champion-photo');
        const titleInput = document.getElementById('edit-champion-title');
        const orderInput = document.getElementById('edit-champion-order');
        const activeInput = document.getElementById('edit-champion-active');
        const statusEl = document.getElementById('champion-upload-status');
        const sliderTrack = document.getElementById('champions-slider-track');
    
        const openModal = () => modalOverlay.classList.add('visible');
        const closeModal = () => modalOverlay.classList.remove('visible');
    
        const resetForm = () => {
            form.reset();
            idInput.value = '';
            photoInput.required = true;
            modalTitle.textContent = 'Add New Banner';
            statusEl.textContent = '';
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Save Banner';
            }
        };
    
        closeModalBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    
        addBtn.addEventListener('click', () => {
            if (!isAdmin()) return;
            resetForm();
            openModal();
        });
    
        sliderTrack.addEventListener('click', (e) => {
            if (!isAdmin()) return;
            const editBtn = e.target.closest('.btn-admin-action.edit');
            const deleteBtn = e.target.closest('.btn-admin-action.delete');
    
            if (editBtn) {
                e.stopPropagation();
                const id = editBtn.dataset.id;
                const banner = allChampionBanners.find(b => b.id === id);
                if (banner) {
                    resetForm();
                    modalTitle.textContent = 'Edit Banner';
                    idInput.value = banner.id;
                    titleInput.value = banner.title || '';
                    orderInput.value = banner.display_order;
                    activeInput.checked = banner.is_active;
                    photoInput.required = false;
                    openModal();
                }
            }
    
            if (deleteBtn) {
                e.stopPropagation();
                const id = deleteBtn.dataset.id;
                if (confirm('Are you sure you want to delete this banner? This cannot be undone.')) {
                    deleteChampionBanner(id, deleteBtn);
                }
            }
        });
    
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = idInput.value;
            const file = photoInput.files[0];
    
            if (!id && !file) {
                alert('An image is required when creating a new banner.');
                return;
            }
    
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            statusEl.textContent = 'Processing...';
            statusEl.style.color = 'var(--text-secondary)';
    
            try {
                let imageUrl = null;
                let imagePath = null;
    
                if (file) {
                    statusEl.textContent = 'Compressing image...';
                    const compressedFile = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920 });
                    statusEl.textContent = 'Uploading image...';
                    const fileName = `champions/${Date.now()}_${compressedFile.name.replace(/[^a-zA-Z0-9.\\-_]/g, '_')}`;
                    
                    const { error: uploadError } = await supabaseClient.storage.from('champion-banners').upload(fileName, compressedFile);
                    if (uploadError) throw uploadError;
    
                    const { data: urlData } = supabaseClient.storage.from('champion-banners').getPublicUrl(fileName);
                    imageUrl = urlData.publicUrl;
                    imagePath = fileName;
                }
    
                const payload = {
                    title: titleInput.value,
                    display_order: parseInt(orderInput.value),
                    is_active: activeInput.checked,
                };
                if (imageUrl) payload.image_url = imageUrl;
                if (imagePath) payload.image_path = imagePath;
    
                if (id) { // Update
                    if (imageUrl) {
                        const { data: oldBanner } = await supabaseClient.from('champion_banners').select('image_path').eq('id', id).single();
                        if (oldBanner && oldBanner.image_path) {
                            await supabaseClient.storage.from('champion-banners').remove([oldBanner.image_path]);
                        }
                    }
                    const { error } = await supabaseClient.from('champion_banners').update(payload).eq('id', id);
                    if (error) throw error;
                } else { // Create
                    const { error } = await supabaseClient.from('champion_banners').insert([payload]);
                    if (error) throw error;
                }
                
                statusEl.textContent = 'Success! Refreshing...';
                statusEl.style.color = 'var(--accent-success)';
                setTimeout(() => {
                    closeModal();
                    document.querySelector('.champions-slider-wrapper')?.loadChampions();
                }, 1000);
    
            } catch (error) {
                console.error('[Champions Admin] Error saving banner:', error);
                statusEl.textContent = 'Error: ' + error.message;
                statusEl.style.color = 'var(--accent-danger)';
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    
        async function deleteChampionBanner(id, btnElement) {
            btnElement.disabled = true;
            try {
                const { data: banner } = await supabaseClient.from('champion_banners').select('image_path').eq('id', id).single();
                if (banner && banner.image_path) {
                    await supabaseClient.storage.from('champion-banners').remove([banner.image_path]);
                }
                const { error } = await supabaseClient.from('champion_banners').delete().eq('id', id);
                if (error) throw error;
                document.querySelector('.champions-slider-wrapper')?.loadChampions();
            } catch (error) {
                alert('Error deleting banner: ' + error.message);
                btnElement.disabled = false;
            }
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        // Ensure counters initialize AFTER page rendering completes
        try {
            setupExpandableCourses();
            initChampionsSlider();
            initChampionAdminSystem();
        initTestimonialInteraction();
        } catch (error) {
            console.error('[DOM Ready] Error during initialization:', error);
        }
    });

    // --- 6. DYNAMIC GALLERY LOADING ---
    const galleryGrid = document.querySelector('.gallery-grid');
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('galleryImage');
    const uploadStatus = document.getElementById('upload-status');

    async function loadGalleryAndAdminControls() {
        if (!galleryGrid) return;

        const limit = galleryGrid.dataset.limit ? parseInt(galleryGrid.dataset.limit) : null;

        console.log('[Gallery] loading state active');
        galleryGrid.innerHTML = Array.from({length: limit || 6}).map(() => `
            <div class="gallery-item skeleton"></div>
        `).join('');
        
        const loggedIn = isAdmin();
        
        try {
            console.log('[Gallery] gallery fetch started');
            let query = supabaseClient.from('gallery').select('*').order('created_at', { ascending: false });
            
            if (limit) {
                query = query.limit(limit);
            }

            const { data: images, error } = await query;

            if (error) {
                console.error('[Gallery] exact errors:', error);
                throw error;
            }
            
            console.log('[Gallery] gallery fetch success');
            console.log('[Gallery] render started');

            galleryGrid.innerHTML = ''; 

            if (!images || images.length === 0) {
                galleryGrid.innerHTML = '<p class="gallery-loading smooth-render show">No images in the gallery yet. Check back soon!</p>';
                console.log('[Gallery] render completed');
                return;
            }

            const fragment = document.createDocumentFragment();
            images.forEach((image, index) => {
                let altText = "YSR Academy Campus Gallery Image - Thane Coaching Institute";
                const path = image.image_path || image.image_url;
                if (path) {
                    const parts = path.split('/');
                    const filename = parts[parts.length - 1];
                    const cleanFilename = filename.replace(/^\d+_/, '');
                    const nameWithoutExt = cleanFilename.substring(0, cleanFilename.lastIndexOf('.')) || cleanFilename;
                    const readableName = nameWithoutExt.replace(/[-_]/g, ' ').trim();
                    if (readableName && !readableName.match(/^\d+$/)) {
                        const capitalized = readableName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                        altText = `${capitalized} - YSR Academy Thane`;
                    }
                }

                const item = document.createElement('div');
                item.className = 'gallery-item smooth-render';
                item.style.transitionDelay = `${index * 50}ms`;
                item.innerHTML = ` 
                    <img src="${image.image_url}" alt="${altText}" loading="lazy" decoding="async">
                    ${loggedIn ? `
                    <div class="item-overlay">
                        <button class="btn-delete" data-id="${image.id}" aria-label="Delete Image">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                    </div>
                    ` : ''}
                `;
                fragment.appendChild(item);
            });
            galleryGrid.appendChild(fragment);
            
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    galleryGrid.querySelectorAll('.smooth-render').forEach(el => el.classList.add('show'));
                });
            });
            
            console.log('[Gallery] render completed');
        } catch (error) {
            console.error('[Gallery] exact errors:', error);
            galleryGrid.innerHTML = '<p class="gallery-loading" style="color: var(--accent-danger);">Could not load gallery images.</p>';
        }
    }

    async function handleUpload(e) {
        e.preventDefault();
        if (!fileInput || !uploadStatus) return;

        if (!isAdmin()) return alert('You must be an admin to upload images.');

        const file = fileInput.files[0];
        if (!file) {
            uploadStatus.textContent = 'Please select a file to upload.';
            uploadStatus.style.color = 'var(--accent-highlight)';
            return;
        }
        
        if (!file.type.startsWith('image/')) {
            uploadStatus.textContent = 'Invalid file type. Please select an image.';
            uploadStatus.style.color = 'var(--accent-danger)';
            return;
        }

        const submitBtn = uploadForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Uploading... <span class="spinner"></span>';

        console.log('[Upload] upload started for:', file.name);

        try {
            // 1. Compress Image
            uploadStatus.textContent = 'Compressing image...';
            uploadStatus.style.color = 'var(--accent-secondary)';
            console.log(`[Upload] Original image size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
            
            const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
            const compressedFile = await imageCompression(file, options);
            
            console.log(`[Upload] Compressed image size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
            console.log('[Upload] Compression success');

            uploadStatus.textContent = 'Uploading to cloud...';
            uploadStatus.style.color = 'var(--accent-primary)';

            const safeName = (compressedFile.name || 'image.jpg').replace(/[^a-zA-Z0-9.\-_]/g, '_');
            const fileName = `gallery/${Date.now()}_${safeName}`;
            
            console.log('[Upload] upload target path:', fileName);

            // 1. Upload to Storage
            const { data: uploadData, error: uploadError } = await supabaseClient.storage
                .from('images')
                .upload(fileName, compressedFile, {
                    contentType: compressedFile.type,
                    upsert: false
                });

            if (uploadError) throw uploadError;
            console.log('[Upload] Storage upload successful:', uploadData);

            // 2. Get Public URL
            const { data: urlData } = supabaseClient.storage
                .from('images')
                .getPublicUrl(fileName);
                
            console.log('[Upload] Generated public URL:', urlData.publicUrl);

            // 3. Insert into Database
            const insertPayload = { image_url: urlData.publicUrl, image_path: fileName };
            console.log('[Upload] Database insert payload:', insertPayload);
            
            const { error: insertError } = await supabaseClient
                .from('gallery')
                .insert([insertPayload]);

            if (insertError) throw insertError;
            console.log('[Upload] Database insert successful.');
            console.log('[Upload] upload completed');

            uploadStatus.textContent = 'Upload successful!';
            uploadStatus.style.color = 'var(--accent-highlight)';
            uploadForm.reset();
            loadGalleryAndAdminControls(); 

            setTimeout(() => { uploadStatus.textContent = ''; }, 5000);

        } catch (error) {
            console.error("[Upload] Error during upload:", error);
            uploadStatus.textContent = 'Upload failed. See console for details.';
            uploadStatus.style.color = 'var(--accent-danger)';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    }

    async function deleteGalleryImage(imageId, btnElement) {
        if (!isAdmin()) return alert('You must be an admin to delete images.');
        
        if (!confirm('Are you sure you want to delete this image? This cannot be undone.')) {
            return;
        }

        let originalContent = '';
        if (btnElement) {
            originalContent = btnElement.innerHTML;
            btnElement.disabled = true;
            btnElement.innerHTML = '<span class="spinner" style="margin:0;"></span>';
        }

        try {
            console.log('[Gallery] delete started');
            
            // 1. Read image_path from database row
            const { data: dbImage, error: fetchError } = await supabaseClient
                .from('gallery')
                .select('image_path')
                .eq('id', imageId)
                .single();
                
            if (fetchError) throw fetchError;
            
            const imagePath = dbImage.image_path;
            console.log('[Gallery] stored image_path:', imagePath);
            console.log('[Gallery] delete target path:', imagePath);

            // 2. Delete from Storage
            const { error: storageError } = await supabaseClient.storage
                .from('images')
                .remove([imagePath]);
            
            if (storageError) throw storageError;
            console.log('[Gallery] storage delete success');

            // 3. Delete from Database
            const { error: dbError } = await supabaseClient
                .from('gallery')
                .delete()
                .eq('id', imageId);

            if (dbError) throw dbError;
            console.log('[Gallery] database delete success');

            await loadGalleryAndAdminControls();
            console.log('[Gallery] refresh success');
        } catch (error) {
            console.error('[Gallery] exact delete errors:', error);
            alert('Could not delete image. Check console.');
        } finally {
            if (btnElement && document.body.contains(btnElement)) {
                btnElement.disabled = false;
                btnElement.innerHTML = originalContent;
            }
        }
    }

    // Initial load for gallery
    loadGalleryAndAdminControls();

    // --- LIGHTBOX LOGIC ---
    let lightboxOverlay = document.getElementById('lightbox-overlay');
    let lightboxImage = document.getElementById('lightbox-image');
    let closeLightboxBtn = document.getElementById('close-lightbox');

    if (!lightboxOverlay) {
        lightboxOverlay = document.createElement('div');
        lightboxOverlay.className = 'lightbox-overlay';
        lightboxOverlay.id = 'lightbox-overlay';
        
        closeLightboxBtn = document.createElement('button');
        closeLightboxBtn.className = 'close-lightbox';
        closeLightboxBtn.id = 'close-lightbox';
        closeLightboxBtn.innerHTML = '&times;';

        lightboxImage = document.createElement('img');
        lightboxImage.id = 'lightbox-image';
        lightboxImage.alt = 'Fullscreen Preview';

        lightboxOverlay.appendChild(closeLightboxBtn);
        lightboxOverlay.appendChild(lightboxImage);
        document.body.appendChild(lightboxOverlay);
    }

    const closeLightbox = () => {
        if (lightboxOverlay) lightboxOverlay.classList.remove('visible');
        if (lightboxImage) lightboxImage.src = '';
    };

    if (closeLightboxBtn) closeLightboxBtn.addEventListener('click', closeLightbox);
    if (lightboxOverlay) lightboxOverlay.addEventListener('click', (e) => {
        if (e.target === lightboxOverlay) closeLightbox();
    });

    // Attach admin event listeners
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleUpload);
    }
    if (galleryGrid) {
        galleryGrid.addEventListener('click', (e) => {
            const deleteButton = e.target.closest('.btn-delete');
            if (deleteButton) {
                e.stopPropagation(); // Prevents the event from bubbling up and causing side-effects
                const imageId = deleteButton.dataset.id;
                deleteGalleryImage(imageId, deleteButton);
                return;
            }
            
            const galleryItem = e.target.closest('.gallery-item');
            if (galleryItem) {
                const img = galleryItem.querySelector('img');
                if (img && lightboxOverlay && lightboxImage) {
                    lightboxImage.src = img.src;
                    lightboxOverlay.classList.add('visible');
                    console.log('[Gallery] fullscreen preview opened');
                }
            }
        });
    }

    // --- 10. LIGHTWEIGHT REUSABLE TEXT-ONLY TOPPER SYSTEM ---
    let allToppers = [];
    let currentTopperEditId = null;
    let currentCourseForTopper = null;
    
    const topperModalOverlay = document.getElementById('topper-modal-overlay');
    const closeTopperModalBtn = document.getElementById('close-topper-modal');
    const topperEditForm = document.getElementById('topper-edit-form');
    const topperModalTitle = document.getElementById('topper-modal-title');
    const editTopperName = document.getElementById('edit-topper-name');
    const editTopperScore = document.getElementById('edit-topper-score');
    const editTopperDesc = document.getElementById('edit-topper-desc');

    async function loadAllToppers() {
        console.log('[Toppers] topper fetch started');

        // Ensure public skeletons show before fetch
        const courseCards = document.querySelectorAll('.course-card');
        courseCards.forEach(card => {
            const container = card.querySelector('.toppers-container');
            if (container) {
                container.innerHTML = '<div class="student-achievement skeleton" style="height: 60px;"></div>';
            }
        });

        try {
            const { data, error } = await supabaseClient
                .from('course_toppers')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;
            allToppers = data || [];
            
            courseCards.forEach(card => {
                const courseName = card.dataset.course;
                if (!courseName) return;
                
                const container = card.querySelector('.toppers-container');
                if (!container) return;
                
                const courseToppers = allToppers.filter(t => t.course_name === courseName);
                container.innerHTML = '';

                if (courseToppers.length === 0) {
                    container.innerHTML = `<p style="color: var(--text-secondary); font-size: 0.85rem; text-align: center;">No toppers added yet.</p>`;
                } else {
                    courseToppers.forEach(topper => {
                        let suffix = '%';
                        if (courseName === 'Medical NEET') {
                            suffix = '/720';
                        }
                        
                        let scoreStr = topper.score.toString();
                        let decimals = scoreStr.includes('.') ? scoreStr.split('.')[1].length : 0;

                        const item = document.createElement('div');
                        item.className = 'student-achievement';
                        item.innerHTML = `
                            <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2300D9FF'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>" alt="${topper.student_name} - Successful Student at YSR Academy Thane" class="student-photo" loading="lazy" decoding="async" width="40" height="40">
                            <div class="student-info">
                                <h4>${topper.student_name}</h4>
                                <p>${topper.description || 'Top Achiever'}</p>
                            </div>
                            <div class="student-score-container">
                                <span class="expand-counter" data-target="${topper.score}" data-decimals="${decimals}" data-suffix="${suffix}">0${suffix}</span>
                            </div>
                            ${isAdmin() ? `
                                <div class="topper-admin-actions">
                                    <button class="btn-edit-topper" data-id="${topper.id}">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                    </button>
                                    <button class="btn-delete-topper" data-id="${topper.id}">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                    </button>
                                </div>
                            ` : ''}
                        `;
                        container.appendChild(item);
                    });
                }
                
                if (card.classList.contains('expanded')) {
                    const counters = card.querySelectorAll('.expand-counter:not(.animated)');
                    counters.forEach(c => {
                        if(window.animateExpandCounterGlobal) window.animateExpandCounterGlobal(c); 
                        c.classList.add('animated');
                    });
                } else if (window.innerWidth <= 768) {
                    const mobileCounters = card.querySelectorAll('.expand-counter:not(.animated)');
                    const counterObserver = new IntersectionObserver((entries, observer) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                if (window.animateExpandCounterGlobal) {
                                    window.animateExpandCounterGlobal(entry.target);
                                    entry.target.classList.add('animated');
                                }
                                observer.unobserve(entry.target);
                            }
                        });
                    }, { threshold: 0.1 });
                    
                    mobileCounters.forEach(c => counterObserver.observe(c));
                }
            });

            console.log('[Toppers] topper render completed');
        } catch (err) {
            console.error('[Toppers] exact errors:', err);
        }
    }

    loadAllToppers();

    document.addEventListener('click', (e) => {
        const addTopperBtn = e.target.closest('.btn-add-topper');
        const editTopperBtn = e.target.closest('.btn-edit-topper');
        const deleteTopperBtn = e.target.closest('.btn-delete-topper');

        if (!isAdmin()) return;

        if (addTopperBtn) {
            e.preventDefault();
            const card = addTopperBtn.closest('.course-card');
            currentCourseForTopper = card.dataset.course;
            currentTopperEditId = null;
            if (topperModalTitle) topperModalTitle.textContent = `Add ${currentCourseForTopper} Topper`;
            if (topperEditForm) topperEditForm.reset();
            if (topperModalOverlay) topperModalOverlay.classList.add('visible');
        }

        if (editTopperBtn) {
            e.preventDefault();
            currentTopperEditId = editTopperBtn.dataset.id;
            const topper = allToppers.find(t => t.id == currentTopperEditId);
            if (topper) {
                currentCourseForTopper = topper.course_name;
                if (topperModalTitle) topperModalTitle.textContent = `Edit ${currentCourseForTopper} Topper`;
                if (editTopperName) editTopperName.value = topper.student_name;
                if (editTopperScore) editTopperScore.value = topper.score;
                if (editTopperDesc) editTopperDesc.value = topper.description || '';
                if (topperModalOverlay) topperModalOverlay.classList.add('visible');
            }
        }

        if (deleteTopperBtn) {
            e.preventDefault();
            const id = deleteTopperBtn.dataset.id;
            if (confirm('Delete this topper? This cannot be undone.')) {
                deleteTopper(id, deleteTopperBtn);
            }
        }
    });

    const closeTopperMod = () => { if(topperModalOverlay) topperModalOverlay.classList.remove('visible'); };
    if (closeTopperModalBtn) closeTopperModalBtn.addEventListener('click', closeTopperMod);
    if (topperModalOverlay) topperModalOverlay.addEventListener('click', (e) => {
        if (e.target === topperModalOverlay) closeTopperMod();
    });

    if (topperEditForm) {
        topperEditForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = topperEditForm.querySelector('button[type="submit"]');
            const origText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Saving... <span class="spinner"></span>';
            console.log('[Toppers] topper save started');

            try {
                // Enforce and log authenticated session check
                const { data: { session } } = await supabaseClient.auth.getSession();
                console.log('[Toppers] Auth Debug before save:', {
                    sessionExists: !!session,
                    userEmail: session?.user?.email,
                    role: session?.user?.role,
                    hasAccessToken: !!session?.access_token
                });
                if (!session) throw new Error("No active authenticated session found. Please log in.");

                const payload = {
                    student_name: editTopperName.value.trim(),
                    score: parseFloat(editTopperScore.value),
                    description: editTopperDesc.value.trim(),
                    course_name: currentCourseForTopper
                };

                if (currentTopperEditId) {
                    const { error } = await supabaseClient.from('course_toppers').update(payload).eq('id', currentTopperEditId);
                    if (error) throw error;
                } else {
                    const { error } = await supabaseClient.from('course_toppers').insert([payload]);
                    if (error) throw error;
                }
                console.log('[Toppers] database save success');

                closeTopperMod();
                await loadAllToppers();
            } catch (err) {
                console.error('[Toppers] exact errors:', err);
                alert('Failed to save topper: ' + (err.message || 'Check console.'));
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = origText;
            }
        });
    }

    async function deleteTopper(id, btn) {
        const origHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner" style="margin:0; width:12px; height:12px; border-width:2px;"></span>';
        try {
            // Enforce and log authenticated session check
            const { data: { session } } = await supabaseClient.auth.getSession();
            console.log('[Toppers] Auth Debug before delete:', {
                sessionExists: !!session,
                userEmail: session?.user?.email,
                role: session?.user?.role,
                hasAccessToken: !!session?.access_token
            });
            if (!session) throw new Error("No active authenticated session found. Please log in.");

            const { error } = await supabaseClient.from('course_toppers').delete().eq('id', id);
            if (error) throw error;
            await loadAllToppers();
        } catch(err) {
            console.error('[Toppers] exact errors:', err);
            alert('Failed to delete topper: ' + (err.message || 'Check console.'));
            btn.disabled = false;
            btn.innerHTML = origHtml;
        }
    }

    // --- 7. PORTAL LOGIN MODAL ---
    const portalBtn = document.getElementById('portal-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const modalOverlay = document.getElementById('login-modal-overlay');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const loginError = document.getElementById('login-error');

    const closeModal = () => {
        if (modalOverlay) modalOverlay.classList.remove('visible');
        if(loginError) loginError.textContent = '';
    };

    function enableAdminMode() {
        document.body.classList.add('is-admin');
        closeModal();
        loadGalleryAndAdminControls(); // Reload gallery with admin controls
        loadAdaptiveFacultyData(); // Dynamically update admin controls for faculty
        loadAllToppers(); // Refresh toppers to attach admin controls
    }

    function disableAdminMode() {
        document.body.classList.remove('is-admin');
        closeModal();
        loadGalleryAndAdminControls(); // Reload gallery without admin controls
        loadAdaptiveFacultyData(); // Dynamically remove admin controls for faculty
        loadAllToppers(); // Refresh toppers to ensure public view is clean
    }

    if (portalBtn && modalOverlay) {
        portalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modalOverlay.classList.add('visible');
        });

        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const { error } = await supabaseClient.auth.signOut();
            if (error) {
                console.error('Logout error:', error);
            }
            // The onAuthStateChange handler will take care of the rest.
        });

        closeModalBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });

    const googleLoginBtns = document.querySelectorAll('.btn-google-login');
    googleLoginBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            loginWithGoogle();
        });
    });
    }

 // --- 8. ADAPTIVE FACULTY IDENTITY EDITING (ADMIN) ---
 let allFacultyData = [];
 let currentFacultyEditId = null; // Use DB ID for editing

 const facultyGrid = document.querySelector('.faculty-grid');
 const founderCardContainer = document.querySelector('.founder-card');
 const facultyModalOverlay = document.getElementById('faculty-modal-overlay');
 const closeFacultyModalBtn = document.getElementById('close-faculty-modal');
 const facultyEditForm = document.getElementById('faculty-edit-form');
 const facultyModalTitle = facultyModalOverlay.querySelector('.modal-title');
 const editFacultyName = document.getElementById('edit-faculty-name');
 const editFacultySubject = document.getElementById('edit-faculty-subject');
 const editFacultyTitle = document.getElementById('edit-faculty-title');
 const editFacultyPhoto = document.getElementById('edit-faculty-photo');

 async function loadAdaptiveFacultyData() {
     console.log('[Faculty] fetch started...');
     console.log('[Faculty] loading state active');
     
     if (founderCardContainer) {
         founderCardContainer.style.display = 'flex';
         founderCardContainer.innerHTML = `
             <div class="skeleton skeleton-avatar" style="width:100px; height:100px; margin:0; flex-shrink:0;"></div>
             <div class="founder-info" style="flex:1;">
                 <div class="skeleton skeleton-title"></div>
                 <div class="skeleton skeleton-text"></div>
             </div>
         `;
     }
     if (facultyGrid) {
         facultyGrid.innerHTML = Array.from({length: 4}).map(() => `
             <div class="faculty-card skeleton" style="border:none;">
                 <div class="skeleton skeleton-avatar" style="background: rgba(255,255,255,0.05);"></div>
                 <div class="skeleton skeleton-title" style="margin: 0 auto 0.5rem; background: rgba(255,255,255,0.05);"></div>
                 <div class="skeleton skeleton-text" style="margin: 0 auto; background: rgba(255,255,255,0.05);"></div>
             </div>
         `).join('');
     }

     try {
         const { data, error } = await supabaseClient
             .from('faculty')
             .select('*')
             .order('created_at', { ascending: true });

         if (error) throw error;
         allFacultyData = data;
         console.log(`[Faculty] ✅ faculty fetch success: ${data.length} members loaded.`);

         console.log('[Faculty] render started...');

         // Clear old DOM dynamically to prevent glitches/duplicates
         if (facultyGrid) facultyGrid.innerHTML = '';
         if (founderCardContainer) {
             founderCardContainer.innerHTML = '';
             // Only display container if data exists
             founderCardContainer.style.display = data.length > 0 ? 'flex' : 'none';
         }

         const team = [];

         if (data.length > 0) {
             // Treat 1st entry as Founder securely avoiding schema changes
             const founder = data[0];
             if (founderCardContainer) {
                 founderCardContainer.classList.add('smooth-render');
                 founderCardContainer.innerHTML = `
                     <div class="faculty-img-wrapper">
                         <img src="${founder.image_url}" alt="${founder.faculty_name} - YSR Academy Coaching Faculty Thane" loading="lazy" decoding="async" width="100" height="100">
                     </div>
                     <div class="founder-info">
                         <h4>${founder.faculty_name}</h4>
                         <p>${founder.subject}</p>
                         ${founder.designation ? `<span class="designation">${founder.designation}</span>` : ''}
                     </div>
                 <button class="btn-delete-faculty" data-id="${founder.id}" aria-label="Delete Founder">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                 </button>
                 <button class="btn-edit-faculty" data-id="${founder.id}" aria-label="Edit Founder">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                 </button>
                 `;
             }
             team.push(...data.slice(1));
         }

         if (facultyGrid) {
             const fragment = document.createDocumentFragment();
             team.forEach((member, index) => {
                 const card = document.createElement('div');
                 card.className = 'faculty-card smooth-render';
                 card.style.transitionDelay = `${index * 50}ms`;
                 card.innerHTML = `
                     <div class="faculty-img-wrapper">
                         <img src="${member.image_url}" alt="${member.faculty_name} - ${member.subject} Faculty at YSR Academy Thane" loading="lazy" decoding="async" width="120" height="120">
                     </div>
                     <h4>${member.faculty_name}</h4>
                     <p class="role">${member.subject}</p>
                     ${member.designation ? `<span class="designation">${member.designation}</span>` : ''}
                 <button class="btn-delete-faculty" data-id="${member.id}" aria-label="Delete Faculty Member">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                 </button>
                 <button class="btn-edit-faculty" data-id="${member.id}" aria-label="Edit Faculty Member">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                 </button>
                 `;
                 fragment.appendChild(card);
             });

             // Add "Add Faculty" card for admins safely
             if (isAdmin()) {
                 const addCard = document.createElement('div');
                 addCard.className = 'faculty-card faculty-add-card smooth-render';
                 addCard.style.transitionDelay = `${team.length * 50}ms`;
                 addCard.innerHTML = `
                     <button class="btn-add-faculty">
                         <span class="plus-icon">+</span>
                         <span>Add Member</span>
                     </button>
                 `;
                 fragment.appendChild(addCard);
             }
             facultyGrid.appendChild(fragment);
         }
         
         requestAnimationFrame(() => {
             requestAnimationFrame(() => {
                 if(founderCardContainer) founderCardContainer.classList.add('show');
                 if(facultyGrid) facultyGrid.querySelectorAll('.smooth-render').forEach(el => el.classList.add('show'));
             });
         });

         console.log('[Faculty] render completed');

     } catch (error) {
         console.error('[Faculty] ❌ exact fetch error:', error);
         console.dir(error);
         if (facultyGrid) facultyGrid.innerHTML = '<p style="color: var(--accent-danger); grid-column: 1 / -1; text-align: center; width: 100%;">Could not load faculty data.</p>';
     }
 }

 // Initial Load
 loadAdaptiveFacultyData();

 // --- Faculty Modal & CRUD Event Handlers ---
 document.addEventListener('click', (e) => {
     const editBtn = e.target.closest('.btn-edit-faculty');
     const addBtn = e.target.closest('.btn-add-faculty');
     const deleteBtn = e.target.closest('.btn-delete-faculty');

     if (!isAdmin()) return;

     if (editBtn) {
         e.preventDefault();
         currentFacultyEditId = editBtn.dataset.id;
         const member = allFacultyData.find(f => f.id == currentFacultyEditId);
         if (member) {
             facultyModalTitle.textContent = 'Edit Faculty Identity';
             editFacultyName.value = member.faculty_name;
             editFacultySubject.value = member.subject;
             editFacultyTitle.value = member.designation || '';
             editFacultyPhoto.value = '';
             editFacultyPhoto.required = false;
             facultyModalOverlay.classList.add('visible');
         }
     }

     if (addBtn) {
         e.preventDefault();
         currentFacultyEditId = null;
         facultyModalTitle.textContent = 'Add New Faculty Member';
         facultyEditForm.reset();
         editFacultyPhoto.required = true;
         facultyModalOverlay.classList.add('visible');
     }

     if (deleteBtn) {
         e.preventDefault();
         const memberId = deleteBtn.dataset.id;
         if (confirm('Are you sure you want to delete this faculty member? This cannot be undone.')) {
             deleteFacultyMember(memberId, deleteBtn);
         }
     }
 });

 // Close Modal Logic
 const closeFacultyMod = () => {
     facultyModalOverlay.classList.remove('visible');
     currentFacultyEditId = null;
 };
 if (closeFacultyModalBtn) closeFacultyModalBtn.addEventListener('click', closeFacultyMod);
 if (facultyModalOverlay) facultyModalOverlay.addEventListener('click', (e) => {
     if (e.target === facultyModalOverlay) closeFacultyMod();
 });

 // Form Submission (Handles both Create and Update)
 facultyEditForm.addEventListener('submit', async (e) => {
     e.preventDefault();
     if (!isAdmin()) return;

     const submitBtn = facultyEditForm.querySelector('button[type="submit"]');
     const originalText = submitBtn.textContent;
     submitBtn.disabled = true;

     try {
         let photoFile = editFacultyPhoto.files[0];
         
         if (photoFile) {
             submitBtn.innerHTML = 'Compressing... <span class="spinner"></span>';
             console.log(`[Faculty] Original image size: ${(photoFile.size / 1024 / 1024).toFixed(2)} MB`);
             
             const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
             photoFile = await imageCompression(photoFile, options);
             
             console.log(`[Faculty] Compressed image size: ${(photoFile.size / 1024 / 1024).toFixed(2)} MB`);
             console.log('[Faculty] Compression success');
         }

         submitBtn.innerHTML = 'Saving... <span class="spinner"></span>';

         const formData = {
             faculty_name: editFacultyName.value.trim(),
             subject: editFacultySubject.value.trim(),
             designation: editFacultyTitle.value.trim(),
             photoFile: photoFile
         };

         console.log('[Faculty] upload started');
         if (currentFacultyEditId) {
             await handleUpdate(currentFacultyEditId, formData);
         } else {
             await handleCreate(formData);
         }
         console.log('[Faculty] upload completed');
     } catch (error) {
         console.error('[Faculty] ❌ Process error:', error);
         alert('Failed to process image or upload. See console for details.');
     } finally {
         submitBtn.disabled = false;
         submitBtn.textContent = originalText;
     }
 });

 async function handleCreate(formData) {
     try {
         // 1. Upload image
         const file = formData.photoFile;
         const filePath = `faculty/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
         console.log('[Upload] upload target path:', filePath);
         const { error: uploadError } = await supabaseClient.storage.from('images').upload(filePath, file);
         if (uploadError) throw uploadError;
         console.log('[Faculty] ✅ Image upload success');

         // 2. Get public URL
         const { data: urlData } = supabaseClient.storage.from('images').getPublicUrl(filePath);

         // 3. Insert into database
         const { error: insertError } = await supabaseClient.from('faculty').insert([{
             faculty_name: formData.faculty_name,
             subject: formData.subject,
             designation: formData.designation,
             image_url: urlData.publicUrl,
             image_path: filePath
         }]);
         if (insertError) throw insertError;

         console.log('[Faculty] ✅ faculty add success');
         closeFacultyMod();
         console.log('[Faculty] refresh triggered');
         await loadAdaptiveFacultyData();
     } catch (error) {
         console.error('[Faculty] ❌ exact add error:', error);
         console.dir(error);
         alert('Failed to add faculty member. See console for details.');
     }
 }

 async function handleUpdate(id, formData) {
     try {
         let updateData = {
             faculty_name: formData.faculty_name,
             subject: formData.subject,
             designation: formData.designation,
         };

         // If a new photo is uploaded, handle storage update
         if (formData.photoFile) {
             const file = formData.photoFile;
             const newPath = `faculty/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;

             // Get old image path to delete it after successful upload
             const member = allFacultyData.find(f => f.id == id);
             const oldPath = member?.image_path;

             // Upload new image
             const { error: uploadError } = await supabaseClient.storage.from('images').upload(newPath, file);
             if (uploadError) throw uploadError;

             // Get new public URL
             const { data: urlData } = supabaseClient.storage.from('images').getPublicUrl(newPath);
             updateData.image_url = urlData.publicUrl;
             updateData.image_path = newPath;

             // Delete old image from storage
             if (oldPath) {
                 await supabaseClient.storage.from('images').remove([oldPath]);
             }
             console.log('[Faculty] ✅ Image replacement success');
         }

         // Update database record
         const { error: updateError } = await supabaseClient.from('faculty').update(updateData).eq('id', id);
         if (updateError) throw updateError;

         console.log(`[Faculty] ✅ faculty update success for ID: ${id}`);
         closeFacultyMod();
         console.log('[Faculty] refresh triggered');
         await loadAdaptiveFacultyData();
     } catch (error) {
         console.error(`[Faculty] ❌ exact update error for ID ${id}:`, error);
         console.dir(error);
         alert('Failed to update faculty member. See console for details.');
     }
 }

 async function deleteFacultyMember(id, btnElement) {
     let originalContent = '';
     if (btnElement) {
         originalContent = btnElement.innerHTML;
         btnElement.disabled = true;
         btnElement.innerHTML = '<span class="spinner" style="margin:0;"></span>';
     }

     try {
         console.log('[Faculty] delete started');
         
         // 1. Read image_path from database row
         const { data: member, error: fetchError } = await supabaseClient
             .from('faculty')
             .select('image_path')
             .eq('id', id)
             .single();

         if (fetchError) throw fetchError;

         const path = member.image_path;
         console.log('[Faculty] stored image_path:', path);
         console.log('[Faculty] delete target path:', path);

         // 2. Delete from Storage
         if (path) {
             const { error: storageError } = await supabaseClient.storage.from('images').remove([path]);
             if (storageError) throw storageError;
             console.log('[Faculty] storage delete success');
         }
         // 3. Delete from Database
         const { error: dbError } = await supabaseClient.from('faculty').delete().eq('id', id);
         if (dbError) throw dbError;
         console.log('[Faculty] database delete success');

         console.log(`[Faculty] ✅ faculty delete success for ID: ${id}`);
         console.log('[Faculty] refresh triggered');
         await loadAdaptiveFacultyData();
     } catch (error) {
         console.error(`[Faculty] ❌ exact delete error for ID ${id}:`, error);
         console.dir(error);
         alert('Failed to delete faculty member. See console for details.');
     } finally {
         if (btnElement && document.body.contains(btnElement)) {
             btnElement.disabled = false;
             btnElement.innerHTML = originalContent;
         }
     }
 }

    // --- 11. TESTIMONIAL MOBILE INTERACTION (SCROLL-BASED) ---
    // This implementation replaces the CSS animation on mobile with a JavaScript-driven
    // scroll. This allows for robust tap-to-center functionality using scrollIntoView,
    // as requested, while preserving the original CSS animation for desktop.
    function initTestimonialInteraction() {
        const marquee = document.querySelector('.testimonial-marquee');
        const track = document.querySelector('.testimonial-track');
        if (!marquee || !track) return;

        // This entire logic is for mobile only.
        if (window.innerWidth > 768) {
            // On desktop, ensure the default CSS animation runs, in case it was paused.
            track.style.animationPlayState = 'running';
            return;
        }

        const cards = track.querySelectorAll('.testimonial-card');
        let isPausedByUser = false;
        let autoScrollRafId = null;
        let resumeTimer = null;
        let userScrollTimeout = null;
        let isProgrammaticScroll = false;
        let isAutoScrolling = false; // Flag to distinguish auto-scroll from user scroll
        let scrollWidth = 0; // Initialize to 0, will be calculated later.

        function autoScroll() {
            if (isPausedByUser) return;

            // If scrollWidth is not calculated yet, do nothing.
            // This prevents the scroll from getting stuck at 0.
            if (scrollWidth === 0) return;

            isAutoScrolling = true; // Signal that the next scroll event is from this loop
            marquee.scrollLeft += 1.5; // Adjust this value to change scroll speed

            if (marquee.scrollLeft >= scrollWidth) {
                // When it reaches the end of the first set, seamlessly jump back to the start
                marquee.scrollLeft -= scrollWidth;
            }
            autoScrollRafId = requestAnimationFrame(autoScroll);
        }

        function stopAutoScroll(clearTapTimer = true) {
            if (autoScrollRafId) {
                cancelAnimationFrame(autoScrollRafId);
                autoScrollRafId = null;
            }
            if (clearTapTimer) {
                clearTimeout(resumeTimer);
            }
        }

        function startAutoScroll() {
            stopAutoScroll(); // Ensure no multiple loops are running
            isPausedByUser = false;
            autoScrollRafId = requestAnimationFrame(autoScroll);
        }

        function handleTestimonialTap(tappedCard) {
            stopAutoScroll();
            isPausedByUser = true;

            cards.forEach(card => card.classList.remove('selected'));
            tappedCard.classList.add('selected');

            isProgrammaticScroll = true;
            tappedCard.scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest'
            });

            // After the smooth scroll animation is likely finished, reset the flag
            setTimeout(() => { isProgrammaticScroll = false; }, 1000);

            // Set an 8-second timer to automatically resume scrolling
            resumeTimer = setTimeout(() => {
                cards.forEach(card => card.classList.remove('selected'));
                startAutoScroll();
            }, 8000);
        }

        // --- Event Listeners ---
        track.addEventListener('click', (e) => {
            const tappedCard = e.target.closest('.testimonial-card');
            if (tappedCard) {
                e.preventDefault();
                handleTestimonialTap(tappedCard);
            }
        });

        // Pause on manual scroll (drag/swipe) and resume after a delay
        marquee.addEventListener('scroll', () => {
            if (isProgrammaticScroll) return; // Ignore scroll events from our own script

            // Ignore scrolls generated by our own auto-scroll loop.
            if (isAutoScrolling) {
                isAutoScrolling = false; // Reset the flag for the next scroll event.
                return;
            }

            // Any other scroll is from the user, so pause auto-scroll
            stopAutoScroll();
            isPausedByUser = true;

            // Debounce the resume: if the user keeps scrolling, the timer resets
            clearTimeout(userScrollTimeout);
            userScrollTimeout = setTimeout(() => {
                // After user stops scrolling for 3s, resume auto-scroll
                startAutoScroll();
            }, 3000);
        }, { passive: true });

        // --- Initial Setup ---
        // We defer the calculation of scrollWidth to ensure the layout is complete.
        const setup = () => {
            scrollWidth = track.scrollWidth / 2;
            if (scrollWidth === 0) {
                // If layout is not ready, try again shortly.
                console.log('[Testimonials] Mobile scroll track not ready, retrying...');
                setTimeout(setup, 100);
            } else {
                console.log(`[Testimonials] Mobile scroll track ready. Width: ${scrollWidth}px`);
                startAutoScroll();
            }
        };

        setup();
    }

    // --- 9. ADAPTIVE LIVE NOTICE SYSTEM (ADMIN) ---
    const noticeModalOverlay = document.getElementById('notice-modal-overlay');
    const closeNoticeModalBtn = document.getElementById('close-notice-modal');
    const noticeAddForm = document.getElementById('notice-add-form');
    const newNoticeInput = document.getElementById('new-notice-input');
    const currentNoticesList = document.getElementById('current-notices-list');
    const noticeTrack = document.getElementById('notice-track');
 
    async function loadAdaptiveNotices() {
        console.log('[Notices] Fetching notices from Supabase...');
        console.log('[Notices] loading state active');
        
        if (noticeTrack) {
            noticeTrack.style.animation = 'none';
            noticeTrack.innerHTML = '<div class="notice-set"><span class="notice-item skeleton skeleton-text" style="width:150px; display:inline-block; margin-right:2rem; height:1rem;"></span><span class="notice-item skeleton skeleton-text" style="width:250px; display:inline-block; height:1rem;"></span></div>';
        }
        if (currentNoticesList) {
            currentNoticesList.innerHTML = Array.from({length: 3}).map(() => `
                <div class="notice-edit-item skeleton" style="height: 40px; margin-bottom: 0.5rem; border:none;"></div>
            `).join('');
        }

        try {
            const { data: notices, error } = await supabaseClient
                .from('notices')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            console.log(`[Notices] ✅ notice fetch success: ${notices.length} notices loaded.`);
            console.log('[Notices] render started...');

            // Render Cinematic Ticker
            if (noticeTrack) {
                noticeTrack.innerHTML = '';
                if (notices.length > 0) {
                    const createSet = () => {
                        const setDiv = document.createElement('div');
                        setDiv.className = 'notice-set smooth-render';
                        notices.forEach(({ text }) => {
                            const span = document.createElement('span');
                            span.className = 'notice-item';
                            span.textContent = text;
                            setDiv.appendChild(span);
                        });
                        return setDiv;
                    };

                    noticeTrack.appendChild(createSet());
                    noticeTrack.appendChild(createSet()); // Duplicate for seamless endless loop

                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            noticeTrack.querySelectorAll('.smooth-render').forEach(el => el.classList.add('show'));
                            noticeTrack.style.animation = 'marquee-scroll 25s linear infinite';
                        });
                    });
                } else {
                    noticeTrack.innerHTML = '<div class="notice-set smooth-render"><span class="notice-item">Welcome to YSR Academy!</span></div>';
                    requestAnimationFrame(() => {
                        noticeTrack.querySelector('.smooth-render').classList.add('show');
                    });
                }
            }

            // Render Modal List
            if (currentNoticesList) {
                currentNoticesList.innerHTML = '';
                if (notices.length > 0) {
                    const fragment = document.createDocumentFragment();
                    notices.forEach(({ id, text }, index) => {
                        const item = document.createElement('div');
                        item.className = 'notice-edit-item smooth-render';
                        item.style.transitionDelay = `${index * 30}ms`;
                        item.innerHTML = `
                            <span class="notice-edit-text">${text}</span>
                            <button class="btn-remove-notice" data-id="${id}">&times;</button>
                        `;
                        fragment.appendChild(item);
                    });
                    currentNoticesList.appendChild(fragment);
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            currentNoticesList.querySelectorAll('.smooth-render').forEach(el => el.classList.add('show'));
                        });
                    });
                } else {
                    currentNoticesList.innerHTML = '<p class="smooth-render show" style="text-align: center; color: var(--text-secondary);">No announcements yet.</p>';
                }
            }
            console.log('[Notices] render completed');
        } catch (error) {
            console.error('[Notices] ❌ exact fetch error:', error);
            if (noticeTrack) noticeTrack.innerHTML = '<div class="notice-set"><span class="notice-item" style="color: var(--accent-danger);">Could not load notices.</span></div>';
            if (currentNoticesList) currentNoticesList.innerHTML = '<p style="text-align: center; color: var(--accent-danger);">Could not load notices.</p>';
        }
    }
 
    // Safe to run now: loads live notices if the table exists
    loadAdaptiveNotices(); 
 
    // Open Notice Modal
    document.addEventListener('click', (e) => {
        const editNoticeBtn = e.target.closest('#btn-edit-notice');
        if (editNoticeBtn && noticeModalOverlay && isAdmin()) {
            e.preventDefault();
            noticeModalOverlay.classList.add('visible');
        }
    });
 
    // Close Notice Modal
    if (closeNoticeModalBtn && noticeModalOverlay) {
        const closeNoticeMod = () => { noticeModalOverlay.classList.remove('visible'); };
        closeNoticeModalBtn.addEventListener('click', closeNoticeMod);
        noticeModalOverlay.addEventListener('click', (e) => {
            if (e.target === noticeModalOverlay) closeNoticeMod();
        });
    }
 
    // Add Notice
    if (noticeAddForm) {
        noticeAddForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!isAdmin()) return;
            const newNoticeText = newNoticeInput.value.trim();
            if (!newNoticeText) return;
            
            const submitBtn = noticeAddForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Adding... <span class="spinner"></span>';

            try {
                console.log('[Notices] upload started');
                const { error } = await supabaseClient.from('notices').insert([{ text: newNoticeText }]);
                if (error) throw error;
                console.log('[Notices] ✅ notice add success:', newNoticeText);
                console.log('[Notices] upload completed');
                newNoticeInput.value = '';
                await loadAdaptiveNotices();
            } catch (error) {
                console.error('[Notices] ❌ exact add error:', error);
                alert('Failed to add notice. See console for details.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
 
    // Remove Notice
    if (currentNoticesList) {
        currentNoticesList.addEventListener('click', async (e) => {
            const removeBtn = e.target.closest('.btn-remove-notice');
            if (removeBtn && isAdmin()) {
                const noticeId = removeBtn.dataset.id;
                if (!noticeId || !confirm('Are you sure you want to delete this notice?')) return;
                
                const originalText = removeBtn.innerHTML;
                removeBtn.disabled = true;
                removeBtn.innerHTML = '<span class="spinner" style="margin:0; width:12px; height:12px; border-width:2px;"></span>';

                try {
                    const { error } = await supabaseClient.from('notices').delete().eq('id', noticeId);
                    if (error) throw error;
                    console.log(`[Notices] ✅ notice delete success for ID: ${noticeId}`);
                    await loadAdaptiveNotices();
                } catch (error) {
                    console.error(`[Notices] ❌ exact delete error for ID ${noticeId}:`, error);
                    alert('Failed to delete notice. See console for details.');
                    removeBtn.disabled = false;
                    removeBtn.innerHTML = originalText;
                }
            }
        });
    }
