import { base } from './base'

export const maps = [
    base
]

export function getMapData(mapId) {
    return maps.find(m => m.id === mapId)
}