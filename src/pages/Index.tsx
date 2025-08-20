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
    console.log('📷 Rasmlar o\'zgartirildi:', images.length);
  };

  const processImagesWithAI = async (images: File[]) => {
    if (images.length === 0) {
      toast.error("Iltimos, kamida bitta rasm yuklang");
      return;
    }

    setIsProcessing(true);
    console.log('🚀 AI ishlov berish jarayoni boshlandi:', images.length, 'ta rasm');

    try {
      // Step 1: OCR Processing for all images
      console.log('📝 1-bosqich: Barcha rasmlardan matn ajratish...');
      setAppState('ocr-loading');
      setLoadingMessage(`${images.length} ta rasmdan matn ajratilmoqda...`);
      
      const extractedTexts = await Promise.all(
        images.map(async (image, index) => {
          console.log(`📄 ${index + 1}-rasm OCR jarayoni...`);
          const text = await ocrService.extractText(image);
          console.log(`📄 ${index + 1}-rasm OCR natijasi:`, text.substring(0, 100));
          return text;
        })
      );

      const validTexts = extractedTexts.filter(text => text && text.trim().length > 5);
      
      if (validTexts.length === 0) {
        throw new Error("Hech bir rasmdan matn ajratolmadi yoki matnlar juda qisqa");
      }

      // Step 2: AI Processing
      console.log('🤖 2-bosqich: AI test yaratish...', validTexts.length, 'ta matn bilan');
      setAppState('ai-loading');
      setLoadingMessage("AI test yaratmoqda...");
      
      const result = await geminiService.generateTest(validTexts);
      console.log('✨ AI test natijasi:', result.substring(0, 200));
      
      setAiResult(result);
      setAppState('result');
      console.log('🎉 Jarayon muvaffaqiyatli yakunlandi!');
      
    } catch (error) {
      console.error('❌ AI ishlov berishda xatolik:', error);
      const errorMessage = error instanceof Error ? error.message : "AI ishlov berishda xatolik yuz berdi";
      toast.error(errorMessage);
      setAppState('upload');
    } finally {
      setIsProcessing(false);
      setLoadingMessage('');
    }
  };

  const handleAIButtonClick = async () => {
    console.log('🎯 AI tugmasi bosildi');
    
    if (uploadedImages.length === 0) {
      toast.error("Iltimos, kamida bitta rasm yuklang");
      return;
    }

    if (isProcessing) {
      console.warn('⚠️ AI allaqachon ishlamoqda');
      toast.error("AI allaqachon ishlamoqda, iltimos kuting...");
      return;
    }

    await processImagesWithAI(uploadedImages);
  };

  const handleReset = () => {
    console.log('🔄 Reset amalga oshirilmoqda');
    setAppState('upload');
    setAiResult('');
    setIsProcessing(false);
    setLoadingMessage('');
    setUploadedImages([]);
  };

  const handleSignOut = async () => {
    try {
      console.log('👋 Foydalanuvchi chiqishni boshladi');
      await signOut();
      toast.success("Muvaffaqiyatli chiqildi");
      console.log('✅ Chiqish muvaffaqiyatli');
    } catch (error) {
      console.error('❌ Chiqishda xatolik:', error);
      toast.error("Chiqishda xatolik yuz berdi");
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Upload Interface */}
      {appState === 'upload' && (
        <div className="h-screen flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 flex justify-between items-center p-3 sm:p-4 md:p-6 bg-card/95 backdrop-blur-sm border-b border-border">
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="hover:bg-secondary transition-colors text-xs sm:text-sm"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Chiqish</span>
            </Button>
            <div className="text-lg sm:text-xl md:text-2xl font-bold ai-gradient bg-clip-text text-transparent">
              Olimtoy AI
            </div>
            <Button
              onClick={() => navigate('/profile')}
              variant="ghost"
              size="sm"
              className="hover:bg-secondary transition-colors text-xs sm:text-sm"
            >
              <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Profil</span>
            </Button>
          </div>

          {/* Main Content with Scroll */}
          <div className="flex-1 overflow-y-auto">
            <div className="min-h-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
              <div className="w-full max-w-xs sm:max-w-md md:max-w-2xl">
                <ImageManager
                  onImagesChange={handleImagesChange}
                  disabled={isProcessing}
                  maxImages={3}
                />
              </div>

              {/* AI Button */}
              {uploadedImages.length > 0 && (
                <div className="text-center space-y-3 sm:space-y-4">
                  <div className="space-y-1 sm:space-y-2">
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold">
                      {uploadedImages.length} ta rasm tayyor
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground px-4">
                      AI test yaratish uchun tugmani bosing
                    </p>
                  </div>
                  
                  <Button
                    onClick={handleAIButtonClick}
                    disabled={isProcessing}
                    size="lg"
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full ai-gradient text-primary-foreground animate-pulse-glow flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Brain className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Result Display */}
      {appState === 'result' && (
        <div className="h-screen bg-background text-foreground overflow-hidden">
          <ResultDisplay 
            result={aiResult} 
            onReset={handleReset}
          />
        </div>
      )}

      {/* Loading Screen */}
      {(appState === 'ocr-loading' || appState === 'ai-loading') && (
        <LoadingScreen message={loadingMessage} />
      )}
    </div>
  );
};

export default Index;