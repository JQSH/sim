const defaultMazeLayout = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

let mazeLayout = [...defaultMazeLayout];

function generatePacManMap(width, height) {
    let maze = Array(height).fill().map(() => Array(width).fill(1));
    
    const isInBounds = (x, y) => x >= 0 && x < width && y >= 0 && y < height;
    
    const countAdjacentWalls = (x, y) => {
        let count = 0;
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                if (isInBounds(x + dx, y + dy) && maze[y + dy][x + dx] === 1) {
                    count++;
                }
            }
        }
        return count;
    };

    for (let y = 1; y < height - 1; y += 2) {
        for (let x = 1; x < width - 1; x += 2) {
            maze[y][x] = 0;
            
            if (x + 2 < width - 1 && y + 2 < height - 1) {
                if (Math.random() < 0.5) {
                    maze[y][x + 1] = 0;
                } else {
                    maze[y + 1][x] = 0;
                }
            } else if (x + 2 < width - 1) {
                maze[y][x + 1] = 0;
            } else if (y + 2 < height - 1) {
                maze[y + 1][x] = 0;
            }
        }
    }

    for (let y = 0; y < height; y++) {
        maze[y][0] = maze[y][width - 1] = 1;
    }
    for (let x = 0; x < width; x++) {
        maze[0][x] = maze[height - 1][x] = 1;
    }

    const createOpening = (x, y) => {
        if (countAdjacentWalls(x, y) <= 5) {
            maze[y][x] = 0;
        }
    };

    for (let i = 0; i < 4; i++) {
        createOpening(1, Math.floor(Math.random() * (height - 2)) + 1);
        createOpening(width - 2, Math.floor(Math.random() * (height - 2)) + 1);
        createOpening(Math.floor(Math.random() * (width - 2)) + 1, 1);
        createOpening(Math.floor(Math.random() * (width - 2)) + 1, height - 2);
    }

    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    let changed;
    do {
        changed = false;
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                if (maze[y][x] === 0) {
                    let openCount = directions.filter(([dx, dy]) => maze[y + dy][x + dx] === 0).length;
                    if (openCount === 1) {
                        let openDirections = directions.filter(([dx, dy]) => maze[y + dy][x + dx] === 1);
                        let randomDir = openDirections[Math.floor(Math.random() * openDirections.length)];
                        maze[y + randomDir[1]][x + randomDir[0]] = 0;
                        changed = true;
                    }
                }
            }
        }
    } while (changed);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < Math.floor(width / 2); x++) {
            maze[y][width - 1 - x] = maze[y][x];
        }
    }

    return maze;
}