import Lenis from "lenis"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { preloadImages } from "./utils.js"

gsap.registerPlugin(ScrollTrigger)

/* =====================================================================
   STICKY GALLERY SCROLL (original)
   ===================================================================== */

class StickyGridScroll {
    constructor() {
        this.getElements()
        this.initContent()
        this.groupItemsByColumn()
        this.addParallaxOnScroll()
        this.animateTitleOnScroll()
        this.animateGridOnScroll()
    }

    getElements() {
        this.block = document.querySelector(".block--main")
        if (this.block) {
            this.wrapper = this.block.querySelector(".block__wrapper")
            this.content = this.block.querySelector(".content")
            this.title = this.block.querySelector(".content__title")
            this.description = this.block.querySelector(".content__description")
            this.button = this.block.querySelector(".content__button")
            this.grid = this.block.querySelector(".gallery__grid")
            this.items = this.block.querySelectorAll(".gallery__item")
        }
    }

    initContent() {
        if (this.description && this.button) {
            gsap.set([this.description, this.button], { opacity: 0, pointerEvents: "none" })
        }
        if (this.content && this.title) {
            const dy = (this.content.offsetHeight - this.title.offsetHeight) / 2
            this.titleOffsetY = (dy / this.content.offsetHeight) * 100
            gsap.set(this.title, { yPercent: this.titleOffsetY })
        }
    }

    groupItemsByColumn() {
        this.numColumns = 3
        this.columns = Array.from({ length: this.numColumns }, () => [])
        this.items.forEach((item, index) => {
            this.columns[index % this.numColumns].push(item)
        })
    }

    addParallaxOnScroll() {
        if (!this.block || !this.wrapper) return
        gsap.from(this.wrapper, {
            yPercent: -100,
            ease: "none",
            scrollTrigger: {
                trigger: this.block,
                start: "top bottom",
                end: "top top",
                scrub: true,
            },
        })
    }

    animateTitleOnScroll() {
        if (!this.block || !this.title) return
        gsap.from(this.title, {
            opacity: 0,
            duration: 0.7,
            ease: "power1.out",
            scrollTrigger: {
                trigger: this.block,
                start: "top 57%",
                toggleActions: "play none none reset",
            },
        })
    }

    gridRevealTimeline(columns = this.columns) {
        const timeline = gsap.timeline()
        const wh = window.innerHeight
        const dy = wh - (wh - this.grid.offsetHeight) / 2
        columns.forEach((column, colIndex) => {
            const fromTop = colIndex % 2 === 0
            timeline.from(
                column,
                {
                    y: dy * (fromTop ? -1 : 1),
                    stagger: {
                        each: 0.06,
                        from: fromTop ? "end" : "start",
                    },
                    ease: "power1.inOut",
                },
                "grid-reveal",
            )
        })
        return timeline
    }

    gridZoomTimeline(columns = this.columns) {
        const timeline = gsap.timeline({ defaults: { duration: 1, ease: "power3.inOut" } })
        timeline.to(this.grid, { scale: 2.05 })
        timeline.to(columns[0], { xPercent: -40 }, "<")
        timeline.to(columns[2], { xPercent: 40 }, "<")
        timeline.to(
            columns[1],
            {
                yPercent: (index) => (index < Math.floor(columns[1].length / 2) ? -1 : 1) * 40,
                duration: 0.5,
                ease: "power1.inOut",
            },
            "-=0.5",
        )
        return timeline
    }

    toggleContent(isVisible = true) {
        if (!this.title || !this.description || !this.button) return
        gsap.timeline({ defaults: { overwrite: true } })
            .to(this.title, {
                yPercent: isVisible ? 0 : this.titleOffsetY,
                duration: 0.7,
                ease: "power2.inOut",
            })
            .to(
                [this.description, this.button],
                {
                    opacity: isVisible ? 1 : 0,
                    duration: 0.4,
                    ease: `power1.${isVisible ? "inOut" : "out"}`,
                    pointerEvents: isVisible ? "all" : "none",
                },
                isVisible ? "-=90%" : "<",
            )
    }

