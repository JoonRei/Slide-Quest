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

    // --- NEW: DRAG & SWIPE STATE ---
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
        
        // REMOVED the 'click' listener
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

    // --- GAME LOGIC ---

    // RENAMED: This is now the core swap function
    function swapTilesAndDraw(tile1PhysicalIndex, tile2PhysicalIndex) {
        [tiles[tile1PhysicalIndex], tiles[tile2PhysicalIndex]] = 
        [tiles[tile2PhysicalIndex], tiles[tile1PhysicalIndex]];
        
        drawBoard();
        checkWin();
    }

    function canMove(clickedIndex, emptyIndex) {
        const sameRow = Math.floor(clickedIndex / gridSize) === Math.floor(emptyIndex / gridSize);
        if (sameRow && Math.abs(clickedIndex - emptyIndex) === 1) {
            return true;
        }
        const sameCol = (clickedIndex % gridSize) === (emptyIndex % gridSize);
        if (sameCol && Math.abs(clickedIndex - emptyIndex) === gridSize) {
            return true;
        }
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
            alert('Congratulations, you solved it!');
            showGameMenu(); 
        }, 300);
    }


    // --- NEW: SWIPE/DRAG EVENT HANDLERS ---

    function onDragStart(e) {
        // Find the tile element that was clicked
        const targetTileElement = e.target.closest('.tile');

        if (targetTileElement && !targetTileElement.classList.contains('empty')) {
            // Find this tile in our `tiles` array
            draggedTile = tiles.find(t => t.element === targetTileElement);
            if (!draggedTile) return;

            // Get start coordinates
            if (e.type === 'mousedown') {
                startX = e.clientX;
                startY = e.clientY;
            } else if (e.type === 'touchstart') {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            }
            e.preventDefault(); // Prevent text selection or image dragging
        }
    }

    function onDragEnd(e) {
        if (!draggedTile) return; // We weren't dragging a valid tile

        let endX = 0;
        let endY = 0;

        // Get end coordinates
        if (e.type === 'mouseup') {
            endX = e.clientX;
            endY = e.clientY;
        } else if (e.type === 'touchend') {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
        }

        // Calculate the difference
        const diffX = endX - startX;
        const diffY = endY - startY;
        const swipeThreshold = 50; // Minimum pixels swiped to count

        let direction = null;

        // Check for horizontal swipe
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
            direction = (diffX > 0) ? 'right' : 'left';
        } 
        // Check for vertical swipe
        else if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > swipeThreshold) {
            direction = (diffY > 0) ? 'down' : 'up';
        }

        if (direction) {
            handleSwipe(direction);
        }

        // Reset drag state
        draggedTile = null;
    }

    function handleSwipe(direction) {
        const draggedPhysicalIndex = tiles.findIndex(t => t.originalIndex === draggedTile.originalIndex);
        const emptyPhysicalIndex = tiles.findIndex(t => t.originalIndex === emptyTileIndex);

        // Check if the empty space is in the direction the user swiped
        if (direction === 'left' && canMove(draggedPhysicalIndex, emptyPhysicalIndex) && emptyPhysicalIndex === draggedPhysicalIndex - 1) {
            swapTilesAndDraw(draggedPhysicalIndex, emptyPhysicalIndex);
        }
        else if (direction === 'right' && canMove(draggedPhysicalIndex, emptyPhysicalIndex) && emptyPhysicalIndex === draggedPhysicalIndex + 1) {
            swapTilesAndDraw(draggedPhysicalIndex, emptyPhysicalIndex);
        }
        else if (direction === 'up' && canMove(draggedPhysicalIndex, emptyPhysicalIndex) && emptyPhysicalIndex === draggedPhysicalIndex - gridSize) {
            swapTilesAndDraw(draggedPhysicalIndex, emptyPhysicalIndex);
        }
        else if (direction === 'down' && canMove(draggedPhysicalIndex, emptyPhysicalIndex) && emptyPhysicalIndex === draggedPhysicalIndex + gridSize) {
            swapTilesAndDraw(draggedPhysicalIndex, emptyPhysicalIndex);
        }
    }


    // --- INITIALIZE ALL ---
    function initGame() {
        scramble();

        // Add drag/swipe listeners to the board
        board.addEventListener('mousedown', onDragStart);
        board.addEventListener('touchstart', onDragStart, { passive: false });

        // Add listeners to the *whole window* for releasing the drag
        // This catches cases where the user drags outside the board
        document.addEventListener('mouseup', onDragEnd);
        document.addEventListener('touchend', onDragEnd);
    }

    // --- EVENT LISTENERS ---
    startGameButton.addEventListener('click', showGame);
    shuffleButton.addEventListener('click', scramble);
    backToMenuButton.addEventListener('click', showGameMenu);
    
    // --- MODAL EVENT LISTENERS ---
    howToPlayButton.addEventListener('click', () => {
        modalOverlay.classList.add('active');
    });

    modalCloseButton.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
    });

    modalGotItButton.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
    });

    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) { 
            modalOverlay.classList.remove('active');
        }
    });

    // Start by showing the splash screen
    showSplashScreen();
});
