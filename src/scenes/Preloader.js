import Phaser from 'phaser'

import sokoban_tilesheet from '../../public/textures/sokoban_tilesheet.png'
import character from '../../public/textures/characters.png'
import concrete from '../../public/textures/concrete.jpg'

export default class Preloader extends Phaser.Scene {
    constructor() {
        super('preloader')
    }

    preload() {
        this.load.spritesheet('sokoban', sokoban_tilesheet , {
            frameWidth: 64
        })
        this.load.image('character', character);
        this.load.image('concrete', concrete);
    }

    create() {
        this.scene.start('game')
    }
}