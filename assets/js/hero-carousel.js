// Hero Carousel JavaScript
document.addEventListener('DOMContentLoaded', function() {
  const carousel = document.querySelector('.hero-carousel');
  if (!carousel) return;

  const slides = carousel.querySelectorAll('.carousel-slide');
  const indicators = carousel.querySelectorAll('.carousel-indicator');
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');
  
  let currentSlide = 0;
  let slideInterval;

  // Show specific slide
  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    
    indicators.forEach((indicator, i) => {
      indicator.classList.toggle('active', i === index);
    });
    
    currentSlide = index;
  }

  // Next slide
  function nextSlide() {
    const next = (currentSlide + 1) % slides.length;
    showSlide(next);
  }

  // Previous slide
  function prevSlide() {
    const prev = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(prev);
  }

  // Start auto-play
  function startAutoPlay() {
    slideInterval = setInterval(nextSlide, 5000);
  }

  // Stop auto-play
  function stopAutoPlay() {
    clearInterval(slideInterval);
  }

  // Event listeners
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);

  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => showSlide(index));
  });

  // Pause on hover
  carousel.addEventListener('mouseenter', stopAutoPlay);
  carousel.addEventListener('mouseleave', startAutoPlay);

  // Initialize
  showSlide(0);
  startAutoPlay();
});
