const SIZE = 4;
let board = [];
let previousBoard = null;

document.addEventListener('DOMContentLoaded', () => {
    const welcomeMessage = document.getElementById('welcome-message');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (currentUser) {
        const playerName = currentUser.name;
        welcomeMessage.textContent = `Welcome back, ${playerName}!`;
        
        // Khôi phục điểm số cao nhất cho tài khoản này
        highScore = localStorage.getItem(`${playerName}_highScore`) ? parseInt(localStorage.getItem(`${playerName}_highScore`)) : 0;
    }

    // Hiển thị điểm số cao nhất
    updateScoreDisplay();

    // Khởi tạo trò chơi
    initializeGame();
    document.addEventListener('keydown', handleKeyPress);
    document.getElementById('undo').addEventListener('click', undo);
    document.getElementById('restart').addEventListener('click', restart);
});


let score = 0;
let previousScore = 0; // Biến để lưu trữ điểm số trước đó
let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;

function initializeGame() {
    board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    addRandomTile();
    addRandomTile();
    draw();
}

function addRandomTile() {
    const emptyTiles = [];
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (board[i][j] === 0) {
                emptyTiles.push({ x: i, y: j });
            }
        }
    }
    if (emptyTiles.length) {
        const { x, y } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        board[x][y] = Math.random() < 0.9 ? 2 : 4;
    }
}

function draw() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    board.forEach(row => {
        row.forEach(value => {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.setAttribute('data-value', value); // Thêm thuộc tính data-value
            tile.textContent = value !== 0 ? value : '';
            grid.appendChild(tile);
        });
    });
}

function handleKeyPress(event) {
    switch (event.key) {
        case 'ArrowUp':
        case 'w':
            move('UP');
            break;
        case 'ArrowDown':
        case 's':
            move('DOWN');
            break;
        case 'ArrowLeft':
        case 'a':
            move('LEFT');
            break;
        case 'ArrowRight':
        case 'd':
            move('RIGHT');
            break;
    }
}



function isGameOver() {
    // Kiểm tra nếu có ô nào trống
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (board[i][j] === 0) {
                return false; // Còn ô trống, trò chơi chưa kết thúc
            }
        }
    }

    // Kiểm tra nếu có ô nào có thể kết hợp
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (i < SIZE - 1 && board[i][j] === board[i + 1][j]) {
                return false; // Có ô có thể kết hợp theo chiều dọc
            }
            if (j < SIZE - 1 && board[i][j] === board[i][j + 1]) {
                return false; // Có ô có thể kết hợp theo chiều ngang
            }
        }
    }

    // Nếu trò chơi kết thúc, kiểm tra và cập nhật điểm số cao nhất
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && score > highScore) {
        highScore = score;
        localStorage.setItem(`${currentUser.name}_highScore`, highScore);
    }

    return true; // Không còn nước đi nào khả thi
}


function move(direction) {
    saveState();
    let moved = false;

    if (direction === 'UP') {
        board = transpose(board);
        moved = moveLeft();
        board = transpose(board);
    } else if (direction === 'DOWN') {
        board = transpose(board);
        moved = moveRight();
        board = transpose(board);
    } else if (direction === 'LEFT') {
        moved = moveLeft();
    } else if (direction === 'RIGHT') {
        moved = moveRight();
    }

    if (moved) {
        addRandomTile();
        draw();
        
        // Kiểm tra tình trạng thua
        if (isGameOver()) {
            alert("Game Over! No more moves available.");
            // Bạn có thể thêm logic để đặt lại trò chơi ở đây nếu muốn
        }
    }
}


function saveState() {
    previousBoard = board.map(row => row.slice());
    previousScore = score; // Lưu điểm số trước khi thay đổi
}

function undo() {
    if (previousBoard) {
        board = previousBoard;
        score = previousScore; // Khôi phục điểm số
        previousBoard = null; // Đặt lại previousBoard
        updateScoreDisplay(); // Cập nhật hiển thị điểm số
        draw();
    }
}

function restart() {
    score = 0; // Đặt lại điểm số về 0
    updateScoreDisplay(); // Cập nhật hiển thị điểm số
    initializeGame();
}

function moveLeft() {
    let moved = false;
    for (let i = 0; i < SIZE; i++) {
        const oldRow = board[i].slice();
        const row = merge(board[i]);
        board[i] = row;
        if (JSON.stringify(oldRow) !== JSON.stringify(row)) moved = true;
    }
    return moved;
}

function moveRight() {
    let moved = false;
    for (let i = 0; i < SIZE; i++) {
        const oldRow = board[i].slice();
        const row = merge(board[i].reverse()).reverse();
        board[i] = row;
        if (JSON.stringify(oldRow) !== JSON.stringify(row)) moved = true;
    }
    return moved;
}

function merge(row) {
    let newRow = row.filter(value => value !== 0); // Lọc các ô trống
    let scoreAdded = 0;

    for (let i = 0; i < newRow.length - 1; i++) {
        if (newRow[i] === newRow[i + 1]) {
            newRow[i] *= 2; // Gộp ô
            scoreAdded += newRow[i]; // Cộng điểm
            newRow.splice(i + 1, 1); // Xóa ô đã gộp
        }
    }

    // Cập nhật điểm số toàn cục
    score += scoreAdded;
    updateScoreDisplay();
    
    // Cập nhật điểm số cao nhất cho tài khoản hiện tại
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && score > highScore) {
        highScore = score;
        localStorage.setItem(`${currentUser.name}_highScore`, highScore);
    }

    // Thêm số 0 vào cuối hàng để đủ kích thước
    while (newRow.length < SIZE) {
        newRow.push(0);
    }
    return newRow;
}


function updateScoreDisplay() {
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score'); // Lấy phần tử hiển thị điểm số cao nhất
    scoreElement.textContent = 'Score: ' + score;
    highScoreElement.textContent = 'High Score: ' + highScore; // Cập nhật hiển thị điểm số cao nhất
}

function transpose(matrix) {
    return matrix[0].map((_, index) => matrix.map(row => row[index]));
}

function transpose(matrix) {
    return matrix[0].map((_, index) => matrix.map(row => row[index]));
}

// Thêm mã vuốt vào đây
let startX, startY;

document.addEventListener('touchstart', (event) => {
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
});

document.addEventListener('touchend', (event) => {
    const endX = event.changedTouches[0].clientX;
    const endY = event.changedTouches[0].clientY;

    const diffX = endX - startX;
    const diffY = endY - startY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) {
            move('RIGHT');
        } else {
            move('LEFT');
        }
    } else {
        if (diffY > 0) {
            move('DOWN');
        } else {
            move('UP');
        }
    }
});

// Kết thúc mã