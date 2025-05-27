import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);


let followAnimation; // Переменная для хранения ссылки на анимацию
let mouseMoveHandler; // Переменная для хранения обработчика mousemove
const followElement = document.querySelector('.screen__icon');

const startFollowIcon = () => {

  // Начальная позиция: 300px сверху и 50% от правого края
  const initialX = window.innerWidth * 0.5; // 50% от ширины экрана (от правого края)
  const initialY = window.innerWidth * 0.15;

  if (!followElement || window.innerWidth < 668) {
    gsap.set(followElement, {
      position: 'absolute',
      x: initialX,
      xPercent: -50,
      y: 20,
      zIndex: 9999,
      pointerEvents: 'none'
    });
    return
  };

  gsap.set(followElement, {
    position: 'fixed',
    x: initialX,
    y: initialY,
    zIndex: 9999,
    pointerEvents: 'none'
  });

  if ('ontouchstart' in window) {
    return;
  }

  let mouseX = initialX;
  let mouseY = initialY;
  let x = initialX;
  let y = initialY;

  // Сохраняем обработчик в переменную для последующего удаления
  mouseMoveHandler = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  };

  window.addEventListener('mousemove', mouseMoveHandler);

  // Создаем и сохраняем анимацию
  followAnimation = gsap.ticker.add(() => {
    const speed = 0.3;
    x += (mouseX - x) * speed;
    y += (mouseY - y) * speed;
    gsap.set(followElement, { x: x, y: y });
  });
};

// Функция для остановки следования
const stopFollowIcon = () => {
  if (mouseMoveHandler) {
    window.removeEventListener('mousemove', mouseMoveHandler);
  }
  if (followAnimation) {
    gsap.ticker.remove(followAnimation);
  }
  followElement.remove();
};

function start() {
  const overlay = document.querySelector(".overlay");
  if (!overlay) {
    console.error("Элемент .overlay не найден!");
    return;
  }

  const addingCounterStyles = (progressCounter) => {
    progressCounter.style.position = "fixed";
    progressCounter.style.bottom = "50px";
    progressCounter.style.right = "50px";
    progressCounter.style.transform = "translateX(-50%)";
    progressCounter.style.color = "black";
    progressCounter.style.fontSize = "clamp(32px, 5vw, 72px)";
    progressCounter.style.fontFamily = "inherit";
    progressCounter.style.zIndex = "1000";
    progressCounter.textContent = "0";
  }

  const progressCounter = document.createElement("div");
  addingCounterStyles(progressCounter)
  document.body.appendChild(progressCounter);

  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 80; i++) {
    const block = document.createElement("div");
    block.classList.add("preload-block");
    block.style.top = `${(i % 20) * 5}%`;
    block.style.left = `${Math.floor(i / 20) * 25}%`;
    fragment.appendChild(block);
  }
  overlay.appendChild(fragment); // Добавляем все блоки за один раз

  const blocks = document.querySelectorAll(".preload-block");
  const group1 = Array.from(blocks).slice(0, 20);
  const group2 = Array.from(blocks).slice(20, 40);
  const group3 = Array.from(blocks).slice(40, 60);
  const group4 = Array.from(blocks).slice(60, 80);

  const blocksTL = gsap.timeline();
  // имитация загрузки
  const loadingTL = gsap.timeline({
    onUpdate: () => {
      const progress = Math.round(loadingTL.progress() * 100);
      progressCounter.textContent = `${progress}`;
    },
    onComplete: () => {
      if (progressCounter && progressCounter.parentNode) {
        progressCounter.parentNode.removeChild(progressCounter);
      }
      // 2. После завершения счётчика - показываем блоки
      gsap.set(blocks, { opacity: 1 });
      startBlocksAnimation();
      innerAnimations();
      startFollowIcon();
    }
  });

  // Имитация загрузки (2 секунды)
  loadingTL.to({}, {
    duration: 2,
    ease: "none"
  });

  function startBlocksAnimation() {
    const preloader = document.querySelector(".preloader");

    const baseDelay = 0;
    const duration = 0.8;
    const stagger = 0.03;
    // Разделение на группы "прелоадера"
    group1.forEach(block => block.style.transformOrigin = "top");
    group2.forEach(block => block.style.transformOrigin = "bottom");
    group3.forEach(block => block.style.transformOrigin = "top");
    group4.forEach(block => block.style.transformOrigin = "bottom");

    return blocksTL
      .to(group1, {
        scaleY: 0,
        duration,
        ease: "power1.inOut",
        delay: baseDelay,
        stagger: { each: stagger, from: "end" },
        onStart: () => {
          preloader.style.background = "transparent";
        },
        onComplete: () => preloader.style.zIndex = "-1"
      })
      .to(group2, {
        scaleY: 0,
        duration,
        ease: "power1.inOut",
        stagger: { each: stagger, from: "start" },
      }, "<")
      .to(group3, {
        scaleY: 0,
        duration,
        ease: "power1.inOut",
        stagger: { each: stagger, from: "end" },
      }, "<")
      .to(group4, {
        scaleY: 0,
        duration,
        ease: "power1.inOut",
        stagger: { each: stagger, from: "start" },
      }, "<")
      .to(".overlay", {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          document.querySelector(".overlay").style.display = "none";
          document.body.classList.remove("blok-scroll");
        }
      });

  }
}

