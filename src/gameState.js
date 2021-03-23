import deepEquals from "fast-deep-equal/es6"

export default class GameState {
    constructor(connection) {
        this.connection = connection
        this.setupConnectionHandlers()

        this.state = {
            players: {

            }
        }
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
            this.addPlayer(metaData)
        }

        this.connection.onMessage = (message) => {
            switch(message.type) {
                case "game-state":
                    this.state = message.data
                    break;
                case "player-state":
                    this.state.players[message.data.id] = message.data
                    this.sendUpdatedGameState()
                    break;
            }
        }

    }

    addPlayer(player) {
        this.state.players[player.id] = player
        this.sendUpdatedGameState()
    }

    getPlayers() {
        return Object.values(this.state.players)
    }

    updatePlayer(updatedPlayer) {
        const oldPlayerState = this.state.players[updatedPlayer.id]

        if (!deepEquals(oldPlayerState, updatedPlayer)) {
            this.state.players[updatedPlayer.id] = {...this.state.players[updatedPlayer.id], ...updatedPlayer}

            if (this.connection.isHosting) {
                this.sendUpdatedGameState()
            } else {
                this.sendPlayerStateToHost(this.state.players[updatedPlayer.id])
            }
        }

    }

}