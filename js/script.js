document.addEventListener('DOMContentLoaded', () => {

    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Scroll Animations (Fade In)
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select elements to animate
    const animatedElements = document.querySelectorAll('.feature-card, .portfolio-item, .cta-container > *, .client-item');

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    // Typing Effect
    const typingText = document.querySelector('.typing-text');
    const words = ["Crescimento Real.", "Retenção Máxima.", "Mais Inscritos.", "Autoridade."];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function type() {
        const currentWord = words[wordIndex];

        if (isDeleting) {
            typingText.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;
        } else {
            typingText.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100;
        }

        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            typeSpeed = 2000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 500; // Pause before new word
        }

        setTimeout(type, typeSpeed);
    }

    if (typingText) {
        setTimeout(type, 1000);
    }

    // Stats Counter Animation
    const stats = document.querySelectorAll('.stat-number');

    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = +entry.target.getAttribute('data-target');
                const duration = 2000; // 2 seconds
                const increment = target / (duration / 16); // 60fps

                let current = 0;
                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        entry.target.innerText = Math.ceil(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        entry.target.innerText = target;
                    }
                };

                updateCounter();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => {
        statsObserver.observe(stat);
    });

    // Transformation Slider Logic
    const sliderContainer = document.querySelector('.slider-container');
    const sliderHandle = document.querySelector('.slider-handle');
    const imageBefore = document.querySelector('.image-before');

    if (sliderContainer && sliderHandle && imageBefore) {
        let isDragging = false;

        const updateSlider = (x) => {
            const rect = sliderContainer.getBoundingClientRect();
            let position = x - rect.left;

            // Constrain position
            if (position < 0) position = 0;
            if (position > rect.width) position = rect.width;

            const percentage = (position / rect.width) * 100;

            sliderHandle.style.left = `${percentage}%`;
            imageBefore.style.width = `${percentage}%`;
        };

        // Mouse Events
        sliderHandle.addEventListener('mousedown', (e) => {
            isDragging = true;
            e.preventDefault(); // Prevent text selection
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            updateSlider(e.clientX);
        });

        // Touch Events
        sliderHandle.addEventListener('touchstart', (e) => {
            isDragging = true;
            e.preventDefault();
        });

        document.addEventListener('touchend', () => {
            isDragging = false;
        });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            updateSlider(e.touches[0].clientX);
        });

        // Click on container to jump
        sliderContainer.addEventListener('click', (e) => {
            updateSlider(e.clientX);
        });
    }
});
