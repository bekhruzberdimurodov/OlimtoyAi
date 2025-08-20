import { useRef, forwardRef, useImperativeHandle, useState, useCallback } from "react";
import { Camera } from "lucide-react";
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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isActive, setIsActive] = useState(false);

    // Default kamera app ochish
    const startCamera = useCallback(async () => {
      fileInputRef.current?.click();
    }, []);

    // Kamera "stop" qilish (bizda real stream yo‘q, shunchaki flag reset)
    const stopCamera = useCallback(() => {
      setIsActive(false);
    }, []);

    // Surat olish (aslida kamera app orqali fayl tanlanadi)
    const captureImage = useCallback(async () => {
      fileInputRef.current?.click();
    }, []);

    // Fayl tanlanganida
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setIsActive(true);
        onCapture(file);
        toast.success("Rasm olindi!");
      }
    };

    useImperativeHandle(ref, () => ({
      captureImage,
      startCamera,
      stopCamera,
      isActive,
    }), [captureImage, startCamera, stopCamera, isActive]);

    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-6">
        {/* Yashirin input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        <Camera className="w-14 h-14 sm:w-16 sm:h-16 text-muted-foreground mx-auto" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Kamera orqali suratga oling</h3>
          <p className="text-muted-foreground text-sm sm:text-base">
            📷 Tugmani bosing va kamera ilovasi ochiladi
          </p>
        </div>

        <Button
          onClick={startCamera}
          disabled={disabled}
          size="lg"
          className="bg-primary hover:bg-primary/90 px-6 py-5 text-base sm:text-lg"
        >
          📸 Rasmga olish
        </Button>
      </div>
    );
  }
);

CameraCapture.displayName = "CameraCapture";
