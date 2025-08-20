import { useState, useRef } from "react";
import { Camera, Upload, X, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface ImageManagerProps {
  onImagesChange: (images: File[]) => void;
  disabled?: boolean;
  maxImages?: number;
}

export const ImageManager = ({ onImagesChange, disabled, maxImages = 3 }: ImageManagerProps) => {
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (images.length + files.length > maxImages) {
      toast.error(`Maksimal ${maxImages} ta rasm yuklash mumkin`);
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} fayli rasm emas`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(`${file.name} fayli juda katta (max 10MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      const newImages = [...images, ...validFiles];
      setImages(newImages);
      onImagesChange(newImages);

      // Create previews
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });

      toast.success(`${validFiles.length} ta rasm yuklandi`);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCameraCapture = async () => {
    if (images.length >= maxImages) {
      toast.error(`Maksimal ${maxImages} ta rasm yuklash mumkin`);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        }
      });

      // Create a temporary video element
      const video = document.createElement('video');
      video.srcObject = stream;
      video.setAttribute('playsinline', 'true');
      video.muted = true;
      
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          video.play().then(() => resolve());
        };
      });

      // Create canvas for capture
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Canvas context not available');
      }

      context.drawImage(video, 0, 0);
      
      // Stop camera
      stream.getTracks().forEach(track => track.stop());

      // Convert to blob and then to file
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
          const newImages = [...images, file];
          setImages(newImages);
          onImagesChange(newImages);

          // Create preview
          const reader = new FileReader();
          reader.onload = (e) => {
            setImagePreviews(prev => [...prev, e.target?.result as string]);
          };
          reader.readAsDataURL(file);

          toast.success("Rasm muvaffaqiyatli olindi!");
        }
      }, 'image/jpeg', 0.9);

    } catch (error) {
      console.error('Camera error:', error);
      toast.error("Kamera ishlamadi");
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
    onImagesChange(newImages);
    
    toast.success("Rasm olib tashlandi");
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full space-y-6">
      {/* Upload Controls */}
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Test varaq rasmlarini yuklang</h3>
          <p className="text-sm text-muted-foreground">
            Maksimal {maxImages} ta rasm yuklash mumkin
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={openFileDialog}
            disabled={disabled || images.length >= maxImages}
            variant="outline"
            size="lg"
            className="flex-1 max-w-xs"
          >
            <Upload className="w-5 h-5 mr-2" />
            Rasm yuklash ({images.length}/{maxImages})
          </Button>

          <Button
            onClick={handleCameraCapture}
            disabled={disabled || images.length >= maxImages}
            variant="outline"
            size="lg"
            className="flex-1 max-w-xs"
          >
            <Camera className="w-5 h-5 mr-2" />
            Rasmga olish
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-md font-medium">Yuklangan rasmlar:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {imagePreviews.map((preview, index) => (
              <Card key={index} className="relative group overflow-hidden">
                <div className="aspect-square">
                  <img
                    src={preview}
                    alt={`Yuklangan rasm ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  onClick={() => removeImage(index)}
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </Button>
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {index + 1}/{maxImages}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <Card className="border-dashed border-2 border-muted-foreground/25 p-8">
          <div className="text-center space-y-4">
            <FileImage className="w-12 h-12 text-muted-foreground mx-auto" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Hech qanday rasm yuklanmagan</p>
              <p className="text-xs text-muted-foreground">
                Yuqoridagi tugmalardan foydalanib rasmlarni yuklang
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};