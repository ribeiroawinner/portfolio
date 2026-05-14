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

/** Query para forçar nova miniatura depois de alterar a capa no YouTube (cache CDN + browser). */
function getYoutubeThumbCacheQuery() {
    if (typeof document === "undefined") return "";
    const raw = document.documentElement.getAttribute("data-yt-thumb-cache");
    if (raw == null || raw === "") return "";
    return `?ytcb=${encodeURIComponent(raw)}`;
}

/** Aplica o bust às capas estáticas do HTML (uma versão em data-yt-thumb-cache). */
function applyYoutubeThumbBustToPosterImgs() {
    const q = getYoutubeThumbCacheQuery();
    if (!q) return;
    document.querySelectorAll("img.hero-video-poster, img.short-video-poster").forEach((img) => {
        const src = img.getAttribute("src");
        if (!src || !src.includes("i.ytimg.com/vi/")) return;
        img.src = `${src.split("?")[0]}${q}`;
    });
}

/** Miniatura: tenta a melhor resolução; se maxres for placeholder (~120px) ou falhar, desce de tier. */
function bindYoutubePosterBestEffort(img, videoId, verticalShort) {
    if (!img || !videoId) return;
    if (img.getAttribute("data-yt-poster-bound") === "1") return;
    img.setAttribute("data-yt-poster-bound", "1");
    const id = encodeURIComponent(videoId);
    const q = getYoutubeThumbCacheQuery();
    const landscapeTiers = [
        `https://i.ytimg.com/vi/${id}/maxresdefault.jpg${q}`,
        `https://i.ytimg.com/vi/${id}/sddefault.jpg${q}`,
        `https://i.ytimg.com/vi/${id}/hqdefault.jpg${q}`
    ];
    const shortTiers = [
        `https://i.ytimg.com/vi/${id}/maxresdefault.jpg${q}`,
        `https://i.ytimg.com/vi/${id}/hq720.jpg${q}`,
        `https://i.ytimg.com/vi/${id}/sddefault.jpg${q}`,
        `https://i.ytimg.com/vi/${id}/hqdefault.jpg${q}`
    ];
    const tiers = verticalShort ? shortTiers : landscapeTiers;
    let tierIndex = 0;

    const goTier = (next) => {
        tierIndex = next;
        if (tierIndex < tiers.length) {
            img.src = tiers[tierIndex];
        }
    };

    img.addEventListener("error", () => {
        goTier(tierIndex + 1);
    });

    img.addEventListener("load", () => {
        if (img.naturalWidth <= 128 && tierIndex < tiers.length - 1) {
            goTier(tierIndex + 1);
        }
    });

    goTier(0);
    if (img.complete && img.naturalWidth <= 128 && tierIndex < tiers.length - 1) {
        goTier(tierIndex + 1);
    }
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

function mountLazyYoutubePlayer(rootEl, videoId, mountId, mountClass, titleAttr) {
    const mount = document.createElement("div");
    mount.id = mountId;
    mount.className = mountClass;
    if (titleAttr) {
        mount.setAttribute("title", titleAttr);
    }
    rootEl.appendChild(mount);

    const createPlayer = () => {
        new YT.Player(mountId, {
            host: "https://www.youtube-nocookie.com",
            videoId,
            width: "100%",
            height: "100%",
            playerVars: {
                ...youtubePlayerVarsBase(),
                autoplay: 1,
                mute: 1
            },
            events: {
                onReady: (ev) => {
                    const p = ev.target;
                    setYoutubePlayerVolume(p);
                    try {
                        p.playVideo();
                    } catch (_) {
                        /* ignore */
                    }
                    requestAnimationFrame(() => {
                        try {
                            p.unMute();
                        } catch (_) {
                            /* alguns browsers só deixam som após interação no próprio player */
                        }
                    });
                }
            }
        });
    };

    if (typeof YT !== "undefined" && YT && YT.Player) {
        createPlayer();
    } else {
        whenYoutubeIframeApiReady(createPlayer);
    }
}

const youtubeEmbedReadyQueue = [];

function runYoutubeEmbedReadyCallbacks() {
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
    applyYoutubeThumbBustToPosterImgs();

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
            bindYoutubePosterBestEffort(poster, shortId, true);
        }
        shortLoadBtn.addEventListener("click", () => {
            shortLoadBtn.remove();
            void shortEmbedRoot.offsetWidth;
            mountLazyYoutubePlayer(
                shortEmbedRoot,
                shortId,
                `short-yt-${shortId}`,
                "shorts-yt-player-mount",
                "YouTube Short portfolio"
            );
        });
    }

    document.querySelectorAll(".hero-yt-lazy[data-video-id]").forEach((root) => {
        const loadBtn = root.querySelector(".hero-video-load-btn");
        const poster = root.querySelector(".hero-video-poster");
        const videoId = root.getAttribute("data-video-id");
        const normalizedId = youtubeVideoIdFromDataShort(videoId || "");
        if (!loadBtn || !normalizedId) return;
        if (poster) {
            bindYoutubePosterBestEffort(poster, normalizedId, false);
        }
        loadBtn.addEventListener("click", () => {
            loadBtn.remove();
            void root.offsetWidth;
            mountLazyYoutubePlayer(
                root,
                normalizedId,
                `hero-yt-${normalizedId}`,
                "hero-yt-player-mount",
                "Featured portfolio video"
            );
        });
    });

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
