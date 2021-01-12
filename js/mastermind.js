let code = [];
let guess = [];
let turn = 1;
const numberOfColors = 6;
let numberOfTurns;
// let abc = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n'];
let abc = "abcdefghijklmn";


const generateCode = () => {


    // code = abc.substr(0, numberOfColors).split("").map((a) => [Math.random(),a]).sort((a,b) => a[0]-b[0]).map((a) => a[1]).splice(0, 4);
    code = ['a','b','c','d'];

    document.querySelector('#solution').querySelectorAll('.hole-code').forEach((hole, i) => {

        hole.classList.add(`color-${code[i]}`);

    });

    // console.log(code);

    return;

}


const bullsAndCows = () => {

    let bulls = 0;
    let cows = 0;

    for (let i = 0; i < 4; i++){
        for (let j = 0; j < 4; j++){
            if (code[i] == guess[j]){
                if (i == j){
                    bulls++;
                } else{
                    cows++;
                }
            }
        }
    }

    return [bulls, cows];

}

const reload = (e) => {

    let i = turn;
    document.querySelector(".flip-container").classList.toggle("flip");

    let reloadBtn = document.querySelector('img');
    reloadBtn.style.transition = 'opacity 0s';
    reloadBtn.style.opacity = 0.2;

    // reloadBtn.style.filter = 'invert(84%) sepia(2%) saturate(4%) hue-rotate(324deg) brightness(93%) contrast(88%)'; 

    for (peg of document.querySelectorAll('.peg')){
        if (matchMedia('(hover: none)').matches){
            peg.removeEventListener("touchstart", placePeg);
        } else {
            peg.removeEventListener("mousedown", placePeg);
        }
    }

    if (matchMedia('(hover: none)').matches){
        reloadBtn.parentElement.removeEventListener("touchstart", reload);
    } else {
        reloadBtn.parentElement.removeEventListener("mousedown", reload);
    }

    const clear = () => {

        if (i == 0) {

            for (peg of document.querySelectorAll('.peg')){
                if (matchMedia('(hover: none)').matches){
                    peg.addEventListener("touchstart", placePeg);
                } else {
                    peg.addEventListener("mousedown", placePeg);
                }
            }

            turn = 1;
            generateCode();


            clearInterval(resetInterval);

        } else {
            document.querySelector(`.turn:nth-last-of-type(${i + 1})`).querySelectorAll('.hole-code').forEach(hole => {

                hole.className = 'hole-code';

            });

            document.querySelector(`.turn:nth-last-of-type(${i + 1})`).querySelectorAll('.hole-bc').forEach(hole => {
                hole.style = '';

                hole.className = 'hole-bc';

            });

            i--;

        }

    }

    let  resetInterval = setInterval(clear, 150);


}


