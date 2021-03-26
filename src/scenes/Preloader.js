import Phaser from 'phaser'

import sokoban_tilesheet from '../../public/textures/sokoban_tilesheet.png'
import character from '../../public/textures/characters.png'
import concrete from '../../public/textures/concrete.jpg'
import bullet_1 from '../../public/textures/bullet_1.png'

import tanksSheet from '../../public/textures/tanks/sheet_tanks.png'
import tanksAtlas from '../../public/textures/tanks/sheet_tanks.xml?url'

import mapTilesheet from '../../public/textures/tilesheet_map.png'

export default class Preloader extends Phaser.Scene {
    constructor() {
        super('preloader')
    }

    preload() {
        this.load.spritesheet('sokoban', sokoban_tilesheet, {
            frameWidth: 64
        })
        this.load.image('character', character);
        this.load.image('concrete', concrete);
        this.load.image('bullet_1', bullet_1);

        this.load.atlasXML('tanks', tanksSheet, tanksAtlas)
        this.load.spritesheet('map', mapTilesheet, {frameWidth: 64})
    }

    create() {
        this.scene.start('game')
    }
}