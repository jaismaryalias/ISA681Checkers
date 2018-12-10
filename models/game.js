const joi = require("joi");

module.exports = (sequelize, DataTypes) => {
  const Game = sequelize.define(
    "Game",
    {
      gameId: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      player1_id: DataTypes.STRING,
      player2_id: DataTypes.STRING,
      status: DataTypes.STRING,
      result: DataTypes.STRING
    },
    {
      timestamps: false
    }
  );
  Game.removeAttribute("id");

  Game.validate = gameInfo => {
    const schema = {
      gameId: joi.INTEGER.required(),
      player1_id: joi.string().email(),
      player2_id: joi.string().email(),
      status: joi.string().required(),
      result: joi.string().required()
    };
    return joi.validate(gameInfo, schema);
  };

  Game.validateEmail = email => {
    const schema = {
      player2_id: joi.string().email()
    };
    return joi.validate(email, schema);
  };

  Game.associate = models => {
    // associations can be defined here
  };
  return Game;
};
