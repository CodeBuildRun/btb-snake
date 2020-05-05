var PF = require('pathfinding');

move_direction = ["up", "down", "left", "right"]

const move = (data) => {
    //console.log(data)

    var board = create_board(data)
    var finder = new PF.AStarFinder({
        diagonalMovement: PF.DiagonalMovement.Never,
        heuristic: PF.Heuristic.manhattan
    });

    //console.log("=======");
    //console.log(data.turn);
    // Choose a point in the board
    var target_path = chose_target(data, board, finder)
    var head = data.you.body[0]
    var step = direction(head, target_path)
    return(step);
}

const create_board = (data) => {
    var board = new PF.Grid(data.board.height, data.board.width)

    for (const snake of data.board.snakes.values())
    {
        for (const part of snake.body.values())
        {
            board.setWalkableAt(part.x, part.y, false);
        }
    }

    return(board)
}

const direction = (origin, finder_path) => {
    var xdif = finder_path[1][0] - origin.x
    var ydif = finder_path[1][1] - origin.y

    if (xdif > 0) {
        move_to = "right"
    } else if (xdif < 0) {
        move_to = "left";
    }

    if (ydif > 0) {
        move_to = "down"
    }
    else if (ydif < 0) {
        move_to = "up"
    }
    return move_to
}


const chose_target = (data, board, finder) => {
    var target_path = [];
    var head = data.you.body[0];

    if (data.turn < 3)
    {
        target_path = choose_fruit(data, board, finder);
    }
    else {
        if (data.you.health < 50)
        {
            target_path = choose_fruit(data, board, finder);
            if (target_path.length == 0)
            {
                target_path = move_to_neighbour(head, data, board, finder);
            }
        }
        else
        {
            target_path = move_to_neighbour(head, data, board, finder);
        }
    }

    

    return target_path;
}

const choose_fruit = (data, board, finder) => {
    var head = data.you.body[0];
    var tail = data.you.body[data.you.body.length - 1];
    var target = [];

    // sort food
    food = data.board.food;
    food.sort(function (a, b) {
        return  distance(a,b)
    });

    // Pick the best/safer fruit
    for (const fruit of food.values()) { 
        var fruit_reach = reachable(head, fruit, board, finder)
        var tail_reach = reachable(tail, fruit, board, finder)
        if (fruit_reach.reach == true && tail_reach.reach == true) 
        {
            target = fruit_reach.path;
            break;
        }
    }
    return target;
}

const chase_tail = (data, board, finder) => {
    var head = data.you.body[0];
    var tail = data.you.body[data.you.body.length - 1];
    var target = [];

    var tail_neighnours = board.getNeighbors(tail, PF.DiagonalMovement.Always);
    for (const tail_target of tail_neighnours.values())
    {
        var tail_reach = reachable(head, tail_target, board, finder)

        if (tail_reach.reach == true)
            target = tail_reach.path;
            break;
    }

    return target;
}

const move_to_neighbour = (origin, data, board, finder) => {
    var target = [];
    var target_cell;
    var max_neighbours = -1;

    neighbours = board.getNeighbors(origin, PF.DiagonalMovement.Never);
    for( const cell of neighbours.values() )
    {
        if (cell.walkable == true) 
        {
            cell_neighbours = board.getNeighbors(cell, PF.DiagonalMovement.Always);
            if ( max_neighbours < cell_neighbours.length)
            {
                max_neighbours = cell_neighbours.length;
                target_cell = cell;
            }
        }
    }

    var boardClone = board.clone();
    target = finder.findPath(origin.x, origin.y, target_cell.x, target_cell.y, boardClone);

    return target;

}

const reachable = (origin, target, board, finder) => {
    var reachable = false
    var boardClone = board.clone();
    var path = finder.findPath(origin.x, origin.y, target.x, target.y, boardClone);

    if (path.length > 0)
        reachable = true

    return { reach: reachable, path: path }
}

const distance = (point_a, point_b) => {
    var x_dist = Math.abs(point_a.x - point_b.x)
    var y_dist = Math.abs(point_a.y - point_b.y);

    return (x_dist + y_dist)
}

module.exports = {
    move,
  }