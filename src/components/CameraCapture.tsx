import { useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { Camera, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const stopCamera = useCallback(() => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      setIsActive(false);
      setError(null);
    }, [stream]);

    const startCamera = useCallback(async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Tez kamera sozlamalari bilan
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'environment'
          },
          audio: false
        });

        if (videoRef.current) {
          const video = videoRef.current;
          video.srcObject = mediaStream;
          setStream(mediaStream);
          
          // Tezkor video yuklash
          video.setAttribute('playsinline', 'true');
          video.muted = true;
          
          // Darhol play qilish
          const playPromise = video.play();
          
          if (playPromise !== undefined) {
            playPromise.then(() => {
              // Video darhol boshlandi
              setIsActive(true);
              setIsLoading(false);
              toast.success("Kamera yoqildi!");
            }).catch(() => {
              // Fallback: metadata kutish
              video.onloadedmetadata = () => {
                video.play().then(() => {
                  setIsActive(true);
                  setIsLoading(false);
                  toast.success("Kamera yoqildi!");
                });
              };
            });
          }
        }
      } catch (error: any) {
        console.error("Kamera xatosi:", error);
        let errorMessage = "Kameraga kirish imkoni yo'q";
        
        if (error.name === 'NotAllowedError') {
          errorMessage = "Kamera ruxsati rad etildi";
        } else if (error.name === 'NotFoundError') {
          errorMessage = "Kamera topilmadi";
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
        setIsLoading(false);
      }
    }, []);

    const captureImage = useCallback(async () => {
      if (!videoRef.current || !canvasRef.current || !isActive) {
        toast.error("Kamera tayyor emas");
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `photo-${Date.now()}.jpg`, { 
            type: 'image/jpeg' 
          });
          onCapture(file);
          toast.success("Rasm olindi!");
        }
      }, 'image/jpeg', 0.9);
    }, [onCapture, isActive]);

    useImperativeHandle(ref, () => ({
      captureImage,
      startCamera,
      stopCamera,
      isActive
    }), [captureImage, startCamera, stopCamera, isActive]);

    return (
      <div className="w-full h-full relative">
        <div className="relative w-full h-full overflow-hidden rounded-lg bg-muted">
          {isActive ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              <div className="absolute top-4 left-4 bg-background/80 text-foreground px-3 py-1 rounded-full text-sm">
                📹 Kamera aktiv
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6">
              {isLoading ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
                  <p className="text-muted-foreground">Kamera yoqilmoqda...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center space-y-4 text-center">
                  <AlertCircle className="w-12 h-12 text-destructive" />
                  <p className="text-destructive">{error}</p>
                  <Button
                    onClick={startCamera}
                    disabled={disabled}
                    variant="outline"
                  >
                    Qayta urinish
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 text-center">
                  <Camera className="w-16 h-16 text-muted-foreground mx-auto" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Kamerani yoqish</h3>
                    <p className="text-muted-foreground">
                      Sahifani suratga olish uchun kamerani yoqing
                    </p>
                  </div>
                  <Button
                    onClick={startCamera}
                    disabled={disabled}
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                  >
                    📹 Kamerani Yoqish
                  </Button>
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