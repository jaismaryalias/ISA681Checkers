const express = require("express");
const Sequelize = require("sequelize");
const models = require("./../models");

const gameRouter = express.Router();
const { Op } = Sequelize;

gameRouter.get("/", async (req, res) => {
  const { email } = req.session;
  const { name } = req.session;
  const game = await models.Game.findOne({
    where: {
      status: "ready",
      [Op.or]: [{ player1_id: email }, { player2_id: email }]
    }
  });

  if (game) {
    console.log("gameExists", game.dataValues);
    res.render("checkersGame", {
      title: "Lets Play Checkers",
      player1: game.dataValues.player1_id,
      player2: game.dataValues.player2_id,
      gameRoom: game.dataValues.gameId,
      my_name: name,
      my_email: email
    });
  } else {
    res.redirect("/login");
  }
});
module.exports = gameRouter;
