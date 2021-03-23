import Phaser from 'phaser'

import sokoban_tilesheet from '../../public/textures/sokoban_tilesheet.png'
import character from '../../public/textures/characters.png'
import concrete from '../../public/textures/concrete.jpg'
import bullet_1 from '../../public/textures/bullet_1.png'

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
        this.load.image('bullet_1', bullet_1);
    }

    create() {
        this.scene.start('game')
    }
}