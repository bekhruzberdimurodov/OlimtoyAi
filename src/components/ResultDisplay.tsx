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
    } catch (error) {
      toast.error("Nusxa ko'chirishda xatolik");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Olimtoy AI - Test natijalari',
        text: result,
      });
    } else {
      handleCopy();
    }
  };

  // Parse the result to identify questions and answers
  const formatResult = (text: string) => {
    const lines = text.split('\n');
    const formattedLines = lines.map((line, index) => {
      // Question detection
      if (line.match(/^\d+\./) || line.includes('?')) {
        return (
          <div key={index} className="font-semibold text-ai-primary text-lg mb-2">
            {line}
          </div>
        );
      }
      
      // Answer options detection
      if (line.match(/^[A-D]\)/)) {
        const isCorrect = line.includes('✓') || line.includes('to\'g\'ri');
        return (
          <div key={index} className={`flex items-center space-x-2 mb-1 p-2 rounded-lg ${isCorrect ? 'bg-green-500/10' : 'bg-card/50'}`}>
            {isCorrect ? 
              <CheckCircle className="w-4 h-4 text-green-500" /> : 
              <XCircle className="w-4 h-4 text-gray-400" />
            }
            <span className={isCorrect ? 'text-green-400 font-medium' : 'text-foreground'}>{line}</span>
          </div>
        );
      }
      
      // Regular text
      if (line.trim()) {
        return (
          <p key={index} className="text-muted-foreground mb-2">
            {line}
          </p>
        );
      }
      
      return <br key={index} />;
    });
    
    return formattedLines;
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-3 sm:p-4 md:p-6 pb-8">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="text-center space-y-2 sm:space-y-4">
              <Badge className="ai-gradient text-primary-foreground px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-lg">
                Test Tayyor! 🎉
              </Badge>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold px-4">Sizning AI Test Natijangiz</h1>
            </div>

            {/* Result Card */}
            <Card className="card-gradient border border-border/20 p-4 sm:p-6 md:p-8">
              <div className="space-y-4 sm:space-y-6">
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
                  <Button
                    onClick={handleCopy}
                    variant="secondary"
                    size="sm"
                    className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                  >
                    <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{copied ? "Nusxa ko'chirildi!" : "Nusxa ko'chirish"}</span>
                  </Button>
                  
                  <Button
                    onClick={handleShare}
                    variant="secondary"
                    size="sm"
                    className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                  >
                    <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Ulashish</span>
                  </Button>
                </div>

                {/* Result Content */}
                <div className="bg-card/30 p-3 sm:p-4 md:p-6 rounded-xl border border-border/10">
                  <ScrollArea className="max-h-[50vh] sm:max-h-[60vh]">
                    <div className="prose prose-invert max-w-none text-sm sm:text-base">
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
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
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