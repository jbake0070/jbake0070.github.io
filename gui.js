

// export function guiMakeMove(engine,fromMove,toMove){
//     engine.makeMove(fromMove,toMove);
// }

const chessFontMap = {
  // White pieces (uppercase)
  'K': '♔', // King
  'Q': '♕', // Queen
  'R': '♖', // Rook
  'B': '♗', // Bishop
  'N': '♘', // Knight
  'P': '♙', // Pawn

  // Black pieces (lowercase)
  'k': '♚', // King
  'q': '♛', // Queen
  'r': '♜', // Rook
  'b': '♝', // Bishop
  'n': '♞', // Knight
  'p': '♟', // Pawn
};

let board = document.getElementById("board");

let guiCells = null;
function isLowerCase(str){
    if (/^[a-z]+$/.test(str)) {
        return true;
    } else {
        return false;
    }
}

function colorPiece(piece){
    if(piece != null){
        if(isLowerCase(piece)){
            return "black";
        }else{
            return "white";
        }
    }
}

function numToChar(num){
    let char = String.fromCharCode(96 + num);
    return char;
}

export function highlightCells(engine,fromMove){
    engine.setEvalPieces(fromMove,null);
    let moveOptions = engine.generateMoves(fromMove);
    if(engine.checkTurn(fromMove)){
        return 0;
    }
    for(let i = 0; i < moveOptions.length;i++){
        let letter = numToChar(moveOptions[i][0]);
        let spot = moveOptions[i][1];
        let pos = letter+spot;
        let element = document.getElementById(pos);
        element.style.backgroundColor = "yellow";
    }
}

export function renderBoard(engine){
    if(board.stat == 1){
        if(guiCells == null){
            let cells = board.querySelectorAll(".cell");
            cells = Array.from(cells);
            cells.sort((a, b) => a.id.localeCompare(b.id));
            guiCells = cells;
        }
        for(let i = 0; i < engine.boardState.boardState.length;i++){
            let piece = engine.boardState.getPieceFromPos(i);
            let cell = guiCells[i];
            cell.style.backgroundColor = cell.getAttribute("storeColor");
            cell.textContent=chessFontMap[piece];
            cell.style.color = colorPiece(piece);
        }

        return;
    }else{
        initBoard(engine);
    }
}



function initBoard(engine){

    let cols = 'hgfedcba';

    let whiteCol = "rgb(196, 132, 132)";
    let blackCol = "rgb(73, 14, 53)";
    let count = 1;
    for(let i = 0; i <8;i++){
        const cellContainer = document.createElement("div");
        cellContainer.className = "cellContainer";
        count-=1;
        for(let j = 1; j <=8;j++){
            const cell = document.createElement("div");
            cell.className = "cell";
            let chosenColor = blackCol;
            if(count % 2 == 0){
            chosenColor = whiteCol;
            }
            count+=1;

            cell.style.backgroundColor = chosenColor;

            let pos = cols[i]+j.toString();
            cell.id = pos;
            let piece  = engine.boardState.getPieceFromPos(pos);
            cell.textContent=chessFontMap[piece];
            let color = colorPiece(piece);
            cell.style.color = color;
            cell.setAttribute("storeColor",chosenColor);
            cell.textContent = pos;
            

            cellContainer.append(cell)
        }
        board.append(cellContainer)

    }
    board.stat = 1;
}
