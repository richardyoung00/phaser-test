import { blaster } from './blaster'

export const weapons = [
    blaster
]

export function getWeaponData(weaponId) {
    return weapons.find(m => m.id === weaponId)
}