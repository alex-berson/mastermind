let code = [];
let guess = [];

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js')
        .then(reg => {
          console.log('Service worker registered!', reg);
        })
        .catch(err => {
          console.log('Service worker registration failed: ', err);
        });
    });
}  

const generateCode = () => {

    const abc = "abcdef";

    code = abc.split("").map((a) => [Math.random(),a]).sort((a,b) => a[0]-b[0]).map((a) => a[1]).splice(0, 4);

    return;
}

const fillCode = () => {
    document.querySelector('#solution').querySelectorAll('.hole-code').forEach((hole, i) => {
        hole.className = '';
        hole.classList.add('hole-code', `color-${code[i]}`);
    });
}

const bullsAndCows = () => {

    let bulls = 0;
    let cows = 0;

    for (let i = 0; i < code.length; i++){
        for (let j = 0; j < guess.length; j++){
            if (code[i] == guess[j]) i == j ? bulls++ : cows++;
        }
    }

    return [bulls, cows];
}

const totalGuessed = () => {

    let [bulls, cows] = bullsAndCows();
    return bulls + cows;
}

const turn = () => {

    for (let [i, turn] of  document.querySelectorAll('.turn:not(.hidden)').entries()) {

        if (getComputedStyle(turn.querySelector('.hole-code')).getPropertyValue("background-color") != "rgb(220, 220, 220)" && i != 0) {

            return numberOfTurns() - i + 2;
        }       
    }

    return 1;
}

const numberOfTurns = () => {
    return document.querySelectorAll('.turn:not(.hidden)').length - 1;
}

const numberOfPegs = () => {
    return document.querySelectorAll('.peg').length;
}

const touchScreen = () => {
    return matchMedia('(hover: none)').matches;
}

const disablePegs = () => {
    for (peg of document.querySelectorAll('.peg')){
        if (touchScreen()){
            peg.removeEventListener("touchstart", pegTouched);
        } else {
            peg.removeEventListener("mousedown", pegTouched);
            peg.style.cursor = "";
        }
    }
}

const enablePegs = () => {
    for (peg of document.querySelectorAll('.peg')){
        if (touchScreen()){
            peg.addEventListener("touchstart", pegTouched);
        } else {
            peg.addEventListener("mousedown", pegTouched);
            peg.style.cursor = "pointer";
        }

        peg.addEventListener('transitionend', stopMoving);
    }
}

const disableReload = () => {

    const reloadBtn = document.querySelector('img');
    reloadBtn.style.transition = 'opacity 0s';
    reloadBtn.style.opacity = 0.2;

    if (touchScreen()){
        reloadBtn.parentElement.removeEventListener("touchstart", reload);
    } else {
        reloadBtn.parentElement.removeEventListener("mousedown", reload);
        reloadBtn.parentElement.style.cursor = "";
    }
}

const enableReload = () => {

    const reloadBtn = document.querySelector('img');
    reloadBtn.style.transition = 'opacity 1s';
    reloadBtn.style.opacity = 1;

    if (touchScreen()){
        reloadBtn.parentElement.addEventListener("touchstart", reload);
    } else {
        reloadBtn.parentElement.addEventListener("mousedown", reload);
        reloadBtn.parentElement.style.cursor = "pointer";
    }
}

const flipTitle = () => {
    document.querySelector(".flip-container").classList.toggle("flip");
}

const clearRow = () => {

    document.querySelector(`.turn:nth-last-of-type(${turn()})`).querySelectorAll('.hole-bc').forEach(hole => {
        hole.style = '';
        hole.className = 'hole-bc';
    });

    document.querySelector(`.turn:nth-last-of-type(${turn()})`).querySelectorAll('.hole-code').forEach(hole => {
        hole.className = 'hole-code';
    });
}

const clearBoard = () => {

    if (turn() == 1) {

        generateCode();
        fillCode();
        enablePegs();

        clearInterval(cleanInterval);

    } else {

        clearRow();
    }
}

const reload = () => {

    disableReload();

    disablePegs();

    flipTitle();
    
    cleanInterval = setInterval(clearBoard, 150);
}

const solutionDispayed = () => {
    return document.querySelector(".flip-container").classList.contains('flip');
}

const blinkReloadBtn = () => {
    const reloadBtn = document.querySelector('img');
    reloadBtn.style.transition = 'opacity 0.05s';
    reloadBtn.style.opacity = 0.5;

    setTimeout(() => {
        const reloadBtn = document.querySelector('img');
        reloadBtn.style.opacity = 1;                 
    }, 100);
}

