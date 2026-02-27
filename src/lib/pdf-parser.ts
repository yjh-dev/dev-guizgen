// Phase 3: PDF 텍스트 추출 스켈레톤
// pdf-parse v2 패키지를 사용하여 PDF에서 텍스트를 추출합니다.

import { PDFParse } from "pdf-parse";

export async function extractTextFromPdf(
  buffer: Buffer
): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();
  return result.text;
}
