
function charToNum(char){
    let charCode = char.charCodeAt(0)-96;
    return charCode;
}
function numToChar(num){
    let char = String.fromCharCode(96 + num);
    return char;
}

class Ruleset{
    constructor(){
        this.rulesets = new Map();
        let PMoves = [[1,0]];
        let pMoves = [[-1,0]];
        let RMoves = [[0,8],[8,0],[-8,0],[0,-8]];
        let NMoves = [[2,1],[1,2],[-1,2],[-2,1],[-2,-1],[-1,-2],[1,-2],[2,-1]];
        let BMoves = [[8,8],[-8,8],[-8,-8],[8,-8]];
        let QMoves = [[0,8],[8,8],[8,0],[-8,8],[-8,0],[-8,-8],[0,-8],[8,-8]];
        let KMoves = [[0,1],[1,1],[1,0],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
        this.rulesets.set("p",pMoves);
        this.rulesets.set("P",PMoves);
        this.rulesets.set("r",RMoves);
        this.rulesets.set("n",NMoves);
        this.rulesets.set("b",BMoves);
        this.rulesets.set("q",QMoves);
        this.rulesets.set("k",KMoves);
    }

    getRule(pieceType){
        return this.rulesets.get(pieceType);
    }
}

function to2D(id){
    let row = Math.floor(id / 8) + 1
    let col = (id % 8) + 1
    return [row,col];
}

function moveToIndex(moveString){
    let col = charToNum(moveString[0]);
    let row = moveString[1];
    let pos = (row-1)+((col-1)*8);
    
    return pos;
}
class BoardState{
    constructor(){
        this.boardState = [
        'R','N','B','Q','K','B','N','R',
        'P','P','P','P','P','P','P','P',
        null,null,null,null,null,null,null,null,
        null,null,null,null,null,null,null,null,
        null,null,null,null,null,null,null,null,
        null,null,null,null,null,null,null,null,
        'p','p','p','p','p','p','p','p',
        'r','n','b','q','k','b','n','r'
        ];

        this.castleable = [1,1,1,1];
        // where id = 0 is bottom right corner
        //  3___2
        //      |
        //  0___1
    }

    queenMe(move){
        let col = move[0];
        let row = move[1];
        let pos = (row-1)+((col-1)*8);
        
        if(move[0]==1){
            this.boardState[pos] = "q";
        }
        if(move[0]==8){
            this.boardState[pos] = "Q";
        }
    }

    updateState(fromMove,toMove){
        //from "a1" to "a6"
        let fromId = moveToIndex(fromMove);
        let toId= moveToIndex(toMove);
        
        this.boardState[toId] = this.boardState[fromId];
        this.boardState[fromId] = null;
    }

    getPosFromPiece(piece){
        let id = this.boardState.indexOf(piece);
        return to2D(id);
    }

    getPieceFromPos(move){
        if(Array.isArray(move)){
            let col = move[0];
            let row = move[1];
            let pos = (row-1)+((col-1)*8);
            return this.boardState[pos];
        }
        if(typeof(move)=="string"){
            let col = charToNum(move[0]);
            let row = move[1];
            let pos = (row-1)+((col-1)*8);
            return this.boardState[pos];
        }
        else{
            return this.boardState[move];
        }
    }

    isOccupied(pos){
        let piece = this.getPieceFromPos(pos);
        if(piece==null){
            return false;
        }else{
            return true;
        }
    }

}
function outOfBounds(x, y) {
    return x < 1 || x > 8 || y < 1 || y > 8;
}
const clamp = (num, min, max) => {
  return Math.min(Math.max(num, min), max);
};
function arrMoveToStr(arr){
    let str = numToChar(arr[0]) + arr[1];
    return str;
}
function strMoveToArr(str){
    let arrIds = [charToNum(str[0]),parseInt(str[1])];
    return arrIds;
}
function isBlack(str){
    if (/^[a-z]+$/.test(str)) {
        return true;
    } else {
        return false;
    }
}

function containsSubarray(arr, sub) {
    return arr.some(
        item => item.length === sub.length && item.every((v, i) => v === sub[i])
    );
}

export class Engine{
    constructor(){
        this.boardState = new BoardState();
        this.turnCount = 0;
        this.evalFromPiece;
        this.evalToPiece;
        this.evalFromPos;
        this.evalToPos;
        this.ruleset = new Ruleset();
    }

