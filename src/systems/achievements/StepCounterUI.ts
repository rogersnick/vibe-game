import {Scene} from 'phaser';
import {AchievementManager} from './AchievementManager';

export class StepCounterUI {
    private scene: Scene;
    private achievementManager: AchievementManager;
    private text!: Phaser.GameObjects.Text;
    private stepAchievement: any;

    constructor(scene: Scene, achievementManager: AchievementManager) {
        this.scene = scene;
        this.achievementManager = achievementManager;
        this.createUI();
    }

    public update(): void {
        if (this.stepAchievement) {
            const current = this.stepAchievement.progress.current;
            const target = this.stepAchievement.progress.target;
            this.text.setText(`Steps: ${current}/${target}`);

            // Change color when achievement is unlocked
            if (this.stepAchievement.isUnlocked) {
                this.text.setColor('#00ff00');
            }
        }
    }

    public destroy(): void {
        this.text.destroy();
    }

    private createUI(): void {
        // Create text in the top-right corner
        this.text = this.scene.add.text(16, 16, 'Steps: 0/25', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: {x: 10, y: 5}
        });

        // Get the step counter achievement
        this.stepAchievement = this.achievementManager.getAchievements()
            .find(a => a.id === 'step_counter');
    }
} 