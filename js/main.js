import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

// Флаг для отслеживания состояния анимаций
let animationsEnabled = window.innerWidth > 668;
let videoAnimation, cardsAnimation;

function setupAnimations() {
  // Очищаем предыдущие анимации, если они есть
  if (videoAnimation) videoAnimation.kill();
  if (cardsAnimation) cardsAnimation.kill();
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());

  const cards = gsap.utils.toArray('.item');
  const container = document.querySelector('.items__inner');
  const video = document.querySelector('.expand-video');

  if (window.innerWidth <= 668) {
    gsap.set(video, { x: 0, y: 0, scale: 1, opacity: 1 });
    gsap.set(cards, { y: 0, opacity: 1 });
    return;
  }

  // Настройки для широких экранов
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

  // Установка начальных параметров
  gsap.set(cards, {
    y: (i) => i * 75,
    opacity: (i) => i === 0 ? 1 : 0.3,
    transform: "translate3d(0, 0, 0)"
  });

  // Анимация видео
  videoAnimation = gsap.timeline({
    scrollTrigger: {
      trigger: ".screen",
      start: "top top",
      end: "bottom+=1000 top",
      scrub: true,
      pin: true
    }
  }).to(video, {
    x: offsetX,
    y: offsetY,
    scale: finalScale,
    opacity: 0.1,
    ease: "power2.out",
    transformOrigin: "center center",
    onStart: () => video.style.zIndex = -1
  });

  // Анимация карточек
  cardsAnimation = gsap.timeline({
    scrollTrigger: {
      trigger: cards[0],
      start: "bottom bottom",
      end: "+=700",
      scrub: true,
      pin: container,
      anticipatePin: 1
    }
  }).to(cards, {
    y: 0,
    opacity: 1,
    stagger: 0.25,
    ease: "power2.out"
  });
}

// Первоначальная настройка
setupAnimations();

// Обработчик изменения размера с троттлингом
let resizeTimeout;
window.addEventListener('resize', function () {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    const nowWide = window.innerWidth > 668;
    if (nowWide !== animationsEnabled) {
      animationsEnabled = nowWide;
      setupAnimations();
    }
  }, 100);
});