const placePeg = (e) => {

    // if (turn > numberOfTurns) return;

    console.log("peg");


    if (document.querySelector(".flip-container").classList.contains('flip')) {
        
        
        let reloadBtn = document.querySelector('img');
        reloadBtn.style.transition = 'opacity 0.05s';
        reloadBtn.style.opacity = 0.5;

        setTimeout(() => {
            let reloadBtn = document.querySelector('img');
            reloadBtn.style.opacity = 1;

                                
        }, 100);
        
        return;
    }

    if (e.currentTarget.classList.contains('moving')) {
        return;
    } else {
        e.currentTarget.classList.toggle("moving");
    }


    if (getComputedStyle(e.currentTarget).getPropertyValue("opacity") == 0) return;

    let holes = document.querySelector(`.turn:nth-last-of-type(${turn + 1})`).querySelectorAll('.hole-code');


    let rectPeg = e.currentTarget.getBoundingClientRect();


    if (e.currentTarget.classList.contains("placed")) {

        for (let [i, hole] of holes.entries()) {

            let rectHole = hole.getBoundingClientRect();

            if (window.innerHeight > window.innerWidth || matchMedia('(hover: hover)').matches) {
                if (rectHole.left == rectPeg.left){

                    guess[i] = undefined;
    
                    hole.classList.toggle("occupied");
    
                    e.currentTarget.style.transform = `translate(0px, 0px)`;
    
                    e.currentTarget.classList.toggle("placed");
    
                    return;
    
                }            
            } else {
                if (rectHole.top == rectPeg.top){

                    guess[i] = undefined;
    
                    hole.classList.toggle("occupied");
    
                    e.currentTarget.style.transform = `translate(0px, 0px)`;
    
                    e.currentTarget.classList.toggle("placed");
    
                    return;
    
                }            
            }

        }
    }


    for (let [i, hole] of holes.entries()) {

        if (!hole.classList.contains("occupied")){


            guess[i] = e.currentTarget.id;

            hole.classList.toggle("occupied");
        
            let rectHole = hole.getBoundingClientRect();

            if (window.innerHeight > window.innerWidth || matchMedia('(hover: hover)').matches) {
                e.currentTarget.style.transform = `translate(${rectHole.left - rectPeg.left}px, ${rectHole.top - rectPeg.top}px)`;
            } else {
                e.currentTarget.style.transform = `translate(${rectPeg.top - rectHole.top}px, ${rectHole.left - rectPeg.left}px)`;
            }


            e.currentTarget.classList.toggle("placed");

            if (i == 3) {
                for (peg of document.querySelectorAll('.peg')){
                    if (matchMedia('(hover: none)').matches){
                        peg.removeEventListener("touchstart", placePeg);
                    } else {
                        peg.addEventListener("mousedown", placePeg);
                    }
                }

                setTimeout(() => {      
                    
                    let holesBC = document.querySelector(`.turn:nth-last-of-type(${turn + 1})`).querySelectorAll('.hole-bc');

                    let [bulls, cows] = bullsAndCows()

                    for (let i = 0; i < bulls; i++){
                        
                        holesBC[i].style.transition = `background-color 0s ${i/3}s`;

                        holesBC[i].classList.add("black");
                    }

                    for (let i = bulls; i < bulls + cows; i++){

                        holesBC[i].style.transition = `background-color 0s ${i/3}s, border 0s ${i/3}s`;

                        holesBC[i].classList.add("white");
                    }


                    guess = [];

                    turn++;


                    for (let peg of document.querySelectorAll('.peg')){

                        if (peg.classList.contains("placed")) {

                            let rectPeg = peg.getBoundingClientRect();

                            for (let hole of holes){
                                let rectHole = hole.getBoundingClientRect();

                                if (window.innerHeight > window.innerWidth || matchMedia('(hover: hover)').matches) {
                                    if (rectHole.left == rectPeg.left){
                                        hole.classList.add(`color-${peg.id}`);
    
                                        break;
                                    }                                
                                } else {
                                    if (rectHole.top == rectPeg.top){
                                        hole.classList.add(`color-${peg.id}`);
    
                                        break;
                                    }                                
                                }
       
                            }

                            peg.style.transition = 'opacity 0s';

                            peg.style.opacity = 0;

                            peg.style.transform = `translate(0px, 0px)`;
                                
                        }
                    }


                    setTimeout(() => {

                        if (turn > numberOfTurns || bulls == 4) {
                            document.querySelector(".flip-container").classList.toggle("flip");
                            let reloadBtn = document.querySelector('img');
                            reloadBtn.style.transition = 'opacity 1s';
                            reloadBtn.style.opacity = 1;

                            // setTimeout(() => {
                                if (matchMedia('(hover: none)').matches){
                                    reloadBtn.parentElement.addEventListener("touchstart", reload);
                                } else {
                                    reloadBtn.parentElement.addEventListener("mousedown", reload);
                                }

                                for (peg of document.querySelectorAll('.peg')){
                                    if (matchMedia('(hover: none)').matches){
                                        peg.addEventListener("touchstart", placePeg);
                                    } else {
                                        peg.addEventListener("mousedown", placePeg);
                                    }
                                }
                            // }, 1000);    
                        } else {

                            for (peg of document.querySelectorAll('.peg')){
                                if (matchMedia('(hover: none)').matches){
                                    peg.addEventListener("touchstart", placePeg);
                                } else {
                                    peg.addEventListener("mousedown", placePeg);
                                }
                            }
                        }


                        for (let [i, peg] of document.querySelectorAll('.placed').entries()){

                            peg.style.transition = `opacity 0s ${i/6}s ease-in-out, transform 0.3s ease-in-out`;
                            peg.style.opacity = 1;

                            peg.classList.toggle("placed");


                        }
                        
                    }, 350 * (bulls + cows));

                
                }, 350);                    
            
            } 

            return;
        }
    }

}

const stopMoving = (e) => {
    if (e.currentTarget.classList.contains('moving')) {
        e.currentTarget.classList.toggle("moving");
    }  
    
} 

const setEventListeners = () => {
    document.querySelectorAll('.peg').forEach((peg, i) => {
            if (matchMedia('(hover: none)').matches){
                peg.addEventListener("touchstart", placePeg);
            } else {
                peg.addEventListener("mousedown", placePeg);
            }

            peg.addEventListener('transitionend', stopMoving);
            
    }); 
} 

