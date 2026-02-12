import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, TextRun, AlignmentType, BorderStyle, HeadingLevel, TableLayoutType, Header } from "docx";
import FileSaver from "file-saver";
import { InvoiceData, DashboardStats } from "../types";

export const generateWordDocument = async (invoices: InvoiceData[], stats: DashboardStats) => {
    // Existing logic for general report (kept as fallback or separate option)
    return generateVatReturnReport(invoices);
};

export const generateVatReturnReport = async (invoices: InvoiceData[]) => {
  const date = new Date().toLocaleDateString('ar-OM');

  // Filter Logic for Omani VAT Return Boxes
  
  // Box 1b (Input): Standard Rated Purchases (5%)
  const standardRatedInvoices = invoices.filter(inv => inv.vatStatus === 'مطابق' && inv.vatAmount > 0);
  const totalStandardBase = standardRatedInvoices.reduce((acc, curr) => acc + (curr.totalAmount - curr.vatAmount), 0);
  const totalStandardVat = standardRatedInvoices.reduce((acc, curr) => acc + curr.vatAmount, 0);

  // Box 3b (Input): Zero Rated Purchases
  const zeroRatedInvoices = invoices.filter(inv => inv.vatStatus === 'صفرية' || (inv.vatAmount === 0 && inv.vatStatus === 'مطابق' && inv.category === 'تكلفة البضاعة المباعة')); 
  const totalZeroRated = zeroRatedInvoices.reduce((acc, curr) => acc + curr.totalAmount, 0);

  // Box 7 (Input): Exempt Purchases
  const exemptInvoices = invoices.filter(inv => inv.vatStatus === 'معفى' || inv.category === 'رواتب وأجور' || inv.category === 'مصاريف تشغيلية'); // Salaries are out of scope usually, but simplified for mapping
  const totalExempt = exemptInvoices.reduce((acc, curr) => acc + curr.totalAmount, 0);

  // Helper to create Arabic text run
  const arabicText = (text: string, bold: boolean = false, size: number = 24, color: string = "000000") => 
    new TextRun({
      text: text,
      font: "Times New Roman",
      bold: bold,
      size: size,
      color: color,
      rightToLeft: true,
    });

  // --- VAT RETURN HELPER TABLE ---
  const vatReturnHeader = new TableRow({
    children: [
        new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, shading: { fill: "10B981" }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [arabicText("المبلغ (ر.ع)", true, 24, "FFFFFF")] })] }),
        new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, shading: { fill: "10B981" }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [arabicText("بند الإقرار الضريبي (المدخلات)", true, 24, "FFFFFF")] })] }),
    ]
  });

  const rowStandardBase = new TableRow({
    children: [
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: totalStandardBase.toFixed(3), bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, bidirectional: true, children: [arabicText("المشتريات الخاضعة للنسبة الأساسية (5%) - قبل الضريبة")] })] }),
    ]
  });

  const rowStandardVat = new TableRow({
    children: [
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: totalStandardVat.toFixed(3), bold: true, color: "DC2626" })] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, bidirectional: true, children: [arabicText("ضريبة المدخلات القابلة للاسترداد (VAT)")] })] }),
    ]
  });

  const rowZero = new TableRow({
    children: [
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: totalZeroRated.toFixed(3), bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, bidirectional: true, children: [arabicText("المشتريات الخاضعة للنسبة الصفرية (0%)")] })] }),
    ]
  });

  const rowExempt = new TableRow({
    children: [
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: totalExempt.toFixed(3), bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, bidirectional: true, children: [arabicText("المشتريات المعفاة من الضريبة")] })] }),
    ]
  });

  // --- DETAILED INVOICE TABLE ---
  const detailHeader = new TableRow({
    tableHeader: true,
    children: [
      "الرقم الضريبي", "الضريبة", "الإجمالي", "الحالة", "المورد", "التاريخ"
    ].map(text => 
      new TableCell({
        shading: { fill: "E0F2F1" },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, children: [arabicText(text, true, 20)] })],
      })
    )
  });

  const detailRows = invoices.map(inv => 
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: inv.vendorTaxId || "-", size: 18 })] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: inv.vatAmount.toFixed(3), color: inv.vatAmount > 0 ? "DC2626" : "000000", size: 20 })] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: inv.totalAmount.toFixed(3), bold: true, size: 20 })] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, children: [arabicText(inv.vatStatus, false, 20)] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, bidirectional: true, children: [arabicText(inv.vendorName, false, 20)] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: inv.date, size: 18 })] })] }),
      ],
    })
  );

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Title
        new Paragraph({
            alignment: AlignmentType.CENTER,
            bidirectional: true,
            heading: HeadingLevel.TITLE,
            children: [arabicText("فينيك الذكي - مساعد الإقرار الضريبي", true, 48, "047857")],
            spacing: { after: 200 }
        }),
        
        new Paragraph({
            alignment: AlignmentType.CENTER,
            bidirectional: true,
            children: [arabicText(`تاريخ التقرير: ${date}`, false, 28)],
            spacing: { after: 400 }
        }),

        // Guidance Text
        new Paragraph({
            bidirectional: true,
            children: [arabicText("أدناه ملخص للمدخلات (المشتريات) مصنفة حسب خانات بوابة جهاز الضرائب. يرجى استخدام هذه الأرقام للمساعدة في تعبئة إقرارك الضريبي.", false, 24)],
            spacing: { after: 200 }
        }),

        // VAT Summary Table
        new Table({
            layout: TableLayoutType.FIXED,
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [vatReturnHeader, rowStandardBase, rowStandardVat, rowZero, rowExempt],
            spacing: { after: 400 }
        }),

        // Warning Section if any Standard Rated invoice misses Tax ID
        ...(standardRatedInvoices.some(inv => !inv.vendorTaxId) ? [
            new Paragraph({
                bidirectional: true,
                children: [arabicText("⚠️ تنبيه: توجد فواتير خاضعة للضريبة لا تحتوي على رقم ضريبي للمورد. قد لا يقبل جهاز الضرائب استرداد هذه المبالغ.", true, 24, "DC2626")],
                spacing: { before: 200, after: 200 }
            })
        ] : []),

        new Paragraph({
            bidirectional: true,
            children: [arabicText("تفاصيل الفواتير المسجلة:", true, 28)],
            spacing: { before: 400, after: 200 }
        }),

        // Detailed Table
        new Table({
            layout: TableLayoutType.FIXED,
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [detailHeader, ...detailRows],
        }),

        // Disclaimer
        new Paragraph({
            alignment: AlignmentType.CENTER,
            bidirectional: true,
            children: [arabicText("ملاحظة: هذا التقرير هو أداة مساعدة فقط. المسؤولية القانونية للإقرار الضريبي تقع على عاتق الخاضع للضريبة.", false, 16, "64748B")],
            spacing: { before: 600 }
        })
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  FileSaver.saveAs(blob, `إقرار-ضريبي-فينيك-${date.replace(/\//g, '-')}.docx`);
};