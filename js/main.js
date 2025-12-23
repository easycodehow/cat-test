// 메인 슬라이더 기능
document.addEventListener('DOMContentLoaded', function() {
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.querySelector('.slider-btn.prev');
  const nextBtn = document.querySelector('.slider-btn.next');
  const currentIndicator = document.querySelector('.slider-indicators .current');
  const totalIndicator = document.querySelector('.slider-indicators .total');

  let currentSlide = 0;
  const totalSlides = slides.length;

  // 총 슬라이드 수 표시
  if (totalIndicator) {
    totalIndicator.textContent = totalSlides;
  }

  // 슬라이드 전환 함수
  function showSlide(index) {
    // 인덱스 범위 체크
    if (index >= totalSlides) {
      currentSlide = 0;
    } else if (index < 0) {
      currentSlide = totalSlides - 1;
    } else {
      currentSlide = index;
    }

    // 모든 슬라이드에서 active 클래스 제거
    slides.forEach(slide => {
      slide.classList.remove('active');
    });

    // 현재 슬라이드에 active 클래스 추가
    slides[currentSlide].classList.add('active');

    // 인디케이터 업데이트
    if (currentIndicator) {
      currentIndicator.textContent = currentSlide + 1;
    }
  }

  // 다음 슬라이드
  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  // 이전 슬라이드
  function prevSlide() {
    showSlide(currentSlide - 1);
  }

  // 버튼 이벤트 리스너
  if (nextBtn) {
    nextBtn.addEventListener('click', nextSlide);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', prevSlide);
  }

  // 자동 슬라이드 (5초마다)
  let autoSlideInterval = setInterval(nextSlide, 5000);

  // 슬라이더 호버 시 자동 슬라이드 정지
  const slider = document.querySelector('.slider');
  if (slider) {
    slider.addEventListener('mouseenter', () => {
      clearInterval(autoSlideInterval);
    });

    slider.addEventListener('mouseleave', () => {
      autoSlideInterval = setInterval(nextSlide, 5000);
    });
  }

  // 초기 슬라이드 표시
  showSlide(0);

  // 카테고리 탭 메뉴 기능
  const tabs = document.querySelectorAll('.category-tabs .tab');
  const contents = document.querySelectorAll('.category-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const targetTab = this.getAttribute('data-tab');

      // 모든 탭에서 active 클래스 제거
      tabs.forEach(t => t.classList.remove('active'));

      // 클릭된 탭에 active 클래스 추가
      this.classList.add('active');

      // 모든 콘텐츠 숨기기
      contents.forEach(content => {
        content.classList.remove('active');
      });

      // 선택된 탭의 콘텐츠 보이기
      const targetContent = document.querySelector(`[data-content="${targetTab}"]`);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });

  // 랭킹 어코디언 기능 (호버)
  const rankingItems = document.querySelectorAll('.ranking-item');
  const rankingList = document.querySelector('.ranking-list');

  rankingItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
      // 모든 항목에서 active 클래스 제거
      rankingItems.forEach(i => i.classList.remove('active'));

      // 호버된 항목에 active 클래스 추가
      this.classList.add('active');
    });
  });

  // 마우스가 랭킹 리스트를 벗어나면 첫 번째 항목으로 복귀
  if (rankingList) {
    rankingList.addEventListener('mouseleave', function() {
      // 모든 항목에서 active 클래스 제거
      rankingItems.forEach(i => i.classList.remove('active'));

      // 첫 번째 항목에 active 클래스 추가
      if (rankingItems.length > 0) {
        rankingItems[0].classList.add('active');
      }
    });
  }
});
