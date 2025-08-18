import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge className="ai-gradient text-primary-foreground px-4 py-2 text-lg">
            Test Tayyor! 🎉
          </Badge>
          <h1 className="text-3xl font-bold">Sizning AI Test Natijangiz</h1>
        </div>

        {/* Result Card */}
        <Card className="card-gradient border border-border/20 p-8">
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                onClick={handleCopy}
                variant="secondary"
                className="flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>{copied ? "Nusxa ko'chirildi!" : "Nusxa ko'chirish"}</span>
              </Button>
              
              <Button
                onClick={handleShare}
                variant="secondary"
                className="flex items-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Ulashish</span>
              </Button>
            </div>

            {/* Result Content */}
            <div className="bg-card/30 p-6 rounded-xl border border-border/10">
              <div className="prose prose-invert max-w-none">
                {formatResult(result)}
              </div>
            </div>
          </div>
        </Card>

        {/* Reset Button */}
        <div className="text-center">
          <Button
            onClick={onReset}
            size="lg"
            className="ai-gradient text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Yangi Test Yaratish
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Olimtoy AI yordamida yaratildi 🤖</p>
        </div>
      </div>
    </div>
  );
};