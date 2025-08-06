(() => {
  const slider = document.getElementById('slider');
  const slidesContainer = document.getElementById('slides');
  const slides = [...slidesContainer.children];
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const pausePlayBtn = document.getElementById('pausePlay');
  const indicatorsContainer = document.getElementById('indicators');

  let currentIndex = 0;
  const slideCount = slides.length;
  let intervalId = null;
  const intervalTime = 4000;
  let isPlaying = true;

  // Ініціалізація індикаторів
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'indicator' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => {
      goToSlide(i);
      resetInterval();
    });
    indicatorsContainer.appendChild(dot);
  });
  const indicators = [...indicatorsContainer.children];

  // Відображення слайда
  function updateSlide() {
    slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
    indicators.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
  }

  function goToSlide(index) {
    currentIndex = (index + slideCount) % slideCount;
    updateSlide();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }
  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  // Автоматичне прокручування
  function startInterval() {
    if (intervalId) return;
    intervalId = setInterval(() => {
      nextSlide();
    }, intervalTime);
    isPlaying = true;
    updatePausePlayBtn();
  }
  function stopInterval() {
    clearInterval(intervalId);
    intervalId = null;
    isPlaying = false;
    updatePausePlayBtn();
  }
  function resetInterval() {
    stopInterval();
    if (isPlaying) startInterval();
  }

  function updatePausePlayBtn() {
    pausePlayBtn.innerHTML = isPlaying ? '&#10073;&#10073;' : '&#9658;';
    pausePlayBtn.setAttribute('aria-label', isPlaying ? 'Пауза' : 'Відновити');
  }

  // Події кнопок
  prevBtn.addEventListener('click', () => {
    prevSlide();
    resetInterval();
  });
  nextBtn.addEventListener('click', () => {
    nextSlide();
    resetInterval();
  });

  pausePlayBtn.addEventListener('click', () => {
    if (isPlaying) {
      stopInterval();
    } else {
      startInterval();
    }
  });

  // Клавіатурне управління
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') {
      nextSlide();
      resetInterval();
    } else if (e.key === 'ArrowLeft') {
      prevSlide();
      resetInterval();
    } else if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault(); // Запобігаємо скролу сторінки
      if (isPlaying) {
        stopInterval();
      } else {
        startInterval();
      }
    }
  });

  // ВИПРАВЛЕНІ тач-події
  let startX = 0;
  let startY = 0;
  let isDragging = false;
  let moved = false;

  // Універсальні функції для отримання координат
  function getClientX(e) {
    return e.touches ? e.touches[0].clientX : e.clientX;
  }

  function getClientY(e) {
    return e.touches ? e.touches[0].clientY : e.clientY;
  }

  function handleStart(e) {
    isDragging = true;
    moved = false;
    startX = getClientX(e);
    startY = getClientY(e);

    // Зупиняємо автоматичне прокручування
    if (isPlaying) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function handleMove(e) {
    if (!isDragging) return;

    const currentX = getClientX(e);
    const currentY = getClientY(e);
    const diffX = Math.abs(currentX - startX);
    const diffY = Math.abs(currentY - startY);

    // Якщо горизонтальний рух більший - це свайп
    if (diffX > diffY && diffX > 10) {
      moved = true;
      e.preventDefault(); // Блокуємо скрол сторінки
    }
  }

  function handleEnd(e) {
    if (!isDragging) return;

    const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const diffX = endX - startX;
    const absDiffX = Math.abs(diffX);

    // Мінімальна відстань для свайпу - 30px
    if (moved && absDiffX > 30) {
      if (diffX > 0) {
        prevSlide(); // Свайп вправо → попередній
      } else {
        nextSlide(); // Свайп вліво → наступний
      }
    }

    isDragging = false;
    moved = false;

    // Відновлюємо автоматичне прокручування
    if (isPlaying) {
      intervalId = setInterval(() => {
        nextSlide();
      }, intervalTime);
    }
  }

  // Додаємо події до слайдера (не тільки до контейнера)
  slider.addEventListener('touchstart', handleStart, { passive: false });
  slider.addEventListener('touchmove', handleMove, { passive: false });
  slider.addEventListener('touchend', handleEnd, { passive: true });

  // Події для миші
  slider.addEventListener('mousedown', handleStart);
  slider.addEventListener('mousemove', handleMove);
  slider.addEventListener('mouseup', handleEnd);
  slider.addEventListener('mouseleave', handleEnd);

  // Запуск
  updateSlide();
  startInterval();

})();
