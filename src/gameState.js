export default class GameState {
    constructor() {
        this.onChange = () => {}
        this.state = {
            players: {

            }
        }
    }

    addPlayer(player) {
        this.state.players[player.id] = player
        this.onChange()
    }

    getPlayers() {
        return Object.values(this.state.players)
    }

    updatePlayer(updatedPlayer) {
        this.state.players[updatedPlayer.id] = {...this.state.players[updatedPlayer.id], ...updatedPlayer}


    }


    serializeState() {
        return JSON.stringify(this.state)
    }
}