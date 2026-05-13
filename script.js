// script.js
document.addEventListener("DOMContentLoaded", () => {
    const i18n = {
        en: {
            "hero.role": "Video editor for YouTubers!",
            "cta.title": "Let's Scale Your Channel?",
            "cta.subtitle": "Quality, deadlines, and results. Request a proposal and start now.",
            "cta.button": "Request a Quote",
            "cta.note": "Reply within 24h.",
            "footer.copyright": "© Win. All rights reserved.",
            "badge.text": "Open for commissions",
            "accordion.header": "About me",
            "accordion.content":
                'I\'m <span class="about-emphasis">Win</span>! I\'m 22 years old and work as a video editor focused on <span class="about-emphasis">Valorant</span>, <span class="about-emphasis">Minecraft and Roblox</span>, <span class="about-emphasis">Vlogs</span>, and <span class="about-emphasis">YouTube Shorts</span>. I use <span class="about-emphasis">Adobe Premiere</span> to transform raw footage and Lives into dynamic content, with a total focus on <span class="about-emphasis">retention</span> and each channel\'s <span class="about-emphasis">identity</span>. I have the technical expertise to structure the pacing of <span class="about-emphasis">gameplays</span> and the narrative of <span class="about-emphasis">vlogs</span>, ensuring all projects are delivered exactly <span class="about-emphasis">on time</span>.'
        }
    };

    const userLang = "en";
    document.documentElement.lang = "en";

    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (i18n[userLang] && i18n[userLang][key]) {
            el.innerHTML = i18n[userLang][key];
        }
    });

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const accordionHeader = document.querySelector(".accordion-header");
    const accordionSection = document.querySelector(".accordion-section");

    if (accordionHeader && accordionSection) {
        accordionHeader.addEventListener("click", () => {
            const isOpen = accordionSection.classList.toggle("is-open");
            accordionHeader.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    const shortEmbedRoot = document.querySelector(".short-video-embed[data-short-id]");
    const shortLoadBtn = shortEmbedRoot?.querySelector(".short-video-load-btn");
    const shortId = shortEmbedRoot?.dataset.shortId;
    if (shortEmbedRoot && shortLoadBtn && shortId) {
        const poster = shortEmbedRoot.querySelector(".short-video-poster");
        if (poster) {
            poster.addEventListener(
                "error",
                () => {
                    poster.src = `https://i.ytimg.com/vi/${encodeURIComponent(shortId)}/hqdefault.jpg`;
                },
                { once: true }
            );
        }
        shortLoadBtn.addEventListener("click", () => {
            shortLoadBtn.remove();
            const wrap = document.createElement("div");
            wrap.className = "short-video-iframe-wrap";
            shortEmbedRoot.appendChild(wrap);

            const mountIframe = () => {
                const rect = shortEmbedRoot.getBoundingClientRect();
                const w = Math.max(1, Math.round(rect.width));
                const h = Math.max(1, Math.round(rect.height));

                const iframe = document.createElement("iframe");
                iframe.title = "YouTube Short portfolio 1";
                iframe.loading = "eager";
                iframe.width = w;
                iframe.height = h;
                iframe.style.position = "absolute";
                iframe.style.top = "0";
                iframe.style.left = "0";
                iframe.style.width = `${w}px`;
                iframe.style.height = `${h}px`;
                iframe.style.aspectRatio = "9 / 16";
                iframe.style.border = "0";
                iframe.style.boxSizing = "border-box";

                iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(shortId)}?rel=0&modestbranding=1&playsinline=1&autoplay=1`;
                iframe.setAttribute(
                    "allow",
                    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                );
                iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
                iframe.allowFullscreen = true;
                wrap.appendChild(iframe);
            };

            void shortEmbedRoot.offsetWidth;
            requestAnimationFrame(() => {
                requestAnimationFrame(mountIframe);
            });
        });
    }

    if (prefersReducedMotion) {
        document.querySelectorAll('[style*="opacity: 0"]').forEach((el) => {
            el.style.opacity = "1";
            el.style.transform = "none";
        });
        return;
    }

    const animatedElements = document.querySelectorAll('[style*="opacity: 0"]');

    animatedElements.forEach((el) => {
        el.style.transition = "opacity 0.8s ease-out, transform 0.8s ease-out";
    });

    const revealOnScroll = (target) => {
        const delay = target.dataset.delay || "0s";
        target.style.transitionDelay = delay;
        target.style.opacity = "1";
        target.style.transform = "translateY(0)";

        const onEnd = (e) => {
            if (e.propertyName === "opacity" && target.style.opacity === "1") {
                target.style.transitionDelay = "0s";
            }
            target.removeEventListener("transitionend", onEnd);
        };
        target.addEventListener("transitionend", onEnd, { once: true });
    };

    const hideOffScreen = (target) => {
        target.style.transitionDelay = "0s";
        target.style.opacity = "0";
        target.style.transform = "translateY(20px)";
    };

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const target = entry.target;
                if (entry.isIntersecting) {
                    revealOnScroll(target);
                } else {
                    hideOffScreen(target);
                }
            });
        },
        {
            threshold: 0.08,
            rootMargin: "0px 0px 0px 0px"
        }
    );

    document
        .querySelectorAll(".portfolio-grid, .features-grid, .clients-grid, .works .container")
        .forEach((grid) => {
            Array.from(grid.querySelectorAll('[style*="opacity: 0"]')).forEach((item, index) => {
                item.dataset.delay = `${index * 0.15}s`;
            });
        });

    animatedElements.forEach((el) => observer.observe(el));
});
