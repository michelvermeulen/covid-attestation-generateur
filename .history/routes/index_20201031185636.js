var express = require("express");
var router = express.Router();
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const pdflib = require("pdf-lib");
const { drawLinesOfText, drawSvgPath } = require("pdf-lib");
const QRCode = require("qrcode");
const { default: Stream } = require("pdf-lib/cjs/core/streams/Stream");

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
    data = JSON.parse(req.cookies.covidgendata);
  }
  data.raison = req.body.raison;

  const pdf = await editPdf(data);

  res.setHeader("Content-Type", "application/pdf");
  // res.setHeader("Content-Disposition", "attachment; filename=attestation.pdf");
  res.setHeader("Content-Disposition", "inline; filename=attestation.pdf");
  res.send(Buffer.from(pdf.buffer));
});

async function editPdf(data) {
  const existingPdfBytes = fs.readFileSync(path.resolve(__dirname, "../public/layout.pdf"));
  const pdfDoc = await pdflib.PDFDocument.load(existingPdfBytes);

  const page1 = pdfDoc.getPages()[0];

  const font = await pdfDoc.embedFont(pdflib.StandardFonts.Helvetica);

  const drawText = (text, x, y, size = 11) => {
    page1.drawText(text, { x, y, size, font });
  };

  const { nom, prenom, datenaissance, lieunaissance, adresse, codepostal, ville, raison } = data;

  Date.prototype.getFrenchFormat = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [(dd > 9 ? "" : "0") + dd, (mm > 9 ? "" : "0") + mm, this.getFullYear()].join("/");
  };
  const date = new Date(datenaissance);
  const now = new Date();
  drawText(prenom + " " + nom, 125, 696);
  drawText(date.getFrenchFormat(), 125, 675);
  drawText(lieunaissance, 305, 675);
  drawText(`${adresse} ${codepostal} ${ville}`, 135, 653);
  drawText(ville, 110, 175);
  drawText(now.getFrenchFormat(), 110, 153);
  drawText(now.getHours() + ":" + now.getMinutes(), 280, 153);
  let crossCoords = [
    [76, 585],
    [76, 535],
    [76, 475],
    [76, 440],
    [76, 400],
    [76, 360],
    [76, 290],
    [76, 250],
    [76, 215],
  ];

  let motifs = ["travail", "achats", "sante", "famille", "handicap", "sport_animaux", "convocation", "missions", "enfants"];

  drawText("x", crossCoords[raison][0], crossCoords[raison][1]);

  const url = await QRCode.toString(
    `
    Crée le : ${now.getFrenchFormat()} à ${now.getHours()}:${now.getMinutes()}
    Nom: ${nom}
    Prénom: ${prenom}
    Naissance: ${datenaissance} à ${lieunaissance}
    Adresse: ${adresse} ${codepostal} ${ville}
    Sortie: ${now.getFrenchFormat()} à ${now.getHours()}:${now.getMinutes()}
    Motifs: ${motifs[raison]}
  `,
    { type: "svg" }
  );

  console.log(url);

  const regexp = new RegExp(/<path stroke="#000000" d="(.*?)"/);
  const svgPath = url.match(regexp);

  page1.moveTo(400, 205);

  page1.drawSvgPath(svgPath[1]);

  // drawSvgPath(url, {
  //   x: 580,
  //   y: 153,
  // });
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

module.exports = router;
