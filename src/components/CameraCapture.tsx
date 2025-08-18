import { useRef, useState, useCallback, forwardRef, useImperativeHandle, useEffect } from "react";
import { Camera, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Webcam from "webcam-easy";

interface CameraCaptureProps {
  onCapture: (imageFile: File) => void;
  disabled?: boolean;
}

export interface CameraCaptureRef {
  captureImage: () => Promise<void>;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  isActive: boolean;
}

export const CameraCapture = forwardRef<CameraCaptureRef, CameraCaptureProps>(
  ({ onCapture, disabled }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const webcamRef = useRef<any>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cleanup function to stop camera
    const stopCamera = useCallback(() => {
      console.log('🔴 Kamera to\'xtatilmoqda...');
      try {
        if (webcamRef.current) {
          webcamRef.current.stop();
          webcamRef.current = null;
          console.log('📷 Webcam-easy to\'xtadi');
        }
      } catch (e) {
        console.warn('⚠️ Webcam stop xatosi', e);
      }
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
          console.log('📹 Track to\'xtatildi:', track.kind);
        });
        setStream(null);
      }
      setIsActive(false);
      setError(null);
    }, [stream]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        stopCamera();
      };
    }, [stopCamera]);

    const startCamera = useCallback(async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('🎥 Kamera yoqilmoqda...');
        
        // Check if camera is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Bu brauzerda kamera qo'llab-quvvatlanmaydi");
        }

        // Stop existing stream if any
        if (webcamRef.current) {
          try { webcamRef.current.stop(); } catch {}
          webcamRef.current = null;
        }
        if (stream) {
          stopCamera();
        }

        if (!videoRef.current) throw new Error('Video element topilmadi');

        // Directly request camera permission with getUserMedia
        let success = false;
        let activeStream: MediaStream | null = null;

        console.log('📱 Kamera ruxsati so\'ralmoqda...');
        
        // First attempt: Try rear camera (mobile)
        try {
          const constraints = {
            video: {
              width: { ideal: 1280, min: 640 },
              height: { ideal: 720, min: 480 },
              facingMode: { ideal: 'environment' }
            },
            audio: false
          };
          
          activeStream = await navigator.mediaDevices.getUserMedia(constraints);
          console.log('✅ Orqa kamera ruxsat berildi');
          success = true;
        } catch (envError) {
          console.log('⚠️ Orqa kamera mavjud emas, old kameraga o\'tilmoqda...', envError);
          
          // Second attempt: Try front camera
          try {
            const frontConstraints = {
              video: {
                width: { ideal: 1280, min: 640 },
                height: { ideal: 720, min: 480 },
                facingMode: 'user'
              },
              audio: false
            };
            
            activeStream = await navigator.mediaDevices.getUserMedia(frontConstraints);
            console.log('✅ Old kamera ruxsat berildi');
            success = true;
          } catch (frontError) {
            console.log('⚠️ Old kamera ham ishlamadi, oddiy video so\'ralmoqda...', frontError);
            
            // Third attempt: Basic video request
            try {
              const basicConstraints = {
                video: true,
                audio: false
              };
              
              activeStream = await navigator.mediaDevices.getUserMedia(basicConstraints);
              console.log('✅ Oddiy kamera ruxsat berildi');
              success = true;
            } catch (basicError) {
              console.error('❌ Hech qanday kamera ishlamadi:', basicError);
              throw basicError;
            }
          }
        }

        if (!success || !activeStream) {
          throw new Error('Kameraga ruxsat olinmadi');
        }

        // Set stream to video element
        videoRef.current.srcObject = activeStream;
        setStream(activeStream);
        
        // Try to use webcam-easy with the existing stream for better functionality
        try {
          const webcam = new (Webcam as any)(videoRef.current, 'user', canvasRef.current || undefined);
          webcamRef.current = webcam;
          console.log('✅ Webcam-easy wrapper qo\'shildi');
        } catch (webcamError) {
          console.log('⚠️ Webcam-easy ishlamadi, faqat native stream ishlatiladi:', webcamError);
        }

        if (videoRef.current) {
          // Ensure playback on iOS Safari
          (videoRef.current as any).playsInline = true;
          try { await videoRef.current.play(); } catch {}
        }
        
        setIsActive(true);
        console.log('🎉 Kamera muvaffaqiyatli ishga tushdi');
        
      } catch (error: any) {
        console.error("❌ Kamera xatosi:", error);
        let errorMessage = "Kameraga kirish imkoni yo'q";
        
        if (error?.name === 'NotAllowedError') {
          errorMessage = "Kamera ruxsati berilmagan. Brauzer sozlamalarida kameraga ruxsat bering.";
        } else if (error?.name === 'NotFoundError' || error?.message?.includes('Requested device not found')) {
          errorMessage = "Kamera topilmadi. Kamera ulangan va ishlayotganini tekshiring.";
        } else if (error?.name === 'NotReadableError') {
          errorMessage = "Kamera band yoki ishlamayapti. Boshqa dasturlar kamerani ishlatmayotganini tekshiring.";
        } else if (error?.name === 'OverconstrainedError') {
          errorMessage = "Kamera talablariga javob bermaydi. Boshqa kamera urinib ko'ring.";
        } else if (error?.name === 'SecurityError') {
          errorMessage = "Xavfsizlik xatosi. HTTPS orqali kirish talab qilinadi.";
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }, [stream, stopCamera]);

    const captureImage = useCallback((): Promise<void> => {
      return new Promise(async (resolve, reject) => {
        console.log('📸 Rasm olish boshlandi...');
        
        try {
          if (webcamRef.current) {
            const dataUrl = webcamRef.current.snap();
            console.log('🖼️ snap() dataURL uzunligi:', dataUrl?.length);
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const file = new File([blob], `captured-${Date.now()}.jpg`, { 
              type: 'image/jpeg' 
            });
            console.log('✅ Rasm (webcam-easy) olindi:', {
              size: file.size,
              type: file.type,
              name: file.name
            });
            onCapture(file);
            resolve();
            return;
          }
        } catch (snapErr) {
          console.warn('⚠️ webcam-easy snap() ishlamadi, canvas ga o\'tiladi', snapErr);
        }
        
        if (!videoRef.current || !canvasRef.current) {
          const error = "Kamera tayyor emas";
          console.error('❌', error);
          reject(new Error(error));
          return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) {
          const error = "Canvas konteksti mavjud emas";
          console.error('❌', error);
          reject(new Error(error));
          return;
        }

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        console.log('📐 Rasm o\'lchamlari:', {
          width: canvas.width,
          height: canvas.height
        });
        
        // Draw the video frame to canvas
        context.drawImage(video, 0, 0);
        
        // Convert canvas to blob with high quality
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `captured-${Date.now()}.jpg`, { 
              type: 'image/jpeg' 
            });
            console.log('✅ Rasm (canvas) olindi:', {
              size: file.size,
              type: file.type,
              name: file.name
            });
            onCapture(file);
            resolve();
          } else {
            const error = "Rasmni saqlashda xatolik";
            console.error('❌', error);
            reject(new Error(error));
          }
        }, 'image/jpeg', 0.95); // High quality JPEG
      });
    }, [onCapture]);