const setTheBoard = () => {

    if (window.innerHeight > window.innerWidth || matchMedia('(hover: hover)').matches) {
        document.documentElement.style.setProperty('--board-height', Math.ceil(window.innerHeight * 0.97 / 4) * 4 + 'px');
    } else {
        document.documentElement.style.setProperty('--board-height', Math.ceil(window.innerWidth * 0.97 / 4) * 4 + 'px');
    }


    if(screen.width < 460 || screen.height < 460){
        if (window.innerHeight > window.innerWidth) {
            document.documentElement.style.setProperty('--board-width', Math.ceil(window.innerWidth * 0.97 / 4) * 4 + 'px');
        } else {
            document.documentElement.style.setProperty('--board-width', Math.ceil(window.innerHeight * 0.97 / 4) * 4 + 'px');
        }

        if (screen.width/screen.height > 0.5 && screen.height/screen.width < 2){
            if (window.navigator.standalone || (document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1)) {
                numberOfTurns = 7;
                document.documentElement.style.setProperty('--board-size', 9);
                document.querySelector(".turn:nth-child(2)").style.display = "none";
                document.querySelector(".turn:nth-child(3)").style.display = "none";
                document.querySelector(".turn:nth-child(4)").style.display = "none";

                
            } else {
                numberOfTurns = 6;
                document.documentElement.style.setProperty('--board-size', 8);
                // document.querySelectorAll(".turn:last-of-type").forEach((turn) => {
                //     console.log("none");

                //     turn.style.display = "none";
                // });

                document.querySelector(".turn:nth-child(2)").style.display = "none";
                document.querySelector(".turn:nth-child(3)").style.display = "none";
                document.querySelector(".turn:nth-child(4)").style.display = "none";
                document.querySelector(".turn:nth-child(5)").style.display = "none";
                    


                // console.log("6");
            }
        } else {
            if (window.navigator.standalone || (document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1)) {
                numberOfTurns = 9;
                document.documentElement.style.setProperty('--board-size', 11);
                document.querySelector(".turn:nth-child(2)").style.display = "none";

            } else {

                numberOfTurns = 8;
                document.documentElement.style.setProperty('--board-size', 10);
                document.querySelector(".turn:nth-child(2)").style.display = "none";
                document.querySelector(".turn:nth-child(3)").style.display = "none";
            }    
        }
    } else {    
        if (matchMedia('(hover: none)').matches) {
            if (window.innerHeight > window.innerWidth) {
                document.documentElement.style.setProperty('--board-width', Math.ceil(window.innerWidth * 0.80 / 4) * 4 + 'px');
            } else {
                document.documentElement.style.setProperty('--board-width', Math.ceil(window.innerHeight * 0.80 / 4) * 4 + 'px');
            }
        } else {
            document.documentElement.style.setProperty('--board-width', Math.ceil(window.innerHeight * 0.60 / 4) * 4 + 'px');
        }

        numberOfTurns = 7;
        document.documentElement.style.setProperty('--board-size', 9);
        document.querySelector(".turn:nth-child(2)").style.display = "none";
        document.querySelector(".turn:nth-child(3)").style.display = "none";
        document.querySelector(".turn:nth-child(4)").style.display = "none";         

    }


}

showUp = () => {

        document.querySelectorAll('.front, .back ').forEach((side) => {
            side.style.transition = 'all 0s';
        });

        // document.querySelector("body").style.opacity = 1;

        let delays = Array.from({length: numberOfTurns + 1}, (_, i) => i/6);

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

        setTimeout(() => {

            document.querySelectorAll('.front, .back ').forEach((side) => {
                side.style.transition = '';
            });
                                
            delays = Array.from({length: numberOfColors}, (_, i) => i/6);

            document.querySelectorAll(".peg").forEach((peg, i) => {
                peg.style.transition = `opacity 0s linear ${delays.shift()}s, transform 0.3s ease-in-out`; 
            });  

            document.querySelectorAll(".peg").forEach((peg) => {
                peg.style.opacity = 1;  
            });     
        
        }, (numberOfTurns + 1) / 6 * 1000);
        
}

const init = () => {

    setEventListeners();

    generateCode();

    setTheBoard();
   
    showUp();
}


window.onload = () => {
    document.fonts.ready.then(() => {

        const preventDefault = (e) => e.preventDefault();
        
        document.body.addEventListener('touchmove', preventDefault, { passive: false });

    
        init(); 
    });
}

