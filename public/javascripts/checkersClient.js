const socket = io.connect(
  "https://localhost:3001/",
  {
    secure: true,
    "flash policy port": 3300
  }
);

var App = {
  gRoomId: 0,
  pEmail: "",
  pName: "",
  mySocketId: 0,
  numPlayersInRoom: 0,
  roundCount: 0,
  currCountry: 0,
  totalScore: 0
};

var Game = {
  player1Email: "",
  player2Email: "",
  roomId: 0,
  status: "ready"
};
var localStats = [];
//sockets and functions

socket.on("newGameRoomCreated", function(data) {
  App.gRoomId = data.gRoomId;
  App.mySocketId = data.mySocketId;
  App.numPlayersInRoom = data.numPlayersInRoom;
  App.points = 0;
  console.log(
    "GameRoom created with Id: " +
      App.gRoomId +
      " and socketId: " +
      App.mySocketId +
      " with " +
      App.numPlayersInRoom +
      " Players"
  );
  $("#createGRBtn").attr("disabled", "disabled");

  $(".waitMsg").append(" on Game Room : ", App.gRoomId);
  $(".waitMsg").show();
  var gRoom = [];
  gRoom[App.gRoomId] = App.numPlayersInRoom;
  //showGameRooms(gRoom);
  $("#joinGRBtn").prop("disabled", true);
});

socket.on("gameRoomList", GameRooms => {
  showGameRooms(GameRooms);
});

socket.on("startCheckers", roomInfo => {
  //console.log(roomInfo);
  //$("#startPlayBtn").removeAttr("disabled");
  $(".waitMsg").hide();
  $(".playerJoinedMsg").show();
  $(".joinRoomMsg").show();

  Game.player1Email = roomInfo.player1_id;
  Game.player2Email = roomInfo.player2_id;
  Game.roomId = roomInfo.gameId;
  Game.status = roomInfo.status;
  console.log(Game);

  //var email = $("#myEmail").append();
  $("#player1Id").append(Game.player1Email);
  $("#player2Id").append(Game.Player2Email);
  $("#gameRoom").append(Game.roomId);

  $(".column").show();

  //startCheckers(Game);
});

socket.on("takeStats", function(data) {
  console.log("received stats");
  localStats = data;
  console.log(localStats);
});

//functions

function createGRoom() {
  socket.emit("createGameRoom", { email: App.pEmail });
  console.log("emitted createGameRoom", App.pEmail);
}
function joinRoom() {
  var gRoomId = $("input[type='radio'][name='radiobtn']:checked").val();
  App.gRoomId = gRoomId;
  console.log("->value now: " + App.gRoomId);
  var content = { gRoomId: App.gRoomId, email: App.pEmail };
  console.log("Value of gRoodId:  " + gRoomId);
  socket.emit("joinGameRoom", content);
  $(".joinRoomMsg").hide();
  $("#roomList").hide();
  console.log("GRoomId sent to Join: " + $("input:radio:checked").val());
}
function checkGameRoomStatus() {
  socket.emit("getGameRooms");
  console.log("get the list of game rooms from server");
}
function startCheckers(GameData) {
  console.log("startCheckers", GameData);
  // socket.emit('showBoard', { email: App.pEmail, gRoomId: App.gRoomId });
  //io.to(Game.roomId).emit();

  //to do
  //game logic
}

function showGameRooms(GameRooms) {
  for (var i in GameRooms) {
    if (GameRooms[i] < 2) {
      console.log(i + " has " + GameRooms[i] + " player(s)");
      $(
        "<input type='radio' name='radiobtn' value=" +
          i +
          ">" +
          i +
          "</input><br/>"
      ).appendTo("#roomList");
    }
  }
  console.log(GameRooms);
  const rooms = jQuery.isEmptyObject(GameRooms);
  if (!rooms) {
    $("#joinGRBtn").prop("disabled", false);
    $("#createGRBtn").prop("disabled", true);
  }
}

