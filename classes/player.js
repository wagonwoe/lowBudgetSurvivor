export class Player {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.color = "yellow";
        this.radius = 15;
        this.speed = 5;
        this.health = 100;
    }

    draw(ctx){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    move(dx, dy, canvas){
        this.x += dx * this.speed;
        this.y += dy * this.speed;

        this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));

    }
}