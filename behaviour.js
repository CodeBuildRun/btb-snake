var PF = require('pathfinding');


const move = (data) => {
    // Choose a random direction to move in
    possible_moves = ["up", "down", "left", "right"]
    var choice = Math.floor(Math.random() * possible_moves.length);
    var snake_move = possible_moves[choice];

    return(snake_move);
}

module.exports = {
    move,
  }