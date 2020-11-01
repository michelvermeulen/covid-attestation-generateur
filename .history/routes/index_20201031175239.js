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

  let reasons = ["travail", "shopping", "medical", ""];

  const page1 = pdfDoc.getPages()[0];

  const font = await pdfDoc.embedFont(pdflib.StandardFonts.Helvetica);

  const drawText = (text, x, y, size = 11) => {
    page1.drawText(text, { x, y, size, font });
  };

  const { nom, prenom, datenaissance, lieunaissance, adresse, codepostal, ville, datesortie } = JSON.parse(data);

  Date.prototype.getFrenchFormat = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [(dd > 9 ? "" : "0") + dd, (mm > 9 ? "" : "0") + mm, this.getFullYear()].join("/");
  };
  const date = new Date(datenaissance);

  drawText(prenom + " " + nom, 125, 696);
  drawText(date.getFrenchFormat(), 125, 675);
  drawText(lieunaissance, 305, 675);
  drawText(`${adresse} ${codepostal} ${ville}`, 135, 653);

  let crossCoords = [[105, 653]];
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

module.exports = router;
