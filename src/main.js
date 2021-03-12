import Phaser from 'phaser'

import Preloader from './scenes/Preloader'
import Game from './scenes/game'
import Connection from './multiplayer/connection'

const conn = new Connection()

window.conn = conn


const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
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

export default game
