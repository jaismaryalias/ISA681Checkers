const joi = require("joi");

module.exports = (sequelize, DataTypes) => {
  const Player = sequelize.define(
    "Player",
    {
      firstName: {
        type: DataTypes.STRING,
        minlength: 5
      },
      lastName: {
        type: DataTypes.STRING,
        minlength: 5
      },
      email: {
        type: DataTypes.STRING,
        primaryKey: true,
        min: 5,
        max: 255
      },
      password: {
        type: DataTypes.STRING,
        min: 8,
        max: 15
      }
    },
    {
      timestamps: false
    }
  );
  Player.associate = models => {
    // associations can be defined here
  };
  Player.removeAttribute("id");

  Player.validate = player => {
    const schema = {
      firstName: joi.string().required(),
      lastName: joi.string().required(),
      email: joi
        .string()
        .min(5)
        .max(255)
        .email()
        .required(),
      password: joi
        .string()
        .required()
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/)
    };
    return joi.validate(player, schema);
  };

  Player.validateLogin = login => {
    const schema = {
      email: joi
        .string()
        .min(5)
        .max(255)
        .email()
        .required(),
      password: joi.string().required()
    };
    return joi.validate(login, schema);
  };
  return Player;
};
