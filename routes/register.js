const express = require("express");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const models = require("../models");

const router = express.Router();

router.get("/", (req, res) => {
  console.log(req.cookies);
  res.render("register", {
    title: "New player registration",
    csrfToken: req.csrfToken()
  });
});

router.post("/", async (req, res) => {
  console.log(req);
  const newPlayer = {
    lastName: req.body.lastName,
    firstName: req.body.firstName,
    email: req.body.email,
    password: req.body.password
  };

  const { error } = models.Player.validate(newPlayer);
  if (error) {
    console.log("pswd", error);
    const errMsg = error.details[0].message;
    if (errMsg.indexOf("password") > -1) {
      const errors = [
        "Password should be atleast 8 characters.",
        "Password should contain atleast 1 uppercase ,1 lowercase,  1 numeral and 1 special character(!,@,#,$,%,^,&,*)"
      ];
      res.render("register", {
        error: errors,
        csrfToken: req.csrfToken()
      });
    } else {
      res.render("register", {
        error: error.details[0].message,
        csrfToken: req.csrfToken()
      });
    }
    return;
  }

  let player = await models.Player.findOne({
    where: { email: req.body.email }
  });
  if (player) {
    res.render("register", {
      error: "User already registered.",
      csrfToken: req.csrfToken()
    });
    return;
  }

  player = new models.Player(
    _.pick(req.body, ["firstName", "lastName", "email", "password"])
  );
  const salt = await bcrypt.genSalt(11);
  player.password = await bcrypt.hash(player.password, salt);
  await player.save();

  res.render("login", { csrfToken: req.csrfToken() });
});

module.exports = router;
