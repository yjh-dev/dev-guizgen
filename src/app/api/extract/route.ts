export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractTextFromPdf } from "@/lib/pdf-parser";
import { extractTextFromUrl } from "@/lib/url-scraper";
import { extractTextFromImage } from "@/lib/image-ocr";
import { extractTranscript } from "@/lib/youtube-transcript";
import {
  PDF_MAX_SIZE_BYTES,
  IMAGE_MAX_SIZE_BYTES,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_PDF_TYPES,
  SOURCE_TEXT_MAX_LENGTH,
} from "@/lib/constants";

interface ExtractResult {
  text: string;
  source_type: string;
  char_count: number;
  truncated: boolean;
}

interface ExtractError {
  error: string;
}

export async function POST(
  request: Request
): Promise<NextResponse<ExtractResult | ExtractError>> {
  try {
    // 인증 확인
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const sourceType = formData.get("source_type") as string;

    if (!sourceType) {
      return NextResponse.json(
        { error: "source_type이 필요합니다." },
        { status: 400 }
      );
    }

    let extractedText: string;

    switch (sourceType) {
      case "pdf": {
        const file = formData.get("file") as File | null;
        if (!file) {
          return NextResponse.json(
            { error: "PDF 파일을 선택해주세요." },
            { status: 400 }
          );
        }
        if (!ALLOWED_PDF_TYPES.includes(file.type)) {
          return NextResponse.json(
            { error: "PDF 파일만 업로드 가능합니다." },
            { status: 400 }
          );
        }
        if (file.size > PDF_MAX_SIZE_BYTES) {
          return NextResponse.json(
            { error: `PDF 파일은 최대 10MB까지 업로드 가능합니다.` },
            { status: 400 }
          );
        }
        const pdfBuffer = Buffer.from(await file.arrayBuffer());
        extractedText = await extractTextFromPdf(pdfBuffer);
        break;
      }

      case "url": {
        const url = formData.get("url") as string;
        if (!url) {
          return NextResponse.json(
            { error: "URL을 입력해주세요." },
            { status: 400 }
          );
        }
        try {
          new URL(url);
        } catch {
          return NextResponse.json(
            { error: "올바른 URL 형식이 아닙니다." },
            { status: 400 }
          );
        }
        extractedText = await extractTextFromUrl(url);
        break;
      }

      case "image": {
        const file = formData.get("file") as File | null;
        if (!file) {
          return NextResponse.json(
            { error: "이미지 파일을 선택해주세요." },
            { status: 400 }
          );
        }
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          return NextResponse.json(
            { error: "PNG, JPG, WebP, GIF 형식만 지원됩니다." },
            { status: 400 }
          );
        }
        if (file.size > IMAGE_MAX_SIZE_BYTES) {
          return NextResponse.json(
            { error: `이미지는 최대 5MB까지 업로드 가능합니다.` },
            { status: 400 }
          );
        }
        const imageBuffer = Buffer.from(await file.arrayBuffer());
        extractedText = await extractTextFromImage(imageBuffer, file.type);
        break;
      }

      case "youtube": {
        const url = formData.get("url") as string;
        if (!url) {
          return NextResponse.json(
            { error: "YouTube URL을 입력해주세요." },
            { status: 400 }
          );
        }
        extractedText = await extractTranscript(url);
        break;
      }

      default:
        return NextResponse.json(
          { error: "지원하지 않는 소스 유형입니다." },
          { status: 400 }
        );
    }

    // 텍스트 길이 제한
    let truncated = false;
    if (extractedText.length > SOURCE_TEXT_MAX_LENGTH) {
      extractedText = extractedText.slice(0, SOURCE_TEXT_MAX_LENGTH);
      truncated = true;
    }

    return NextResponse.json({
      text: extractedText,
      source_type: sourceType,
      char_count: extractedText.length,
      truncated,
    });
  } catch (error) {
    console.error("Extract error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "텍스트 추출 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
