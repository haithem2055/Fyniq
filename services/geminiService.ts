
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

export const processInvoiceWithGemini = async (
  fileData: { data: string, mimeType: string }, 
  defaultCurrency: string = 'OMR',
  scanMode: 'tax_invoice' | 'bank_receipt' = 'tax_invoice'
): Promise<Omit<InvoiceData, 'id'>> => {
  return retryWithBackoff(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const isBankMode = scanMode === 'bank_receipt';

    const systemInstruction = `
      Identity: You are "Fyniq AI", an expert Omani Accountant.
      
      **CRITICAL STEP - VALIDATION:**
      First, analyze the image content. Is this a valid financial document?
      - If scanMode is 'tax_invoice': Look for a Tax Invoice, Bill, or Receipt.
      - If scanMode is 'bank_receipt': Look for a Bank POS Slip, Payment Confirmation, or Card Receipt.
      - If the image is random/unreadable: Set 'isInvoice' to FALSE.
      - Otherwise: Set 'isInvoice' to TRUE.

      **Processing Rules (Only if isInvoice is TRUE):**
      1. **Vendor/Company**: Identify the merchant name.
      2. **Bank Name**: ${isBankMode ? 'MANDATORY: Identify the bank (e.g., Bank Muscat, NBO, Bank Dhofar).' : 'Optional: Identify the bank if it is a POS receipt.'}
      3. **Date**: Extract the date accurately.
      4. **Card Processing**: 
         - ${isBankMode ? 'MANDATORY: Extract last 4 digits of the card and Auth Code.' : 'Optional: Extract card details if present.'}
      5. **Oman VAT Logic**: 
         - If tax_invoice: Extract VAT amount and Tax ID if available.
         - If bank_receipt: VAT is usually included in total; set vatAmount to 0 unless explicitly shown.
      6. **Currency**: Default to OMR.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: fileData.mimeType, data: fileData.data } },
          { text: `Analyze this image as a ${scanMode.replace('_', ' ')}. Identify the ${isBankMode ? 'bank and company' : 'merchant and tax details'}.` }
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
            bankName: { type: Type.STRING },
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
