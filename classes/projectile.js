export class Projectile {
    constructor(x, y, angle, speed = 8) {
      this.x = x;
      this.y = y;
      this.radius = 5;
      this.color = "blue";
      this.speed = speed;
      this.angle = angle; 
    }
  
    move() {
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
    }
  
    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.closePath();
    }
  }
  