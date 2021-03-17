import Phaser from 'phaser'

export default class Preloader extends Phaser.Scene {
    constructor() {
        super('preloader')
    }

    preload() {
        this.load.spritesheet('sokoban', 'textures/sokoban_tilesheet.png', {
            frameWidth: 64
        })
        this.load.image('character', 'textures/characters.png');
    }

    create() {
        this.scene.start('game')
    }
}