$(function() {
  $("#joinGRBtn").attr("disabled", "disabled");
  $("#resumeGBtn").attr("disabled", "disabled");
  $("#startPlayBtn").attr("disabled", "disabled");

  $(".column").hide();

  checkGameRoomStatus();

  $("#createGRBtn").one("click", function() {
    createGRoom();
  });
  $("#joinGRBtn").one("click", function() {
    joinRoom();
  });
  $("#startPlayBtn").one("click", () => {
    //startCheckers();
  });

  App.pEmail = $("#sEmail").text();
  console.log("Created global email variable: " + App.pEmail);

  App.pName = $("#sName").text();
  console.log("Created global name variable: " + App.pName);

  //checkers board

  // var socket=io();
  //The initial setup
  var gameBoard = [
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 2, 0, 2, 0, 2, 0],
    [0, 2, 0, 2, 0, 2, 0, 2],
    [2, 0, 2, 0, 2, 0, 2, 0]
  ];
  //arrays to store the instances
  var pieces = [];
  var tiles = [];
  var players = [];

  //distance formula
  var dist = function(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  };
  //Piece object - there are 24 instances of them in a checkers game
  function Piece(element, position) {
    //linked DOM element
    this.element = element;
    //positions on gameBoard array in format row, column
    this.position = position;
    //which player's piece i it
    this.player = "";
    //figure out player by piece id
    if (this.element.attr("id") < 12) this.player = 1;
    else this.player = 2;
    //makes object a king
    this.king = false;
    this.makeKing = function() {
      this.element.css(
        "backgroundImage",
        "url('king1" + this.player + ".png')"
      );
      this.king = true;
    };
    //moves the piece
    this.move = function(tile) {
      this.element.removeClass("selected");
      if (!Board.isValidPlacetoMove(tile.position[0], tile.position[1]))
        return false;
      var move = { dest: [tile.position[0], tile.position[1]] };

      var src = [this.position[0], this.position[1]];
      var dest = [tile.position[0], tile.position[1]];
      //make sure piece doesn't go backwards if it's not a king
      if (this.player == 1 && this.king == false) {
        if (tile.position[0] < this.position[0]) return false;
      } else if (this.player == 2 && this.king == false) {
        if (tile.position[0] > this.position[0]) return false;
      }
      //remove the mark from Board.board and put it in the new spot
      Board.board[this.position[0]][this.position[1]] = 0;
      Board.board[tile.position[0]][tile.position[1]] = this.player;
      this.position = [tile.position[0], tile.position[1]];
      //change the css using board's dictionary
      this.element.css("top", Board.dictionary[this.position[0]]);
      this.element.css("left", Board.dictionary[this.position[1]]);
      //if piece reaches the end of the row on opposite side crown it a king (can move all directions)
      if (!this.king && (this.position[0] == 0 || this.position[0] == 7))
        this.makeKing();
      Board.changePlayerTurn();
      socket.emit("moveTo", { src: src, dest: dest, player: this.player });
      return true;
    };

    //tests if piece can jump anywhere
    this.canJumpAny = function() {
      if (
        this.canOpponentJump([this.position[0] + 2, this.position[1] + 2]) ||
        this.canOpponentJump([this.position[0] + 2, this.position[1] - 2]) ||
        this.canOpponentJump([this.position[0] - 2, this.position[1] + 2]) ||
        this.canOpponentJump([this.position[0] - 2, this.position[1] - 2])
      ) {
        return true;
      }
      return false;
    };

    //tests if an opponent jump can be made to a specific place
    this.canOpponentJump = function(newPosition) {
      //find what the displacement is
      var dx = newPosition[1] - this.position[1];
      var dy = newPosition[0] - this.position[0];
      //make sure object doesn't go backwards if not a king
      if (this.player == 1 && this.king == false) {
        if (newPosition[0] < this.position[0]) return false;
      } else if (this.player == 2 && this.king == false) {
        if (newPosition[0] > this.position[0]) return false;
      }
      //must be in bounds
      if (
        newPosition[0] > 7 ||
        newPosition[1] > 7 ||
        newPosition[0] < 0 ||
        newPosition[1] < 0
      )
        return false;
      //middle tile where the piece to be conquered sits
      var tileToCheckx = this.position[1] + dx / 2;
      var tileToChecky = this.position[0] + dy / 2;
      //if there is a piece there and there is no piece in the space after that
      if (
        !Board.isValidPlacetoMove(tileToChecky, tileToCheckx) &&
        Board.isValidPlacetoMove(newPosition[0], newPosition[1])
      ) {
        //find which object instance is sitting there
        for (pieceIndex in pieces) {
          if (
            pieces[pieceIndex].position[0] == tileToChecky &&
            pieces[pieceIndex].position[1] == tileToCheckx
          ) {
            if (this.player != pieces[pieceIndex].player) {
              //return the piece sitting there
              return pieces[pieceIndex];
            }
          }
        }
      }
      return false;
    };

    this.opponentJump = function(tile) {
      var pieceToRemove = this.canOpponentJump(tile.position);
      //if there is a piece to be removed, remove it
      if (pieceToRemove) {
        pieces[pieceIndex].remove();
        return true;
      }
      return false;
    };

    this.remove = function() {
      //remove it and delete it from the gameboard
      this.element.css("display", "none");
      if (this.player == 1)
        $("#player2").append("<div class='capturedPiece'></div>");
      if (this.player == 2)
        $("#player1").append("<div class='capturedPiece'></div>");
      Board.board[this.position[0]][this.position[1]] = 0;
      //reset position so it doesn't get picked up by the for loop in the canOpponentJump method
      this.position = [];
    };
  }

  function Tile(element, position) {
    //this.piece = piece;
    //linked DOM element
    this.element = element;
    //position in gameboard
    this.position = position;
    //if tile is in range from the piece
    this.inRange = function(piece) {
      if (
        dist(
          this.position[0],
          this.position[1],
          piece.position[0],
          piece.position[1]
        ) == Math.sqrt(2)
      ) {
        //regular move
        return "regular";
      } else if (
        dist(
          this.position[0],
          this.position[1],
          piece.position[0],
          piece.position[1]
        ) ==
        2 * Math.sqrt(2)
      ) {
        //jump move
        return "jump";
      }
    };
  }

  //Board object - controls logistics of game
  var Board = {
    board: gameBoard,
    playerTurn: 1,
    tilesElement: $("div.tiles"),
    //dictionary to convert position in Board.board to the viewport units
    dictionary: [
      "0vmin",
      "10vmin",
      "20vmin",
      "30vmin",
      "40vmin",
      "50vmin",
      "60vmin",
      "70vmin",
      "80vmin",
      "90vmin"
    ],
    //initialize the 8x8 board
    initalize: function() {
      var countPieces = 0;
      var countTiles = 0;
      for (row in this.board) {
        //row is the index
        for (column in this.board[row]) {
          //column is the index
          //whole set of if statements control where the tiles and pieces should be placed on the board
          if (row % 2 == 1) {
            if (column % 2 == 0) {
              this.tilesElement.append(
                "<div class='tile' id='tile" +
                  countTiles +
                  "' style='top:" +
                  this.dictionary[row] +
                  ";left:" +
                  this.dictionary[column] +
                  ";'></div>"
              );
              tiles[countTiles] = new Tile($("#tile" + countTiles), [
                parseInt(row),
                parseInt(column)
              ]);
              countTiles += 1;
            }
          } else {
            if (column % 2 == 1) {
              this.tilesElement.append(
                "<div class='tile' id='tile" +
                  countTiles +
                  "' style='top:" +
                  this.dictionary[row] +
                  ";left:" +
                  this.dictionary[column] +
                  ";'></div>"
              );
              tiles[countTiles] = new Tile($("#tile" + countTiles), [
                parseInt(row),
                parseInt(column)
              ]);
              countTiles += 1;
            }
          }
          if (this.board[row][column] == 1) {
            $(".player1pieces").append(
              "<div class='piece' id='" +
                countPieces +
                "' style='top:" +
                this.dictionary[row] +
                ";left:" +
                this.dictionary[column] +
                ";'></div>"
            );
            pieces[countPieces] = new Piece($("#" + countPieces), [
              parseInt(row),
              parseInt(column)
            ]);
            countPieces += 1;
          } else if (this.board[row][column] == 2) {
            $(".player2pieces").append(
              "<div class='piece' id='" +
                countPieces +
                "' style='top:" +
                this.dictionary[row] +
                ";left:" +
                this.dictionary[column] +
                ";'></div>"
            );
            pieces[countPieces] = new Piece($("#" + countPieces), [
              parseInt(row),
              parseInt(column)
            ]);
            countPieces += 1;
          }
        }
      }
    },
    //check if the location has an object
    isValidPlacetoMove: function(row, column) {
      console.log(row, column);
      console.log(this.board);
      if (this.board[row][column] == 0) {
        return true;
      }
      return false;
    },
    //change the active player - also changes div.turn's CSS
    changePlayerTurn: function() {
      if (this.playerTurn == 1) {
        this.playerTurn = 2;
        $(".turn").css(
          "background",
          "linear-gradient(to right, transparent 50%, #BEEE62 50%)"
        );
        return;
      }
      if (this.playerTurn == 2) {
        this.playerTurn = 1;
        $(".turn").css(
          "background",
          "linear-gradient(to right, #BEEE62 50%, transparent 50%)"
        );
      }
    },
    //reset the game
    clear: function() {
      location.reload();
    }
  };

  //initialize the board
  Board.initalize();

  /***
    Events
    ***/

  //select the piece on click if it is the player's turn
  $(".piece").on("click", function() {
    var selected;
    var isPlayersTurn =
      $(this)
        .parent()
        .attr("class")
        .split(" ")[0] ==
      "player" + Board.playerTurn + "pieces";
    if (isPlayersTurn) {
      if ($(this).hasClass("selected")) selected = true;
      $(".piece").each(function(index) {
        $(".piece")
          .eq(index)
          .removeClass("selected");
      });
      if (!selected) {
        $(this).addClass("selected");
      }
    }
  });

  //reset game when clear button is pressed
  $("#cleargame").on("click", function() {
    Board.clear();
    console.log("board has been reset...");
  });

  //move piece when tile is clicked
  $(".tile").on("click", function() {
    //make sure a piece is selected
    if ($(".selected").length != 0) {
      //find the tile object being clicked
      var tileID = $(this)
        .attr("id")
        .replace(/tile/, "");
      var tile = tiles[tileID];
      //find the piece being selected
      var piece = pieces[$(".selected").attr("id")];
      //check if the tile is in range from the object
      var inRange = tile.inRange(piece);
      if (inRange) {
        //if the move needed is jump, then move it but also check if another move can be made (double and triple jumps)
        if (inRange == "jump") {
          if (piece.opponentJump(tile)) {
            piece.move(tile);
            if (piece.canJumpAny()) {
              Board.changePlayerTurn(); //change back to original since another turn can be made
              piece.element.addClass("selected");
            }
          }
          //if it's regular then move it if no jumping is available
        } else if (inRange == "regular") {
          if (!piece.canJumpAny()) {
            piece.move(tile);
          } else {
            alert("You must jump when possible!");
          }
        }
      }
    }
  });

  socket.on("moved", data => {
    console.log("moved data", data);
    console.log(Game);

    var src = data.move.src;
    var dest = data.move.dest;

    //src is a piece
    var piece;
    for (var i = 0; i < pieces.length; i++) {
      var position = pieces[i].position;
      if (position[0] === src[0] && position[1] === src[1]) {
        piece = pieces[i];
        console.log(piece);
      }
    }

    //destination is a tile

    var tile;
    for (var i = 0; i < tiles.length; i++) {
      var position = tiles[i].position;
      if (position[0] === dest[0] && position[1] === dest[1]) {
        tile = tiles[i];
        console.log(tile);
      }
    }

    if (piece && tile) {
      Board.board[piece.position[0]][piece.position[1]] = 0;
      Board.board[tile.position[0]][tile.position[1]] = data.move.player;
      piece.position = [tile.position[0], tile.position[1]];
      //change the css using board's dictionary
      piece.element.css("top", Board.dictionary[piece.position[0]]);
      piece.element.css("left", Board.dictionary[piece.position[1]]);
      //if piece reaches the end of the row on opposite side crown it a king (can move all directions)
      if (!piece.king && (piece.position[0] == 0 || piece.position[0] == 7))
        piece.makeKing();
      Board.changePlayerTurn();
    }
  });
});