const pegVisible = (e) => {
    return getComputedStyle(e.currentTarget).getPropertyValue("opacity") != 0;
}

const gameOver = () => {

    const [bulls, _] = bullsAndCows();
 
    return turn() > numberOfTurns() || bulls == 4;
}

const displayBC = () => {

    const holesBC = document.querySelector(`.turn:nth-last-of-type(${turn() + 1})`).querySelectorAll('.hole-bc');

    const [bulls, cows] = bullsAndCows()

    for (let i = 0; i < bulls; i++){
        
        holesBC[i].style.transition = `background-color 0s ${i/3}s`;

        holesBC[i].classList.add("black");
    }

    for (let i = bulls; i < bulls + cows; i++){

        holesBC[i].style.transition = `background-color 0s ${i/3}s, border 0s ${i/3}s`;

        holesBC[i].classList.add("white");
    }
}

const returnPegs = () => {

    const holes = document.querySelector(`.turn:nth-last-of-type(${turn() + 1})`).querySelectorAll('.hole-code');

    for (let peg of document.querySelectorAll('.peg')){

        if (peg.classList.contains("placed")) {

            const rectPeg = peg.getBoundingClientRect();

            for (let hole of holes){
                const rectHole = hole.getBoundingClientRect();

                if (vertical()) {
                    if (rectHole.left == rectPeg.left){hole.classList.add(`color-${peg.id}`); break}                                
                } else {
                    if (rectHole.top == rectPeg.top){hole.classList.add(`color-${peg.id}`); break}                                
                }
            }

            peg.style.transition = 'opacity 0s';
            peg.style.opacity = 0;
            peg.style.transform = `translate(0px, 0px)`;
                
        }
    }
}

const vertical = () => {
    return window.innerHeight > window.innerWidth || !touchScreen();
}

const returnPeg = (e) => {

    const holes = document.querySelector(`.turn:nth-last-of-type(${turn() + 1})`).querySelectorAll('.hole-code');

    const rectPeg = e.currentTarget.getBoundingClientRect();

    for (let [i, hole] of holes.entries()) {

        const rectHole = hole.getBoundingClientRect();

        if (vertical() && rectHole.left == rectPeg.left || !vertical() && rectHole.top == rectPeg.top) {

            hole.classList.toggle("occupied");

            e.currentTarget.style.transform = `translate(0px, 0px)`;

            e.currentTarget.classList.toggle("placed");
        }
    }
}

const displayPegs = () => {

    for (let [i, peg] of document.querySelectorAll('.placed').entries()){

        peg.style.transition = `opacity 0s ${i/6}s ease-in-out, transform 0.3s ease-in-out`;
        peg.style.opacity = 1;
        peg.classList.toggle("placed");
    }
}

const turnDone = () => {

    disablePegs();

    setTimeout(() => {      
        
        displayBC();

        returnPegs();

        setTimeout(() => {

            if (gameOver()) {

                flipTitle();

                setTimeout(() => {

                    enableReload();

                    enablePegs();

                }, 300);    

            } else {

                enablePegs();
                
            }

            displayPegs();
            
        }, 350 * totalGuessed());
    
    }, 350);  
}

const placePeg = (e) => {

    const holes = document.querySelector(`.turn:nth-last-of-type(${turn() + 1})`).querySelectorAll('.hole-code');

    const rectPeg = e.currentTarget.getBoundingClientRect();

    for (let [i, hole] of holes.entries()) {

        if (!hole.classList.contains("occupied")){

            guess[i] = e.currentTarget.id;

            hole.classList.toggle("occupied");
        
            const rectHole = hole.getBoundingClientRect();

            if (vertical()) {
                e.currentTarget.style.transform = `translate(${rectHole.left - rectPeg.left}px, ${rectHole.top - rectPeg.top}px)`;
            } else {
                e.currentTarget.style.transform = `translate(${rectPeg.top - rectHole.top}px, ${rectHole.left - rectPeg.left}px)`;
            }

            e.currentTarget.classList.toggle("placed");

            if (i == 3) {

                turnDone();                  
            } 

            return;
        }
    }
}

