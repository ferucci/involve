import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

function preloaderAnimation() {
  const overlay = document.querySelector(".overlay");
  for (let i = 0; i < 80; i++) {
    const block = document.createElement("div");
    block.classList.add("preload-block");
    block.style.top = `${(i % 20) * 5}%`;
    block.style.left = `${Math.floor(i / 20) * 25}%`;
    overlay.appendChild(block);
  }

  // Разбиваем на группы по 20
  const blocks = document.querySelectorAll(".preload-block");

  const group1 = Array.from(blocks).slice(0, 20);   // слева снизу вверх
  const group2 = Array.from(blocks).slice(20, 40);  // слева сверху вниз
  const group3 = Array.from(blocks).slice(40, 60);  // справа снизу вверх
  const group4 = Array.from(blocks).slice(60, 80);  // справа сверху вниз

  // Общие параметры
  const baseDelay = 1;
  const duration = 0.8;
  const stagger = 0.03;

  // Группа 1 — снизу вверх
  group1.forEach(block => block.style.transformOrigin = "top");
  gsap.to(group1, {
    scaleY: 0,
    duration,
    ease: "power1.inOut",
    delay: baseDelay,
    stagger: { each: stagger, from: "end" }
  });

  // Группа 2 — сверху вниз
  group2.forEach(block => block.style.transformOrigin = "bottom");
  gsap.to(group2, {
    scaleY: 0,
    duration,
    ease: "power1.inOut",
    delay: baseDelay,
    stagger: { each: stagger, from: "start" }
  });

  // Группа 3 — снизу вверх
  group3.forEach(block => block.style.transformOrigin = "top");
  gsap.to(group3, {
    scaleY: 0,
    duration,
    ease: "power1.inOut",
    delay: baseDelay,
    stagger: { each: stagger, from: "end" }
  });

  // Группа 4 — сверху вниз
  group4.forEach(block => block.style.transformOrigin = "bottom");
  gsap.to(group4, {
    scaleY: 0,
    duration,
    ease: "power1.inOut",
    delay: baseDelay,
    stagger: { each: stagger, from: "start" }
  });

  gsap.to(".overlay", {
    opacity: 0,
    delay: baseDelay + duration + 0.6, // немного позже окончания анимации
    duration: 0.5,
    onComplete: () => {
      document.querySelector(".overlay").style.display = "none";
      document.body.classList.remove("blok-scroll");
    }
  });
}

function setupAnimations() {
  const cards = gsap.utils.toArray('.item');
  const container = document.querySelector('.items__inner');
  const video = document.querySelector('.expand-video');
  let videoAnimation, cardsAnimation;

  if (!container || !video || !cards.length) {
    console.error("Элементы не найдены!");
    return;
  }

  return ScrollTrigger.matchMedia({

    "(max-width: 667px)": () => {
      gsap.set(video, { x: 0, y: 0, scale: 1, opacity: 1 });
      gsap.set(cards, { y: 0, width: "100%", maxWidth: "100%", opacity: 1 });

      const cardHeight = cards[0].offsetHeight;

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          pin: true,
          pinSpacing: true,
          scrub: 1,
          start: "top top",
          end: "bottom bottom"
        }
      });

      timeline.from(".item", {
        y: (index) => (-cardHeight + 40) * index + 1,
        duration: (index) => 0.8 / (index + 1),
        ease: "none",
        stagger: {
          each: 0.2,
          from: "end"
        },
      });
    },

    "(min-width: 668px)": () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const videoRect = video.getBoundingClientRect();
      const initialWidth = videoRect.width;
      const initialHeight = videoRect.height;

      const scaleX = screenWidth / initialWidth;
      const scaleY = screenHeight / initialHeight;
      const finalScale = Math.max(scaleX, scaleY);
      const offsetX = (screenWidth - initialWidth) / 2 - videoRect.left;
      const offsetY = (screenHeight - initialHeight) / 2 - videoRect.top;

      ScrollTrigger.refresh(); // ← обновляю ScrollTrigger перед настройкой

      // Установка начальных параметров
      gsap.set(cards, {
        y: (i) => i * 75,
        opacity: (i) => i === 0 ? 1 : 0.3,
        transform: "translate3d(0, 0, 0)"
      });

      // Анимация видео
      videoAnimation = gsap.timeline({
        scrollTrigger: {
          toggleClass: { targets: '.screen', className: "active" },
          id: 'video',
          trigger: ".screen",
          start: "top+=1 top",
          end: "bottom+=1000 top",
          scrub: true,
          pin: true,
          fastScrollEnd: true,
          pinSpacing: true,
          revertOnUpdate: true,
          immediateRender: false, // Важно: отключаем немедленный рендеринг
          onUpdate: self => {
            if (self.progress === 0 && self.direction === -1) {
              // Принудительно устанавливаем начальное состояние при достижении верха
              gsap.set(video, { x: 0, y: 0, scale: 1, opacity: 1 });
            }
          }
        }
      }).to(video, {
        x: offsetX,
        y: offsetY,
        scale: finalScale,
        opacity: 0.1,
        ease: "power2.out",
        transformOrigin: "center center",
        onStart: () => video.style.zIndex = -1,
        immediateRender: false // Важно: отключаем немедленный рендеринг для анимации
      });

      // Анимация карточек
      cardsAnimation = gsap.timeline({
        scrollTrigger: {
          trigger: cards[0],
          start: "bottom bottom",
          end: "+=700",
          scrub: true,
          pin: container,
          // pinSpacing: false,
          anticipatePin: 1,
          immediateRender: false
        }
      }).to(cards, {
        y: 0,
        opacity: 1,
        stagger: 0.25,
        ease: "power2.out",
        immediateRender: false
      });

      // Принудительно обновляем ScrollTrigger после создания анимаций
      ScrollTrigger.refresh();
    }

  })
}
window.addEventListener('load', () => {
  // preloaderAnimation();
  document.body.classList.remove("blok-scroll");
})
window.addEventListener('DOMContentLoaded', function () {
  setupAnimations();
});