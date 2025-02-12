import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

const Game = () => {
  const gameRef = useRef(null);

  useEffect(() => {
    // Configuración de Phaser
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      backgroundColor: '#222',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scene: {
        preload: preload,
        create: create,
        update: update
      }
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Se destruye el juego al desmontar el componente
    return () => {
      game.destroy(true);
    }
  }, []);

  // Variables para la escena
  let paddle;
  let ball;
  let bricks;
  let score = 0;
  let scoreText;

  function preload() {
    // No cargamos imágenes, ya que generaremos figuras geométricas
  }

  function create() {
    // UI: Texto de puntuación
    scoreText = this.add.text(16, 16, 'Puntuación: 0', { fontSize: '20px', fill: '#fff' });

    // Crear el paddle (barra de control)
    paddle = this.add.rectangle(400, 550, 120, 20, 0xffffff);
    // Convertirlo en objeto de física estático (inmóvil a menos que lo movamos manualmente)
    this.physics.add.existing(paddle, true);

    // Crear la bola (usamos un rectángulo para simplificar)
    ball = this.add.rectangle(400, 530, 16, 16, 0xff0000);
    this.physics.add.existing(ball);
    // Configurar colisiones con los límites del mundo
    ball.body.setCollideWorldBounds(true, 1, 1);
    ball.body.setBounce(1, 1);
    // Velocidad inicial
    ball.body.setVelocity(150, -150);

    // Colisión entre bola y paddle
    this.physics.add.collider(ball, paddle, ballHitPaddle, null, this);

    // Crear un grupo de bricks (bloques)
    bricks = this.physics.add.staticGroup();
    const brickOffsetX = 80;
    const brickOffsetY = 50;
    const brickWidth = 60;
    const brickHeight = 20;
    const brickPadding = 10;
    const cols = 10;
    const rows = 4;

    // Generar una cuadrícula de bricks
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const brickX = brickOffsetX + col * (brickWidth + brickPadding);
        const brickY = brickOffsetY + row * (brickHeight + brickPadding);
        // Creamos un rectángulo para el brick
        const brick = this.add.rectangle(brickX, brickY, brickWidth, brickHeight, 0x00ff00);
        this.physics.add.existing(brick, true); // Cuerpo estático
        bricks.add(brick);
      }
    }

    // Colisión entre bola y bricks
    this.physics.add.collider(ball, bricks, hitBrick, null, this);

    // Mover el paddle con el ratón o toque
    this.input.on('pointermove', function (pointer) {
      // Limitar el movimiento dentro de los bordes del juego
      paddle.x = Phaser.Math.Clamp(pointer.x, paddle.width / 2, 800 - paddle.width / 2);
      // Actualizar la posición del cuerpo físico del paddle
      paddle.body.updateFromGameObject();
    });
  }

  function update() {
    // Si la bola se sale por la parte inferior, se reinicia su posición y velocidad
    if (ball.y > 600) {
      ball.x = 400;
      ball.y = 530;
      ball.body.setVelocity(150, -150);
    }
  }

  // Ajusta la velocidad de la bola según el punto de impacto con el paddle
  function ballHitPaddle(ballObj, paddleObj) {
    const diff = ballObj.x - paddleObj.x;
    // Modifica la velocidad horizontal en función del lugar de contacto
    ballObj.body.setVelocityX(diff * 10);
  }

  // Al colisionar la bola con un brick, lo destruye y actualiza la puntuación
  function hitBrick(ballObj, brickObj) {
    brickObj.destroy();
    score += 10;
    scoreText.setText('Puntuación: ' + score);
  }

  return <div id="game-container"></div>;
};

export default Game;
