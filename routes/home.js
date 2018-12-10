const express = require("express");
const models = require("../models");

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("home:", req.session);

  if (req.session && req.session.email) {
    const player = await models.Player.findOne({
      where: { email: req.session.email }
    });

    if (player) {
      res.locals.email = player.dataValues.email;
      res.locals.name = `${player.dataValues.firstName} ${
        player.dataValues.lastName
      }`;

      res.render("home", {
        title: "Home Page",
        name: `${player.dataValues.firstName} ${player.dataValues.lastName}`,
        email: player.dataValues.email
      });
    } else {
      req.session.destroy();
      res.render("login", { title: "Checkers", csrfToken: req.csrfToken() });
    }
  }
});

module.exports = router;
