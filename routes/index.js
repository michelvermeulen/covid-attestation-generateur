var express = require("express");
var router = express.Router();
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const pdflib = require("pdf-lib");
const { drawLinesOfText, drawSvgPath } = require("pdf-lib");
const QRCode = require("qrcode");
const { default: Stream } = require("pdf-lib/cjs/core/streams/Stream");
const moment = require("moment-timezone");
var mysql = require("mysql");
const useragent = require("express-useragent");
require("dotenv").config();
var connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

router.get("/", function (req, res, next) {
  res.redirect("/app/");
});

/* GET home page. */
router.get("/app/", function (req, res, next) {
  let cookie = req.cookies.covidgendata;
  let data;
  if (typeof cookie != "undefined") {
    data = JSON.parse(cookie);
  } else {
    data = null;
  }
  if (typeof req.query.clear !== "undefined" || !data) {
    // res.cookie("covidgendata", null, {
    //   maxAge: new Date(0),
    // });
    res.render("index", { data, showForm: true });
  } else {
    res.render("index", { data });
  }
});

router.get("/pdf/", async function (req, res, next) {
  if (typeof req.cookies.covidgendata == "undefined" || JSON.parse(req.cookies.covidgendata).nom.length == 0 || typeof req.query.raison == "undefined") {
    res.redirect("/app/");
  } else {
    data = JSON.parse(req.cookies.covidgendata);
    data.raison = req.query.raison;
    const pdf = await editPdf(data);

    var source = req.headers["user-agent"],
      ua = useragent.parse(source);

    connection.query("INSERT INTO webflandre.covid_hits (user_agent, time) VALUES(?,?)", [req.headers["user-agent"], moment().tz("Europe/Paris").format("YYYY-M-DD HH:mm:ss")], function (err, rows, fields) {
      if (err) throw err;
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", Buffer.byteLength(Buffer.from(pdf.buffer), "utf-8"));
    // res.setHeader("Content-Disposition", "attachment; filename=attestation.pdf");
    res.setHeader("Content-Disposition", "inline; filename=attestation" + new Date().getTime() + ".pdf");
    res.send(Buffer.from(pdf.buffer));
  }
});

router.post("/app/generate", async function (req, res, next) {
  let data;
  if (req.body && typeof req.body.nom !== "undefined") {
    let now = new Date();
    now.setMonth(now.getMonth() + 6);
    res.cookie("covidgendata", JSON.stringify(req.body), {
      maxAge: 15552000000,
    });
    data = req.body;
    res.redirect("/");
  }
});

async function editPdf(data) {
  const existingPdfBytes = fs.readFileSync(path.resolve(__dirname, "../public/layout_new_2.pdf"));
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
  //const date = new Date(datenaissance);
  const now = new Date();
  const localTime = moment().tz("Europe/Paris").format("H:m");
  const localTimeElms = localTime.split(":", 2);
  const localHour = localTimeElms[0].toString().padStart(2, 0) + ":" + localTimeElms[1].toString().padStart(2, 0);
  drawText(prenom + " " + nom, 150, 595);
  drawText(datenaissance, 140, 582);
  drawText(lieunaissance, 240, 582);
  drawText(`${adresse} ${codepostal} ${ville}`, 140, 568);
  drawText(ville, 100, 161);
  drawText(now.getFrenchFormat(), 80, 148);
  drawText(localHour, 180, 148);


  let motifs = ["Travail", "Courses", "Consultation médicale", "Motif familial impérieux, personnes vulnérables ou précaires ou gardes d’enfants", "Assistance handicap", "Sortie & Sport", "Justice", "Intérêt général", "Enfants", "Déplacements de transit et longue distance", "Achats professionnels et livraisons à domicile", "Déménagement", "Démarches administratives ou juridiques", "Culte", "Participation à des rassemblements autorisés"];

  let reasons = [
    "Déplacements entre le domicile et le lieu d’exercice de l’activité professionnelle ou le lieu d’enseignement et de formation, déplacements professionnels ne pouvant être différés",
    "Déplacements pour effectuer des achats de première nécessité ou des retraits de commandes",
    "Déplacements pour des consultations, examens, actes de prévention (dont vaccination) et soins ne pouvant être assurés à distance ou pour l’achat de produits de santé",
    "Motif familial impérieux, personnes vulnérables ou précaires ou gardes d’enfant",
    "Déplacements pour motif familial impérieux, pour l’assistance aux personnes vulnérables ou  précaires ou pour la garde d’enfants",
    "Déplacements des personnes en situation de handicap et de leur accompagnant",
    "Déplacements dans un rayon maximal de dix kilomètres autour du domicile, liés soit à l'activité physique individuelle des personnes, à l'exclusion de toute pratique sportive collective, soit à la promenade avec les seules personnes regroupées dans un même domicile",
    "Déplacements pour répondre à une convocation judiciaire ou administrative, déplacements pour se rendre chez un professionnel du droit, pour un acte ou une démarche qui ne peuvent être réalisés à distance",
    "Déplacements pour participer à des missions d’intérêt général sur demande de l’autorité administrative",
    "Déplacement pour chercher les enfants à l’école et à l’occasion de leurs activités périscolaires",
    "Déplacements pour effectuer des achats de fournitures nécessaires à l'activité professionnelle, ou pour des livraisons à domicile",
    "Déplacements liés à un déménagement résultant d'un changement de domicile et déplacements indispensables à l'acquisition ou à la location d’une résidence principale, insusceptibles d'être différés",
    "Déplacements pour se rendre dans un service public pour un acte ou une démarche qui ne peuvent être réalisés à distance",
    "Déplacements à destination ou en provenance d'un lieu de culte",
    "Participation à des rassemblements, réunions ou activités sur la voie publique ou dans un lieu ouvert au public qui ne sont pas interdits en application de l'article 3"
  ];

  let text = reasons[raison - 1];
  let words = text.split(' ');
  let y = 400;
  while (words.length > 0) {
    let portion = '';
    while (portion.length < 70) {
      portion += words.splice(0, 1) + ' ';
    }
    // let portion = text.slice(0, 100);
    // text = text.slice(100);
    drawText(portion, 55, y, 14);
    y -= 20;
  }
  // drawText(reasons[raison - 1], 50, 300);

  const url = await QRCode.toString(
    `
    Crée le : ${now.getFrenchFormat()} à ${localHour}
    Nom: ${nom}
    Prénom: ${prenom}
    Naissance: ${datenaissance} à ${lieunaissance}
    Adresse: ${adresse} ${codepostal} ${ville}
    Sortie: ${now.getFrenchFormat()} à ${localHour}
    Motifs: ${motifs[raison - 1]}
  `,
    { type: "svg" }
  );

  const regexp = new RegExp(/<path stroke="#000000" d="(.*?)"/);
  const svgPath = url.match(regexp);

  page1.moveTo(430, 205);

  page1.drawSvgPath(svgPath[1], { scale: 1.5 });

  pdfDoc.addPage();

  const page2 = pdfDoc.getPages()[1];

  page2.moveTo(10, page2.getHeight() - 10);

  page2.drawSvgPath(svgPath[1], { scale: 5 });

  // drawSvgPath(url, {
  //   x: 580,
  //   y: 153,
  // });
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

module.exports = router;
