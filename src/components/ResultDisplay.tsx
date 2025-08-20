import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle, RotateCcw, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ResultDisplayProps {
  result: string;
  onReset: () => void;
}

export const ResultDisplay = ({ result, onReset }: ResultDisplayProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      toast.success("Nusxa ko'chirildi!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Nusxa ko'chirishda xatolik");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Olimtoy AI - Test natijalari",
        text: result,
      });
    } else {
      handleCopy();
    }
  };

  // Parse the result to identify questions and answers
  const formatResult = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, index) => {
      // Savol aniqlash
      if (/^\d+[\).]/.test(line) || line.includes("?")) {
        return (
          <div
            key={index}
            className="font-semibold text-ai-primary text-base sm:text-lg mb-2"
          >
            {line}
          </div>
        );
      }

      // Variantlarni aniqlash: A) yoki A.
      if (/^[A-D](\)|\.)/.test(line)) {
        const isCorrect =
          line.includes("✓") || line.toLowerCase().includes("to'g'ri");
        return (
          <div
            key={index}
            className={`flex items-center gap-2 mb-1 p-2 rounded-lg ${
              isCorrect ? "bg-green-500/10" : "bg-muted/30"
            }`}
          >
            {isCorrect ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-gray-400" />
            )}
            <span
              className={
                isCorrect ? "text-green-500 font-medium" : "text-foreground"
              }
            >
              {line}
            </span>
          </div>
        );
      }

      // Oddiy matn
      if (line.trim()) {
        return (
          <p
            key={index}
            className="text-muted-foreground text-sm sm:text-base mb-2"
          >
            {line}
          </p>
        );
      }

      // Bo‘sh qator
      return <div key={index} className="h-3" />;
    });
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6 lg:p-8 pb-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
              <Badge className="ai-gradient text-primary-foreground px-4 py-2 text-sm sm:text-lg rounded-full">
                Test Tayyor! 🎉
              </Badge>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                Sizning AI Test Natijangiz
              </h1>
            </div>

            {/* Result Card */}
            <Card className="card-gradient border border-border/20 p-4 sm:p-6 md:p-8 shadow-md">
              <div className="space-y-6">
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button
                    onClick={handleCopy}
                    variant="secondary"
                    size="sm"
                    aria-label="Nusxa ko'chirish"
                    className="flex items-center gap-2 text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    <span>
                      {copied ? "Nusxa ko'chirildi!" : "Nusxa ko'chirish"}
                    </span>
                  </Button>

                  <Button
                    onClick={handleShare}
                    variant="secondary"
                    size="sm"
                    aria-label="Natijani ulashish"
                    className="flex items-center gap-2 text-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Ulashish</span>
                  </Button>
                </div>

                {/* Result Content */}
                <div className="bg-card/40 p-4 sm:p-6 rounded-xl border border-border/10">
                  <ScrollArea className="max-h-[55vh]">
                    <div className="prose prose-invert max-w-none">
                      {formatResult(result)}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </Card>

            {/* Reset Button */}
            <div className="text-center">
              <Button
                onClick={onReset}
                size="lg"
                className="ai-gradient text-primary-foreground hover:opacity-90 transition-opacity w-full sm:w-auto"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Yangi Test Yaratish
              </Button>
            </div>

            {/* Footer */}
            <div className="text-center text-xs sm:text-sm text-muted-foreground pb-4">
              <p>Olimtoy AI yordamida yaratildi 🤖</p>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
