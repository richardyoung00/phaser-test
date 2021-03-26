import Phaser from 'phaser'
import ProjectileWeapon from "../modules/ProjectileWeapon";
import {getMapData} from "../game_data/maps";
import {getWeaponData} from "../game_data/weapons";

export default class Game extends Phaser.Scene {

    /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
    cursors

    /** @type {Phaser.Physics.Arcade.Sprite} */
    player

    constructor() {
        super('game')
        this.player = null
        this.players = {}
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
        this.mapData = getMapData(this.gameState.getMapName())
    }

    create() {
        const {width, height} = this.scale

        // Set aspect ratio to the same as viewport (may break on portrait or weird sized screens)
        // const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
        // const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
        // this.scale.displaySize.setAspectRatio( vw/vh );
        // this.scale.refresh();

        const hostId = this.connection.hostId
        this.peerId = this.connection.peerId

        this.createMap()

        let hostIdText = this.add.text(6, 6, 'Game join code: ' + hostId, {
            font: '12px Arial',
            fill: '#ffffff'
        }).setScrollFactor(0);


        this.renderPlayerSprites()

        this.input.on('pointermove', (cursor) => {
            if (!this.player) {
                return
            }
            const angle = Phaser.Math.Angle.Between(this.player.container.x, this.player.container.y, cursor.x + this.cameras.main.scrollX, cursor.y + this.cameras.main.scrollY)
            this.player.turret.setRotation(angle + (Math.PI / 2))
        })

        this.input.on('pointerdown', (pointer) => {
            this.shootWeapon()
        })

    }

    createMap() {
        const {width, height, tileTexture, tileTextureFrame} = this.mapData
        let ts = this.add.tileSprite(0, 0, width, height, tileTexture, tileTextureFrame)
        // this.cameras.main.setZoom(0.8);

        this.physics.world.setBounds(-width/2, -height/2, width, height);
    }

    shootWeapon() {
        const x = this.player.container.x
        const y = this.player.container.y
        const direction = this.player.turret.rotation - (Math.PI / 2)

        this.player.weapon.fireBullet(x, y, direction)

    }

    renderPlayerSprites() {
        const allPlayers = this.gameState.getPlayers()
        for (let p of allPlayers) {


            if (!this.players[p.id]) { //add new sprite

                const sprite = this.physics.add.sprite(0, 0, p.texture, p.textureFrame).setRotation(p.rotation).setScale(0.5)
                const label = this.add.text(0, 30, p.name, {
                    font: '12px Arial',
                    fill: '#ffffff',
                    align: 'center'
                }).setOrigin(0.5);

                const turret = this.physics.add.sprite(0, 0, "tanks", "barrelBlack").setRotation(p.rotation).setOrigin(0.5,1.2).setScale(0.5);

                const container = this.add.container(p.x, p.y, [sprite, label, turret ])
                this.physics.world.enable(container);

                const weaponData = getWeaponData(p.weapon)
                const weapon = new ProjectileWeapon(this, weaponData);

                this.players[p.id] = {container, label, sprite, turret, weapon}

                if (p.id === this.peerId) {
                    this.player = this.players[p.id]
                    this.cameras.main.startFollow(this.player.container);
                }

                container.body.setCollideWorldBounds(true);

            } else { // update the existing sprite
                this.players[p.id].container.setX(p.x).setY(p.y)
                this.players[p.id].sprite.setTexture(p.texture, p.textureFrame).setRotation(p.rotation)
                this.players[p.id].turret.setRotation(p.turretRotation)

                if (p.status === "disconnected") {
                    this.players[p.id].container.setActive(false);
                    this.players[p.id].container.setVisible(false);
                }
            }

        }

    }

    updatePlayer() {
        let newPlayerState = {
            id: this.peerId,
            x: this.player.container.x,
            y: this.player.container.y,
            texture: this.player.sprite.texture.key,
            textureFrame: this.player.sprite.frame.name,
            rotation: this.player.sprite.rotation,
            turretRotation: this.player.turret.rotation,
        }

        this.gameState.updatePlayer(newPlayerState)
    }


    update() {

        if (!this.player) {
            return
        }
        const speed = 200

        if (this.cursors.left.isDown || this.cursors.left_alt.isDown) {
            this.player.container.body.setVelocity(-speed, 0)
            this.player.sprite.setRotation(Math.PI* 3 /2)

        } else if (this.cursors.right.isDown || this.cursors.right_alt.isDown) {
            this.player.container.body.setVelocity(speed, 0)
            this.player.sprite.setRotation(Math.PI /2)

        } else if (this.cursors.up.isDown || this.cursors.up_alt.isDown) {
            this.player.container.body.setVelocity(0, -speed)
            this.player.sprite.setRotation(0)

        } else if (this.cursors.down.isDown || this.cursors.down_alt.isDown) {
            this.player.container.body.setVelocity(0, speed)
            this.player.sprite.setRotation(Math.PI)
        } else {
            this.player.container.body.setVelocity(0, 0)
        }

        this.updatePlayer()


        this.renderPlayerSprites()
    }
}