    animateGridOnScroll() {
        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: this.block,
                start: "top 25%",
                end: "bottom bottom",
                scrub: true,
            },
        })
        timeline
            .add(this.gridRevealTimeline())
            .add(this.gridZoomTimeline(), "-=0.6")
            .add(() => this.toggleContent(timeline.scrollTrigger.direction === 1), "-=0.32")
    }
}

/* =====================================================================
   SPACES SHOWCASE — full-screen slider with split-text transitions
   ===================================================================== */

class SpacesShowcase {
    constructor() {
        this.section = document.querySelector(".section--spaces")
        if (!this.section) return
        this.slides = [...this.section.querySelectorAll(".spaces__slide")]
        this.btnPrev = this.section.querySelector(".spaces__btn--prev")
        this.btnNext = this.section.querySelector(".spaces__btn--next")
        this.countCur = this.section.querySelector(".spaces__count-cur")
        this.total = this.slides.length
        this.current = 0
        this.busy = false
        this.init()
    }

    init() {
        this.slides.forEach((slide, i) => {
            if (i !== 0) {
                gsap.set(slide, { autoAlpha: 0 })
                gsap.set(slide.querySelector(".spaces__title-l"), { x: "-60%" })
                gsap.set(slide.querySelector(".spaces__title-r"), { x: "60%" })
            }
        })
        this.btnNext.addEventListener("click", () => this.navigate(1))
        this.btnPrev.addEventListener("click", () => this.navigate(-1))
    }

    navigate(dir) {
        if (this.busy) return
        this.busy = true
        const prev = this.current
        this.current = (this.current + dir + this.total) % this.total
        const prevSlide = this.slides[prev]
        const nextSlide = this.slides[this.current]

        const tl = gsap.timeline({ onComplete: () => { this.busy = false } })
        tl.to(prevSlide.querySelector(".spaces__title-l"), { x: dir > 0 ? "-35%" : "35%", duration: 0.6, ease: "power2.in" })
        tl.to(prevSlide.querySelector(".spaces__title-r"), { x: dir > 0 ? "35%" : "-35%", duration: 0.6, ease: "power2.in" }, "<")
        tl.to(prevSlide, { autoAlpha: 0, duration: 0.45 }, "-=0.25")

        gsap.set(nextSlide, { autoAlpha: 0 })
        gsap.set(nextSlide.querySelector(".spaces__title-l"), { x: dir > 0 ? "-25%" : "25%" })
        gsap.set(nextSlide.querySelector(".spaces__title-r"), { x: dir > 0 ? "25%" : "-25%" })
        tl.to(nextSlide, { autoAlpha: 1, duration: 0.55 }, "-=0.2")
        tl.to(nextSlide.querySelector(".spaces__title-l"), { x: 0, duration: 0.9, ease: "power2.out" }, "-=0.45")
        tl.to(nextSlide.querySelector(".spaces__title-r"), { x: 0, duration: 0.9, ease: "power2.out" }, "<")
        tl.add(() => {
            this.countCur.textContent = String(this.current + 1).padStart(2, "0")
        }, "-=0.6")
    }
}

/* =====================================================================
   SMOOTH SCROLLING (Lenis + GSAP)
   ===================================================================== */

function initSmoothScrolling() {
    const lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 1.4 })
    lenis.on("scroll", ScrollTrigger.update)
    gsap.ticker.add((time) => { lenis.raf(time * 1000) })
    gsap.ticker.lagSmoothing(0)
}

/* =====================================================================
   HERO ENTRANCE + BLUR/FADE ON SCROLL
   ===================================================================== */

function initHeroEffect() {
    const content = document.querySelector(".hero__content")
    if (!content) return

    // Staggered entrance after loading
    gsap.from(".hero__eyebrow", { opacity: 0, y: 14, duration: 1, delay: 0.4, ease: "power2.out" })
    gsap.from(".hero__title",   { opacity: 0, y: 22, duration: 1.3, delay: 0.6, ease: "power2.out" })
    gsap.from(".hero__tagline", { opacity: 0, y: 14, duration: 1,   delay: 0.95, ease: "power2.out" })
    gsap.from(".hero__scroll-hint", { opacity: 0, duration: 1, delay: 1.5, ease: "power2.out" })

    // Blur + fade the whole hero content block on scroll
    gsap.to(content, {
        opacity: 0,
        filter: "blur(20px)",
        ease: "none",
        scrollTrigger: {
            trigger: ".block--intro",
            start: "top top",
            end: "bottom top",
            scrub: true,
        },
    })
}

