export default class ProjectileSprite extends Phaser.Physics.Arcade.Sprite {

    constructor(config) {
        super(config.scene, config.x, config.y, config.texture, config.textureFrame);

        config.group.add(this)

        // config.scene.sys.displayList.add(this)
        // config.scene.sys.updateList.add(this)
        // config.scene.sys.arcadePhysics.world.enableBody(this, 0)
        

        config.scene.add.existing(this);
        config.scene.physics.add.existing(this);

        this.config = config
        this.setScale(config.scale)
        this.setRotation(config.rotation)
        this.setTint(config.tint)

        this.setVelocity(config.velocityX, config.velocityY)
        this.setBounce(1, 1)

        this.numCollisions = 0
    }

    didCollideWithObject(object) {
        this.numCollisions++
        if (this.numCollisions > this.config.maxBounces) {
            this.destroy()
        } else {
            console.log("change velocity")
            this.emit("invert-velocity-y")
        }

    }

}