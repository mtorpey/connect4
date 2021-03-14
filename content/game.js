const GAME_WIDTH = 7;
const GAME_HEIGHT = 6;

// Create game grid
class Model {
    grid;
    currentPlayer;
    winner;

    constructor(obj) {
        if (obj) {
            Object.assign(this, obj);
        } else {
            this.setupNewGame();
        }
    }

    setupNewGame() {
        this.grid = new Array(GAME_HEIGHT);
        for (let r = 0; r < GAME_HEIGHT; r++) {
            this.grid[r] = new Array(GAME_WIDTH);
            for (let c = 0; c < GAME_WIDTH; c++) {
                this.grid[r][c] = null;
            }
        }
        this.currentPlayer = 0;
        this.winner = null;
    }

    playPiece(col) {
        if (this.winner != null) {
            return;
        }
        // Put a piece in the given column
        for (let row = GAME_HEIGHT - 1; row >= 0; row--) {
            if (this.grid[row][col] === null) {
                this.grid[row][col] = this.currentPlayer;
                if (this.winsGame(row, col)) {
                    announceWinner(this.currentPlayer);
                    return;
                }
                this.currentPlayer = 1 - this.currentPlayer;
                return;
            }
        }

    }

    getCell(row, col) {
        return this.grid[row][col];
    }

    winsGame(row, col) {
        let player = this.grid[row][col];
        // Is this empty?  (It shouldn't be)
        if (player === null) {
            return false;
        }

        // Try all 4 directions and their opposites
        let dirs = [
            {drow: 0, dcol: 1},
            {drow: 1, dcol: 1},
            {drow: 1, dcol: 0},
            {drow: 1, dcol: -1}
        ];
        for (let dir of dirs) {
            if (this.nrInLine(row, col, dir.drow, dir.dcol, player)
                + this.nrInLine(row, col, -dir.drow, -dir.dcol, player)
                >= 3) {
                this.winner = player;
                return true;
            }
        }
        return false;
    }

    nrInLine(row, col, drow, dcol, player) {
        row += drow;
        col += dcol;
        if (row < 0 || row >= GAME_HEIGHT || col < 0 || col >= GAME_WIDTH) {
            return 0;
        }
        if (this.grid[row][col] != player) {
            return 0;
        } else {
            return 1 + this.nrInLine(row, col, drow, dcol, player);
        }
    }
}

var model = new Model();

function displayGame(model) {
    let div = document.createElement("div");
    div.id = "gameDiv";
    let playString;
    if (model.winner === null) {
        playString = ((model.currentPlayer === 0) ? "Red" : "Yellow") + " to play";
    } else {
        playString = ((model.winner === 0) ? "Red" : "Yellow") + " wins!";
    }
    let playPara = document.createElement("p");
    playPara.innerHTML = playString;
    div.appendChild(playPara);
    let table = document.createElement("table");
    table.id = "gameTable";
    for (let r = 0; r < GAME_HEIGHT; r++) {
        let row = document.createElement("tr");
        for (let c = 0; c < GAME_WIDTH; c++) {
            let cell = document.createElement("td");
            cell.row = r;
            cell.col = c;
            cell.addEventListener("click", clickCell);
            cell.addEventListener("mouseover", mouseOverCell);
            cell.addEventListener("mouseleave", mouseLeaveCell);
            let piece = model.getCell(r, c);
            switch(piece) {
                case null: cell.className = "empty"; break;
                case 0: cell.className = "p0"; break;
                case 1: cell.className = "p1"; break;
            }
            cell.innerHTML = " ";
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    div.appendChild(table);
    oldDiv = document.getElementById("gameDiv");
    if (oldDiv) {
        oldDiv.remove();
    }
    document.body.appendChild(div);
}

let clickCell = function(event) {
    model.playPiece(event.target.col);
    displayGame(model);
    sendUpdatedModel();
}

let mouseOverCell = function(event) {
    let col = event.target.col;
    let x = document.querySelectorAll('td');
    for (let cell of x) {
        if (cell.col === col && cell.className === "empty") {
            cell.className = "highlight";
        }
    }
}

let announceWinner = function(winningPlayer) {
    alert(((winningPlayer === 0) ? "Red" : "Yellow") + " wins!");
}

let mouseLeaveCell = function(event) {
    let col = event.target.col;
    let x = document.querySelectorAll('td');
    for (let cell of x) {
        if (cell.className === "highlight") {
            cell.className = "empty";
        }
    }
}

window.onload = function() {
    displayGame(model);
    showApple();
}

//
// SERVER SOCKETS for multi-client play
//
var socket = io();

function showApple() {
    var apple = document.getElementById("apple");
    apple.innerHTML = "Loaded successfully";
    //apple.addEventListener("click", changeTitle);
}

let sendUpdatedModel = function() {
    apple.innerHTML = "Sent model...";
    socket.emit("updated_model", model);
}

var nr_updates = 0;

socket.on("updated_model", (newModel) => {
    apple.innerHTML = "Server sent model " + (++nr_updates);
    model = new Model(newModel);
    displayGame(model);
});