/* =====================================================================
   NAVBAR — transparent → solid on scroll
   ===================================================================== */

function initNavbar() {
    const navbar = document.querySelector(".navbar")
    if (!navbar) return

    ScrollTrigger.create({
        trigger: "body",
        start: "80px top",
        onUpdate: (self) => {
            if (self.scroll() > 80) {
                navbar.classList.add("navbar--solid")
            } else {
                navbar.classList.remove("navbar--solid")
            }
        },
    })
}

/* =====================================================================
   ARCH REVEAL — clip-path expand on scroll
   ===================================================================== */

function initArchReveal() {
    const archImg = document.querySelector(".arch__img")
    const archText = document.querySelector(".arch__text")
    if (!archImg) return

    gsap.fromTo(archImg,
        { clipPath: "inset(0 40% 0 40% round 50%)" },
        {
            clipPath: "inset(0 0% 0 0% round 0%)",
            ease: "none",
            scrollTrigger: {
                trigger: ".section--arch",
                start: "top top",
                end: "bottom bottom",
                scrub: 1.5,
            },
        }
    )

    if (archText) {
        gsap.fromTo(archText,
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: ".section--arch",
                    start: "55% top",
                    end: "80% top",
                    scrub: 1,
                },
            }
        )
    }
}

/* =====================================================================
   HOMEPAGE SECTION ANIMATIONS
   ===================================================================== */

