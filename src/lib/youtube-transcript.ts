interface CaptionTrack {
  baseUrl: string;
  languageCode: string;
  kind?: string;
  name?: { simpleText?: string };
}

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function extractTranscript(url: string): Promise<string> {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error("올바른 YouTube URL이 아닙니다.");
  }

  // YouTube 페이지에서 자막 트랙 정보 추출
  const pageResponse = await fetch(
    `https://www.youtube.com/watch?v=${videoId}`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
      },
      signal: AbortSignal.timeout(15000),
    }
  );

  if (!pageResponse.ok) {
    throw new Error("YouTube 페이지를 불러올 수 없습니다.");
  }

  const pageHtml = await pageResponse.text();

  // ytInitialPlayerResponse에서 captionTracks 추출
  const playerResponseMatch = pageHtml.match(
    /ytInitialPlayerResponse\s*=\s*({.+?})\s*;/
  );
  if (!playerResponseMatch) {
    throw new Error("영상 정보를 가져올 수 없습니다. 비공개 영상일 수 있습니다.");
  }

  let playerResponse;
  try {
    playerResponse = JSON.parse(playerResponseMatch[1]);
  } catch {
    throw new Error("영상 정보를 파싱할 수 없습니다.");
  }

  const captionTracks: CaptionTrack[] =
    playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

  if (!captionTracks || captionTracks.length === 0) {
    throw new Error(
      "이 영상에 자막이 없습니다. 자막이 있는 영상을 사용해주세요."
    );
  }

  // 자막 우선순위: 수동 한국어 > 자동 한국어 > 수동 영어 > 자동 영어 > 첫 번째
  const priority = [
    captionTracks.find(
      (t) => t.languageCode === "ko" && t.kind !== "asr"
    ),
    captionTracks.find((t) => t.languageCode === "ko"),
    captionTracks.find(
      (t) => t.languageCode === "en" && t.kind !== "asr"
    ),
    captionTracks.find((t) => t.languageCode === "en"),
    captionTracks[0],
  ];

  const selectedTrack = priority.find(Boolean);
  if (!selectedTrack) {
    throw new Error("사용 가능한 자막 트랙이 없습니다.");
  }

  // 자막 XML 가져오기
  const captionResponse = await fetch(selectedTrack.baseUrl, {
    signal: AbortSignal.timeout(10000),
  });

  if (!captionResponse.ok) {
    throw new Error("자막을 불러올 수 없습니다.");
  }

  const captionXml = await captionResponse.text();

  // XML에서 텍스트 추출
  const textSegments: string[] = [];
  const textRegex = /<text[^>]*>([\s\S]*?)<\/text>/g;
  let match;

  while ((match = textRegex.exec(captionXml)) !== null) {
    const decoded = match[1]
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n/g, " ")
      .trim();
    if (decoded) {
      textSegments.push(decoded);
    }
  }

  if (textSegments.length === 0) {
    throw new Error("자막에서 텍스트를 추출할 수 없습니다.");
  }

  return textSegments.join(" ");
}
