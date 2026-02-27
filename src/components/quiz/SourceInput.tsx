"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  SOURCE_TEXT_MAX_LENGTH,
  SOURCE_TEXT_MIN_LENGTH,
  PDF_MAX_SIZE_MB,
  IMAGE_MAX_SIZE_MB,
} from "@/lib/constants";
import {
  Type,
  FileText,
  Globe,
  ImageIcon,
  Youtube,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import FileUpload from "./FileUpload";
import type { SourceType } from "@/types/quiz";

interface SourceTab {
  type: SourceType;
  label: string;
  icon: React.ReactNode;
}

const SOURCE_TABS: SourceTab[] = [
  { type: "text", label: "텍스트", icon: <Type className="h-4 w-4" /> },
  { type: "pdf", label: "PDF", icon: <FileText className="h-4 w-4" /> },
  { type: "url", label: "URL", icon: <Globe className="h-4 w-4" /> },
  { type: "image", label: "이미지", icon: <ImageIcon className="h-4 w-4" /> },
  { type: "youtube", label: "YouTube", icon: <Youtube className="h-4 w-4" /> },
];

interface SourceInputProps {
  sourceType: SourceType;
  sourceText: string;
  onSourceTypeChange: (type: SourceType) => void;
  onSourceTextChange: (text: string) => void;
  error?: string;
}

export default function SourceInput({
  sourceType,
  sourceText,
  onSourceTypeChange,
  onSourceTextChange,
  error,
}: SourceInputProps) {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractSuccess, setExtractSuccess] = useState<string | null>(null);

  function getTextLengthColor() {
    const len = sourceText.trim().length;
    if (len > 0 && len < SOURCE_TEXT_MIN_LENGTH) return "text-destructive";
    if (len >= SOURCE_TEXT_MAX_LENGTH * 0.9) return "text-orange-500";
    return "text-muted-foreground";
  }

  function handleTabChange(type: SourceType) {
    onSourceTypeChange(type);
    setFile(null);
    setUrl("");
    setExtractError(null);
    setExtractSuccess(null);
  }

  async function handleExtract() {
    setIsExtracting(true);
    setExtractError(null);
    setExtractSuccess(null);

    try {
      const formData = new FormData();
      formData.append("source_type", sourceType);

      if (sourceType === "pdf" || sourceType === "image") {
        if (!file) {
          setExtractError("파일을 선택해주세요.");
          setIsExtracting(false);
          return;
        }
        formData.append("file", file);
      } else if (sourceType === "url" || sourceType === "youtube") {
        if (!url.trim()) {
          setExtractError("URL을 입력해주세요.");
          setIsExtracting(false);
          return;
        }
        formData.append("url", url.trim());
      }

      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setExtractError(data.error || "텍스트 추출에 실패했습니다.");
        return;
      }

      onSourceTextChange(data.text);
      const msg = `${data.char_count.toLocaleString()}자 추출 완료`;
      setExtractSuccess(data.truncated ? `${msg} (최대 길이로 잘림)` : msg);
    } catch {
      setExtractError("텍스트 추출 중 오류가 발생했습니다.");
    } finally {
      setIsExtracting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>학습 자료</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 탭 */}
        <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
          {SOURCE_TABS.map((tab) => (
            <button
              key={tab.type}
              type="button"
              onClick={() => handleTabChange(tab.type)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                sourceType === tab.type
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* 소스별 입력 */}
        {sourceType === "text" && (
          <div className="space-y-2">
            <Label htmlFor="source">학습 텍스트</Label>
            <Textarea
              id="source"
              placeholder="퀴즈를 생성할 텍스트를 입력하세요... (최소 50자)"
              value={sourceText}
              onChange={(e) => onSourceTextChange(e.target.value)}
              maxLength={SOURCE_TEXT_MAX_LENGTH}
              rows={8}
            />
            <p className={`text-xs ${getTextLengthColor()}`}>
              {sourceText.length.toLocaleString()} /{" "}
              {SOURCE_TEXT_MAX_LENGTH.toLocaleString()}자
              {sourceText.trim().length > 0 &&
                sourceText.trim().length < SOURCE_TEXT_MIN_LENGTH &&
                ` (최소 ${SOURCE_TEXT_MIN_LENGTH}자)`}
            </p>
          </div>
        )}

        {sourceType === "pdf" && (
          <div className="space-y-4">
            <FileUpload
              accept=".pdf"
              maxSizeMB={PDF_MAX_SIZE_MB}
              file={file}
              onFileChange={setFile}
              icon="pdf"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleExtract}
              disabled={!file || isExtracting}
              className="w-full"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  텍스트 추출 중...
                </>
              ) : (
                "텍스트 추출"
              )}
            </Button>
          </div>
        )}

        {sourceType === "url" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url-input">웹페이지 URL</Label>
              <Input
                id="url-input"
                type="url"
                placeholder="https://example.com/article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleExtract}
              disabled={!url.trim() || isExtracting}
              className="w-full"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  본문 추출 중...
                </>
              ) : (
                "본문 추출"
              )}
            </Button>
          </div>
        )}

        {sourceType === "image" && (
          <div className="space-y-4">
            <FileUpload
              accept="image/png,image/jpeg,image/webp,image/gif"
              maxSizeMB={IMAGE_MAX_SIZE_MB}
              file={file}
              onFileChange={setFile}
              icon="image"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleExtract}
              disabled={!file || isExtracting}
              className="w-full"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  OCR 텍스트 인식 중...
                </>
              ) : (
                "텍스트 인식 (OCR)"
              )}
            </Button>
          </div>
        )}

        {sourceType === "youtube" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="youtube-input">YouTube URL</Label>
              <Input
                id="youtube-input"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                자막이 있는 영상만 지원됩니다.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleExtract}
              disabled={!url.trim() || isExtracting}
              className="w-full"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  자막 추출 중...
                </>
              ) : (
                "자막 추출"
              )}
            </Button>
          </div>
        )}

        {/* 추출 결과 메시지 */}
        {extractError && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {extractError}
          </div>
        )}

        {extractSuccess && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {extractSuccess}
          </div>
        )}

        {/* 추출된 텍스트 미리보기/편집 (텍스트 직접입력 외의 소스) */}
        {sourceType !== "text" && sourceText && (
          <div className="space-y-2">
            <Label>추출된 텍스트 (편집 가능)</Label>
            <Textarea
              value={sourceText}
              onChange={(e) => onSourceTextChange(e.target.value)}
              maxLength={SOURCE_TEXT_MAX_LENGTH}
              rows={8}
            />
            <p className={`text-xs ${getTextLengthColor()}`}>
              {sourceText.length.toLocaleString()} /{" "}
              {SOURCE_TEXT_MAX_LENGTH.toLocaleString()}자
            </p>
          </div>
        )}

        {/* 검증 에러 */}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
