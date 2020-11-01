var express = require("express");
var router = express.Router();
const bodyParser = require("body-parser");
const fs = require("fs");

/* GET home page. */
router.get("/", function (req, res, next) {
  const cookie = req.cookies.covidgendata;

  let data;
  if (typeof cookie != "undefined") {
    data = JSON.parse(cookie);
  } else {
    data = null;
  }

  res.render("index", { data });
});

router.post("/", function (req, res, next) {
  if (req.body && req.body.nom != "") {
    res.cookie("covidgendata", JSON.stringify(req.body));
  }
  editPdf(body);
  res.render("index", {
    data: req.body,
  });
});

async function editPdf(data) {
  const existingPdfBytes = fs.readFileSync("./../public/layout.pdf");
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pdfBytes = await pdfDoc.save();
}

module.exports = router;
