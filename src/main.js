import Phaser from 'phaser'

import Preloader from './scenes/Preloader'
import Game from './scenes/Game'
import Connection from './multiplayer/connection'
import GameState from "./gameState";

const connection = new Connection()
const gameState = new GameState(connection)

window.connection = connection
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


function start() {
	const gameSetup = document.querySelector("#game-setup")
	gameSetup.style.display = "none"


	const game = new Phaser.Game(config)

	game.registry.set('connection', connection)
	game.registry.set('gameState', gameState)

}

function hostGame(username) {
	gameState.addPlayer({
		id: connection.peerId,
		name: username,
		x: 100,
		y: 100,
		texture: "character",
		rotation: 0
	})

	connection.beginHosting()

	const newUrl = window.origin + window.pathname + '?gameId=' + connection.hostId;
	window.history.pushState({path:newUrl},'',newUrl);

	start()

}

async function joinGame(username, hostId) {
	const playerDetails = {
		id: connection.peerId,
		name: username,
		x: 200,
		y: 200,
		texture: "character",
		rotation: 0
	}
	try {
		await connection.connectToHost(hostId, playerDetails)
		start()
	} catch(e) {
		alert("could not connect to game ID " + hostId)
	}
}

window.onload = function() {

	const userNameInput = document.querySelector("#username")
	const joinGameIdInput = document.querySelector("#join-game-id")
	const joinButton = document.querySelector("#join-button")
	const hostButton = document.querySelector("#host-button")

	hostButton.addEventListener('click', () => {
		if (!userNameInput.value) {
			alert("Please enter a username")
		} else {
			hostGame(userNameInput.value)
		}
	})

	joinButton.addEventListener('click', () => {
		if (!userNameInput.value) {
			alert("Please enter a username")
			return
		}

		if (!joinGameIdInput.value) {
			alert("Please enter a game ID to join")
			return
		}

		joinGame(userNameInput.value, joinGameIdInput.value)
	})

}

