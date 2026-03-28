/**
 * YOU 버튼 — 마우스 위치에 따라 배경/텍스트 색 변경
 * X축: 색상(hue) 0~360
 * Y축: 명도 조절 (어둡게 ↔ 밝게)
 */
(function () {
  const btn = document.querySelector('.you-btn');
  if (!btn) return;

  function applyColor(clientX, clientY) {
    const xRatio = clientX / window.innerWidth;   // 0 ~ 1 (좌→우)
    const yRatio = clientY / window.innerHeight;  // 0 ~ 1 (위→아래)

    // X축 → hue (0~360)
    const hue = Math.round(xRatio * 360);

    // Y축 → lightness (25% 어두움 ~ 75% 밝음)
    const lightness = Math.round(25 + yRatio * 50);

    // 채도 고정
    const saturation = 80;

    const bg = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

    // 텍스트는 명도 50% 기준으로 흰/검 자동 전환
    const textColor = lightness > 50 ? '#0a0a0a' : '#f5f5f5';

    btn.style.background = bg;
    btn.style.color = textColor;
  }

  document.addEventListener('mousemove', function (e) {
    applyColor(e.clientX, e.clientY);
  });

  // 터치 이벤트 지원 (모바일)
  document.addEventListener('touchmove', function (e) {
    const touch = e.touches[0];
    applyColor(touch.clientX, touch.clientY);
  }, { passive: true });

  document.addEventListener('touchstart', function (e) {
    const touch = e.touches[0];
    applyColor(touch.clientX, touch.clientY);
  }, { passive: true });

  // 마우스가 화면 벗어나면 기본값 복원
  document.addEventListener('mouseleave', function () {
    btn.style.background = '';
    btn.style.color = '';
  });
})();
