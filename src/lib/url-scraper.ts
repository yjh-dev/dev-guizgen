import * as cheerio from "cheerio";

export async function extractTextFromUrl(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; QuizGenBot/1.0; +https://quizgen.ai)",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`페이지를 불러올 수 없습니다. (HTTP ${response.status})`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
    throw new Error("HTML 페이지만 지원됩니다.");
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // 불필요한 요소 제거
  $(
    "script, style, nav, header, footer, aside, iframe, noscript, " +
      "svg, form, button, input, select, [role='navigation'], " +
      "[role='banner'], [role='contentinfo'], .sidebar, .menu, .nav, " +
      ".advertisement, .ad, .ads, .cookie, .popup"
  ).remove();

  // 주요 콘텐츠 영역 우선 탐색
  const selectors = [
    "article",
    '[role="main"]',
    "main",
    ".post-content",
    ".entry-content",
    ".article-content",
    ".content",
    "#content",
    ".post",
    ".entry",
  ];

  let text = "";
  for (const selector of selectors) {
    const el = $(selector);
    if (el.length > 0) {
      text = el.text();
      break;
    }
  }

  // 주요 영역을 못 찾으면 body 전체
  if (!text.trim()) {
    text = $("body").text();
  }

  // 정리: 연속 공백/줄바꿈 축소
  text = text
    .replace(/[\t ]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\s+$/gm, "")
    .trim();

  if (!text) {
    throw new Error("페이지에서 텍스트를 추출할 수 없습니다.");
  }

  return text;
}
