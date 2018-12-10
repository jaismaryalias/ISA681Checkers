const express = require("express");
require("express-async-errors");
const helmet = require("helmet");
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const https = require("https");
const csrf = require("csurf");
const session = require("express-session");
const cors = require("cors");
const hsts = require("hsts");
const socketIO = require("socket.io");
const xssFilter = require("x-xss-protection");
const ejs = require("ejs");
const models = require("./models");
const error = require("./middleware/error");

const csrfProtection = csrf({ cookie: false });

// Initialize Routes
const indexRouter = require("./routes/index");
const loginRouter = require("./routes/login");
const registerRouter = require("./routes/register");
const homeRouter = require("./routes/home");
const logoutRouter = require("./routes/logout");
const gameRouter = require("./routes/checkersgame");

// Load certificates from ENV
const options = {
  rejectUnauthorized: true,
  key: fs.readFileSync("./bin/certificates/localhost.key"),
  cert: fs.readFileSync("./bin/certificates/localhost.crt")
};

const app = express();
const server = https.createServer(options, app);
const io = socketIO(server);
app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  "/jquery",
  express.static(path.join(__dirname, "/node_modules/jquery/dist/"))
);
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "/public/views"));
app.engine("html", ejs.renderFile);
app.set("view engine", "pug");

app.use(morgan("combined"));
app.use(cors());

app.use(
  session({
    cookieName: "cqsession",
    secret: "jiqch6ec8ker1sinf2orm7",
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 600000,
      secure: true,
      httpOnly: true,
      domain: "localhost"
    }
  })
);

app.use(helmet());
app.use(helmet.noCache());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", "wss://localhost:3001"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    },
    setAllHeaders: true
  })
);
app.use(helmet.noSniff());
app.use(helmet.referrerPolicy({ policy: "same-origin" }));
app.use(helmet.frameguard({ action: "sameorigin" }));

const SIXTY_DAYS_IN_SECONDS = 5184000;
app.use(
  hsts({
    maxAge: SIXTY_DAYS_IN_SECONDS,
    includeSubDomains: true,
    preload: true
  })
);

app.use(xssFilter());
app.use(xssFilter({ setOnOldIE: true }));
app.use(csrfProtection);

const AllGames = {};
const globalStats = [];

io.on("connection", socket => {
  console.log(`Event: Player connected, socket id: ${socket.id}`);

  io.sockets.connected[socket.id].emit("takeStats", globalStats);
  socket.on("disconnect", () => {
    setTimeout(() => {
      console.log(`Event: Player disconnected, socket id: ${socket.id}`);
    }, 10000);
  });

  console.log("Connected sockets:");
  Object.keys(io.sockets.sockets).forEach(id => {
    console.log(`ID: ${id}`);
  });

  socket.emit("message", { "inital ": "message from server" });
  socket.on("received", data => {
    console.log("received :", data);
  });

  // create gameroom
  socket.on("createGameRoom", async data => {
    const thisGameId = Math.random() * 100000 || 0;
    let email = data.email;

    socket.join(thisGameId.toString());
    AllGames[thisGameId] = 1;
    console.log("AllGames", AllGames);

    const game = {
      gameId: thisGameId,
      player1_id: email,
      player2_id: "",
      status: "waiting"
    };
    try {
      const gameRoom = await models.Game.create(game);
      if (gameRoom) {
        socket.emit("newGameRoomCreated", {
          gRoomId: thisGameId,
          mySocketId: socket.id,
          numPlayersInRoom: 1
        });
        console.log(
          `Event: GameRoomCreated, Game ID: ${thisGameId}, Player Email: ${email}`
        );
      }
    } catch (err) {
      console.log(err);
      socket.emit("error", err);
    }
  });

  socket.on("getGameRooms", () => {
    socket.emit("gameRoomList", AllGames);
    console.log("sending gameRooms..", AllGames);
  });

  socket.on("joinGameRoom", async newPlayer => {
    const playerInfo = {
      gRoomId: newPlayer.gRoomId,
      mySocketId: socket.id,
      numPlayersInRoom: 2
    };

    const roomId = playerInfo.gRoomId;
    socket.join(roomId);
    AllGames[playerInfo.gRoomId] = 2;

    const { error } = models.Game.validateEmail({
      player2_id: newPlayer.email
    });
    if (error)
      socket.emit("error", { message: "Invalid player Email Received" });

    try {
      const gRoomUpdate = await models.Game.update(
        { player2_id: newPlayer.email, status: "ready" },
        {
          where: { gameId: playerInfo.gRoomId }
        }
      );

      if (gRoomUpdate) {
        socket.emit("joinedRoom", playerInfo);
        const getRoomInfo = await models.Game.findOne({
          where: { gameId: roomId }
        });
        if (getRoomInfo)
          io.to(roomId).emit("startCheckers", getRoomInfo.dataValues);
      }
    } catch (err) {
      console.log(err);
      socket.emit("error", err);
    }
  });

  socket.on("moveTo", async moveSrcDest => {
    console.log(moveSrcDest);
    io.sockets.emit("moved", { move: moveSrcDest });
  });

  socket.on("move", async moveData => {
    console.log(moveData);
    const email = moveData.email;
    const roomId = moveData.roomId;
    const gameMove = {
      gameId: moveData.roomId,
      player: email,
      src: moveData.tile,
      dest: moveData.position
    };
    io.sockets.emit("moved", {
      tile: moveData.tile,
      piece: moveData.piece,
      board: moveData.board
    });

    try {
      console.log("Updating game");
      const gameData = await models.Game.update(
        { status: "playing" },
        {
          where: { gameId: roomId }
        }
      );

      if (gameData) {
        console.log("Updating moves");
      }
    } catch (err) {
      console.error(err);
    }
  });
});

app.use("/", indexRouter);
app.use("/login", loginRouter);
app.use("/register", registerRouter);
app.use("/home", homeRouter);
app.use("/logout", logoutRouter);
app.use("/checkersGame", gameRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next();
});

app.use(error);

module.exports = { app, server };
