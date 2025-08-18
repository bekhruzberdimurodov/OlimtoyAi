import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { CameraCapture, CameraCaptureRef } from "@/components/CameraCapture";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ResultDisplay } from "@/components/ResultDisplay";
import { Button } from "@/components/ui/button";
import { ocrService, geminiService } from "@/services/aiService";
import { toast } from "sonner";
import { Brain, User, LogOut } from "lucide-react";

type AppState = 'camera' | 'ocr-loading' | 'ai-loading' | 'result';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [appState, setAppState] = useState<AppState>('camera');
  const [aiResult, setAiResult] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const cameraRef = useRef<CameraCaptureRef>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleImageCapture = (imageFile: File) => {
    console.log('🎯 Rasm olindi, AI ishlov berish boshlanyapti...', {
      fileName: imageFile.name,
      fileSize: imageFile.size,
      fileType: imageFile.type
    });
    processImageWithAI(imageFile);
  };

  const processImageWithAI = async (imageFile: File) => {
    setIsProcessing(true);
    console.log('🚀 AI ishlov berish jarayoni boshlandi');

    try {
      // Step 1: OCR Processing
      console.log('📝 1-bosqich: OCR ishlov berish...');
      setAppState('ocr-loading');
      setLoadingMessage("Rasmdan matn ajratilmoqda...");
      
      const extractedText = await ocrService.extractText(imageFile);
      console.log('📄 OCR natijasi:', extractedText);
      
      if (!extractedText || extractedText.length < 5) {
        throw new Error("Rasmdan matn ajratolmadi yoki matn juda qisqa");
      }

      // Step 2: AI Processing
      console.log('🤖 2-bosqich: AI test yaratish...');
      setAppState('ai-loading');
      setLoadingMessage("AI test yaratmoqda...");
      
      const result = await geminiService.generateTest(extractedText);
      console.log('✨ AI test natijasi:', result);
      
      setAiResult(result);
      setAppState('result');
      console.log('🎉 Jarayon muvaffaqiyatli yakunlandi!');
      
    } catch (error) {
      console.error('❌ AI ishlov berishda xatolik:', error);
      const errorMessage = error instanceof Error ? error.message : "AI ishlov berishda xatolik yuz berdi";
      toast.error(errorMessage);
      setAppState('camera');
    } finally {
      setIsProcessing(false);
      setLoadingMessage('');
    }
  };

  const handleAIButtonClick = async () => {
    console.log('🎯 AI tugmasi bosildi');
    
if (!cameraRef.current?.isActive) {
  console.log('📲 Kamera faol emas — avtomatik yoqilmoqda');
  try {
    await cameraRef.current?.startCamera();
    console.log('✅ Kamera yoqildi');
  } catch (e) {
    console.error('❌ Kamerani yoqishda xatolik:', e);
    toast.error("Kamerani yoqib bo'lmadi");
    return;
  }
}

    if (isProcessing) {
      console.warn('⚠️ AI allaqachon ishlamoqda');
      toast.error("AI allaqachon ishlamoqda, iltimos kuting...");
      return;
    }

try {
  console.log('📸 Rasm olish boshlanyapti...');
  await cameraRef.current.captureImage();
  console.log('✅ Rasm muvaffaqiyatli olindi');
} catch (error) {
  console.error('❌ Rasm olishda xatolik:', error);
  toast.error("Rasm olishda xatolik yuz berdi");
}
  };

  const handleReset = () => {
    console.log('🔄 Reset amalga oshirilmoqda');
    setAppState('camera');
    setAiResult('');
    setIsProcessing(false);
    setLoadingMessage('');
  };

  const handleSignOut = async () => {
    try {
      console.log('👋 Foydalanuvchi chiqishni boshladi');
      // Stop camera before sign out
      if (cameraRef.current?.isActive) {
        cameraRef.current.stopCamera();
      }
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
      {/* Camera Interface */}
      {appState === 'camera' && (
        <>
          {/* Mobile Layout - Full Screen */}
          <div className="relative w-full h-screen md:hidden">
            {/* Top Navigation */}
            <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4 bg-gradient-to-b from-black/70 to-transparent">
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Chiqish
              </Button>
              <div className="text-white font-medium">Olimtoy AI</div>
              <Button
                onClick={() => navigate('/profile')}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 transition-colors"
              >
                <User className="w-4 h-4 mr-2" />
                Profil
              </Button>
            </div>

            {/* Camera View */}
            <div className="absolute inset-0">
              <CameraCapture 
                ref={cameraRef}
                onCapture={handleImageCapture} 
                disabled={isProcessing}
              />
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 z-20 p-8 bg-gradient-to-t from-black/80 to-transparent">
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white">Darslik sahifasini ko'rsating</h2>
                  <p className="text-sm text-white/80">AI sizga test tayyorlab beradi</p>
                </div>
                
                {/* AI Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={handleAIButtonClick}
                    disabled={isProcessing}
                    size="lg"
                    className="w-24 h-24 rounded-full bg-white hover:bg-white/90 text-black border-4 border-white/30 shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Brain className="w-10 h-10" />
                  </Button>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-white/90 font-medium">AI tugmasini bosing</p>
                  <p className="text-xs text-white/60">Rasm olinadi va test yaratiladi</p>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop/Tablet Layout */}
          <div className="hidden md:flex md:flex-col min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center p-6 bg-card/95 backdrop-blur-sm border-b border-border">
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="hover:bg-secondary transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Chiqish
              </Button>
              <div className="text-xl font-bold ai-gradient bg-clip-text text-transparent">
                Olimtoy AI
              </div>
              <Button
                onClick={() => navigate('/profile')}
                variant="ghost"
                size="sm"
                className="hover:bg-secondary transition-colors"
              >
                <User className="w-4 h-4 mr-2" />
                Profil
              </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="w-full max-w-4xl">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Left Side - Instructions */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
                        Darslik sahifasini{" "}
                        <span className="ai-gradient bg-clip-text text-transparent">
                          ko'rsating
                        </span>
                      </h1>
                      <p className="text-lg text-muted-foreground">
                        AI sizga test tayyorlab beradi. Darslik sahifasini kameraga ko'rsating va AI tugmasini bosing.
                      </p>
                    </div>
                    
                    <div className="flex justify-center md:justify-start">
                      <Button
                        onClick={handleAIButtonClick}
                        disabled={isProcessing}
                        size="lg"
                        className="w-20 h-20 rounded-full ai-gradient text-primary-foreground animate-pulse-glow flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Brain className="w-8 h-8" />
                      </Button>
                    </div>

                    <div className="space-y-2 text-center md:text-left">
                      <p className="text-sm font-medium">AI tugmasini bosing</p>
                      <p className="text-xs text-muted-foreground">Rasm olinadi va test yaratiladi</p>
                    </div>
                  </div>

                  {/* Right Side - Camera */}
                  <div className="w-full">
                    <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden border-4 border-border bg-card shadow-2xl">
                      <CameraCapture 
                        ref={cameraRef}
                        onCapture={handleImageCapture} 
                        disabled={isProcessing}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Result Display */}
      {appState === 'result' && (
        <div className="min-h-screen bg-background text-foreground p-6">
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