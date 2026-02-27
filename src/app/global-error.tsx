"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">오류가 발생했습니다</h2>
          <p className="mb-4 text-muted-foreground">
            예상치 못한 오류가 발생했습니다. 다시 시도해주세요.
          </p>
          <Button onClick={() => reset()}>다시 시도</Button>
        </div>
      </body>
    </html>
  );
}
