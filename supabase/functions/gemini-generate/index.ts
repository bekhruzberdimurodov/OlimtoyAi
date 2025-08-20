import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { extractedText } = await req.json();

    if (!extractedText) {
      throw new Error("Matn topilmadi");
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API kaliti topilmadi");
    }

    console.log("Generating test with Gemini for text:", extractedText.substring(0, 100));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Bu matn asosida test savollarini yarating va javoblarini ham bering. Shuni qat'iy formatda bajaring, hech qanday yulduzcha (**), markdown, bullet point ishlatmang. Matn: ${extractedText}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 2048,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      throw new Error(`Gemini API xatoligi: ${response.status}`);
    }

    const data = await response.json();
    console.log("Gemini response received:", JSON.stringify(data, null, 2));

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("Gemini dan javob olinmadi");
    }

    // Har doim parts massivini tekshiramiz
    const parts = data.candidates[0].content.parts;
    if (!parts || parts.length === 0 || !parts[0].text) {
      throw new Error("Gemini javobi bo'sh keldi");
    }

    const generatedTest = parts[0].text;

    return new Response(JSON.stringify({ generatedTest }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in gemini-generate function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Test yaratishda xatolik yuz berdi",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});