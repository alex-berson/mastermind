const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const touchScreen = () => matchMedia('(hover: none)').matches || matchMedia('(pointer: coarse)').matches;

const shuffle = (array) => {

    for (let i = array.length - 1; i > 0; i--) {

        let j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] = [array[j], array[i]]; 
    }

    return array;
}

const portraitMode = () => {

    return new Promise(resolve => {

        let landscape = window.innerHeight < window.innerWidth;

        if (touchScreen() && landscape) {

            window.addEventListener('orientationchange', () => setTimeout(resolve, 500), {once: true});

            return;
        }

        resolve();
    });
}

const setBoardSize = () => {

    const fullScreen = () => window.navigator.standalone || nativeApp();
    const nativeApp = () => !document.URL.startsWith('http://') && !document.URL.startsWith('https://');

    let board = document.querySelector('.board');
    let hole = document.querySelector('.hole-code');
    let n = fullScreen() ? screen.width / screen.height < 0.5 ? 10 : 9 : 8;
    let scaleX = touchScreen() ? screen.width > 460 && screen.height > 460 ? 0.75 : 0.97 : 0.6 * window.innerHeight / window.innerWidth;
    let scaleY = nativeApp() && screen.width / screen.height < 0.5 ? 1 : 0.97;
    
    document.documentElement.style.setProperty('--board-size', n);
    document.documentElement.style.setProperty('--board-width', `${Math.ceil(document.documentElement.clientWidth * scaleX / 4) * 4}px`);
    document.documentElement.style.setProperty('--board-height', `${Math.ceil(document.documentElement.clientHeight * scaleY / n) * n}px`);

    let ratio = hole.getBoundingClientRect().width / board.getBoundingClientRect().width;

    document.documentElement.style.setProperty('--hole-board-ratio', ratio);
}

const generateCode = () => {

    let code = shuffle([1,2,3,4,5,6]).slice(0, 4);
    let holes = document.querySelectorAll('#solution .hole-code');

    holes.forEach(hole => hole.dataset.color = code.shift());
}

const showBoard = async () => {

    let header = document.querySelector('.header');
    let pegs = [...document.querySelectorAll('.peg')];
    let n = Number(getComputedStyle(document.documentElement).getPropertyValue('--board-size')) - 2;

    header.classList.add('visible');

    for (let i = 0; i < n; i++) {

        let row = createRow();

        await sleep(150);

        row.classList.add('visible');
    }

    for (let peg of pegs) {

        await sleep(150);

        peg.classList.add('visible');
    }
}

const createRow = () => {

    let pegs = document.querySelector('.pegs');
    let board = document.querySelector('.board');
    let template = document.querySelector('.row-template');
    let clone = template.content.cloneNode(true);
    let row = clone.querySelector('.row');

    board.insertBefore(clone, pegs);
    
    return row;
}

const selectHole = (e) => {

    let hole = e.currentTarget;
    let rows = document.querySelectorAll('.row:not(.completed)');
    let row = rows[rows.length - 1];
    let holes = row.querySelectorAll('.hole-code');
    let valid = [...holes].includes(hole);
    let selected = row.querySelector('.selected');
    let occupied = hole.classList.contains('occupied');

    if (gameOver() || !valid || occupied) return;
    if (selected) selected.classList.remove('selected');
    if (hole != selected) hole.classList.add('selected');
}

const selectPeg = (e) => {

    let peg = e.currentTarget;
    let moving = peg.classList.contains('move');
    let visible = peg.classList.contains('visible');

    if (moving || !visible) return;

    if (gameOver()) {
        blinkReset();
        return;
    }

    if (peg.classList.contains('placed')) {
        returnPeg(peg);
        return;
    }

    placePeg(peg);
}

const placePeg = (peg) => {

    let color = Number(peg.dataset.color);
    let rows = document.querySelectorAll('.row:not(.completed)');
    let row = rows[rows.length - 1];
    let holes = [...row.querySelectorAll('.hole-code')];
    let hole = row.querySelector('.hole-code.selected:not(.occupied)') ||
               row.querySelector('.hole-code:not(.occupied)');
    let pos = holes.indexOf(hole);
    let pegRect = peg.getBoundingClientRect();
    let holeRect = hole.getBoundingClientRect();
    let offsetLeft = holeRect.left - pegRect.left;
    let offsetTop = holeRect.top - pegRect.top;

    peg.classList.add('move');
    hole.classList.add('occupied');
    peg.style.transform = `translate(${offsetLeft}px, ${offsetTop}px)`;

    let occupied = row.querySelectorAll('.hole-code.occupied');

    if (occupied.length == 4) disablePegs();
   
    peg.addEventListener('transitionend', () => {

        peg.classList.remove('move'); 
        peg.classList.add('placed');
        peg.dataset.pos = pos;
        hole.classList.remove('selected');
        hole.dataset.color = color;

        if (occupied.length == 4) endTurn(row);

    }, {once: true});
}

