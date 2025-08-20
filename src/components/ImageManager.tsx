import { useState, useRef } from "react";
import { Upload, X, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface ImageManagerProps {
  onImagesChange: (images: File[]) => void;
  disabled?: boolean;
  maxImages?: number;
}

export const ImageManager = ({
  onImagesChange,
  disabled,
  maxImages = 3,
}: ImageManagerProps) => {
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (images.length + files.length > maxImages) {
      toast.error(`Maksimal ${maxImages} ta rasm yuklash mumkin`);
      event.target.value = "";
      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} fayli rasm emas`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} fayli juda katta (max 10MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      const newImages = [...images, ...validFiles];
      setImages(newImages);
      onImagesChange(newImages);

      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews((prev) => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });

      toast.success(`${validFiles.length} ta rasm yuklandi`);
    }

    // reset input
    event.target.value = "";
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    setImages(newImages);
    setImagePreviews(newPreviews);
    onImagesChange(newImages);

    toast.success("Rasm olib tashlandi");
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Test varaq rasmlarini yuklang</h3>
        <p className="text-sm text-muted-foreground">
          Maksimal {maxImages} ta rasm yuklash mumkin
        </p>
      </div>

      {/* Controls: faqat yuklash */}
      <div className="flex justify-center">
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || images.length >= maxImages}
          variant="outline"
          size="lg"
          className="w-full sm:w-auto max-w-xs"
        >
          <Upload className="w-5 h-5 mr-2" />
          Rasm yuklash ({images.length}/{maxImages})
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Previews */}
      {images.length > 0 ? (
        <div className="space-y-4">
          <h4 className="text-md font-medium">Yuklangan rasmlar:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {imagePreviews.map((preview, index) => (
              <Card
                key={index}
                className="relative group overflow-hidden rounded-xl shadow-md"
              >
                <img
                  src={preview}
                  alt={`Rasm ${index + 1}`}
                  className="w-full h-40 object-cover"
                />
                <Button
                  onClick={() => removeImage(index)}
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition"
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
      ) : (
        <Card className="border-dashed border-2 border-muted-foreground/25 p-8">
          <div className="text-center space-y-4">
            <FileImage className="w-12 h-12 text-muted-foreground mx-auto" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Hech qanday rasm yuklanmagan</p>
              <p className="text-xs text-muted-foreground">
                Tugmani bosib rasm(lar)ni yuklang
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
