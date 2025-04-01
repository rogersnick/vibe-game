import { Scene } from 'phaser';
import createDebug from 'debug';
const debug = createDebug('vibe:menu');

interface FloatingCircle {
  circle: Phaser.GameObjects.Ellipse;
  speedX: number;
  speedY: number;
  rotationSpeed: number;
  scale: number;
  glow: Phaser.GameObjects.Ellipse;
  trail: Phaser.GameObjects.Ellipse[];
}

export class MenuScene extends Scene {
  private title!: Phaser.GameObjects.Text;
  private startText!: Phaser.GameObjects.Text;
  private controlsText!: Phaser.GameObjects.Text;
  private backgroundCircles: FloatingCircle[] = [];
  private readonly NUM_CIRCLES = 25;
  private readonly MIN_CIRCLE_SIZE = 15;
  private readonly MAX_CIRCLE_SIZE = 40;
  private readonly MIN_SPEED = 0.2;
  private readonly MAX_SPEED = 0.5;
  private readonly MIN_OPACITY = 0.2;
  private readonly MAX_OPACITY = 0.4;
  private readonly TRAIL_LENGTH = 4;
  private readonly GLOW_SIZE_MULTIPLIER = 1.8;
  private readonly GLOW_OPACITY = 0.25;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    // Add a subtle gradient background
    const gradient = this.add.graphics();
    gradient.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0);
    gradient.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    this.createBackgroundCircles();
    this.createTitle();
    this.createStartText();
    this.setupKeyboardInput();
  }

  private setupKeyboardInput(): void {
    if (this.input.keyboard) {
      this.input.keyboard.once('keydown', () => {
        debug('Key pressed, starting game');
        this.scene.start('GameScene');
      });
    } else {
      debug('Keyboard input not available');
    }
  }

  private createStartText(): void {
    this.startText = this.add.text(this.cameras.main.centerX, 450, 'Press any key to start', {
      font: '32px monospace',
      color: '#ffffff',
      shadow: { offsetX: 0, offsetY: 0, blur: 10, color: 'rgba(0, 255, 0, 0.3)' }
    })
      .setOrigin(0.5);

    // Add pulsing animation to start text
    this.tweens.add({
      targets: this.startText,
      alpha: 0.5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Add controls text
    this.controlsText = this.add.text(this.cameras.main.centerX, 520, 'WASD to move\nSPACE to run', {
      font: '24px monospace',
      color: '#ffffff',
      shadow: { offsetX: 0, offsetY: 0, blur: 8, color: 'rgba(0, 255, 0, 0.3)' },
      align: 'center'
    })
      .setOrigin(0.5);

    // Add subtle fade animation to controls text
    this.tweens.add({
      targets: this.controlsText,
      alpha: 0.7,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createBackgroundCircles(): void {
    for (let i = 0; i < this.NUM_CIRCLES; i++) {
      const size = Phaser.Math.Between(this.MIN_CIRCLE_SIZE, this.MAX_CIRCLE_SIZE);
      const x = Phaser.Math.Between(0, this.cameras.main.width);
      const y = Phaser.Math.Between(0, this.cameras.main.height);
      const opacity = Phaser.Math.FloatBetween(this.MIN_OPACITY, this.MAX_OPACITY);
      
      // Create main circle with a subtle gradient
      const circle = this.add.ellipse(x, y, size, size, 0x00ff00, opacity);
      
      // Create glow effect
      const glow = this.add.ellipse(x, y, size * this.GLOW_SIZE_MULTIPLIER, size * this.GLOW_SIZE_MULTIPLIER, 0x00ff00, this.GLOW_OPACITY);
      
      // Create trail array
      const trail: Phaser.GameObjects.Ellipse[] = [];
      for (let j = 0; j < this.TRAIL_LENGTH; j++) {
        const trailCircle = this.add.ellipse(x, y, size * 0.8, size * 0.8, 0x00ff00, opacity * 0.5);
        trail.push(trailCircle);
      }
      
      // Add subtle rotation animation with varying speeds
      const rotationDuration = Phaser.Math.Between(6000, 12000);
      this.tweens.add({
        targets: [circle, glow, ...trail],
        rotation: Math.PI * 2,
        duration: rotationDuration,
        repeat: -1,
        ease: 'Linear'
      });

      // Add subtle scale animation with slight variations
      const scaleDuration = Phaser.Math.Between(2000, 4000);
      const scaleAmount = Phaser.Math.FloatBetween(0.9, 1.2);
      this.tweens.add({
        targets: [circle, glow, ...trail],
        scale: scaleAmount,
        duration: scaleDuration,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Add color pulse animation
      this.tweens.add({
        targets: [circle, glow, ...trail],
        fillColor: 0x00ff00,
        duration: Phaser.Math.Between(3000, 5000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.backgroundCircles.push({
        circle,
        glow,
        trail,
        speedX: Phaser.Math.FloatBetween(this.MIN_SPEED, this.MAX_SPEED) * (Math.random() > 0.5 ? 1 : -1),
        speedY: Phaser.Math.FloatBetween(this.MIN_SPEED, this.MAX_SPEED) * (Math.random() > 0.5 ? 1 : -1),
        rotationSpeed: Phaser.Math.FloatBetween(0.001, 0.003),
        scale: Phaser.Math.FloatBetween(0.9, 1.2)
      });
    }
  }

  private createTitle(): void {
    const asciiTitle = [
      '██╗   ██╗██╗██████╗ ███████╗',
      '██║   ██║██║██╔══██╗██╔════╝',
      '██║   ██║██║██████╔╝█████╗  ',
      '╚██╗ ██╔╝██║██╔══██╗██╔══╝  ',
      ' ╚████╔╝ ██║███████║███████╗',
      '  ╚═══╝  ╚═╝╚══════╝╚══════╝',
      '',
      ' ██████╗ ██████╗ ██╗     ██╗     ███████╗████████╗ ██████╗ ██████╗ ',
      '██╔════╝██╔═══██╗██║     ██║     ██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗',
      '██║     ██║   ██║██║     ██║     █████╗     ██║   ██║   ██║██████╔╝',
      '██║     ██║   ██║██║     ██║     ██╔══╝     ██║   ██║   ██║██╔══██╗',
      '╚██████╗╚██████╔╝███████╗███████╗███████╗   ██║   ╚██████╔╝██║  ██║',
      ' ╚═════╝ ╚═════╝ ╚══════╝╚══════╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝'
    ].join('\n');

    this.title = this.add.text(this.cameras.main.centerX, 200, asciiTitle, {
      font: '20px monospace',
      color: '#ffffff',
      stroke: '#00ff00',
      strokeThickness: 2,
      shadow: { offsetX: 0, offsetY: 0, blur: 15, color: 'rgba(0, 255, 0, 0.5)' },
      align: 'center',
      letterSpacing: 1
    });
    this.title.setOrigin(0.5);

    // Add pulsing animation to title with enhanced glow
    this.tweens.add({
      targets: this.title,
      scale: 1.02,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Add subtle color shift to title
    this.tweens.add({
      targets: this.title,
      strokeColor: 0x00ff00,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  update(): void {
    // Update background circles and their effects
    this.backgroundCircles.forEach(circle => {
      // Move the circle and its effects
      circle.circle.x += circle.speedX;
      circle.circle.y += circle.speedY;
      circle.glow.x = circle.circle.x;
      circle.glow.y = circle.circle.y;

      // Update trail
      for (let i = circle.trail.length - 1; i > 0; i--) {
        circle.trail[i].x = circle.trail[i - 1].x;
        circle.trail[i].y = circle.trail[i - 1].y;
      }
      circle.trail[0].x = circle.circle.x;
      circle.trail[0].y = circle.circle.y;

      // Rotate the circle and its effects
      circle.circle.rotation += circle.rotationSpeed;
      circle.glow.rotation += circle.rotationSpeed * 0.8;
      circle.trail.forEach((trailCircle, index) => {
        trailCircle.rotation += circle.rotationSpeed * (0.9 - (index * 0.1));
      });

      // Bounce off screen edges with smooth transition
      if (circle.circle.x < 0 || circle.circle.x > this.cameras.main.width) {
        circle.speedX *= -1;
        this.tweens.add({
          targets: [circle.circle, circle.glow, ...circle.trail],
          scale: circle.scale * 0.9,
          duration: 100,
          yoyo: true
        });
      }
      if (circle.circle.y < 0 || circle.circle.y > this.cameras.main.height) {
        circle.speedY *= -1;
        this.tweens.add({
          targets: [circle.circle, circle.glow, ...circle.trail],
          scale: circle.scale * 0.9,
          duration: 100,
          yoyo: true
        });
      }
    });
  }
} 