(() => {
  const slider = document.getElementById('slider');
  const slidesContainer = document.getElementById('slides');
  const slides = [...slidesContainer.children];
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const pausePlayBtn = document.getElementById('pausePlay');
  const indicatorsContainer = document.getElementById('indicators');
  const progressFill = document.getElementById('progressFill');
  const currentSlideDisplay = document.getElementById('currentSlide');
  const totalSlidesDisplay = document.getElementById('totalSlides');

  let currentIndex = 0;
  const slideCount = slides.length;
  let intervalId = null;
  let progressInterval = null;
  const intervalTime = 5000;
  let isPlaying = true;
  let isTransitioning = false;

  totalSlidesDisplay.textContent = slideCount;

  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'indicator' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => {
      if (!isTransitioning) {
        goToSlide(i);
        resetInterval();
      }
    });
    indicatorsContainer.appendChild(dot);
  });
  const indicators = [...indicatorsContainer.children];

  function updateSlide() {
    if (isTransitioning) return;
    isTransitioning = true;

    slides.forEach(slide => slide.classList.remove('active'));

    slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;

    setTimeout(() => {
      slides[currentIndex].classList.add('active');
    }, 100);

    indicators.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });

    currentSlideDisplay.textContent = currentIndex + 1;

    setTimeout(() => {
      isTransitioning = false;
    }, 800);
  }

  function goToSlide(index) {
    if (isTransitioning) return;
    currentIndex = (index + slideCount) % slideCount;
    updateSlide();
  }

  function nextSlide() {
    if (isTransitioning) return;
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    if (isTransitioning) return;
    goToSlide(currentIndex - 1);
  }

  // Прогрес-бар
  function startProgress() {
    let progress = 0;
    const increment = 100 / (intervalTime / 50);

    progressInterval = setInterval(() => {
      progress += increment;
      progressFill.style.width = `${Math.min(progress, 100)}%`;

      if (progress >= 100) {
        progress = 0;
      }
    }, 50);
  }

  function stopProgress() {
    clearInterval(progressInterval);
    progressInterval = null;
    progressFill.style.width = '0%';
  }

  function resetProgress() {
    stopProgress();
    if (isPlaying) startProgress();
  }

  function startInterval() {
    if (intervalId) return;
    intervalId = setInterval(() => {
      if (!isTransitioning) {
        nextSlide();
      }
    }, intervalTime);
    isPlaying = true;
    updatePausePlayBtn();
    startProgress();
  }

  function stopInterval() {
    clearInterval(intervalId);
    intervalId = null;
    isPlaying = false;
    updatePausePlayBtn();
    stopProgress();
  }

  function resetInterval() {
    if (isPlaying) {
      stopInterval();
      startInterval();
    }
  }

  function updatePausePlayBtn() {
    const icon = pausePlayBtn.querySelector('.pause-icon');
    icon.textContent = isPlaying ? '⏸' : '▶';
    pausePlayBtn.setAttribute('aria-label', isPlaying ? 'Пауза' : 'Відновити');
  }

  function addRippleEffect(button, event) {
    const ripple = button.querySelector('.btn-ripple');
    if (ripple) {
      ripple.style.width = '0';
      ripple.style.height = '0';

      setTimeout(() => {
        ripple.style.width = '80px';
        ripple.style.height = '80px';
      }, 10);

      setTimeout(() => {
        ripple.style.width = '0';
        ripple.style.height = '0';
      }, 400);
    }
  }

  prevBtn.addEventListener('click', (e) => {
    if (!isTransitioning) {
      addRippleEffect(prevBtn, e);
      prevSlide();
      resetInterval();
    }
  });

  nextBtn.addEventListener('click', (e) => {
    if (!isTransitioning) {
      addRippleEffect(nextBtn, e);
      nextSlide();
      resetInterval();
    }
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
    if (isTransitioning) return;

    switch (e.key) {
      case 'ArrowRight':
        nextSlide();
        resetInterval();
        break;
      case 'ArrowLeft':
        prevSlide();
        resetInterval();
        break;
      case ' ':
        e.preventDefault();
        if (isPlaying) stopInterval();
        else startInterval();
        break;
    }
  });

  let startX = 0;
  let startY = 0;
  let isDragging = false;

  function onTouchStart(e) {
    if (isTransitioning) return;
    isDragging = true;
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;

    if (isPlaying) stopInterval();
  }

  function onTouchMove(e) {
    if (!isDragging || isTransitioning) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - startX);
    const deltaY = Math.abs(touch.clientY - startY);

    if (deltaX > deltaY && deltaX > 10) {
      e.preventDefault();
    }
  }

  function onTouchEnd(e) {
    if (!isDragging || isTransitioning) return;

    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const diff = endX - startX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }

    isDragging = false;

    if (isPlaying) {
      setTimeout(startInterval, 500);
    }
  }

  slidesContainer.addEventListener('touchstart', onTouchStart, { passive: false });
  slidesContainer.addEventListener('touchmove', onTouchMove, { passive: false });
  slidesContainer.addEventListener('touchend', onTouchEnd, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopInterval();
    } else if (isPlaying) {
      startInterval();
    }
  });

  slides[0].classList.add('active');
  updateSlide();
  startInterval();

})();
