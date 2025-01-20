import { Game } from "./classes/game.js";
import { GameDB } from "./classes/gameDB.js"

const canvas = document.getElementById("gameCanvas");
const game = new Game(canvas);


let gameDB;

gameDB = new GameDB(); 
await gameDB.connect();
const scores = await gameDB.getScores();
console.log(scores);
gameDB.printScores();

window.addEventListener("keydown", (e) => (game.keys[e.key] = true));
window.addEventListener("keyup", (e) => (game.keys[e.key] = false));

document.getElementById("deathForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    let d = new Date();
    let dY = d.getFullYear();
    let dMo = d.getMonth() + 1;
    let dD = d.getDate();
    let dH = d.getHours();
    let dMi = d.getMinutes();
    let date = dD.toString() + ". " + dMo.toString() + ". " + dY.toString() + ", " + dH.toString() + ":" + dMi.toString().padStart(2,'0'); 

    
    const playerName = document.getElementById("playerName").value;
    if (playerName.trim() !== ""){
        gameDB.insertScore(playerName, game.score, date);
        console.log(`Skore ulozeno: ${playerName}, ${game.score}, ${date}`);
    }

    document.getElementById("deathScreen").style.display = "none";
    gameDB.printScores();
    game.resetGame();
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && game.hasStarted && !game.choosingUpgrade) {
      game.togglePause();
    }
});
  
document.getElementById("resumeButton").addEventListener("click", () => {
    game.togglePause();
});
  
document.getElementById("resetButton").addEventListener("click", () => {   
    game.togglePause();
    game.resetGame();
});

document.getElementById("upgradeButtonAS").addEventListener("click", () =>{
    game.upgradeAS();
});

document.getElementById("upgradeButtonMS").addEventListener("click", () =>{
    game.upgradeMS();
});

document.getElementById("upgradeButtonHR").addEventListener("click", () =>{
    game.upgradeHR();
});

document.getElementById("startButton").addEventListener("click", () => {
    document.getElementById("startScreen").style.display = "none";
    gameLoop();
})

function gameLoop(){
    game.update();
    game.draw();
    requestAnimationFrame(gameLoop);
}