function initHomeAnimations() {
    const ease = "power2.out"

    // --- Tagline (Place Matters) ---
    const taglineTl = gsap.timeline({
        scrollTrigger: { trigger: ".section--tagline", start: "top 70%", once: true },
    })
    taglineTl
        .from(".tagline__eyebrow",   { opacity: 0, y: 18, duration: 0.7, ease })
        .from(".tagline__heading",   { opacity: 0, y: 44, duration: 1.1, ease }, "-=0.4")
        .from(".tagline__body",      { opacity: 0, y: 24, duration: 0.9, ease }, "-=0.7")
        .from(".tagline__actions",   { opacity: 0, y: 18, duration: 0.7, ease }, "-=0.6")
        .from(".mosaic__img",        { opacity: 0, scale: 0.96, duration: 1.0, stagger: 0.12, ease }, "-=0.8")

    // --- Services section header ---
    const servicesHeaderTl = gsap.timeline({
        scrollTrigger: { trigger: ".section--services", start: "top 72%", once: true },
    })
    servicesHeaderTl
        .from(".section--services .section__eyebrow", { opacity: 0, y: 16, duration: 0.7, ease })
        .from(".section--services .section__heading", { opacity: 0, y: 28, duration: 0.9, ease }, "-=0.4")

    // --- Service cards stagger ---
    gsap.from(".service-card", {
        opacity: 0,
        y: 60,
        duration: 0.9,
        stagger: 0.12,
        ease,
        scrollTrigger: { trigger: ".services__grid", start: "top 75%", once: true },
    })

    // --- Stats bar ---
    const statsEls = document.querySelectorAll(".stat__num[data-count]")
    ScrollTrigger.create({
        trigger: ".section--stats",
        start: "top 70%",
        once: true,
        onEnter: () => {
            statsEls.forEach((el) => {
                const target = parseInt(el.dataset.count)
                gsap.to({ val: 0 }, {
                    val: target,
                    duration: 1.6,
                    ease: "power2.out",
                    onUpdate: function () {
                        el.textContent = Math.round(this.targets()[0].val)
                    },
                })
            })
            gsap.from(".stat", { opacity: 0, y: 20, stagger: 0.1, duration: 0.8, ease })
        },
    })

    // --- Quote section ---
    // Parallax bg
    gsap.to(".quote__bg img", {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
            trigger: ".section--quote",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
        },
    })
    // Text reveal
    const quoteTl = gsap.timeline({
        scrollTrigger: { trigger: ".section--quote", start: "top 60%", once: true },
    })
    quoteTl
        .from(".quote__mark",  { opacity: 0, y: 20, duration: 0.8, ease })
        .from(".quote__text",  { opacity: 0, y: 36, duration: 1.1, ease }, "-=0.4")
        .from(".quote__attr",  { opacity: 0, y: 16, duration: 0.7, ease }, "-=0.5")

    // --- Re-Gen section ---
    // Image parallax
    gsap.to(".regen__image-panel img", {
        yPercent: 8,
        ease: "none",
        scrollTrigger: {
            trigger: ".section--regen",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
        },
    })
    // Content slide in from right
    const regenTl = gsap.timeline({
        scrollTrigger: { trigger: ".section--regen", start: "top 62%", once: true },
    })
    regenTl
        .from(".regen__content-panel .section__eyebrow", { opacity: 0, x: 30, duration: 0.7, ease })
        .from(".regen__heading",    { opacity: 0, x: 30, duration: 1.0, ease }, "-=0.4")
        .from(".regen__body",       { opacity: 0, x: 24, duration: 0.9, ease }, "-=0.6")
        .from(".regen__features li",{ opacity: 0, x: 20, stagger: 0.07, duration: 0.6, ease }, "-=0.5")
        .from(".regen__content-panel .btn", { opacity: 0, x: 20, duration: 0.6, ease }, "-=0.4")
    // Image reveal from left
    gsap.from(".regen__image-panel", {
        x: -40,
        opacity: 0,
        duration: 1.2,
        ease,
        scrollTrigger: { trigger: ".section--regen", start: "top 65%", once: true },
    })

    // --- Principles ---
    const principlesTl = gsap.timeline({
        scrollTrigger: { trigger: ".section--principles", start: "top 68%", once: true },
    })
    principlesTl
        .from(".principles__header .section__eyebrow", { opacity: 0, y: 16, duration: 0.7, ease })
        .from(".principles__header .section__heading",  { opacity: 0, y: 28, duration: 0.9, ease }, "-=0.4")
        .from(".principle", { opacity: 0, y: 50, stagger: 0.12, duration: 0.9, ease }, "-=0.5")

    // --- History timeline ---
    // Progress line draw
    gsap.to(".timeline__progress-fill", {
        width: "100%",
        ease: "none",
        scrollTrigger: {
            trigger: ".history__timeline",
            start: "top 55%",
            end: "top 15%",
            scrub: true,
        },
    })
    // Items reveal
    const historyTl = gsap.timeline({
        scrollTrigger: { trigger: ".section--history", start: "top 65%", once: true },
    })
    historyTl
        .from(".history__header .section__eyebrow", { opacity: 0, y: 16, duration: 0.7, ease })
        .from(".history__heading",   { opacity: 0, y: 28, duration: 0.9, ease }, "-=0.4")
        .from(".timeline__item", { opacity: 0, y: 36, stagger: 0.14, duration: 0.9, ease }, "-=0.4")

    // --- CTA section ---
    // Parallax bg
    gsap.to(".cta__bg img", {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
            trigger: ".section--cta",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
        },
    })
    // Content reveal
    const ctaTl = gsap.timeline({
        scrollTrigger: { trigger: ".section--cta", start: "top 62%", once: true },
    })
    ctaTl
        .from(".cta__eyebrow",  { opacity: 0, y: 16, duration: 0.7, ease })
        .from(".cta__heading",  { opacity: 0, y: 32, duration: 1.0, ease }, "-=0.4")
        .from(".cta__body",     { opacity: 0, y: 20, duration: 0.8, ease }, "-=0.5")
        .from(".cta__actions",  { opacity: 0, y: 16, duration: 0.7, ease }, "-=0.4")

    // --- Footer ---
    gsap.from(".footer__top > *", {
        opacity: 0,
        y: 24,
        stagger: 0.1,
        duration: 0.9,
        ease,
        scrollTrigger: { trigger: ".footer", start: "top 88%", once: true },
    })

    // --- Awards section ---
    const awardsTl = gsap.timeline({
        scrollTrigger: { trigger: ".section--awards", start: "top 68%", once: true },
    })
    awardsTl
        .from(".awards__header .section__eyebrow", { opacity: 0, y: 16, duration: 0.7, ease })
        .from(".awards__heading",                   { opacity: 0, y: 36, duration: 1.0, ease }, "-=0.4")
        .from(".awards__cert",                      { opacity: 0, y: 30, stagger: 0.1, duration: 0.8, ease }, "-=0.5")

    // --- Spaces showcase entrance ---
    gsap.from(".section--spaces .spaces__title-l", {
        x: "-30%",
        opacity: 0,
        duration: 1.2,
        ease,
        scrollTrigger: { trigger: ".section--spaces", start: "top 75%", once: true },
    })
    gsap.from(".section--spaces .spaces__slide--active .spaces__title-r", {
        x: "30%",
        opacity: 0,
        duration: 1.2,
        ease,
        scrollTrigger: { trigger: ".section--spaces", start: "top 75%", once: true },
    })
    gsap.from(".spaces__badge, .spaces__controls", {
        opacity: 0,
        y: 16,
        duration: 0.8,
        stagger: 0.15,
        ease,
        scrollTrigger: { trigger: ".section--spaces", start: "top 60%", once: true },
    })

    // --- Nature grid ---
    const natureHeaderTl = gsap.timeline({
        scrollTrigger: { trigger: ".section--nature-grid", start: "top 70%", once: true },
    })
    natureHeaderTl
        .from(".nature-grid__heading", { opacity: 0, y: 48, duration: 1.1, ease })
        .from(".nature-grid__sub",     { opacity: 0, y: 24, duration: 0.9, ease }, "-=0.6")

    gsap.from(".nature-grid__photo--a", {
        opacity: 0, y: 60, duration: 1.0, ease,
        scrollTrigger: { trigger: ".nature-grid__photos", start: "top 72%", once: true },
    })
    gsap.from(".nature-grid__photo--b", {
        opacity: 0, y: 80, duration: 1.0, ease, delay: 0.12,
        scrollTrigger: { trigger: ".nature-grid__photos", start: "top 72%", once: true },
    })
    gsap.from(".nature-grid__photo--c", {
        opacity: 0, x: 40, duration: 1.0, ease, delay: 0.22,
        scrollTrigger: { trigger: ".nature-grid__photos", start: "top 72%", once: true },
    })
    gsap.from(".nature-grid__photo--d", {
        opacity: 0, y: 60, duration: 1.0, ease, delay: 0.32,
        scrollTrigger: { trigger: ".nature-grid__photos", start: "top 72%", once: true },
    })

    // --- More of Kingbridge ---
    gsap.from(".more__left", {
        x: -50, opacity: 0, duration: 1.2, ease,
        scrollTrigger: { trigger: ".section--more", start: "top 65%", once: true },
    })
    gsap.from(".more__card", {
        x: 40, opacity: 0, stagger: 0.18, duration: 1.0, ease,
        scrollTrigger: { trigger: ".section--more", start: "top 62%", once: true },
    })
    gsap.to(".more__left-img img", {
        yPercent: 10, ease: "none",
        scrollTrigger: {
            trigger: ".section--more",
            start: "top bottom", end: "bottom top",
            scrub: true,
        },
    })

    // --- Wordmark ---
    gsap.from(".wordmark__top", {
        opacity: 0, y: 20, duration: 0.9, ease,
        scrollTrigger: { trigger: ".section--wordmark", start: "top 85%", once: true },
    })
    gsap.from(".wordmark__text", {
        opacity: 0, y: 80, duration: 1.3, ease,
        scrollTrigger: { trigger: ".section--wordmark", start: "top 80%", once: true },
    })
}

/* =====================================================================
   INIT
   ===================================================================== */

preloadImages().then(() => {
    document.body.classList.remove("loading")
    initSmoothScrolling()
    initHeroEffect()
    initNavbar()
    initArchReveal()
    initHomeAnimations()
    new StickyGridScroll()
    new SpacesShowcase()
    window._gsap = gsap
    window._ScrollTrigger = ScrollTrigger
})