const pegTouched = (e) => {

    if (solutionDispayed()) {blinkReloadBtn(); return}

    if (e.currentTarget.classList.contains('moving')) return;

    e.currentTarget.classList.toggle("moving");

    if (!pegVisible(e)) return;

    if (e.currentTarget.classList.contains("placed")) {
        returnPeg(e);
        return;
    }

    placePeg(e);
}

const stopMoving = (e) => {

    if (e.currentTarget.classList.contains('moving')) {
        e.currentTarget.classList.toggle("moving");
    }  
} 
 
const setBoardHeight = (vh) => {

    if (vertical()) {
        document.documentElement.style.setProperty('--board-height', Math.ceil(document.documentElement.clientHeight * vh / 4) * 4 + 'px');
    } else {
        document.documentElement.style.setProperty('--board-height', Math.ceil(document.documentElement.clientWidth * vh / 4) * 4 + 'px');
    }
}

const setBoardWidth = (vw) => {

    if (window.innerHeight > window.innerWidth && touchScreen()) {
        document.documentElement.style.setProperty('--board-width', Math.ceil(document.documentElement.clientWidth * vw / 4) * 4 + 'px');
    } else {
        document.documentElement.style.setProperty('--board-width', Math.ceil(document.documentElement.clientHeight * vw / 4) * 4 + 'px');
    } 
}

const iPhoneXApp = () => {
    if ((document.URL.indexOf('http://') == -1 && document.URL.indexOf('https://') == -1) && 
        (screen.width < 460 || screen.height < 460) && 
        (screen.width/screen.height < 0.5 && screen.height/screen.width > 2)) {
            return true;
    } 
    return false;
}

const setBoardSize = (n) => {

    document.documentElement.style.setProperty('--board-size', n);

    for (let i = 0; i < 10 - n; i++) {
        document.querySelector(`.turn:nth-child(${i + 2})`).classList.add('hidden');
    }
}

const phone = () => {
    return (screen.width < 460 || screen.height < 460) && screen.height/screen.width < 2;
}

const phoneX = () => {
    return (screen.width < 460 || screen.height < 460) && screen.height/screen.width > 2;
}

const iPad = () => {

    return (screen.width/screen.height).toFixed(1) >= 0.7;
}

const fullScreen = () => {
    return window.navigator.standalone || (document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1);
}

const setTheBoard = () => {

    if (phone()) {fullScreen() ? setBoardSize(9) : setBoardSize(8); setBoardHeight(0.97); setBoardWidth(0.97); return}

    if (iPhoneXApp()) {setBoardSize(10); setBoardHeight(1); setBoardWidth(0.97); return}

    if (phoneX()) {fullScreen() ? setBoardSize(10) : setBoardSize(8); setBoardHeight(0.97); setBoardWidth(0.97); return}

    setBoardSize(9);

    setBoardHeight(0.97);

    if (touchScreen()) {iPad() ? setBoardWidth(0.8) : setBoardWidth(0.97); return}
    
    setBoardWidth(0.60);
}

const showBoard = () => {

    const delays = Array.from({length: numberOfTurns() + 1}, (_, i) => i/6);

        document.querySelectorAll(".turn").forEach((turn, i) => {
            if (getComputedStyle(turn).getPropertyValue("display") != 'none') {
                turn.style.transition = `opacity 0s linear ${delays.shift()}s`; 
            }
        });  

        document.querySelectorAll(".turn").forEach((turn) => {
            if (getComputedStyle(turn).getPropertyValue("display") != 'none') {
                turn.style.opacity = 1;  
            }  
        });  
}

const showPegs = () => {

    const delays = Array.from({length: numberOfPegs()}, (_, i) => i/6);

    document.querySelectorAll(".peg").forEach((peg, i) => {
        peg.style.transition = `opacity 0s linear ${delays.shift()}s, transform 0.3s ease-in-out`; 
    });  

    document.querySelectorAll(".peg").forEach((peg) => {
        peg.style.opacity = 1;  
    });     
}

const showUp = () => {

        showBoard();

        setTimeout(showPegs, (numberOfTurns() + 1) / numberOfPegs() * 1000);    
}

const disableTouchMove = () => {

    const preventDefault = (e) => e.preventDefault();
    document.body.addEventListener('touchmove', preventDefault, { passive: false });

}

const init = () => {

    disableTouchMove();

    setTheBoard();

    generateCode();

    fillCode();
   
    showUp();

    enablePegs();
}

window.onload = () => {
    document.fonts.ready.then(() => {
        init(); 
    });
}

