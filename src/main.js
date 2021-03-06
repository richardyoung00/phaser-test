import Phaser from 'phaser'

import Preloader from './scenes/Preloader'
import Game from './scenes/Game'
import Connection from './multiplayer/connection'
import GameState from "./gameState";
import { playerDefaults } from './game_data/players';

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
			gravity: { y: 0 },
			debug: false
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
	connection.beginHosting()

	gameState.addPlayer({
		...playerDefaults,
		id: connection.peerId,
		name: username,
		x: 100,
		y: 100
	})

	gameState.setMapName("base")



	const newUrl = window.location.origin + window.location.pathname + '?gameId=' + connection.hostId;
	window.history.pushState({path:newUrl},'',newUrl);

	start()

}

async function joinGame(username, hostId) {
	const playerDetails = {
		...playerDefaults,
		id: connection.peerId,
		name: username,
		x: 200,
		y: 200
	}
	try {
		await connection.connectToHost(hostId, playerDetails)
		start()
	} catch(e) {
		alert("could not connect to game ID " + hostId)
	}
}

function showTab(id) {
	const tabContents = document.querySelectorAll(".tabcontent")
	for (let tabContent of tabContents) {
		tabContent.style.display = "none"
	}

	const tabLinks = document.querySelectorAll("button.tablinks")
	for (let tabLink of tabLinks) {
		if (tabLink.getAttribute("tab") === id) {
			tabLink.classList.add("active")
		} else {
			tabLink.classList.remove("active")
		}
	}

	const selectedTab = document.getElementById(id)
	selectedTab.style.display = "";

}

window.onload = function() {

	const userNameInput = document.querySelector("#username")
	const joinGameIdInput = document.querySelector("#join-game-id")
	const joinButton = document.querySelector("#join-button")
	const hostButton = document.querySelector("#host-button")

	const tabButtons = document.querySelectorAll("button.tablinks")
	for (let tabButton of tabButtons) {
		tabButton.addEventListener('click', () => {
			showTab(tabButton.getAttribute('tab'))
		})
	}
	showTab("join")

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

	const searchParams = new URLSearchParams(window.location.search);
	if (searchParams.has("gameId")) {
		joinGameIdInput.value = searchParams.get("gameId")
	}

}

