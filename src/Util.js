import Rule from './Rule.js'
import {LEGEND} from './Constants.js'

export default {
  getObjectsForMap(mapStr = '') {
    return this.splitMapString(mapStr)
      .map((row, i) => row.map((char, j) => {
        var Block = LEGEND[char]
        if (typeof Block !== 'function') {
          throw new Error(`Could not find Block constructor in legend for "${char}"`)
        }
        return new Block(i, j)
      }))
  },
  getRulesFromRows(grid) {
    return grid.flatMap(row => Rule.fromArray(row) || [])
  },
  getRulesFromCols(grid) {
    var cols = grid[0].map((_, y) =>
      grid.map((__, x) => grid[x][y]))

    return this.getRulesFromRows(cols)
  },
  getNextPosition({x,y}, input) {
    switch (input) {
      case 'Left':
        return {x, y: y-1}
      case 'Right':
        return {x, y: y+1}
      case 'Up':
        return {x: x-1, y}
      case 'Down':
        return {x: x+1, y}
    }
  },
  getDirectionFromMoveDelta(move) {
    var dX = move.to.x - move.from.x
    var dY = move.to.y - move.from.y

    return dX === 0
      ? (dY > 0 ? 'Right' : 'Left')
      : (dX > 0 ? 'Down' : 'Up')
  },
  getDistanceBetweenPositions(pos1, pos2) {
    // this assumes a straight line because blocks
    // can only move in one direction at a time
    return pos1.x !== pos2.x
      ? Math.abs(pos1.x - pos2.x)
      : Math.abs(pos1.y - pos2.y)
  },
  sortMoves(moves) {
    var sorted = moves.sort((move1, move2) => {
      if (
        move1.from.x === move2.to.x ||
        move1.from.y === move2.to.y
      ) return 1

      if (
        move1.to.x === move2.from.x ||
        move1.to.y === move2.from.y
      ) return -1

      return 0
    })

    // idk why but consistently the first position should be the last
    if (sorted.length > 1) sorted.push(sorted.splice(0, 1)[0])

    // reversing them ensures they get applied as state changes in the correct order
    return sorted.reverse()
  },
  deduplicateMoves(moves) {
    var deduped = []
    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      if (!this.arrayContainsObject(deduped, move)) {
        deduped.push(move)
      }
    }
    return deduped
  },
  sanitizeMapString(mapStr) {
    return mapStr.trim().replace(/[^\S\r\n]/g, '')
  },
  splitMapString(mapStr) {
    return mapStr.trim().split('\n').map(l => l.trim().split(''))
  },
  arrayContainsObject(arr, obj) {
    return !!arr.find(item => {
      if (typeof item !== 'object') return false
      return this.objectsAreEqual(item, obj)
    })
  },
  objectsAreEqual(obj1 = {}, obj2 = {}) {
    return Object.keys(obj1).every(k => {
      return JSON.stringify(obj1[k]) === JSON.stringify(obj2[k])
    })
  }
}