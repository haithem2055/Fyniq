
import { GoogleGenAI, Type } from "@google/genai";
import { ExpenseCategory, InvoiceData } from "../types";

export const fileToGenerativePart = async (file: File): Promise<{ data: string, mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (!base64String) {
          reject(new Error("Failed to read file"));
          return;
      }
      
      const parts = base64String.split(',');
      const data = parts.length > 1 ? parts[1] : base64String;
      
      // Determine mimeType dynamicallly
      let mimeType = file.type;
      if (!mimeType && base64String.startsWith('data:')) {
          mimeType = base64String.substring(5, base64String.indexOf(';'));
      }
      if (!mimeType) mimeType = 'image/jpeg'; // Fallback

      resolve({ data, mimeType });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 5, initialDelay = 3000): Promise<T> {
  let currentDelay = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const status = error?.status || error?.code || error?.error?.code || error?.response?.status;
      const message = error?.message || error?.error?.message || '';
      const isRateLimit = status === 429 || message.includes('429') || message.includes('quota');
      
      if (isRateLimit && i < retries - 1) {
        await delay(currentDelay);
        currentDelay *= 2;
        continue;
      }
      throw error;
    }
  }
  throw new Error("API Error");
}

export const processInvoiceWithGemini = async (fileData: { data: string, mimeType: string }, defaultCurrency: string = 'OMR'): Promise<Omit<InvoiceData, 'id'>> => {
  return retryWithBackoff(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemInstruction = `
      Identity: You are "Fyniq AI", an expert Omani Accountant.
      
      **CRITICAL STEP - VALIDATION:**
      First, analyze the image content. Is this a valid financial document (Invoice, Receipt, POS Slip, Tax Invoice, or Payment Confirmation Screenshot)?
      - If the image is a person, animal, landscape, random object, or unreadable blur: Set 'isInvoice' to FALSE.
      - If the image contains financial transaction details (amount, date, vendor): Set 'isInvoice' to TRUE.

      **Processing Rules (Only if isInvoice is TRUE):**
      1. **Vendor**: Look for merchant name (e.g., "ARAB SWEETS").
      2. **Date**: Extract the date. If time is present, include it in description.
      3. **Card Processing**: 
         - Check if it's a Visa/MasterCard receipt. 
         - Extract last 4 digits of the card (e.g. from 463609******3970, extract "3970").
         - Extract Auth Code/RRN if available.
      4. **Oman VAT Logic**: If it's a small grocery/sweet shop POS receipt, it's usually standard rated (5%) included in price, or Zero-rated if it's basic food.
      5. **Currency**: Default to OMR.

      **Output Fields**:
      - isInvoice: Boolean (True/False).
      - paymentMethod: 'CARD' if visa/mastercard details found, otherwise 'CASH'.
      - cardLast4: String (Last 4 digits only).
      - authCode: String (Auth/Approval code).
      - vatStatus: If POS receipt from a bank, set to 'مطابق' if total matches.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: fileData.mimeType, data: fileData.data } },
          { text: "Analyze this image. Validate if it is a receipt first." }
        ]
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isInvoice: { type: Type.BOOLEAN },
            vendorName: { type: Type.STRING },
            vendorPhone: { type: Type.STRING },
            vendorTaxId: { type: Type.STRING },
            date: { type: Type.STRING },
            totalAmount: { type: Type.NUMBER },
            vatAmount: { type: Type.NUMBER },
            originalAmount: { type: Type.NUMBER },
            currency: { type: Type.STRING },
            category: { type: Type.STRING, enum: Object.values(ExpenseCategory) },
            description: { type: Type.STRING },
            vatStatus: { type: Type.STRING, enum: ['مطابق', 'غير مطابق', 'معفى', 'صفرية'] },
            paymentMethod: { type: Type.STRING, enum: ['CARD', 'CASH', 'TRANSFER'] },
            cardLast4: { type: Type.STRING },
            authCode: { type: Type.STRING }
          },
          required: ["isInvoice", "vendorName", "date", "totalAmount", "vatAmount", "originalAmount", "currency", "category", "description", "vatStatus"]
        }
      }
    });

    const parsedResponse = JSON.parse(response.text || "{}");

    // Strict Validation Check
    if (parsedResponse.isInvoice === false) {
        throw new Error("NOT_AN_INVOICE");
    }

    return parsedResponse;
  });
};

export const sendFinancialQuery = async (invoices: InvoiceData[], userMessage: string, chatHistory: {role: string, content: string}[]) => {
    return retryWithBackoff(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const dataContext = invoices.map(inv => ({
            date: inv.date,
            vendor: inv.vendorName,
            category: inv.category,
            totalOMR: inv.totalAmount,
            method: inv.paymentMethod,
            card: inv.cardLast4
        }));

        const systemInstruction = `أنت المستشار المالي لـ "فينيك الذكي". لديك صلاحية الوصول لهذه البيانات: ${JSON.stringify(dataContext)}. ساعد المستخدم في تتبع مصاريفه باللغة العربية.`;
        const chat = ai.chats.create({ model: 'gemini-3-flash-preview', config: { systemInstruction } });
        const response = await chat.sendMessage({ message: userMessage });
        return response.text;
    });
};
