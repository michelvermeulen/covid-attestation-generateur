var express = require("express");
var router = express.Router();
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const pdflib = require("pdf-lib");
const { drawLinesOfText } = require("pdf-lib");

/* GET home page. */
router.get("/", function (req, res, next) {
  if (typeof req.body.clear !== "undefined") {
    res.cookie("covidgendata", null);
  } else {
    const cookie = req.cookies.covidgendata;
  }

  let data;
  if (typeof cookie != "undefined") {
    data = JSON.parse(cookie);
  } else {
    data = null;
  }

  res.render("index", { data });
});

router.post("/", function (req, res, next) {
  let data;

  if (req.body && req.body.nom != "") {
    res.cookie("covidgendata", JSON.stringify(req.body));
    data = req.body;
  } else {
    data = req.cookies.covidgendata;
  }
  data.raison = req.body.raison;
  console.log(data);
  editPdf(data);
  res.render("index", {
    data,
  });
});

async function editPdf(data) {
  const existingPdfBytes = fs.readFileSync(path.resolve(__dirname, "../public/layout.pdf"));
  const pdfDoc = await pdflib.PDFDocument.load(existingPdfBytes);
  const pdfBytes = await pdfDoc.save();
}

module.exports = router;
