const express = require("express");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");
const Seller = require("../models/Seller");

const router = express.Router();

const templates = {
  en: {
    title: "Now accepting online orders on GullyFoods",
    scan: "Scan to order from this shop",
    tagline: "Your neighborhood store, now online.",
    powered: "Powered by GullyFoods",
  },
  hi: {
    title: "अभी गलीफ़ूड्स से ऑनलाइन ऑर्डर करें",
    scan: "ऑर्डर करने के लिए स्कैन करें",
    tagline: "आपकी गली की दुकान, अब ऑनलाइन",
    powered: "Powered by GullyFoods", 
  },
};

router.get("/all-shops-pdf", async (req, res) => {
  try {
    const lang = req.query.lang || "both";

    const sellers = await Seller.find()
      .populate({
        path: "shop",
        select: "name category address",
      })
      .select("qrCode phone")
      .lean();

    const valid = sellers.filter((s) => s.shop && s.qrCode);

    if (!valid.length)
      return res.status(400).json({ message: "No valid shops found" });

    const tmpDir = path.join(__dirname, "../tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const filePath = path.join(tmpDir, "all-shops.pdf");

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const logoPath = path.join(__dirname, "../assets/AppLogo.png");
    const hindiFont = path.join(
      __dirname,
      "../fonts/NotoSansDevanagari-Regular.ttf"
    );

    const renderPage = async (shop, seller, language) => {
      const t = templates[language];
      
      // Determine the primary font path for the current language
      const primaryFontPath = language === "hi" ? hindiFont : "Helvetica-Bold";

      // 1. Set the primary font for the page's main content
      doc.font(primaryFontPath);
      doc.fillColor("black");

      const logoWidth = 250; 
      const logoX = (doc.page.width - logoWidth) / 2; 

      // ✅ LOGO
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, logoX, 40, { width: logoWidth }); 
      }

      // Set Y position for text below the logo area
      doc.y = 180; 

      // ✅ SHOP NAME (in Green - ALWAYS in English/Helvetica-Bold)
      doc.font("Helvetica-Bold"); 
      doc.moveDown(0);
      doc.fillColor("green"); 
      doc.fontSize(26).text(shop.name, { align: "center" });
      
      // --- Switch back to primary font and black color ---
      doc.font(primaryFontPath); 
      doc.fillColor("black"); 

      // ✅ HEADLINE
      doc.moveDown(0.3);
      doc.fontSize(18).text(t.title, { align: "center" });

      // ✅ QR CODE
      let qrBase64 = seller.qrCode;
      if (!qrBase64.startsWith("data:image")) {
        qrBase64 = await QRCode.toDataURL(seller.qrCode, { width: 500 });
      }

      const qrImg = qrBase64.replace(/^data:image\/png;base64,/, "");
      const qrBuffer = Buffer.from(qrImg, "base64");

      doc.moveDown(1.5);
      const qrCodeWidth = 350;
      const qrX = (doc.page.width - qrCodeWidth) / 2;
      const qrY = doc.y; // Get current Y position
      doc.image(qrBuffer, qrX, qrY, { width: qrCodeWidth });

      // Jump past the QR code area
      doc.y = qrY + qrCodeWidth + 10; 

      // ✅ SCAN TEXT
      doc.fontSize(14).text(t.scan, { align: "center" });

      // ✅ TAGLINE
      doc.moveDown(0.8);
      doc.fontSize(12).text(t.tagline, { align: "center" });

      // ✅ FOOTER (ALWAYS in English/Helvetica-Bold)
      doc.font("Helvetica-Bold"); 
      doc.fontSize(10).text(
        `${t.powered} | www.gullyfoods.app | @gullyfoods_express`,
        0,
        770, 
        { align: "center" }
      );
    };

    let pageCount = 0;

    for (let s of valid) {
      // English Page
      if (lang === "en" || lang === "both") {
        if (pageCount > 0) doc.addPage();
        await renderPage(s.shop, s, "en");
        pageCount++;
      }

      // Hindi Page
      if (lang === "hi" || lang === "both") {
        if (pageCount > 0) doc.addPage();
        await renderPage(s.shop, s, "hi");
        pageCount++;
      }
    }

    if (pageCount === 0) {
      doc.end();
      return res.status(400).json({
        message:
          "No pages could be generated for the shops using the specified language filter.",
      });
    }

    doc.end();

    stream.on("finish", () => {
      res.download(filePath, "GullyFoods-All-Shops.pdf", () => {
      });
    });
  } catch (err) {
    console.error("PDF Error:", err);
    res
      .status(500)
      .json({ message: "PDF generation failed", error: err.message });
  }
});

module.exports = router;