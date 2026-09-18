class FlappyBird {
    constructor() {
        console.log('FlappyBird constructor called');
        this.canvas = document.getElementById('gameCanvas');
        console.log('Canvas found:', this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        console.log('Canvas dimensions:', this.width, 'x', this.height);
        
        // Game state
        this.gameRunning = false;
        this.gameOver = false;
        this.score = 0;
        this.bestScore = localStorage.getItem('flappyBirdBestScore') || 0;
        
        // Bird properties
        this.bird = {
            x: 80,
            y: this.height / 2,
            width: 30,
            height: 30,
            velocity: 0,
            gravity: 0.08,
            jumpPower: -3,
            rotation: 0
        };
        
        // Pipes
        this.pipes = [];
        this.pipeWidth = 100;
        this.pipeGap = 150;
        this.pipeSpacing = 350;
        this.pipeSpeed = 1;
        
        // Enemy birds
        this.enemyBirds = [];
        this.enemyBirdSpeed = 2;
        this.enemyBirdSpawnRate = 0.002; // 0.2% chance per frame
        
        // Background elements
        this.clouds = [];
        this.generateClouds();
        
        // Event listeners
        this.setupEventListeners();
        console.log('Event listeners set up');
        
        // Initialize UI
        this.updateScoreDisplay();
        this.updateBestScoreDisplay();
        
        // Start animation loop
        this.animate();
        console.log('Game initialized successfully');
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            console.log('Key pressed:', e.code);
            if (e.code === 'Space') {
                e.preventDefault();
                console.log('Space pressed, gameRunning:', this.gameRunning, 'gameOver:', this.gameOver);
                if (this.gameRunning) {
                    this.jump();
                } else if (this.gameOver) {
                    this.resetGame();
                    this.startGame();
                } else {
                    this.startGame();
                }
            }
        });
        
        // Mouse/touch controls
        this.canvas.addEventListener('click', () => {
            console.log('Canvas clicked, gameRunning:', this.gameRunning, 'gameOver:', this.gameOver);
            if (this.gameRunning) {
                this.jump();
            } else if (this.gameOver) {
                this.resetGame();
                this.startGame();
            } else {
                this.startGame();
            }
        });
        
        // Button controls
        document.getElementById('startButton').addEventListener('click', () => {
            console.log('Start button clicked');
            this.startGame();
        });
        
        document.getElementById('resetButton').addEventListener('click', () => {
            console.log('Reset button clicked');
            this.resetGame();
        });
    }
    
    generateClouds() {
        this.clouds = [];
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * this.width,
                y: Math.random() * (this.height / 2),
                size: Math.random() * 30 + 20,
                speed: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    startGame() {
        console.log('startGame called, current gameRunning:', this.gameRunning);
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gameOver = false;
            this.score = 0;
            this.pipes = [];
            this.bird.y = this.height / 2;
            this.bird.velocity = 0;
            this.bird.rotation = 0;
            this.updateScoreDisplay();
            console.log('Game started successfully');
        }
    }
    
    resetGame() {
        this.gameRunning = false;
        this.gameOver = false;
        this.score = 0;
        this.pipes = [];
        this.enemyBirds = [];
        this.bird.y = this.height / 2;
        this.bird.velocity = 0;
        this.bird.rotation = 0;
        this.updateScoreDisplay();
    }
    
    jump() {
        console.log('jump called, gameRunning:', this.gameRunning, 'gameOver:', this.gameOver);
        if (this.gameRunning && !this.gameOver) {
            this.bird.velocity = this.bird.jumpPower;
            console.log('Bird jumped, new velocity:', this.bird.velocity);
        }
    }
    
    updateBird() {
        if (this.gameRunning && !this.gameOver) {
            // Apply gravity
            this.bird.velocity += this.bird.gravity;
            this.bird.y += this.bird.velocity;
            
            // Update rotation based on velocity
            this.bird.rotation = Math.min(Math.PI / 2, Math.max(-Math.PI / 4, this.bird.velocity * 0.1));
            
            // Check boundaries
            if (this.bird.y < 0) {
                this.bird.y = 0;
                this.bird.velocity = 0;
            }
            if (this.bird.y + this.bird.height > this.height) {
                this.gameOver = true;
                this.gameRunning = false;
            }
        }
    }
    
    generatePipes() {
        if (this.gameRunning && !this.gameOver) {
            if (this.pipes.length === 0 || 
                this.pipes[this.pipes.length - 1].x < this.width - this.pipeSpacing) {
                
                const gapY = Math.random() * (this.height - this.pipeGap - 100) + 50;
                
                this.pipes.push({
                    x: this.width,
                    topHeight: gapY,
                    bottomY: gapY + this.pipeGap,
                    passed: false
                });
            }
        }
    }
    
    generateEnemyBirds() {
        if (this.gameRunning && !this.gameOver) {
            // Random chance to spawn enemy bird
            if (Math.random() < this.enemyBirdSpawnRate) {
                const enemyBird = {
                    x: this.width,
                    y: Math.random() * (this.height - 15),
                    width: 15,
                    height: 15,
                    speed: this.enemyBirdSpeed
                };
                this.enemyBirds.push(enemyBird);
            }
        }
    }
    
    updatePipes() {
        if (this.gameRunning && !this.gameOver) {
            for (let i = this.pipes.length - 1; i >= 0; i--) {
                const pipe = this.pipes[i];
                pipe.x -= this.pipeSpeed;
                
                // Check if bird passed the pipe
                if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
                    pipe.passed = true;
                    this.score++;
                    this.updateScoreDisplay();
                    
                    // Update best score
                    if (this.score > this.bestScore) {
                        this.bestScore = this.score;
                        localStorage.setItem('flappyBirdBestScore', this.bestScore);
                        this.updateBestScoreDisplay();
                    }
                }
                
                // Remove pipes that are off screen
                if (pipe.x + this.pipeWidth < 0) {
                    this.pipes.splice(i, 1);
                }
            }
        }
    }
    
    updateEnemyBirds() {
        if (this.gameRunning && !this.gameOver) {
            for (let i = this.enemyBirds.length - 1; i >= 0; i--) {
                const enemyBird = this.enemyBirds[i];
                enemyBird.x -= enemyBird.speed;
                
                // Remove enemy birds that are off screen
                if (enemyBird.x + enemyBird.width < 0) {
                    this.enemyBirds.splice(i, 1);
                }
            }
        }
    }
    
    updateClouds() {
        if (this.gameRunning && !this.gameOver) {
            this.clouds.forEach(cloud => {
                cloud.x -= cloud.speed;
                if (cloud.x + cloud.size < 0) {
                    cloud.x = this.width + cloud.size;
                    cloud.y = Math.random() * (this.height / 2);
                }
            });
        }
    }
    
    checkCollision() {
        if (!this.gameRunning) return;
        
        const birdRect = {
            x: this.bird.x,
            y: this.bird.y,
            width: this.bird.width,
            height: this.bird.height
        };
        
        for (const pipe of this.pipes) {
            // Top pipe collision
            if (this.rectCollision(birdRect, {
                x: pipe.x,
                y: 0,
                width: this.pipeWidth,
                height: pipe.topHeight
            })) {
                this.gameOver = true;
                this.gameRunning = false;
                return;
            }
            
            // Bottom pipe collision
            if (this.rectCollision(birdRect, {
                x: pipe.x,
                y: pipe.bottomY,
                width: this.pipeWidth,
                height: this.height - pipe.bottomY
            })) {
                this.gameOver = true;
                this.gameRunning = false;
                return;
            }
        }
        
        // Check collision with enemy birds
        for (const enemyBird of this.enemyBirds) {
            if (this.rectCollision(birdRect, {
                x: enemyBird.x,
                y: enemyBird.y,
                width: enemyBird.width,
                height: enemyBird.height
            })) {
                this.gameOver = true;
                this.gameRunning = false;
                return;
            }
        }
    }
    
    rectCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    drawBird() {
        this.ctx.save();
        this.ctx.translate(this.bird.x + this.bird.width / 2, this.bird.y + this.bird.height / 2);
        this.ctx.rotate(this.bird.rotation);
        
        // Bird body
        this.ctx.fillStyle = 'grey';
        this.ctx.fillRect(-this.bird.width / 2, -this.bird.height / 2, this.bird.width, this.bird.height);
        
        // Bird eye
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(-this.bird.width / 2 + 5, -this.bird.height / 2 + 5, 8, 8);
        
        // Bird wing
        this.ctx.fillStyle = '#FFA500';
        this.ctx.fillRect(-this.bird.width / 2 + 2, -this.bird.height / 2 + 10, 12, 8);
        
        this.ctx.restore();
    }
    
    drawPipes() {
        this.ctx.fillStyle = '#228B22';
        
        this.pipes.forEach(pipe => {
            // Top pipe
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            
            // Bottom pipe
            this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, this.height - pipe.bottomY);
            
            // Pipe caps
            this.ctx.fillStyle = '#006400';
            this.ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, this.pipeWidth + 10, 20);
            this.ctx.fillRect(pipe.x - 5, pipe.bottomY, this.pipeWidth + 10, 20);
            this.ctx.fillStyle = '#228B22';
        });
    }
    
    drawEnemyBirds() {
        this.ctx.fillStyle = '#FF0000';
        
        this.enemyBirds.forEach(enemyBird => {
            // Enemy bird body
            this.ctx.fillRect(enemyBird.x, enemyBird.y, enemyBird.width, enemyBird.height);
            
            // Enemy bird eye
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(enemyBird.x + 5, enemyBird.y + 5, 6, 6);
            this.ctx.fillStyle = '#FF0000';
            
            // Enemy bird wing
            this.ctx.fillStyle = '#CC0000';
            this.ctx.fillRect(enemyBird.x + 2, enemyBird.y + 8, 10, 6);
            this.ctx.fillStyle = '#FF0000';
        });
    }
    
    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.clouds.forEach(cloud => {
            this.ctx.beginPath();
            this.ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawBackground() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    drawScore() {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Score: ${this.score}`, this.width / 2, 40);
    }
    
    drawGameOver() {
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2 - 50);
            
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Score: ${this.score}`, this.width / 2, this.height / 2);
            this.ctx.fillText('Press SPACE or CLICK to restart', this.width / 2, this.height / 2 + 50);
        }
    }
    
    updateScoreDisplay() {
        document.getElementById('scoreDisplay').textContent = this.score;
    }
    
    updateBestScoreDisplay() {
        document.getElementById('bestScore').textContent = this.bestScore;
    }
    
    update() {
        this.updateBird();
        this.generatePipes();
        this.updatePipes();
        this.generateEnemyBirds();
        this.updateEnemyBirds();
        this.updateClouds();
        this.checkCollision();
    }
    
    draw() {
        this.drawBackground();
        this.drawClouds();
        this.drawPipes();
        this.drawEnemyBirds();
        this.drawBird();
        this.drawScore();
        this.drawGameOver();
    }
    
    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new FlappyBird();
}); 