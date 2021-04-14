import deepEquals from "fast-deep-equal/es6"
import { getWeaponData } from "./game_data/weapons"
import Phaser from 'phaser'

/*
player: {
    id: connection.peerId,
    name: username,
    x: 100,
    y: 100,
    texture: "tanks",
    textureFrame: "tankBlack",
    weapon: "blaster",
    weaponLastFired: 1618407757096,
    rotation: 0,
    turretRotation: 0,
    status: 'connected'
}

projectile: {
    id: projectileData.playerId + "_" + Date.now(),
    playerId: projectileData.playerId,
    rotation: projectileData.direction,
    x: projectileData.x,
    y: projectileData.y,
    texture: weaponData.texture,
    velocityX: velocity.x,
    velocityY: velocity.y,
}

*/

export default class GameState {
    constructor(connection) {
        this.connection = connection
        this.setupConnectionHandlers()

        this.state = {
            map: null,
            players: {

            },
            projectiles: {

            },
            messages: []
        }
    }

    setMapName(map) {
        this.state.map = map
    }

    getMapName() {
        return this.state.map
    }

    sendUpdatedGameState() {
        if (this.connection.isHosting) {
            this.connection.sendToAllGuests({
                type: "game-state",
                data: this.state
            })
        } else {
            console.error("cannot sent data to all guests if you are not the host")
        }
    }

    sendPlayerStateToHost(player) {
        if (!this.connection.isHosting) {
            this.connection.sendToHost({
                type: "player-state",
                data: player
            })
        } else {
            console.error("cannot sent player data to host if you are the host")
        }

    }

    setupConnectionHandlers() {
        this.connection.onGuestConnected = (peerId, metaData) => {
            console.log("connected " + peerId)
            this.state.messages.push(metaData.name + " has joined the game")
            this.addPlayer(metaData)
        }

        this.connection.onGuestDisconnected = (metaData) => {
            console.log("player left " + metaData.id)
            this.state.messages.push(metaData.name + " has left the game")
            this.removePlayer(metaData)
        }

        this.connection.onMessage = (message) => {
            switch (message.type) {
                case "game-state":
                    this.state = message.data
                    break;
                case "player-state":
                    this.state.players[message.data.id] = message.data
                    this.sendUpdatedGameState()
                    break;
                case "shoot-weapon":
                    this.addProjectile(message.data)
                    break;
            }
        }

    }

    addPlayer(player) {
        this.state.players[player.id] = player
        //Init defaults
        this.state.players[player.id].status = "connected"
        this.state.players[player.id].weapon = "blaster"
        this.state.players[player.id].weaponLastFired = 0
        this.sendUpdatedGameState()
    }

    removePlayer(player) {
        this.state.players[player.id].status = "disconnected"
        this.sendUpdatedGameState()
    }
    
    removeProjectile(projectileId) {
        delete this.state.projectiles[projectileId]
        this.sendUpdatedGameState()
    }

    getPlayers() {
        return Object.values(this.state.players)
    }

    getProjectiles() {
        return Object.values(this.state.projectiles)
    }

    updatePlayer(updatedPlayer) {
        const oldPlayerState = this.state.players[updatedPlayer.id]

        if (!deepEquals(oldPlayerState, updatedPlayer)) {
            this.state.players[updatedPlayer.id] = { ...this.state.players[updatedPlayer.id], ...updatedPlayer }

            if (this.connection.isHosting) {
                this.sendUpdatedGameState()
            } else {
                this.sendPlayerStateToHost(this.state.players[updatedPlayer.id])
            }
        }

    }

    updateProjectilePositions(positions) {
        for (let p of positions) {
            if (this.state.projectiles[p.id]) {
                this.state.projectiles[p.id].x = p.x
                this.state.projectiles[p.id].y = p.y
            }
        }
        this.sendUpdatedGameState()
    }

    velocityFromRotation(rotation, speed) {
        const vec = new Phaser.Math.Vector2()
        vec.setToPolar(rotation, speed)
        return vec
    }

    addProjectile(projectileData) {
        if (!this.connection.isHosting) {
            console.error("only the host can add projectiles to the game state")
            return
        }
        const shootingPlayer = this.state.players[projectileData.playerId]
        const weaponId = shootingPlayer.weapon
        const weaponData = getWeaponData(weaponId)
        //check fire rate

        //check max number projectiles

        const velocity = this.velocityFromRotation(projectileData.direction, weaponData.projectile_speed)

        const projectileId = projectileData.playerId + "_" + Date.now()
        this.state.projectiles[projectileId] = {
            id: projectileData.playerId + "_" + Date.now(),
            playerId: projectileData.playerId,
            rotation: projectileData.direction,
            x: projectileData.x,
            y: projectileData.y,
            texture: weaponData.texture,
            velocityX: velocity.x,
            velocityY: velocity.y
        }
    }

    shootWeapon(projectileData) {
        if (this.connection.isHosting) {
            this.addProjectile(projectileData)
        } else {
            this.connection.sendToHost({
                type: "shoot-weapon",
                data: projectileData
            })
        }
    }

    updateProjectile(updatedProjectile) {
        console.log(updatedProjectile)
    }

}