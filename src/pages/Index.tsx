import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ResultDisplay } from "@/components/ResultDisplay";
import { ImageManager } from "@/components/ImageManager";
import { Button } from "@/components/ui/button";
import { ocrService, geminiService } from "@/services/aiService";
import { toast } from "sonner";
import { Brain, User, LogOut } from "lucide-react";

type AppState = 'upload' | 'ocr-loading' | 'ai-loading' | 'result';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [appState, setAppState] = useState<AppState>('upload');
  const [aiResult, setAiResult] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleImagesChange = (images: File[]) => {
    setUploadedImages(images);
  };

  const processImagesWithAI = async (images: File[]) => {
    if (images.length === 0) {
      toast.error("Iltimos, kamida bitta rasm yuklang");
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: OCR
      setAppState('ocr-loading');
      setLoadingMessage(`${images.length} ta rasmdan matn ajratilmoqda...`);
      
      const extractedTexts = await Promise.all(
        images.map(async (image) => {
          const text = await ocrService.extractText(image);
          return text;
        })
      );

      const validTexts = extractedTexts.filter(text => text && text.trim().length > 5);
      if (validTexts.length === 0) {
        throw new Error("Matn topilmadi yoki juda qisqa");
      }

      // Step 2: AI
      setAppState('ai-loading');
      setLoadingMessage("AI test yaratmoqda...");

      const result = await geminiService.generateTest(validTexts);
      setAiResult(result);
      setAppState('result');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Xatolik yuz berdi";
      toast.error(errorMessage);
      setAppState('upload');
    } finally {
      setIsProcessing(false);
      setLoadingMessage('');
    }
  };

  const handleAIButtonClick = async () => {
    if (uploadedImages.length === 0) {
      toast.error("Iltimos, kamida bitta rasm yuklang");
      return;
    }
    if (isProcessing) {
      toast.error("AI allaqachon ishlamoqda, iltimos kuting...");
      return;
    }
    await processImagesWithAI(uploadedImages);
  };

  const handleReset = () => {
    setAppState('upload');
    setAiResult('');
    setIsProcessing(false);
    setLoadingMessage('');
    setUploadedImages([]);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Muvaffaqiyatli chiqildi");
    } catch {
      toast.error("Chiqishda xatolik yuz berdi");
    }
  };

  if (loading) return <LoadingScreen />;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background text-foreground flex flex-col">
      {/* HEADER */}
      <header className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-card/80 backdrop-blur-md border-b border-border shadow-sm">
        <Button
          onClick={handleSignOut}
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 hover:bg-secondary/80 transition-colors text-xs sm:text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Chiqish</span>
        </Button>

        <h1 className="text-lg sm:text-xl md:text-2xl font-bold ai-gradient bg-clip-text text-transparent">
          Olimtoy AI
        </h1>

        <Button
          onClick={() => navigate('/profile')}
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 hover:bg-secondary/80 transition-colors text-xs sm:text-sm"
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Profil</span>
        </Button>
      </header>

      {/* UPLOAD SCREEN */}
      {appState === 'upload' && (
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 md:px-10 py-6 sm:py-10 space-y-8 text-center">
          <div className="w-full max-w-xs sm:max-w-md md:max-w-2xl">
            <ImageManager
              onImagesChange={handleImagesChange}
              disabled={isProcessing}
              maxImages={3}
            />
          </div>

          {uploadedImages.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold">
                  {uploadedImages.length} ta rasm tayyor
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  AI test yaratish uchun tugmani bosing
                </p>
              </div>

              <Button
                onClick={handleAIButtonClick}
                disabled={isProcessing}
                size="lg"
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full ai-gradient text-primary-foreground shadow-lg shadow-primary/40 hover:scale-110 active:scale-95 transition-transform flex items-center justify-center"
              >
                <Brain className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
              </Button>
            </div>
          )}
        </main>
      )}

      {/* RESULT SCREEN */}
      {appState === 'result' && (
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10">
          <ResultDisplay result={aiResult} onReset={handleReset} />
        </main>
      )}

      {/* LOADING */}
      {(appState === 'ocr-loading' || appState === 'ai-loading') && (
        <LoadingScreen message={loadingMessage} />
      )}
    </div>
  );
};

export default Index;
