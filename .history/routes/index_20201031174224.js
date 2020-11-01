var express = require("express");
var router = express.Router();
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const pdflib = require("pdf-lib");
const { drawLinesOfText } = require("pdf-lib");

/* GET home page. */
router.get("/", function (req, res, next) {
  let cookie;
  if (typeof req.body.clear !== "undefined") {
    res.cookie("covidgendata", null);
  } else {
    cookie = req.cookies.covidgendata;
  }

  let data;
  if (typeof cookie != "undefined") {
    data = JSON.parse(cookie);
  } else {
    data = null;
  }

  res.render("index", { data });
});

router.post("/", async function (req, res, next) {
  let data;
  if (req.body && typeof req.body.nom !== "undefined") {
    res.cookie("covidgendata", JSON.stringify(req.body));
    data = req.body;
  } else {
    data = req.cookies.covidgendata;
  }
  data.raison = req.body.raison;

  const pdf = await editPdf(data);

  res.setHeader("Content-Type", "application/pdf");
  // res.setHeader("Content-Disposition", "attachment; filename=attestation.pdf");
  res.setHeader("Content-Disposition", "inline; filename=attestation.pdf");
  res.send(Buffer.from(pdf.buffer));
});

async function editPdf(data) {
  console.log(data);
  const existingPdfBytes = fs.readFileSync(path.resolve(__dirname, "../public/layout.pdf"));
  const pdfDoc = await pdflib.PDFDocument.load(existingPdfBytes);

  const page1 = pdfDoc.getPages()[0];

  const font = await pdfDoc.embedFont(pdflib.StandardFonts.Helvetica);

  const drawText = (text, x, y, size = 11) => {
    page1.drawText(text, { x, y, size, font });
  };

  const { nom, prenom, datenaissance, lieunaissance, adresse, codepostal, ville, datesortie } = JSON.parse(data);

  drawText(nom, 80, 600);
  drawText(prenom, 105, 625);
  drawText(`${datenaissance} à ${lieunaissance}`, 173, 601);
  drawText(adresse, 198, 577);
  drawText(`${codepostal} ${ville}`, 50, 557);

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

module.exports = router;
