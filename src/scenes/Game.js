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
        this.cursors = this.input.keyboard.createCursorKeys()
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

        let hostIdText = this.add.text(6,6, 'Game join code: ' + hostId, {font: '12px Arial', fill: '#ffffff'})

        this.anims.create({
            key: 'down-idle',
            frames: [{ key: 'sokoban', frame: 52 }]
        })

        this.anims.create({
            key: 'up-idle',
            frames: [{ key: 'sokoban', frame: 55 }]
        })

        this.anims.create({
            key: 'left-idle',
            frames: [{ key: 'sokoban', frame: 81 }]
        })

        this.anims.create({
            key: 'right-idle',
            frames: [{ key: 'sokoban', frame: 78 }]
        })

        this.anims.create({
            key: 'down-walk',
            frames: this.anims.generateFrameNumbers('sokoban', { start: 52, end: 54 }),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create({
            key: 'up-walk',
            frames: this.anims.generateFrameNumbers('sokoban', { start: 55, end: 57 }),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create({
            key: 'left-walk',
            frames: this.anims.generateFrameNumbers('sokoban', { start: 81, end: 83 }),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create({
            key: 'right-walk',
            frames: this.anims.generateFrameNumbers('sokoban', { start: 78, end: 80 }),
            frameRate: 10,
            repeat: -1
        })

        this.renderPlayerSprites()
        // this.gameState.onchange = () => {
        //     this.renderPlayerSprites()
        // }

        
        // this.player = this.physics.add.sprite(width * 0.5, height * 0.6, 'sokoban')
        //     .play('down-idle')

        // this.cameras.main.startFollow(this.player);
    }

    renderPlayerSprites() {
        const allPlayers = this.gameState.getPlayers()
        for (let p of allPlayers) {


            if (!this.playerSprites[p.id]) { //add new sprite
                this.playerSprites[p.id] = this.physics.add.sprite(p.x, p.y, p.texture).play(p.animation)
                if (p.id === this.peerId) {
                    this.player = this.playerSprites[p.id]
                    this.cameras.main.startFollow(this.player);
                }

            } else { // update the existing sprite
                this.playerSprites[p.id].setX(p.x).setY(p.y).setTexture(p.texture).play(p.animation)
            }

        }

    }

    updatePlayer() {
        let p = {
            id: this.peerId,
            x: this.player.x,
            y: this.player.y,
            texture: this.player.texture,
            animation: this.player.anims.currentAnim.key,
        }
        this.gameState.updatePlayer(p)
    }


    update() {
        const speed = 200

        if (this.cursors.left.isDown) {
            this.player.setVelocity(-speed, 0)
            this.player.play('left-walk', true)
        }
        else if (this.cursors.right.isDown) {
            this.player.setVelocity(speed, 0)
            this.player.play('right-walk', true)
        }
        else if (this.cursors.up.isDown) {
            this.player.setVelocity(0, -speed)
            this.player.play('up-walk', true)
        }
        else if (this.cursors.down.isDown) {
            this.player.setVelocity(0, speed)
            this.player.play('down-walk', true)
        }
        else {
            this.player.setVelocity(0, 0)
            const key = this.player.anims.currentAnim.key
            const parts = key.split('-')
            const direction = parts[0]
            this.player.play(`${direction}-idle`)
        }

        //todo only do this when something changes
        this.updatePlayer()


        this.renderPlayerSprites()
    }
}