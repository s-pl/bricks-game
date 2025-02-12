import Phaser from 'phaser';

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
    this.ballCount = 0;
    this.gameStarted = false; // Para saber si el juego ya ha comenzado
    this.gameOver = false; // Indicador de si el juego ha terminado
  }

  preload() {
    // Cargar recursos si es necesario
  }

  create() {
    // Si el juego no ha comenzado, mostrar pantalla de inicio
    if (!this.gameStarted) {
      this.createStartScreen();
      return;
    }

    // Asegurar que el AudioContext se reanuda tras la primera interacción
    this.input.once('pointerdown', () => {
      if (this.sound.context.state === 'suspended') {
        this.sound.context.resume();
      }
    });

    // Habilitar físicas
    this.physics.world.setBoundsCollision(true, true, true, false);

    // Crear la pelota
    this.ball = this.add.circle(400, 500, 10, 0xffffff);
    this.physics.add.existing(this.ball);
    this.ball.body.setBounce(1);
    this.ball.body.setCollideWorldBounds(true);
    this.ball.body.setVelocity(200, -300);

    // Crear la paleta
    this.paddle = this.add.rectangle(400, 550, 100, 20, 0x00ff00);
    this.physics.add.existing(this.paddle);
    this.paddle.body.setImmovable(true);

    // Movimiento de la paleta con el mouse
    this.input.on('pointermove', (pointer) => {
      this.paddle.x = pointer.x;
    });

    // Crear bloques (bricks) con los números de toques restantes y colores aleatorios
    this.bricks = this.physics.add.staticGroup();
    this.bricksGroup = [];
    const rows = 6;
    const columns = 10;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        let brick = this.bricks.create(80 + x * 70, 50 + y * 40, 'brick');
        brick.setScale(0.8, 0.8);
        brick.setOrigin(0.5, 0.5);
        brick.health = Math.floor(Math.random() * 3) + 1;

        // Mostrar el número de toques restantes dentro del bloque con colores aleatorios
        const randomColor = this.randomColor();
        let text = this.add.text(brick.x, brick.y, brick.health, {
          fontSize: '18px',
          fill: randomColor,
        }).setOrigin(0.5);

        this.bricksGroup.push({ brick, text });
      }
    }

    // Crear puntos generadores
    this.generationPoints = [];
    this.time.addEvent({
      delay: 5000, // Cada 5 segundos
      loop: true,
      callback: this.createGenerationPoint,
      callbackScope: this,
    });

    // Colisiones
    this.physics.add.collider(this.ball, this.paddle);
    this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);
    this.physics.add.collider(this.ball, this.generationPoints, this.createNewBall, null, this);

    // Detectar si la pelota sale de los límites
    this.physics.world.on('worldbounds', this.checkBallOutOfBounds, this);
  }

  hitBrick(ball, brick) {
    brick.health -= 1;
    // Actualizar el texto del bloque
    const brickInfo = this.bricksGroup.find(item => item.brick === brick);
    if (brickInfo) {
      brickInfo.text.setText(brick.health);
    }

    if (brick.health <= 0) {
      brick.destroy();
      if (brickInfo) {
        brickInfo.text.destroy();
      }
    }
  }

  createGenerationPoint() {
    const x = Phaser.Math.Between(50, 750); // Generar aleatoriamente en el ancho del juego
    const y = Phaser.Math.Between(50, 400); // Generar aleatoriamente en el área de arriba del juego
    const point = this.add.circle(x, y, 5, 0xff0000); // Punto generador de bola
    this.physics.add.existing(point, true); // Hacer que sea estático (sin física)
    this.generationPoints.push(point);
  }

  createNewBall(ball, point) {
    // Crear una nueva bola cuando la pelota pase sobre el punto generador
    this.ballCount++;
    const newBall = this.add.circle(Phaser.Math.Between(100, 700), 300, 10, 0xffffff);
    this.physics.add.existing(newBall);
    newBall.body.setBounce(1);
    newBall.body.setCollideWorldBounds(true);
    newBall.body.setVelocity(Phaser.Math.Between(150, 250), Phaser.Math.Between(-250, -150));

    // Habilitar la colisión con la paleta y los bloques
    this.physics.add.collider(newBall, this.paddle);
    this.physics.add.collider(newBall, this.bricks, this.hitBrick, null, this);

    // Destruir el punto generador al generar una bola
    point.destroy();
    this.generationPoints = this.generationPoints.filter(p => p !== point);
  }

  // Función para generar colores aleatorios
  randomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  createStartScreen() {
    const startText = this.add.text(400, 300, 'Toque para comenzar', {
      fontSize: '32px',
      fill: '#fff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      startText.destroy(); // Eliminar pantalla de inicio
      this.gameStarted = true; // El juego comienza
      this.create(); // Inicializar el juego
    });
  }

  checkBallOutOfBounds(body) {
    // Si la pelota que se sale es la última, mostrar el mensaje de "Perdido"
    if (body.gameObject === this.ball && this.ballCount <= 1) {
      this.gameOver = true;
      this.displayGameOver();
    }
  }

  displayGameOver() {
    const gameOverText = this.add.text(400, 300, '¡Perdiste! Toca para reiniciar', {
      fontSize: '32px',
      fill: '#ff0000',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Esperar el toque para reiniciar
    this.input.once('pointerdown', () => {
      gameOverText.destroy(); // Eliminar mensaje de fin de juego
      this.resetGame(); // Reiniciar el juego
    });
  }

  resetGame() {
    this.ballCount = 0;
    this.gameOver = false;
    this.scene.restart(); // Reiniciar la escena
  }
}

export default MainScene;