const returnPeg = (peg) => {

    let pos = peg.dataset.pos;
    let rows = document.querySelectorAll('.row:not(.completed)');
    let row = rows[rows.length - 1];
    let hole = row.querySelectorAll('.hole-code')[pos];
    
    hole.classList.remove('occupied');
    peg.classList.add('move');
    peg.removeAttribute('style');
    
    delete hole.dataset.color;
    delete peg.dataset.pos;

    peg.addEventListener('transitionend', () => peg.classList.remove('move', 'placed'), {once: true});
}

const endTurn = async (row) => {

    row.classList.add('completed');
     
    await showClues(row);
    resetPegs();

    if (gameOver()) {
        endGame();
        return;
    }

    enablePegs();
}

const getClues = () => {

    let clues = [0, 0];
    let row = document.querySelector('.row.completed');
    let solution = document.querySelectorAll('#solution .hole-code');

    if (row == null) return clues;

    let guess = row.querySelectorAll('.hole-code');

    for (let i = 0; i < solution.length; i++) {
        for (let j = 0; j < guess.length; j++) {
            if (solution[i].dataset.color == guess[j].dataset.color) clues[Number(i != j)]++
        }
    }

    return clues;
}

const showClues = async (row) => {

    let [blacks, whites] = getClues();
    let holes = [...row.querySelectorAll('.hole-clue')];

    for (let i = 0; i < blacks + whites; i++) { 

        let hole = holes.shift();

        hole.classList.add(i < blacks ? 'black' : 'white');

        await sleep(300);
    }  
}

const resetPegs = async () => {

    let pegs = document.querySelectorAll('.peg.placed');

    pegs.forEach(peg => peg.classList.remove('visible'));

    for (let peg of pegs) {

        await sleep(150);

        peg.removeAttribute('style');
        peg.classList.remove('placed');
        peg.classList.add('visible');
    }
}

const gameOver = () => {

    let [blacks, _] = getClues();
    let row = document.querySelector('.row:not(.header)');
    let holes = row.querySelectorAll('.hole-code:not(.occupied)');
 
    return holes.length == 0 || blacks == 4;
}

const endGame = async () => {

    flipTitle();
    await sleep(300);
    enableReset();
    enablePegs();
}

const flipTitle = () => {

    return new Promise(resolve => {

        let flipper = document.querySelector('.flip-container');

        flipper.classList.toggle('flip');
        flipper.addEventListener('transitionend', resolve, {once: true});
    });
}

const blinkReset = () => {

    let button = document.querySelector('.button');

    button.classList.add('blink');

    button.addEventListener('animationend', () => button.classList.remove('blink'), {once: true});
}

const resetGame = async () => {

    disableReset();
    disablePegs();
    await Promise.all([
        flipTitle(),
        clearBoard()
    ]);
    generateCode();
    enablePegs();
}

const clearBoard = async () => {
   
    let rows = document.querySelectorAll('.row.completed');
   
    for (let row of rows) {

        await sleep(150);

        let holesCode = row.querySelectorAll('.hole-code');
        let holesClue = row.querySelectorAll('.hole-clue');

        holesCode.forEach(hole => {
            delete hole.dataset.color;
            hole.classList.remove('occupied','selected')
        });

        holesClue.forEach(hole => hole.classList.remove('black', 'white'));

        row.classList.remove('completed');
    }
}

const enableHoles = () => {

    let holes = document.querySelectorAll('.row:not(:first-child).visible .hole-code');

    for (let hole of holes) {
        hole.addEventListener('touchstart', selectHole);
        hole.addEventListener('mousedown', selectHole);
    }
}

const enablePegs = () => {

    let pegs = document.querySelectorAll('.peg');

    for (let peg of pegs) {
        peg.classList.add('enabled');
        peg.addEventListener('touchstart', selectPeg);
        peg.addEventListener('mousedown', selectPeg);
    }
}

const disablePegs = () => {

    let pegs = document.querySelectorAll('.peg');

    for (let peg of pegs) {
        peg.classList.remove('enabled');
        peg.removeEventListener('touchstart', selectPeg);
        peg.removeEventListener('mousedown', selectPeg);
    }
}

const enableReset = () => {

    let reset = document.querySelector('.reset');
    let button = document.querySelector('.button');

    button.style.transitionDuration = '0.6s';
    button.addEventListener('transitionend', () => button.removeAttribute('style'), {once: true});

    reset.classList.add('enabled');
    reset.addEventListener('touchstart', resetGame);
    reset.addEventListener('mousedown', resetGame);
}

const disableReset = () => {

    let reset = document.querySelector('.reset');

    reset.classList.remove('enabled');
    reset.removeEventListener('touchstart', resetGame);
    reset.removeEventListener('mousedown', resetGame);
}

const disableScreen = () => {

    const preventDefault = (e) => e.preventDefault();

    document.addEventListener('touchstart', preventDefault, {passive: false});
    document.addEventListener('mousedown', preventDefault, {passive: false});
}

const registerServiceWorker = () => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js');
}

const init = async () => {

    registerServiceWorker();
    disableScreen();
    await portraitMode();
    setBoardSize();
    generateCode();
    await showBoard();
    enablePegs();
    enableHoles();
}

window.onload = () => document.fonts.ready.then(init); 