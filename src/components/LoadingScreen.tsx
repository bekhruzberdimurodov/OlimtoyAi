import { Brain, Loader2, Sparkles, Zap } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen = ({ message = "AI sizning savolingizni tahlil qilmoqda..." }: LoadingScreenProps) => {
  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* AI Brain Animation */}
        <div className="relative">
          <div className="w-32 h-32 mx-auto relative">
            {/* Central Brain */}
            <div className="absolute inset-0 bg-ai-primary/20 rounded-full animate-pulse-glow"></div>
            <Brain className="w-32 h-32 text-ai-primary animate-float" />
            
            {/* Orbiting Elements */}
            <div className="absolute inset-0">
              <Sparkles className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-6 h-6 text-ai-secondary animate-spin" />
              <Zap className="absolute bottom-0 right-0 w-5 h-5 text-ai-primary animate-ping" />
              <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-4 w-3 h-3 bg-ai-secondary rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">{message}</h2>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-ai-primary" />
            <span className="text-muted-foreground">Iltimos kuting...</span>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-ai-primary rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-ai-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-ai-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Fun Facts */}
        <div className="mt-8 p-4 bg-card/50 rounded-lg border border-border/20 max-w-md">
          <p className="text-sm text-muted-foreground">
            💡 AI sizning rasmingizni matnga aylantirmoqda va test savollari tayyorlamoqda
          </p>
        </div>
      </div>
    </div>
  );
};