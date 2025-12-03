import { GoogleGenAI, Type } from "@google/genai";
import { GenerationResult } from "../types";

function btoa_utf8(str: string) {
    return btoa(unescape(encodeURIComponent(str)));
}

const textModel = 'gemini-2.5-flash';
const imageModel = 'gemini-2.5-flash-image';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateImageWithRetry(ai: GoogleGenAI, prompt: string, retries = 3): Promise<any> {
    try {
        return await ai.models.generateContent({
            model: imageModel,
            contents: prompt,
            config: { imageConfig: { aspectRatio: "16:9" } } as any
        });
    } catch (error: any) {
        const isQuotaError = error.message?.includes('429') || 
                             error.code === 429 || 
                             error.status === 429 || 
                             error.message?.includes('Quota exceeded') ||
                             error.message?.includes('RESOURCE_EXHAUSTED');
        
        if (isQuotaError && retries > 0) {
            console.warn(`Rate limit hit. Retrying in 30s... (${retries} retries left)`);
            await delay(30000); // Wait 30 seconds before retry for strict limits
            return generateImageWithRetry(ai, prompt, retries - 1);
        }
        throw error;
    }
}

export const generateAffiliatePost = async (
  productName: string,
  productDescription: string,
  affiliateHoplink: string,
  templateName: string,
  onProgress: (step: number, message: string) => void,
  apiKey: string
): Promise<GenerationResult> => {
    
    if (!apiKey) {
        console.error("API Key is missing.");
        throw new Error("API Key is not configured. Please go to the Settings page to enter your API key.");
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    // 1. Pre-flight check for API key validity
    onProgress(0, 'Validating API key...');
    try {
        await ai.models.countTokens({model: textModel, contents: 'test'});
    } catch(err) {
        console.error("API Key validation failed:", err);
        throw new Error("API Key Validation Failed. Go to the Settings page and use the 'Check API Key Status' tool for more details. Your key might be invalid, or your project may lack billing.");
    }


    onProgress(1, 'Generating high-converting copy & SEO...');
    
    const ctaButtonHtml = `<a href="${affiliateHoplink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #22c55e; color: white; padding: 15px 30px; font-size: 20px; font-weight: bold; text-decoration: none; border-radius: 8px; text-align: center; transition: background-color 0.3s ease;">Click Here to Get Instant Access!</a>`;

    const contentPrompt = `
      You are an expert direct response copywriter and SEO specialist.
      Generate a complete, high-converting affiliate marketing landing page content.
      Product: "${productName}"
      Description: "${productDescription}"
      Template Style: "${templateName}"
      Your response MUST be a JSON object with four keys: "title", "metaDescription", "htmlBodyContent", and "imagePrompts".
      
      "title": A compelling, SEO-friendly title for the page.
      "metaDescription": An engaging meta description for search results.
      "htmlBodyContent": A single string of HTML for the <body>. Do NOT include <html>, <head>, or <body> tags.
        - Insert placeholders: "[HERO_IMAGE]", "[FEATURES_IMAGE]", and "[CTA_BANNER_IMAGE]".
        - Insert the placeholder: "[CTA_BUTTON]".
      "imagePrompts": A JSON object with three keys: "hero", "features", and "ctaBanner".
        - Values must be descriptive prompts for generating visually stunning, relevant images (16:9 aspect ratio).
    `;

    const contentGenerationResponse = await ai.models.generateContent({
      model: textModel,
      contents: contentPrompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            metaDescription: { type: Type.STRING },
            htmlBodyContent: {
              type: Type.STRING,
            },
            imagePrompts: {
              type: Type.OBJECT,
              properties: {
                hero: { type: Type.STRING },
                features: { type: Type.STRING },
                ctaBanner: { type: Type.STRING },
              },
              required: ["hero", "features", "ctaBanner"],
            },
          },
          required: ["title", "metaDescription", "htmlBodyContent", "imagePrompts"],
        }
      }
    });

    if (!contentGenerationResponse.text) {
        throw new Error("No text returned from content generation.");
    }

    const generatedContent = JSON.parse(contentGenerationResponse.text);
    const { title, metaDescription, htmlBodyContent, imagePrompts } = generatedContent;

    onProgress(2, 'Creating 3 images. This is the slowest step due to API limits...');

    const imageResponses = [];
    const prompts = [imagePrompts.hero, imagePrompts.features, imagePrompts.ctaBanner];
    
    for (let i = 0; i < prompts.length; i++) {
        onProgress(2, `Generating image ${i + 1} of 3...`);
        const response = await generateImageWithRetry(ai, prompts[i]);
        imageResponses.push(response);
        if (i < prompts.length - 1) {
            onProgress(2, `Waiting 61 seconds to avoid rate limits...`);
            await delay(61000); // Drastically increased delay
        }
    }
    
    const base64Images = imageResponses.map(res => {
        if (!res.candidates || !res.candidates[0] || !res.candidates[0].content || !res.candidates[0].content.parts) {
            throw new Error("Invalid response structure from image generation.");
        }
        for (const part of res.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        throw new Error("Image data not found in response part");
    });

    onProgress(3, 'Assembling the final page...');

    let finalHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title><meta name="description" content="${metaDescription}"><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-gray-100 text-gray-800 font-sans"><div class="container mx-auto p-4 md:p-8">${htmlBodyContent}</div></body></html>`;
    finalHtml = finalHtml.replace('[HERO_IMAGE]', `<img src="images/hero.png" alt="Hero image for ${productName}" class="w-full h-auto rounded-lg shadow-lg mb-8">`);
    finalHtml = finalHtml.replace('[FEATURES_IMAGE]', `<img src="images/features.png" alt="Features of ${productName}" class="w-full h-auto rounded-lg shadow-md my-8">`);
    finalHtml = finalHtml.replace('[CTA_BANNER_IMAGE]', `<img src="images/cta_banner.png" alt="Call to action banner" class="w-full h-auto rounded-lg shadow-md my-8">`);
    finalHtml = finalHtml.replace(/\[CTA_BUTTON\]/g, `<div class="text-center my-12">${ctaButtonHtml}</div>`);
    
    const previewHtmlBase64 = btoa_utf8(finalHtml);
    onProgress(4, 'Success! Your post is ready.');
    
    return {
      templateName: templateName,
      previewHtmlBase64: previewHtmlBase64,
      images: base64Images,
    };

  } catch (error: any) {
    console.error("Error generating affiliate post:", error);
    onProgress(0, ''); 
    
    let errorMessage = "An unknown error occurred during generation.";
    if (error instanceof Error) {
        errorMessage = error.message;
        if (errorMessage.includes("429") || errorMessage.includes("Quota") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
             errorMessage = "Persistent API Rate Limit Error. This usually happens on the free tier, even with low traffic. The most common solution is to enable billing on your Google Cloud project. You will still benefit from the free usage tier, but your rate limits will be significantly higher. Please go to the Google Cloud Console, select your project, and add a billing account.";
        }
    }
    
    throw new Error(errorMessage);
  }
};
