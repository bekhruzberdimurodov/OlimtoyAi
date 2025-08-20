import { useRef } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface CameraCaptureProps {
  onCapture: (imageFile: File) => void;
  disabled?: boolean;
}

export const CameraCapture = ({ onCapture, disabled }: CameraCaptureProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onCapture(file);
      toast.success("Rasm olindi!");
    }
  };

  return (
    <div className="w-full h-full relative">
      <div className="w-full h-[60vh] md:h-[70vh] lg:h-[75vh] flex flex-col items-center justify-center rounded-2xl shadow-md bg-muted">
        <Camera className="w-14 h-14 sm:w-16 sm:h-16 text-muted-foreground mb-6" />
        <h3 className="text-lg font-semibold mb-2">Kameradan foydalanish</h3>
        <p className="text-muted-foreground text-sm sm:text-base mb-6 text-center">
          Suratga olish uchun qurilma kamerasi ochiladi
        </p>

        {/* Yashirin input kamera ochadi */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleCapture}
        />

        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          size="lg"
          className="bg-primary hover:bg-primary/90 px-6 py-5 text-base sm:text-lg"
        >
          📸 Suratga olish
        </Button>
      </div>
    </div>
  );
};

CameraCapture.displayName = "CameraCapture";