function innerAnimations() {
  const cards = gsap.utils.toArray('.item');
  const container = document.querySelector('.items');
  const video = document.querySelector('.expand-video');
  const heroTitle = document.querySelector('.screen__title');

  let videoAnimation, cardsAnimation, heroTitleAnimation;

  if (!container || !video || !cards.length) {
    console.error("Элементы отсутствуют на странице!");
    return;
  }

  return ScrollTrigger.matchMedia({

    "(max-width: 667px)": () => {
      gsap.set(video, { x: 0, y: 0, scale: 1, opacity: 1 });
      gsap.set(cards, { y: 0, opacity: 1 });

      const itemsInner = container.querySelector('.items__inner');

      const cardHeight = cards[0].offsetHeight;
      const cardsGap = 40;
      const totalCardsHeight = (cards.length * cardHeight) + ((cards.length - 1) * cardsGap);

      // конечная точка анимации
      const animationEndPoint = totalCardsHeight - window.innerHeight + cardHeight;

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: itemsInner,
          pin: true,
          pinSpacing: false,
          scrub: .8,
          start: "top top",
          end: `+=${animationEndPoint}`
        }
      });

      timeline.to(".item", {
        y: (index) => (-cardHeight + cardsGap) * index + 1,
        duration: (index) => 0.8 / (index + 1),
        ease: "power1.out",
        stagger: {
          each: 0.15,
          onStart: () => console.log("Элемент начал анимацию")
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
      console.log('screenHeight', screenHeight)
      console.log('initialHeight', initialHeight)
      console.log(scaleY)
      const finalScale = Math.max(scaleX, scaleY);
      const offsetX = (screenWidth - initialWidth) / 2 - videoRect.left;
      const offsetY = (screenHeight - initialHeight) / 2 - videoRect.top;

      // Установка начальных параметров
      gsap.set(cards, {
        y: (i) => i * 75,
        opacity: (i) => i === 0 ? 1 : 0.3,
        transform: "translate3d(0, 0, 0)",
      });

      // Анимация видео
      videoAnimation = gsap.timeline({
        scrollTrigger: {
          toggleClass: { targets: '.screen', className: "active" },
          // toggleClass: { targets: '.header', className: "fixed" },
          id: 'video',
          trigger: ".screen",
          start: "top-=79.5 top",
          end: "bottom+=1000 top",
          scrub: true,
          pin: true,
          fastScrollEnd: true,
          pinSpacing: true,
          // revertOnUpdate: true,
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
        // opacity: 0.5,
        ease: "power2.out",
        transformOrigin: "center center",
        onStart: () => video.style.zIndex = -1,
        onComplete: () => {
          stopFollowIcon()
        },

        immediateRender: false
      });

      heroTitleAnimation = gsap.timeline({
        scrollTrigger: {
          trigger: heroTitle,
          start: "top-=0 top+=10%",
          scrub: true,
        }
      }).to(heroTitle, {
        y: -250
      })

      // Анимация карточек
      cardsAnimation = gsap.timeline({
        scrollTrigger: {
          trigger: cards[0],
          start: "bottom bottom-=25",
          end: "+=700",
          scrub: true,
          pin: container,
          pinSpacing: true,
          anticipatePin: 0.4,
          immediateRender: false,
          onStart: () => {
            console.log('Анимция старт')
          }
        }
      }).to(cards, {
        y: 0,
        opacity: 1,
        stagger: 0.25,
        ease: "power2.out",
        immediateRender: false
      });

      // // Принудительно обновляем ScrollTrigger после создания анимаций
      // ScrollTrigger.refresh();
    }

  })
}

window.addEventListener('DOMContentLoaded', () => {
  start();
})