module.exports = (sequelize, DataTypes) => {
  const GameMove = sequelize.define(
    "GameMove",
    {
      gameId: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      moveNum: {
        type: DataTypes.INTEGER,
        autoincrement: true
      },
      player: DataTypes.STRING,
      src: DataTypes.STRING,
      dest: DataTypes.STRING
    },
    {
      timestamps: false
    }
  );
  GameMove.removeAttribute("id");
  GameMove.associate = models => {
    // associations can be defined here
  };
  return GameMove;
};
