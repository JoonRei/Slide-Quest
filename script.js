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
    
    const gridSize = 3;
    const tileSize = 100;
    const boardPadding = 5; 

    let tiles = [];
    const solvedState = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    // --- SCREEN MANAGEMENT ---
    function showSplashScreen() {
        splashScreen.classList.remove('hidden');
        gameMenu.classList.add('hidden');
        gameContainer.classList.add('hidden');
        
        // Fade-out logic
        setTimeout(() => {
            splashScreen.classList.add('fade-out'); 
            
            setTimeout(() => {
                splashScreen.classList.add('hidden');
                showGameMenu();
            }, 500); 

        }, 3000); 
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
        
        if (index === 8) {
            tile.classList.add('empty');
            return tile;
        }

        const col = index % gridSize;
        const row = Math.floor(index / gridSize);
        const bgPosX = col * (100 / (gridSize - 1));
        const bgPosY = row * (100 / (gridSize - 1));
        tile.style.backgroundPosition = `${bgPosX}% ${bgPosY}%`;
        
        tile.addEventListener('click', () => onTileClick(index));
        return tile;
    }

    function drawBoard() {
        tiles.forEach((tile, logicalIndex) => {
            const physicalIndex = tiles.findIndex(item => item.originalIndex === logicalIndex);
            const col = physicalIndex % gridSize;
            const row = Math.floor(physicalIndex / gridSize);

            // Account for board padding
            tile.element.style.top = `${row * tileSize + boardPadding}px`;
            tile.element.style.left = `${col * tileSize + boardPadding}px`;
        });
    }

    // --- GAME LOGIC ---

    function onTileClick(clickedTileOriginalIndex) {
        const clickedPhysicalIndex = tiles.findIndex(item => item.originalIndex === clickedTileOriginalIndex);
        const emptyPhysicalIndex = tiles.findIndex(item => item.originalIndex === 8);

        if (canMove(clickedPhysicalIndex, emptyPhysicalIndex)) {
            [tiles[clickedPhysicalIndex], tiles[emptyPhysicalIndex]] = 
            [tiles[emptyPhysicalIndex], tiles[clickedPhysicalIndex]];
            
            drawBoard();
            checkWin();
        }
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
            const emptyPhysicalIndex = tiles.findIndex(item => item.originalIndex === 8);
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

    // --- INITIALIZE ALL ---
    function initGame() {
        scramble();
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

    
    showSplashScreen();
});