    inCheck(fromMove,toMove){
        
        let currBoardState = [...this.boardState.boardState];  // shallow copy
        
        this.boardState.updateState(fromMove,toMove);
        let turn = 1;
        if(this.turnCount%2==0){
            turn = 0;
            //blacks turn
        }
        let k = this.boardState.getPosFromPiece("k");
        if(turn == 0){
        k = this.boardState.getPosFromPiece("K");
        console.log("checking white check...")
        }else{
        console.log("checking black check...")

        }
        let all_moves = [];
        for(let i = 0; i < this.boardState.boardState.length;i++){
            if(this.boardState.boardState[i] != null){
                let arr = to2D(i);
                let str_move = arrMoveToStr(arr);
                if(isBlack(this.boardState.getPieceFromPos(str_move))==turn){
                    continue;
                }
                let moves = this.generateMoves(str_move);
                for(let m = 0; m < moves.length;m++){
                    all_moves.push(moves[m]);
                }
            }
        }
        this.boardState.boardState = currBoardState;
        if(containsSubarray(all_moves,k)){
            return 1;
        }
        return 0;
    }

    checkCheckmate(){
        
        let currBoardState2 = [...this.boardState.boardState];  // shallow copy
        console.log("currboardstate " + currBoardState2);
        
        // this.boardState.updateState(fromMove,toMove);
        let turn = 0;
        if(this.turnCount%2==0){
            turn = 1;
            //blacks turn
        }
        let all_moves = [];
        this.turnCount+=1;
        for(let i = 0; i < this.boardState.boardState.length;i++){
            if(this.boardState.boardState[i] != null){
                let arr = to2D(i);
                let str_move = arrMoveToStr(arr);
                if(isBlack(this.boardState.getPieceFromPos(str_move))!=turn){
                    continue;
                }
                let moves = this.generateMoves(str_move);
                
                for(let m = 0; m < moves.length;m++){
                    all_moves.push([str_move,arrMoveToStr(moves[m])]);
                    
                }
            }
        }
        for(let i = 0; i < all_moves.length;i++){
            let incheck = this.inCheck(all_moves[i][0],all_moves[i][1]);
            if(!incheck){
                console.log(all_moves);
                console.log("move that unchecks: " +all_moves[i][0],all_moves[i][1] )
                this.boardState.boardState = currBoardState2;
                this.turnCount-=1;
                return 0;
            }
        }
        this.turnCount-=1;
        document.getElementById("turn-text").innerText = "Checkmate!";
        console.log("CHECKMATE!");
        this.boardState.boardState = currBoardState2;
        return 1;
    }

