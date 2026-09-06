"use client";

// components/portfolio/PortfolioShareButton.tsx
// Share button allowing students to copy a direct link to their verified digital portfolio.

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";

interface PortfolioShareButtonProps {
  studentId: string;
  studentName: string;
}

export function PortfolioShareButton({ studentId }: PortfolioShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const url = `${window.location.origin}/portfolio?studentId=${studentId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="h-8 gap-1.5 text-xs border-border hover:bg-background-muted"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-success" />
          <span>Link Copied</span>
        </>
      ) : (
        <>
          <Share2 className="h-3.5 w-3.5 text-foreground-muted" />
          <span>Share Portfolio Link</span>
        </>
      )}
    </Button>
  );
}
