import Phaser from 'phaser'

class ProjectileWeaponBullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet_1');
        this.worldBounds = scene.physics.world.bounds

    }

    fire(x, y, direction, weaponData) {
        this.body.reset(x, y);
        this.body.setCollideWorldBounds(false);

        this.setActive(true);
        this.setVisible(true);

        this.scene.physics.velocityFromRotation(direction, weaponData.projectile_speed, this.body.velocity);

    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (!this.worldBounds.contains(this.x, this.y)) {
            this.setActive(false);
            this.setVisible(false);
        }
    }

}

export default class ProjectileWeapon extends Phaser.Physics.Arcade.Group {
    constructor(scene, weaponData) {
        super(scene.physics.world, scene);
        this.weaponData = weaponData

        this.createMultiple({
            frameQuantity: this.weaponData.max_projectiles,
            key: this.weaponData.texture,
            active: false,
            visible: false,
            classType: ProjectileWeaponBullet
        });
    }

    fireBullet(x, y, direction) {
        if (Date.now() - this.lastFire < this.weaponData.fire_delay) {
            return
        }

        let bullet = this.getFirstDead(false);

        if (bullet) {
            bullet.fire(x, y, direction, this.weaponData);
            this.lastFire = Date.now()
        }
    }

}