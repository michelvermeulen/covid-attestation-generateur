var express = require("express");
var router = express.Router();
const bodyParser = require("body-parser");

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
  const body = req.body;
  console.log(body);
  if (body.nom) {
    res.cookie("covidgendata", JSON.stringify(req.body));
  }

  res.render("index");
});

function editPdf(data) {

  const existingPdfBytes =

}

module.exports = router;