useImperativeHandle(ref, () => ({
  captureImage,
  startCamera,
  stopCamera,
  isActive
}), [captureImage, startCamera, stopCamera, isActive]);

    return (
      <div className="w-full h-full relative">
        <div className="relative w-full h-full camera-container overflow-hidden rounded-lg">
          {isActive ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              {/* Camera overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 right-4 flex justify-center">
                  <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    📹 Kamera aktiv
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-card">
              {isLoading ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin w-8 h-8 border-2 border-ai-primary border-t-transparent rounded-full"></div>
                  <p className="text-muted-foreground">Kamera yuklanmoqda...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center space-y-4 p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-destructive" />
                  <p className="text-destructive text-sm">{error}</p>
                  <Button
                    onClick={startCamera}
                    disabled={disabled}
                    variant="outline"
                    size="sm"
                  >
                    Qayta urinish
                  </Button>
                </div>
              ) : (
                  <div className="space-y-6 text-center">
                    <Camera className="w-16 h-16 text-muted-foreground mx-auto" />
                    <div className="space-y-2">
                      <p className="text-lg font-medium">Kamerani yoqish</p>
                      <p className="text-sm text-muted-foreground">
                        Darslik sahifasini suratga olish uchun kamerani yoqing
                      </p>
                    </div>
                    <Button
                      onClick={startCamera}
                      disabled={disabled}
                      className="ai-gradient text-primary-foreground animate-pulse-glow"
                      size="lg"
                    >
                      📹 Kamerani Yoqish
                    </Button>
                    <div className="text-xs text-muted-foreground/70 max-w-sm mx-auto">
                      Kamera ruxsati so'ralganida "Ruxsat berish" tugmasini bosing
                    </div>
                  </div>
              )}
            </div>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }
);

CameraCapture.displayName = "CameraCapture";