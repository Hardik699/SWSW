import { RequestHandler } from "express";
import PDFDocument from "pdfkit";

interface EncryptPDFRequest {
  image?: string;
  pdfBase64?: string;
  password: string;
  fileName: string;
}

export const encryptPDF: RequestHandler = async (req, res) => {
  try {
    const { image, password, fileName } = req.body as EncryptPDFRequest;

    if (!image || !password) {
      res.status(400).json({ error: "Missing image or password" });
      return;
    }

    // Convert base64 image to buffer
    const imgBuffer = Buffer.from(image, "base64");

    // Create a new PDF document with password protection and white background
    const doc = new PDFDocument({
      size: "A4",
      userPassword: password,
      ownerPassword: password, // You can set a different owner password if needed
      permissions: {
        printing: "highResolution",
        copying: false,
        modifying: false,
      },
    });

    // Send as file download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}.pdf"`
    );

    // Pipe the PDF document to the response
    doc.pipe(res);

    // Add white background to the entire page
    doc.rect(0, 0, doc.page.width, doc.page.height)
       .fill('#ffffff');

    // Add the image to the PDF
    // We'll scale the image to fit the page
    const pageWidth = doc.page.width - 40; // 20 units margin on each side
    const pageHeight = doc.page.height - 40;

    doc.image(imgBuffer, 20, 20, {
      fit: [pageWidth, pageHeight],
      align: "center",
      valign: "center",
    });

    // End the document
    doc.end();
  } catch (error) {
    console.error("Error generating password-protected PDF:", error);
    res.status(500).json({ error: "Failed to generate password-protected PDF" });
  }
};
