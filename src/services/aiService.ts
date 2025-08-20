import Tesseract from 'tesseract.js';

// Simple OCR Service using Tesseract.js - reliable and fast
class OCRService {
  async extractText(imageFile: File): Promise<string> {
    try {
      console.log('🔍 OCR boshlandi - Rasm o\'lchami:', imageFile.size, 'bytes');
      
      // Simple Tesseract call with minimal configuration for better reliability
      const { data: { text } } = await Tesseract.recognize(
        imageFile,
        'eng+uzb+rus', // English, Uzbek and Russian for better text recognition
        {
          logger: (m) => console.log('📄 OCR progress:', m.status, m.progress), // Enable detailed logging
        }
      );
      
      const cleanedText = text.trim().replace(/\s+/g, ' ');
      console.log('✅ OCR tugadi - Ajratilgan matn:', cleanedText);
      console.log('📊 Matn uzunligi:', cleanedText.length, 'belgi');
      
      if (!cleanedText || cleanedText.length < 3) {
        console.warn('⚠️ Matn juda qisqa yoki topilmadi');
        return "Matn aniqlanmadi. Iltimos, rasmni aniqroq oling.";
      }
      
      return cleanedText;
    } catch (error) {
      console.error('❌ OCR xatosi:', error);
      return "Matn o'qishda xatolik. Qaytadan urining.";
    }
  }
}

// Gemini AI Service using Supabase Edge Function
class GeminiService {
  async generateTest(extractedTexts: string | string[]): Promise<string> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Handle both single string and array of strings
      const textsArray = Array.isArray(extractedTexts) ? extractedTexts : [extractedTexts];
      
      // Filter valid texts and combine them
      const validTexts = textsArray.filter(text => text && text.trim().length > 5);
      
      if (validTexts.length === 0) {
        throw new Error('Rasmlardan yetarli matn ajratolmadi');
      }

      const combinedText = validTexts.join('\n\n--- Keyingi rasm ---\n\n');
      
      console.log('🧾 OCR dan olingan matn(lar):', validTexts.length, 'ta');
      console.log('📏 Umumiy matn uzunligi:', combinedText.length, 'belgi');
      const promptText = `Testni xatolarsiz ishlab ber: ${combinedText}`;
      console.log('🤖 Gemini ga yuboriladigan prompt:', promptText.substring(0, 200) + '...');
      console.log('📤 Prompt uzunligi:', promptText.length, 'belgi');
      
      const { data, error } = await supabase.functions.invoke('gemini-generate', {
        body: { extractedText: combinedText }
      });

      if (error) {
        console.error('❌ Supabase function xatosi:', error);
        throw new Error('Test yaratishda xatolik: ' + error.message);
      }

      if (data?.error) {
        console.error('❌ Gemini API xatosi:', data.error);
        throw new Error(data.error);
      }

      // Handle both old and new response formats
      const result = data?.generatedTest || data?.text;
      if (!result) {
        console.error('❌ Test yaratilmadi - bo\'sh javob');
        throw new Error('Test yaratilmadi');
      }

      console.log('✅ Gemini dan kelgan javob:', result.substring(0, 200) + '...');
      console.log('📊 Javob uzunligi:', result.length, 'belgi');
      
      return result;
    } catch (error) {
      console.error('❌ Gemini service xatosi:', error);
      throw new Error(error instanceof Error ? error.message : 'Test yaratishda xatolik yuz berdi');
    }
  }
}

export const ocrService = new OCRService();
export const geminiService = new GeminiService();