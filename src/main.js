import Phaser from 'phaser'

import Preloader from './scenes/Preloader'
import Game from './scenes/Game'
import Connection from './multiplayer/connection'
import GameState from "./gameState";

const conn = new Connection()
const gameState = new GameState()


gameState.addPlayer({
	id: conn.peerId,
	name: "Player 1",
	x: 100,
	y: 100,
	texture: "character",
	rotation: 0
})

setTimeout(() => {
	gameState.addPlayer({
		id: "abc123",
		name: "Player 1",
		x: 200,
		y: 300,
		texture: "character",
		rotation: 2
	})
}, 5000)

window.conn = conn
window.gameState = gameState


const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	parent: "game-container",
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 0 }
		}
	},
	scale: {
		mode: Phaser.Scale.FIT,
	},
	scene: [Preloader, Game]
}
const game = new Phaser.Game(config)

game.registry.set('connection', conn)
game.registry.set('gameState', gameState)

export default game