    generateMoves(fromMove){
        let fromPiece = this.boardState.getPieceFromPos(fromMove);
        let fromIds = strMoveToArr(fromMove);
        let pieceRuleset;
        
        if(fromPiece==null){
            return 0;
        }
        if(fromPiece.toLowerCase() == "p"){
            pieceRuleset = this.ruleset.getRule(fromPiece);
        }else{
            pieceRuleset = this.ruleset.getRule(fromPiece.toLowerCase());
        }
        let legalMoves = [];
        let sweep = 0;

        if(pieceRuleset.length>1){
            if(Math.abs(pieceRuleset[0][0]) == 8 || Math.abs(pieceRuleset[0][1]) == 8){
                sweep = 1;
            }
        }

        if(sweep){
            let startY = fromIds[0];
            let startX = fromIds[1];
            for(let i = 0;i <pieceRuleset.length;i++){
                let modY = pieceRuleset[i][0]/8;
                let modX = pieceRuleset[i][1]/8;

                for(let t = 1;t<100;t++){
                    let testPosY = (t*modY)+startY;
                    let testPosX = (t*modX)+startX;
                    let testMove = [testPosY,testPosX];
                    if(outOfBounds(testMove[0],testMove[1])){
                        break;
                    }
                    if(this.boardState.isOccupied(testMove)){
                        if((isBlack(this.boardState.getPieceFromPos(testMove)) != isBlack(fromPiece))){
                            legalMoves.push(testMove);
                        }
                        break;
                    }
                    legalMoves.push(testMove);
                }
                

            }

        }

        else{
            for(let i = 0;i <pieceRuleset.length;i++){
                let moveTest = pieceRuleset[i];
                let finalX = fromIds[1]+moveTest[1];
                let finalY = fromIds[0]+moveTest[0];
                let finalPos = null;
                let testMove = [finalY,finalX];
                if(!outOfBounds(finalX,finalY)){
                    if(this.boardState.isOccupied(testMove)){
                        if(fromPiece.toLowerCase() == "p"){
                            continue;
                        }
                        let friendlyPiece = isBlack(this.boardState.getPieceFromPos(testMove)) == isBlack(fromPiece);
                        if(friendlyPiece){
                            continue;
                        }
                    }

                    finalPos = [finalY,finalX];
                }
                if(finalPos != null){
                    
                    legalMoves.push(finalPos)
                }
                
            }       
        }
        
        if(this.evalFromPiece.toLowerCase() == "p"){
            // special pawn rules
            let negX = clamp([fromIds[1]-1],1,8);
            let posX = clamp([fromIds[1]+1],1,8);
            if(isBlack(fromPiece)){
                
                if(fromIds[0]==7 && !this.boardState.isOccupied([fromIds[0]-1,fromIds[1]])){
                    let twoStep = [fromIds[0]-2,fromIds[1]];
                    legalMoves.push(twoStep);
                }
                let leftHit = [fromIds[0]-1,negX];
                let rightHit = [fromIds[0]-1,posX];
                if(this.boardState.isOccupied(leftHit)){
                    if(!isBlack(this.boardState.getPieceFromPos(leftHit))){
                        legalMoves.push(leftHit);
                    }
                }
                if(this.boardState.isOccupied(rightHit)){
                    if(!isBlack(this.boardState.getPieceFromPos(rightHit))){
                        legalMoves.push(rightHit);
                    }
                }
            }else{
                if(fromIds[0]==2 && !this.boardState.isOccupied([fromIds[0]+1,fromIds[1]])){
                    let twoStep = [fromIds[0]+2,fromIds[1]];
                    legalMoves.push(twoStep);
                }
                let leftHit = [fromIds[0]+1,negX];
                let rightHit = [fromIds[0]+1,posX];
                if(this.boardState.isOccupied(leftHit)){
                    if(isBlack(this.boardState.getPieceFromPos(leftHit))){
                        legalMoves.push(leftHit);
                    }
                }
                if(this.boardState.isOccupied(rightHit)){
                    if(isBlack(this.boardState.getPieceFromPos(rightHit))){
                        legalMoves.push(rightHit);
                    }
                }
            }


        }
        let castleOccupancyCheck = null;
        if(fromPiece == "K"){
            castleOccupancyCheck = [[[1,2],[1,3],[1,4]],[[1,6],[1,7]]];
        }
        if(fromPiece == "k"){
            castleOccupancyCheck = [[[8,2],[8,3],[8,4]],[[8,6],[8,7]]];
        }
        
        if(castleOccupancyCheck != null){
            for(let j = 0;j<castleOccupancyCheck.length;j++){
                if(this.boardState.castleable[j+2]){
                    let currCastleCheck = castleOccupancyCheck[j];
                    let valid = 1;
                    for(let i = 0; i < currCastleCheck.length;i++){
                        if(this.boardState.isOccupied(currCastleCheck[i])){
                            valid = 0;
                            break;
                        }
                    }
                    if(valid){
                        legalMoves.push(currCastleCheck[1]);
                    }

                }
            }
        }
        
        return legalMoves;
    }

