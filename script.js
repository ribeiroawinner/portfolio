// script.js
/** Aceita ID de 11 caracteres, youtu.be/…, /shorts/…, /embed/… ou watch?v=… */
function youtubeVideoIdFromDataShort(raw) {
    if (!raw) return "";
    const t = String(raw).trim();
    let m = t.match(/youtu\.be\/([^?#&/]+)/i);
    if (m) return m[1];
    m = t.match(/youtube\.com\/shorts\/([^?#&/]+)/i);
    if (m) return m[1];
    m = t.match(/youtube\.com\/embed\/([^?#&/]+)/i);
    if (m) return m[1];
    m = t.match(/[?&]v=([^?#&]+)/);
    if (m) return m[1];
    if (/^[\w-]{11}$/.test(t)) return t;
    return "";
}

/** Volume inicial (0–100); só funciona via IFrame API, não por parâmetros da URL. */
const YT_EMBED_VOLUME = 50;

const YT_SHARED_PLAYER_VARS = {
    playsinline: 1,
    rel: 0,
    modestbranding: 1,
    iv_load_policy: 3,
    enablejsapi: 1
};

function youtubePlayerVarsBase() {
    const v = { ...YT_SHARED_PLAYER_VARS };
    if (typeof location !== "undefined" && location.origin && location.protocol !== "file:") {
        v.origin = location.origin;
    }
    return v;
}

function setYoutubePlayerVolume(player) {
    try {
        if (player && typeof player.setVolume === "function") {
            player.setVolume(YT_EMBED_VOLUME);
        }
    } catch (_) {
        /* embed pode recusar em alguns contextos */
    }
}

function initHeroYoutubePlayers() {
    if (typeof YT === "undefined" || !YT.Player) return;
    document.querySelectorAll(".hero-yt-embed[data-video-id]").forEach((el) => {
        if (el.getAttribute("data-yt-inited") === "1") return;
        const videoId = el.getAttribute("data-video-id");
        const elId = el.id;
        if (!videoId || !elId) return;
        el.setAttribute("data-yt-inited", "1");
        new YT.Player(elId, {
            host: "https://www.youtube-nocookie.com",
            videoId,
            width: "100%",
            height: "100%",
            playerVars: youtubePlayerVarsBase(),
            events: {
                onReady: (ev) => setYoutubePlayerVolume(ev.target)
            }
        });
    });
}

const youtubeEmbedReadyQueue = [];

function runYoutubeEmbedReadyCallbacks() {
    initHeroYoutubePlayers();
    while (youtubeEmbedReadyQueue.length) {
        const fn = youtubeEmbedReadyQueue.shift();
        try {
            fn();
        } catch (_) {}
    }
}

function whenYoutubeIframeApiReady(fn) {
    if (typeof YT !== "undefined" && YT && YT.Player) {
        fn();
        return;
    }
    youtubeEmbedReadyQueue.push(fn);
}

const previousOnYouTubeIframeAPIReady = window.onYouTubeIframeAPIReady;
window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady() {
    if (typeof previousOnYouTubeIframeAPIReady === "function") {
        previousOnYouTubeIframeAPIReady();
    }
    runYoutubeEmbedReadyCallbacks();
};

document.addEventListener("DOMContentLoaded", () => {
    if (typeof YT !== "undefined" && YT && YT.Player) {
        initHeroYoutubePlayers();
    }

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

    const shortEmbedRoot = document.querySelector(".shorts-video-container[data-short-id]");
    const shortLoadBtn = shortEmbedRoot?.querySelector(".short-video-load-btn");
    const shortId = youtubeVideoIdFromDataShort(shortEmbedRoot?.dataset.shortId);
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
            void shortEmbedRoot.offsetWidth;

            const mountId = `short-yt-${shortId}`;
            const mount = document.createElement("div");
            mount.id = mountId;
            mount.className = "shorts-yt-player-mount";
            mount.setAttribute("title", "YouTube Short portfolio");
            shortEmbedRoot.appendChild(mount);

            const mountPlayer = () => {
                new YT.Player(mountId, {
                    host: "https://www.youtube-nocookie.com",
                    videoId: shortId,
                    width: "100%",
                    height: "100%",
                    playerVars: {
                        ...youtubePlayerVarsBase(),
                        autoplay: 0
                    },
                    events: {
                        onReady: (ev) => setYoutubePlayerVolume(ev.target)
                    }
                });
            };

            whenYoutubeIframeApiReady(mountPlayer);
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
