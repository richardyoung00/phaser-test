import Phaser from 'phaser'

export default class Game extends Phaser.Scene {

    /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
    cursors

    /** @type {Phaser.Physics.Arcade.Sprite} */
    player

    constructor() {
        super('game')
        this.player = null
        this.playerSprites = {}
    }

    init() {

        this.cursors = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.UP,
            down: Phaser.Input.Keyboard.KeyCodes.DOWN,
            left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
            shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
            up_alt: Phaser.Input.Keyboard.KeyCodes.W,
            down_alt: Phaser.Input.Keyboard.KeyCodes.S,
            left_alt: Phaser.Input.Keyboard.KeyCodes.A,
            right_alt: Phaser.Input.Keyboard.KeyCodes.D
        });
        this.connection = this.registry.get('connection')
        this.gameState = this.registry.get('gameState')
    }

    create() {
        const { width, height } = this.scale

        // Set aspect ratio to the same as viewport (may break on portrait or weird sized screens)
        // const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
        // const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
        // this.scale.displaySize.setAspectRatio( vw/vh );
        // this.scale.refresh();

        this.connection.beginHosting()
        const hostId = this.connection.hostId
        this.peerId = this.connection.peerId

        let ts = this.add.tileSprite(0, 0, 1000, 1000, 'concrete')

        let hostIdText = this.add.text(6,6, 'Game join code: ' + hostId, {font: '12px Arial', fill: '#ffffff'}).setScrollFactor(0);


        this.renderPlayerSprites()

        this.input.on('pointermove',  (cursor) => {
            const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, cursor.x + this.cameras.main.scrollX, cursor.y + this.cameras.main.scrollY)
            this.player.setRotation(angle + (Math.PI/2))
        })

    }

    renderPlayerSprites() {
        const allPlayers = this.gameState.getPlayers()
        for (let p of allPlayers) {


            if (!this.playerSprites[p.id]) { //add new sprite
                this.playerSprites[p.id] = this.physics.add.sprite(p.x, p.y, p.texture).setRotation(p.rotation)
                if (p.id === this.peerId) {
                    this.player = this.playerSprites[p.id]
                    this.cameras.main.startFollow(this.player);
                }

            } else { // update the existing sprite
                this.playerSprites[p.id].setX(p.x).setY(p.y).setTexture(p.texture).setRotation(p.rotation)
            }

        }

    }

    updatePlayer() {
        let p = {
            id: this.peerId,
            x: this.player.x,
            y: this.player.y,
            texture: this.player.texture,
            rotation: this.player.rotation,
        }
        this.gameState.updatePlayer(p)
    }


    update() {
        const speed = 200

        if (this.cursors.left.isDown || this.cursors.left_alt.isDown) {
            this.player.setVelocity(-speed, 0)
        }
        else if (this.cursors.right.isDown || this.cursors.right_alt.isDown) {
            this.player.setVelocity(speed, 0)
        }
        else if (this.cursors.up.isDown || this.cursors.up_alt.isDown) {
            this.player.setVelocity(0, -speed)
        }
        else if (this.cursors.down.isDown || this.cursors.down_alt.isDown) {
            this.player.setVelocity(0, speed)
        }
        else {
            this.player.setVelocity(0, 0)
        }

        //todo only do this when something changes
        this.updatePlayer()


        this.renderPlayerSprites()
    }
}