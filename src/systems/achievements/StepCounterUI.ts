import { Scene } from 'phaser';
import { AchievementManager } from './AchievementManager';
import { Inventory } from '../../entities/Inventory';

export class StepCounterUI {
    private scene: Scene;
    private achievementManager: AchievementManager;
    private inventory: Inventory;
    private text!: Phaser.GameObjects.Text;

    constructor(scene: Scene, achievementManager: AchievementManager, inventory: Inventory) {
        this.scene = scene;
        this.achievementManager = achievementManager;
        this.inventory = inventory;
        this.createUI();
    }

    private createUI(): void {
        // Create text in the top-right corner
        this.text = this.scene.add.text(16, 16, 'Steps: 0\nItems: 0', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });

        // Set up inventory callback
        this.inventory.setOnItemCollectedCallback((count) => {
            this.update();
        });
    }

    public update(): void {
        const stepCount = this.achievementManager.getStepCount();
        const itemCount = this.inventory.getItemCount();
        const achievements = this.achievementManager.getAchievements();
        
        // Find the next locked step achievement, sorted by target value
        const nextAchievement = achievements
            .filter(a => a.id === 'step_counter' || a.id === '1k_club' || a.id === 'explorer' || a.id === 'marathon_runner')
            .sort((a, b) => (a.progress?.target || 0) - (b.progress?.target || 0))
            .find(a => !a.isUnlocked);

        if (nextAchievement) {
            this.text.setText(`Steps: ${stepCount}\nItems: ${itemCount}\nNext: ${nextAchievement.title} (${nextAchievement.progress!.target})`);
        } else {
            this.text.setText(`Steps: ${stepCount}\nItems: ${itemCount}\nAll step achievements unlocked!`);
            this.text.setColor('#00ff00');
        }
    }

    public destroy(): void {
        this.text.destroy();
    }
} 