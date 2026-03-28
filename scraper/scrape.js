/**
 * artpulse.im /artnews 스크래퍼
 * 실행: node scrape.js
 * 결과: ../news-data.json 에 저장
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function scrape() {
  console.log('브라우저 시작 중...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 봇 탐지 우회
  await page.setExtraHTTPHeaders({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36'
  });

  console.log('artpulse.im/artnews 접속 중...');
  await page.goto('https://artpulse.im/artnews', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  // 콘텐츠 로드 대기
  await page.waitForTimeout(3000);

  // 기사 추출 (여러 셀렉터 시도)
  const articles = await page.evaluate(() => {
    const results = [];

    // 일반적인 아티클/카드 패턴 탐색
    const selectors = [
      'article',
      '[class*="article"]',
      '[class*="news"]',
      '[class*="card"]',
      '[class*="post"]',
      'li a',
      'h2 a',
      'h3 a'
    ];

    for (const sel of selectors) {
      const els = document.querySelectorAll(sel);
      if (els.length > 2) {
        els.forEach(el => {
          const title =
            el.querySelector('h1,h2,h3,h4')?.textContent?.trim() ||
            el.textContent?.trim().split('\n')[0] ||
            '';
          const link = el.tagName === 'A' ? el.href : el.querySelector('a')?.href || '';
          const date =
            el.querySelector('time')?.textContent?.trim() ||
            el.querySelector('[class*="date"]')?.textContent?.trim() ||
            '';
          const desc =
            el.querySelector('p')?.textContent?.trim() ||
            '';

          if (title && title.length > 5 && title.length < 300) {
            results.push({ title, link, date, desc });
          }
        });
        if (results.length > 0) break;
      }
    }

    // 중복 제거
    const seen = new Set();
    return results.filter(r => {
      const key = r.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  });

  await browser.close();

  const output = {
    fetchedAt: new Date().toISOString(),
    source: 'https://artpulse.im/artnews',
    articles
  };

  const outPath = path.join(__dirname, '..', 'news-data.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
  console.log(`완료: ${articles.length}개 기사 → news-data.json`);
}

scrape().catch(err => {
  console.error('오류:', err.message);
  process.exit(1);
});