    checkTurn(fromMove){
        let fromPiece = this.boardState.getPieceFromPos(fromMove);
        if(this.turnCount%2==0){
            return isBlack(fromPiece);
        }else{
            return !isBlack(fromPiece);
        }
    }

    promotePawns(){
        let toMove = this.evalToPos;
        let fromIds = strMoveToArr(toMove);
        let promoted = 0;
        if(fromIds[0]==1 && this.evalFromPiece == "p"){
            this.boardState.queenMe(fromIds);
            promoted = 1;

        }
        if(fromIds[0]==8 && this.evalFromPiece == "P"){
            this.boardState.queenMe(fromIds);
            promoted = 1;
        }
        return promoted
    }

    checkLegality(){
        let fromMove = this.evalFromPos;
        let toMove = this.evalToPos;
        if(this.evalFromPiece == null){
            return 0;
        }
        if(this.checkTurn(fromMove)){
            return 0;
        }
        let legalMoves = this.generateMoves(fromMove);
        let toMoveArr = strMoveToArr(toMove);
        if(!containsSubarray(legalMoves,toMoveArr)){
            return 0;
        }
        return 1;
    }

    setCastleable(){
        let fromMove = this.evalFromPos;
        let currCastleset = this.boardState.castleable;
            if(fromMove=="a1"){
                currCastleset[0] = 0;
            }
            if(fromMove=="a5"){
                currCastleset[0] = 0;
                currCastleset[1] = 0;
            }
            if(fromMove=="a8"){
                currCastleset[1] = 0;
            }
            if(fromMove=="h8"){
                currCastleset[2] = 0;
            }
            if(fromMove=="h5"){
                currCastleset[3] = 0;
                currCastleset[2] = 0;
            }
            if(fromMove=="h1"){
                currCastleset[3] = 0;
            }
            this.boardState.castleable = currCastleset;
    }

    checkCastle(){
        let fromPos = this.evalFromPos;
        let fromPiece = this.evalFromPiece;
        let toPos = this.evalToPos;
        if(fromPiece=="K" && fromPos=="a5" && toPos == "a7"){
            this.boardState.updateState("a8","a6");
        }
        if(fromPiece=="K" && fromPos=="a5" && toPos == "a3"){
            this.boardState.updateState("a1","a4");
        }
        if(fromPiece=="k" && fromPos=="h5" && toPos == "h7"){
            this.boardState.updateState("h8","h6");
        }
        if(fromPiece=="k" && fromPos=="h5" && toPos == "h3"){
            this.boardState.updateState("h1","h4");
        }
    }


    
    setEvalPieces(fromMove,toMove){
        let fromPiece = this.boardState.getPieceFromPos(fromMove);
        let toPiece = this.boardState.getPieceFromPos(toMove);
        this.evalFromPiece = fromPiece;
        this.evalToPiece = toPiece;
        this.evalFromPos = fromMove;
        this.evalToPos = toMove;
    }

    makeMove(fromMove,toMove){

        this.setEvalPieces(fromMove,toMove);
        let legal = this.checkLegality();

        if(legal){
            if(this.inCheck(fromMove,toMove)){
                return 0;
            }
            //if legal, increment turnCount
            this.boardState.updateState(fromMove,toMove);
            this.checkCastle();
            this.setCastleable();

            this.promotePawns();
            this.checkCheckmate();
            this.turnCount+=1;
            return 1;
        }else{
            return 0;
        }
    }
}
