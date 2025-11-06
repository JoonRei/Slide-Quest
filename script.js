document.addEventListener('DOMContentLoaded', () => {

    // --- SCREEN ELEMENTS ---
    const splashScreen = document.getElementById('splash-screen');
    const gameMenu = document.getElementById('game-menu');
    const gameContainer = document.getElementById('game-container');
    const startGameButton = document.getElementById('start-game-button');
    const howToPlayButton = document.getElementById('how-to-play-button');
    
    // --- MODAL ELEMENTS ---
    const modalOverlay = document.getElementById('modal-overlay');
    const modalCloseButton = document.getElementById('modal-close-button');
    const modalGotItButton = document.getElementById('modal-got-it-button');

    // --- GAME ELEMENTS ---
    const board = document.getElementById('puzzle-board');
    const shuffleButton = document.getElementById('shuffle-button');
    const backToMenuButton = document.getElementById('back-to-menu-button');
    
    // --- GAME STATE ---
    const gridSize = 3;
    const tileSize = 100;
    const boardPadding = 5;

    let tiles = [];
    const solvedState = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const emptyTileIndex = 8; // The 9th tile (index 8) is empty

    // --- DRAG & SWIPE STATE ---
    let startX = 0;
    let startY = 0;
    let draggedTile = null;

    // --- SCREEN MANAGEMENT ---
    function showSplashScreen() {
        splashScreen.classList.remove('hidden');
        gameMenu.classList.add('hidden');
        gameContainer.classList.add('hidden');
        
        setTimeout(() => {
            splashScreen.classList.add('fade-out');
            setTimeout(() => {
                splashScreen.classList.add('hidden');
                showGameMenu();
            }, 500);
        }, 2500);
    }

    function showGameMenu() {
        gameMenu.classList.remove('hidden');
        gameContainer.classList.add('hidden');
        splashScreen.classList.add('hidden');
    }

    function showGame() {
        gameContainer.classList.remove('hidden');
        gameMenu.classList.add('hidden');
        splashScreen.classList.add('hidden');
        if (tiles.length === 0) {
            initGame(); 
        } else {
            scramble();
        }
    }

    // --- GAME SETUP FUNCTIONS ---
    function createTile(index) {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        
        if (index === emptyTileIndex) {
            tile.classList.add('empty');
            return tile;
        }

        const col = index % gridSize;
        const row = Math.floor(index / gridSize);
        const bgPosX = col * (100 / (gridSize - 1));
        const bgPosY = row * (100 / (gridSize - 1));
        
        tile.style.backgroundPosition = `${bgPosX}% ${bgPosY}%`;
        return tile;
    }

    function drawBoard() {
        board.style.width = `${gridSize * tileSize + boardPadding * 2}px`;
        board.style.height = `${gridSize * tileSize + boardPadding * 2}px`;
        
        tiles.forEach((tile, logicalIndex) => {
            const physicalIndex = tiles.findIndex(item => item.originalIndex === logicalIndex);
            const col = physicalIndex % gridSize;
            const row = Math.floor(physicalIndex / gridSize);

            tile.element.style.top = `${row * tileSize + boardPadding}px`;
            tile.element.style.left = `${col * tileSize + boardPadding}px`;
        });
    }

    // --- CORE GAME LOGIC ---
    function swapTilesAndDraw(tile1PhysicalIndex, tile2PhysicalIndex) {
        [tiles[tile1PhysicalIndex], tiles[tile2PhysicalIndex]] = 
        [tiles[tile2PhysicalIndex], tiles[tile1PhysicalIndex]];

        drawBoard();

        // Optional: vibration feedback on mobile
        if (navigator.vibrate) navigator.vibrate(40);

        checkWin();
    }

    function canMove(clickedIndex, emptyIndex) {
        const sameRow = Math.floor(clickedIndex / gridSize) === Math.floor(emptyIndex / gridSize);
        if (sameRow && Math.abs(clickedIndex - emptyIndex) === 1) return true;

        const sameCol = (clickedIndex % gridSize) === (emptyIndex % gridSize);
        if (sameCol && Math.abs(clickedIndex - emptyIndex) === gridSize) return true;

        return false;
    }
    
    function scramble() {
        board.innerHTML = ''; 
        
        tiles = solvedState.map(originalIndex => ({
            originalIndex: originalIndex,
            element: createTile(originalIndex)
        }));

        tiles.forEach(tile => {
            board.appendChild(tile.element);
        });

        let shuffles = 50;
        for (let i = 0; i < shuffles; i++) {
            const emptyPhysicalIndex = tiles.findIndex(item => item.originalIndex === emptyTileIndex);
            const neighbors = [];
            
            if (canMove(emptyPhysicalIndex - 1, emptyPhysicalIndex)) neighbors.push(emptyPhysicalIndex - 1);
            if (canMove(emptyPhysicalIndex + 1, emptyPhysicalIndex)) neighbors.push(emptyPhysicalIndex + 1);
            if (canMove(emptyPhysicalIndex - gridSize, emptyPhysicalIndex)) neighbors.push(emptyPhysicalIndex - gridSize);
            if (canMove(emptyPhysicalIndex + gridSize, emptyPhysicalIndex)) neighbors.push(emptyPhysicalIndex + gridSize);

            const randomNeighborIndex = neighbors[Math.floor(Math.random() * neighbors.length)];
            
            if (randomNeighborIndex >= 0 && randomNeighborIndex < tiles.length) {
                 [tiles[emptyPhysicalIndex], tiles[randomNeighborIndex]] = 
                 [tiles[randomNeighborIndex], tiles[emptyPhysicalIndex]];
            }
        }
        drawBoard(); 
    }

    function checkWin() {
        for (let i = 0; i < tiles.length; i++) {
            if (tiles[i].originalIndex !== i) {
                return;
            }
        }
        setTimeout(() => {
            alert('🎉 Congratulations! You solved it!');
            showGameMenu(); 
        }, 300);
    }

    // --- DRAG / SWIPE LOGIC ---
    function onDragStart(e) {
        const targetTileElement = e.target.closest('.tile');
        if (targetTileElement && !targetTileElement.classList.contains('empty')) {
            draggedTile = tiles.find(t => t.element === targetTileElement);
            if (!draggedTile) return;

            if (e.type === 'mousedown') {
                startX = e.clientX;
                startY = e.clientY;
            } else if (e.type === 'touchstart') {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            }
            e.preventDefault();
        }
    }

    function onDragEnd(e) {
        if (!draggedTile) return;

        let endX = 0;
        let endY = 0;

        if (e.type === 'mouseup') {
            endX = e.clientX;
            endY = e.clientY;
        } else if (e.type === 'touchend') {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
        }

        const diffX = endX - startX;
        const diffY = endY - startY;
        const swipeThreshold = 40;

        let direction = null;

        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
            direction = (diffX > 0) ? 'right' : 'left';
        } 
        else if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > swipeThreshold) {
            direction = (diffY > 0) ? 'down' : 'up';
        }

        if (direction) handleSwipe(direction);
        draggedTile = null;
    }

   function handleSwipe(direction) {
    const draggedPhysicalIndex = tiles.findIndex(t => t.originalIndex === draggedTile.originalIndex);
    const emptyPhysicalIndex = tiles.findIndex(t => t.originalIndex === emptyTileIndex);

    // Compute current row/col of both
    const draggedRow = Math.floor(draggedPhysicalIndex / gridSize);
    const draggedCol = draggedPhysicalIndex % gridSize;
    const emptyRow = Math.floor(emptyPhysicalIndex / gridSize);
    const emptyCol = emptyPhysicalIndex % gridSize;

    // Check adjacency
    const isLeft  = (draggedRow === emptyRow && draggedCol === emptyCol + 1);
    const isRight = (draggedRow === emptyRow && draggedCol === emptyCol - 1);
    const isUp    = (draggedCol === emptyCol && draggedRow === emptyRow + 1);
    const isDown  = (draggedCol === emptyCol && draggedRow === emptyRow - 1);

    // Apply the movement only if direction matches adjacency
    if (direction === 'left' && isLeft) {
        swapTilesAndDraw(draggedPhysicalIndex, emptyPhysicalIndex);
    }
    else if (direction === 'right' && isRight) {
        swapTilesAndDraw(draggedPhysicalIndex, emptyPhysicalIndex);
    }
    else if (direction === 'up' && isUp) {
        swapTilesAndDraw(draggedPhysicalIndex, emptyPhysicalIndex);
    }
    else if (direction === 'down' && isDown) {
        swapTilesAndDraw(draggedPhysicalIndex, emptyPhysicalIndex);
    }
}


    // --- INITIALIZE ALL ---
    function initGame() {
        scramble();

        // Add drag/swipe listeners
        board.addEventListener('mousedown', onDragStart);
        board.addEventListener('touchstart', onDragStart, { passive: false });
        document.addEventListener('mouseup', onDragEnd);
        document.addEventListener('touchend', onDragEnd, { passive: true });
    }

    // --- EVENT LISTENERS ---
    startGameButton.addEventListener('click', showGame);
    shuffleButton.addEventListener('click', scramble);
    backToMenuButton.addEventListener('click', showGameMenu);

    // --- MODAL EVENT LISTENERS ---
    howToPlayButton.addEventListener('click', () => modalOverlay.classList.add('active'));
    modalCloseButton.addEventListener('click', () => modalOverlay.classList.remove('active'));
    modalGotItButton.addEventListener('click', () => modalOverlay.classList.remove('active'));
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) modalOverlay.classList.remove('active');
    });

    // Start by showing splash screen
    showSplashScreen();
});

