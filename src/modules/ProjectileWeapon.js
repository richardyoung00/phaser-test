import Phaser from 'phaser'

class ProjectileWeaponBullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet_1');
    }

    fire(x, y, direction) {
        this.body.reset(x, y);

        this.setActive(true);
        this.setVisible(true);

        this.scene.physics.velocityFromRotation(direction, 600, this.body.velocity);

    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        //todo: kill if out of bounds
        if (this.x > 1000 || this.x < -1000 || this.y > 1000 || this.y < -1000) {
            this.setActive(false);
            this.setVisible(false);
        }
    }

}

export default class ProjectileWeapon extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);

        this.createMultiple({
            frameQuantity: 5,
            key: 'bullet',
            active: false,
            visible: false,
            classType: ProjectileWeaponBullet
        });
    }

    fireBullet(x, y, direction) {
        let bullet = this.getFirstDead(false);

        if (bullet) {
            bullet.fire(x, y, direction);
        }
    }

}