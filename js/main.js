import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const cards = gsap.utils.toArray('.item');
const container = document.querySelector('.items');
const video = document.querySelector('.expand-video');
const bannerSection = document.querySelector('.banner');
let videoAnimation, cardsAnimation;

function setupAnimations() {
  return ScrollTrigger.matchMedia({

    "(max-width: 667px)": () => {

      gsap.set(video, { x: 0, y: 0, scale: 1, opacity: 1 });
      gsap.set(cards, { y: 0, width: "100%", maxWidth: "100%", opacity: 1 });

      const cardHeight = cards[0].offsetHeight;
      const cardsTotalHeight = container.offsetHeight;

      cards.forEach((card, index) => {

        // Для последней карточки end будет 'top top', для остальных - +=cardHeight
        const endValue = index === cards.length - 1 ? 'top top' : `+=${cardHeight}`;

        ScrollTrigger.create({
          trigger: card,
          start: 'top+=10 top',
          end: endValue,
          pin: true,
          pinSpacing: false, // не создаёт лишней прокрутки
          markers: true,
          scrub: false,
          // можно добавить onUpdate для доп. логики, если нужно
        });
        // z-index: последняя карточка выше всех
        card.style.zIndex = index;
      });
      return;

      // if (window.innerWidth <= 668) {
      //   gsap.set(video, { x: 0, y: 0, scale: 1, opacity: 1 });

      //   const cardHeight = cards[0].offsetHeight;
      //   const cardsTotalHeight = cards.reduce((acc, card) => acc + card.offsetHeight, 0);
      //   // Сохраняем изначальные позиции
      //   const originalPositions = cards.map((card, index) => ({
      //     y: index * 60,
      //   }));

      //   // Инициализируем позиционирование
      //   cards.forEach((card, index) => {
      //     gsap.set(card, {
      //       position: 'absolute',
      //       top: 0,
      //       y: originalPositions[index].y,
      //       zIndex: index,
      //       // opacity: index === 0 ? 1 : 0.3 // Первая карточка полностью видима
      //     });
      //   });

      //   ScrollTrigger.create({
      //     trigger: '.items__inner',
      //     start: 'top top',
      //     end: `+=${cardsTotalHeight}`,
      //     pin: true,
      //     markers: true,
      //     scrub: 1,

      //     onUpdate: (self) => {
      //       const progress = self.progress;
      //       const activeIndex = Math.floor(progress * cards.length);

      //       cards.forEach((card, index) => {
      //         if (index <= activeIndex) {
      //           // Карточки выше активной возвращаются на место
      //           const returnProgress = Math.min(1, (progress - (index / cards.length)) * cards.length);
      //           gsap.to(card, {
      //             y: originalPositions[index].y * (1 - returnProgress),
      //             opacity: 1 - 0.5 * returnProgress,
      //             duration: 0.3
      //           });
      //         } else {
      //           // Обычное поведение для следующих карточек
      //           gsap.to(card, {
      //             y: (index - activeIndex) * 60,
      //             // opacity: 0,
      //             duration: 0.3
      //           });
      //         }
      //       });
      //     }
      //   });
      //   return
      // }
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

      ScrollTrigger.refresh(); // обновляю ScrollTrigger перед настройкой

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

// Первоначальная настройка
// Инициализация после полной загрузки страницы
window.addEventListener('DOMContentLoaded', function () {
  setupAnimations();

  // Дополнительное обновление после короткой задержки
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 300);
});