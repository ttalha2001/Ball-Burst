const canvas = document.querySelector('canvas');
const scoreElement = document.querySelector('#score');
const staticScore = document.querySelector('#static');
const gameOverElement = document.querySelector('#gameOver');
const gameOverScore = document.querySelector('#gameOverScore');
const restBtn = document.querySelector('#restBtn');
const startGame = document.querySelector('#startGame');
let burstAudio = new Audio("pop-7.mp3");
let startAudio = new Audio("Woosh.wav");
let gameOverAudio = new Audio("Game Over.mp3");
let gameMusic = new Audio("GameAudio.mp3");
let porjectileSound = new Audio("laserGun.mp3");
let clickCounter = 0;
let gameStatus = false;

canvas.width = innerWidth;
canvas.height = innerHeight;

const c = canvas.getContext('2d');

class player {
	constructor(x, y, radius, color){
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
	}

	draw() {
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.fillStyle = this.color;
		c.fill();
	}
}

class projectile {
	constructor(x, y, radius, color, velocity) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
	}

	draw() {
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.fillStyle = this.color;
		c.fill();
	}

	update() {
		this.draw();
		this.x = this.x + 2*(this.velocity.x);
		this.y = this.y + 2*(this.velocity.y);
	}
}

class enemy {
	constructor(x, y, radius, color, velocity){
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
	}

	draw() {
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.fillStyle = this.color;
		c.fill();
	}

	update() {
		this.draw();
		this.x = this.x + 2*(this.velocity.x);
		this.y = this.y + 2*(this.velocity.y);
	}
}

class particle {
	constructor(x, y, radius, color, velocity){
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
		this.alpha = 1;
	}

	draw() {
		c.save();
		c.globalAlpha = this.alpha;
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.fillStyle = this.color;
		c.fill();
		c.restore();
	}

	update() {
		this.draw();
		this.velocity.x *= 0.97;
		this.velocity.y *= 0.97;
		this.x = this.x + 2*(this.velocity.x);
		this.y = this.y + 2*(this.velocity.y);
		this.alpha -= 0.01;
	}
}

const x = canvas.width / 2;
const y = canvas.height / 2;

let P1 = new player(x, y, 15, 'white');
let animationId;
let intervalId;
let score = 0;
let projectiles = [];
let enemies = [];
let particles = [];

function resetGame() {
	P1 = new player(x, y, 15, 'white');
	animationId;
	score = 0;
	projectiles = [];
	enemies = [];
	particles = [];
	scoreElement.innerHTML = score;
}

function spawnEnemy() {
	intervalId = setInterval(() => {

		const radius = Math.random() * (30 - 5) + 5;
		let x;
		let y;
		if(Math.random() < 0.5) {
			x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
			y = Math.random() * canvas.height;
		}
		else {
			x = Math.random() * canvas.width;
			y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
		}
		const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
		const angle = Math.atan2(canvas.height/2 - y, canvas.width/2 - x);
		const velocity = {
			x: Math.cos(angle),
			y: Math.sin(angle)
		}
		enemies.push(new enemy(x, y, radius, color, velocity));
	}, 1000);
}

function animate() {
	animationId = requestAnimationFrame(animate);
	c.fillStyle = 'rgba(0, 0, 0, 0.1)';
	c.fillRect(0, 0, canvas.width, canvas.height);
	P1.draw();
	particles.forEach((particle, index) => {
		if(particle.alpha <= 0) {
			setTimeout(() => {
					particles.splice(index, 1);
			}, 0);
		}
		else {
			particle.update();
		}
	});
	projectiles.forEach((projectile, index) => {
		projectile.update();
		if(projectile.x + projectile.radius < 0 ||
		 projectile.x - projectile.radius > canvas.width ||
		 projectile.y + projectile.radius < 0 ||
		 projectile.y - projectile.radius > canvas.height) {
			setTimeout(() => {
					projectiles.splice(index, 1);
				}, 0);
		}
	});
	for(let index = enemies.length - 1; index >= 0; index--) {
		const enemy = enemies[index];
		enemy.update();
		const dist = Math.hypot(P1.x - enemy.x, P1.y - enemy.y);
		if(dist - enemy.radius - P1.radius < 1) {
			cancelAnimationFrame(animationId);
			clearInterval(intervalId);
			gameMusic.pause();
			gameStatus = true;
			gameMusic.currentTime = 0;
			gameOverAudio.play();
			scoreElement.style.display = 'none';
			staticScore.style.display = 'none';
			gameOver.style.display = 'block';
			gsap.fromTo('#gameOver', {scale: 0.6, opacity: 0}, {scale: 1, opacity: 1});
			gameOverScore.innerHTML= score;
		}
		for(let projIndex = projectiles.length - 1; projIndex >= 0; projIndex--) {
			const projectile = projectiles[projIndex];
			const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
			if(dist - enemy.radius - projectile.radius < 1) {
				if(enemy.radius - 10 > 5) {
					score += 20;
					gsap.to(enemy, {radius: enemy.radius - 10});
					setTimeout(() => {
					projectiles.splice(projIndex, 1);
					scoreElement.innerHTML = score;
					}, 0);
				}
				else {
					setTimeout(() => {
					score += 50;
					burstAudio.play();
					enemies.splice(index, 1);
					for(let i = 0; i < enemy.radius * 2; i++) {
						particles.push(new particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {x: (Math.random() - 0.5) * (Math.random() * 6), y: (Math.random() - 0.5) * (Math.random() * 6)}));
					}
					projectiles.splice(projIndex, 1);
					scoreElement.innerHTML = score;
					}, 0);
					burstAudio.pause();
					burstAudio.currentTime = 0;
				}
			}
		}
	}
}

addEventListener('click', (event) => {
	clickCounter += 1;
	const angle = Math.atan2(event.clientY - y, event.clientX - x);
	const velocity = {
		x: Math.cos(angle)*4,
		y: Math.sin(angle)*4
	}
	if(clickCounter > 1 && !gameStatus) {
		porjectileSound.pause();
		porjectileSound.currentTime = 0;
		porjectileSound.volume = 0.2;
		porjectileSound.play();
		projectiles.push(new projectile(x, y, 5, 'white', velocity));
	}
})

restBtn.addEventListener('click', () => {
	resetGame();
	animate();
	spawnEnemy();
	gameStatus = false;
	gameMusic.volume = 0.3;
	startAudio.play();
	gameMusic.play();
	gsap.to('#gameOver', {
		opacity: 0,
		scale: 0.8,
		duration: 0.5,
		ease: 'expo.in',
		onComplete: () => {
			gameOver.style.display = 'none';
			scoreElement.style.display = 'flex';
			staticScore.style.display = 'flex';
		}
	});
	clickCounter = 0;
})

startGame.addEventListener('click', () => {
	resetGame();
	animate();
	spawnEnemy();
	gameMusic.volume = 0.3;
	startAudio.play();
	gameMusic.play();
	gsap.to('#startGame', {
		opacity: 0,
		scale: 0.8,
		duration: 0.5,
		ease: 'expo.in',
		onComplete: () => {
			startGame.style.display = 'none';
			scoreElement.style.display = 'flex';
			staticScore.style.display = 'flex';
		}
	})
})