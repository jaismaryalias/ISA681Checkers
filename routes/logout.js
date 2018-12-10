const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  req.session.destroy();
  res.render("index", { logout: "You have successfully logged out." });
});

module.exports = router;
