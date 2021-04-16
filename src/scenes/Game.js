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

        this.projectiles = {}
        

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


        window.game = this
    }

    create() {

        // Collision groups
        this.playersGroup = this.physics.add.group()
        this.projectilesGroup = this.physics.add.group()
        this.objectPlayerCollideGroup = this.add.group()
        this.objectProjectileCollideGroup = this.physics.add.staticGroup()

        const {width, height} = this.scale

        // Set aspect ratio to the same as viewport (may break on portrait or weird sized screens)
        // const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
        // const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
        // this.scale.displaySize.setAspectRatio( vw/vh );
        // this.scale.refresh();

        const hostId = this.connection.hostId
        this.peerId = this.connection.peerId
        this.isHost = this.connection.isHosting

        this.createMap()

        if (this.connection.isHosting) {
            this.setupCollisions()
        }

        let hostIdText = this.add.text(6, 6, 'Game join code: ' + hostId, {
            font: '12px Arial',
            fill: '#ffffff'
        }).setScrollFactor(0);


        this.renderSprites()

        this.input.on('pointermove', (cursor) => {
            if (!this.player) {
                return
            }
            const angle = Phaser.Math.Angle.Between(this.player.sprite.x, this.player.sprite.y, cursor.x + this.cameras.main.scrollX, cursor.y + this.cameras.main.scrollY)
            this.player.turret.setRotation(angle + (Math.PI / 2))
        })

        this.input.on('pointerdown', (pointer) => {
            this.shootWeapon()
        })

    }

    createMap() {
        const {width, height, tileTexture, tileTextureFrame, objects} = this.mapData
        let ts = this.add.tileSprite(0, 0, width, height, tileTexture, tileTextureFrame)
        // this.cameras.main.setZoom(0.8);

        for (let o of objects) {
            const sprite = this.physics.add.image(o.x, o.y, o.texture, o.textureFrame)
            sprite.body.setImmovable(true)
            if (o.playerCollision) {
                this.objectPlayerCollideGroup.add(sprite)
            }
            if (o.bulletCollision) {
                this.objectProjectileCollideGroup.add(sprite)
                this.objectProjectileCollideGroup.refresh()
            }
        }

        this.physics.world.setBounds(-width/2, -height/2, width, height);
    }

    setupCollisions() {
        console.log("setting colllsions")
        //player collides with map object
        this.physics.add.collider(this.objectPlayerCollideGroup, this.playersGroup);
        //projctile collides with map object 
        this.physics.add.overlap(this.objectProjectileCollideGroup, this.projectilesGroup, this.onProjectileCollideWithObject);
        //projctile collides with player
        this.physics.add.overlap(this.playersGroup, this.projectilesGroup, this.onProjectileCollideWithPlayer);
    }

    onProjectileCollideWithObject(object, projectile) {
        //todo: destroy or bounce projectile here
    }
    
    onProjectileCollideWithPlayer(player, projectile) {
        //todo: destroy player
    }

    shootWeapon() {
        const turretEnd = this.player.turret.getTopCenter(null, true)
        const x = turretEnd.x
        const y = turretEnd.y
        const direction = this.player.turret.rotation - (Math.PI / 2)

        const weaponData = {
            playerId: this.peerId,
            x,
            y,
            direction
        }
        this.gameState.shootWeapon(weaponData)

    }

    renderSprites() {
        this.renderPlayers()
        this.renderProjectiles()
    }

    renderPlayers() {
        const allPlayers = this.gameState.getPlayers()
        for (let p of allPlayers) {


            if (!this.players[p.id]) { //add new sprite

                const sprite = this.physics.add.sprite(p.x, p.y, p.texture, p.textureFrame).setRotation(p.rotation).setScale(0.5)
                const label = this.add.text(p.x, p.y + 30, p.name, {
                    font: '12px Arial',
                    fill: '#ffffff',
                    align: 'center'
                }).setOrigin(0.5);

                const turret = this.physics.add.sprite(p.x, p.y, "tanks", "barrelBlack").setRotation(p.rotation).setOrigin(0.5,1.2).setScale(0.5);

                const weaponData = getWeaponData(p.weapon)
                const weapon = new ProjectileWeapon(this, weaponData);

                this.players[p.id] = {label, sprite, turret, weapon}

                if (p.id === this.peerId) {
                    this.player = this.players[p.id]
                    this.cameras.main.startFollow(sprite);
                }

                this.playersGroup.add(sprite)

                sprite.setCollideWorldBounds(true);

            } else { // update the existing sprite
                this.players[p.id].sprite.setX(p.x).setY(p.y)
                this.players[p.id].sprite.setTexture(p.texture, p.textureFrame).setRotation(p.rotation)
                this.players[p.id].turret.setX(p.x).setY(p.y)
                this.players[p.id].turret.setRotation(p.turretRotation)
                this.players[p.id].label.setX(p.x).setY(p.y + 30)

                if (p.status === "disconnected") {
                    this.players[p.id].sprite.setActive(false);
                    this.players[p.id].sprite.setVisible(false);
                    this.players[p.id].turret.setActive(false);
                    this.players[p.id].turret.setVisible(false);
                    this.players[p.id].label.setActive(false);
                    this.players[p.id].label.setVisible(false);
                }
            }

        }

    }

    renderProjectiles() {
        const allProjectiles = this.gameState.getProjectiles()
        for (let p of allProjectiles) {
            if (!this.projectiles[p.id]) { //add new sprite
                const projectile = this.physics.add.sprite(p.x, p.y, p.texture, p.textureFrame)
                projectile.setScale(p.scale)
                projectile.setTexture(p.texture, p.textureFrame)
                projectile.setRotation(p.rotation)
                projectile.setTint(p.tint)
                this.projectilesGroup.add(projectile)
                this.projectiles[p.id] = projectile
                this.projectiles[p.id].setVelocity(p.velocityX, p.velocityY)

            }  
            // Not setting X and Y here could be a possible optimisation in case we get lag from server
            this.projectiles[p.id].setX(p.x)
            this.projectiles[p.id].setY(p.y)
            
        }

        const projectileKeys = allProjectiles.map(p => p.id)

        //check if a projectile no longer exists and delete
        for (let [key, projectile] of Object.entries(this.projectiles)) {
            if(!projectileKeys.includes(key)) {
                projectile.destroy()
                delete this.projectiles[key]
            }
        }

    }

    updatePlayerState() {
        let newPlayerState = {
            id: this.peerId,
            x: this.player.sprite.x,
            y: this.player.sprite.y,
            texture: this.player.sprite.texture.key,
            textureFrame: this.player.sprite.frame.name,
            rotation: this.player.sprite.rotation,
            turretRotation: this.player.turret.rotation,
        }

        this.gameState.updatePlayer(newPlayerState)
    }


    // Host only
    updateProjectileStates() {
        const projectilePositions = []
        for (let [key, projectile] of Object.entries(this.projectiles)) {
            
            //Projectile goes out of bounds
            if (!this.physics.world.bounds.contains(projectile.x, projectile.y)) {
                projectile.destroy(false);
                this.gameState.removeProjectile(key)
                delete this.projectiles[key]

            }

            projectilePositions.push({
                id: key,
                x: projectile.x,
                y: projectile.y
            })
        }

        this.gameState.updateProjectilePositions(projectilePositions)
    }


    update() {

        if (!this.player) {
            return
        }
        const speed = 200

        if (this.cursors.left.isDown || this.cursors.left_alt.isDown) {
            this.player.sprite.body.setVelocity(-speed, 0)
            this.player.sprite.setRotation(Math.PI* 3 /2)

        } else if (this.cursors.right.isDown || this.cursors.right_alt.isDown) {
            this.player.sprite.body.setVelocity(speed, 0)
            this.player.sprite.setRotation(Math.PI /2)

        } else if (this.cursors.up.isDown || this.cursors.up_alt.isDown) {
            this.player.sprite.body.setVelocity(0, -speed)
            this.player.sprite.setRotation(0)

        } else if (this.cursors.down.isDown || this.cursors.down_alt.isDown) {
            this.player.sprite.body.setVelocity(0, speed)
            this.player.sprite.setRotation(Math.PI)
        } else {
            this.player.sprite.body.setVelocity(0, 0)
        }

        this.updatePlayerState()
        if (this.connection.isHosting) {
            this.updateProjectileStates()
        }
        this.renderSprites()
        
    }
}