import { Player } from "./player.js";
import { Enemy } from "./enemy.js";
import { Projectile } from "./projectile.js";

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.player = new Player(canvas.width / 2, canvas.height / 2);
    this.enemies = [];
    this.projectiles = [];
    this.keys = {};
    this.spawnEnemyInterval = 1000;
    this.lastSpawnTime = 0;
    this.lastShotTime = 0;
    this.shotInterval = 1500;
    this.score = 0;
    this.neededScore = 100;
    this.isPaused = false;
    this.choosingUpgrade = false;
  }

  handleInput() {
    let dx = 0;
    let dy = 0;
    if (this.keys["ArrowUp"] || this.keys["w"]) dy = -0.5;
    if (this.keys["ArrowDown"] || this.keys["s"]) dy = 0.5;
    if (this.keys["ArrowLeft"] || this.keys["a"]) dx = -0.5;
    if (this.keys["ArrowRight"] || this.keys["d"]) dx = 0.5;

    this.player.move(dx, dy, this.canvas);
  }

  spawnEnemies() {
    const now = Date.now();
    if (now - this.lastSpawnTime > this.spawnEnemyInterval) {
      const x = Math.random() < 0.5 ? 0 : this.canvas.width;
      const y = Math.random() * this.canvas.height;
      this.enemies.push(new Enemy(x, y));
      this.lastSpawnTime = now;
      if (this.spawnEnemyInterval <= 0) {
        this.spawnEnemyInterval = 10
      }else{
        this.spawnEnemyInterval -= 10;
      }
      
    }
  }

  findClosestEnemy() {
    if (this.enemies.length === 0) return null;

    let closestEnemy = null;
    let closestDistance = Infinity;

    this.enemies.forEach((enemy) => {
      const distance = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    });

    return closestEnemy;
  }

  shoot() {
    const now = Date.now();
    if (now - this.lastShotTime > this.shotInterval) {
      const closestEnemy = this.findClosestEnemy();

      if (closestEnemy) {
        const angle = Math.atan2(
          closestEnemy.y - this.player.y,
          closestEnemy.x - this.player.x
        );
        this.projectiles.push(
          new Projectile(this.player.x, this.player.y, angle)
        );
      }

      this.lastShotTime = now;
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    const pauseMenu = document.getElementById("pauseMenu");
    if (this.isPaused) {
      pauseMenu.style.display = "block";
    } else {
      pauseMenu.style.display = "none";
    }
  }

  resetGame() {
    this.player.x = this.canvas.width / 2;
    this.player.y = this.canvas.height / 2;
    this.player.health = 100;
    this.enemies = [];
    this.projectiles = [];
    this.lastSpawnTime = 0;
    this.lastShotTime = 0;
    this.score = 0;
    this.isPaused = false;
    this.hasStarted = false;
    this.shotInterval = 1500;
    this.player.speed = 5;
    this.neededScore = 50
    this.spawnEnemyInterval = 1000;
    this.choosingUpgrade = false;
  
    console.log("Hra byla resetována.");
  }

  showDeathScreen() {
    this.isPaused = true;
    this.choosingUpgrade = true;
    const deathScreen = document.getElementById("deathScreen");
    deathScreen.style.display = "block";
  }

  showUpgradeScreen(){
    this.isPaused = true; 
    this.choosingUpgrade = true;
    const upgradeScreen = document.getElementById("upgradeScreen");
    upgradeScreen.style.display = "block";
  }

  upgradeAS(){
    this.shotInterval -= 250;
    const upgradeScreen = document.getElementById("upgradeScreen");
    upgradeScreen.style.display = "none";
    this.choosingUpgrade = false;
    this.isPaused = false; 
  }

  upgradeMS(){
    this.player.speed += 0.5;
    const upgradeScreen = document.getElementById("upgradeScreen");
    upgradeScreen.style.display = "none";
    this.choosingUpgrade = false;
    this.isPaused = false; 
  }

  upgradeHR(){
    this.player.health += 30;
    const upgradeScreen = document.getElementById("upgradeScreen");
    upgradeScreen.style.display = "none";
    this.choosingUpgrade = false;
    this.isPaused = false; 
  }

  update() {
    this.hasStarted = true;
    if (this.isPaused) return;
    this.handleInput();
    this.spawnEnemies();
    this.shoot();

    if (this.score >= this.neededScore) {
      this.showUpgradeScreen();
      this.neededScore += this.neededScore;
    }

    this.enemies.forEach((enemy) => {
      enemy.moveTowards(this.player);
    });

    this.projectiles.forEach((projectile) => {
      projectile.move();
    });

    this.projectiles = this.projectiles.filter((projectile) => {
      let hit = false;

      this.enemies = this.enemies.filter((enemy) => {
        const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
        if (dist < projectile.radius + enemy.radius) {
          hit = true;
          this.score += 10;
          return false;
        }
        return true;
      });

      return !hit;
    });

    this.projectiles = this.projectiles.filter(
      (projectile) =>
        projectile.x >= 0 &&
        projectile.x <= this.canvas.width &&
        projectile.y >= 0 &&
        projectile.y <= this.canvas.height
    );

    this.enemies = this.enemies.filter((enemy) => {
      const dist = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y);
      if (dist < this.player.radius + enemy.radius) {
        this.player.health -= 10;
        return false;
      }
      return true;
    });

    if (this.player.health <= 0) {
      this.showDeathScreen();
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.player.draw(this.ctx);
    this.enemies.forEach((enemy) => enemy.draw(this.ctx));
    this.projectiles.forEach((projectile) => projectile.draw(this.ctx));

    this.ctx.fillStyle = "black";
    this.ctx.fillText(`Zdraví: ${this.player.health}`, 10, 20);
    this.ctx.fillText(`Skóre: ${this.score}`, 100, 20);
  }
}
