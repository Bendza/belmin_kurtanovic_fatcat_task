export interface Position {
  x: number
  y: number
}

export interface Stats {
  moves: number
  exe: number
  iteration: number
}

export interface Settings {
  rows: number
  columns: number
  startingPosition: Position
  endingPosition: Position
  animations: boolean
}

//random number generator for blockers
function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min)
}

//comparing two positions
const isSamePosition = (pos1: Position, pos2: Position): boolean => {
  return pos1.x === pos2.x && pos1.y === pos2.y
}

//checks if the position of newly generated blocker is taken
const isPositionBlocked = (pos: Position, blockers: Position[], movingObject: Position[], settings: Settings): boolean => {
  if (isSamePosition(settings.startingPosition, pos) || isSamePosition(settings.endingPosition, pos)) {
    return true
  }
  if (blockers.some((b) => isSamePosition(b, pos))) {
    return true
  }
  if (movingObject.some((b) => isSamePosition(b, pos))) {
    return true
  }
  return false
}

//generating new blockers
const generateBlockers = (movingObject: Position[], count: number, settings: Settings): Position[] => {
  const newBlockers: Position[] = []

  while (count > 0) {
    const x = randomNumber(0, settings.rows)
    const y = randomNumber(0, settings.columns)
    const blocker: Position = { x, y }

    if (!isPositionBlocked(blocker, newBlockers, movingObject, settings)) {
      newBlockers.push(blocker)
      count--
    }
  }

  return newBlockers
}

//returns array of newly generated blockers
const addBlockers = (movingObject: Position[], numberOfBlockings: number, settings: Settings) => {
  return generateBlockers(movingObject, numberOfBlockings, settings)
}

//finding shortest path using breadth first search algorithm
const findShortestPath = (movingObject: Position[], blockingObject: Position[], settings: Settings): Position[] | null => {
  const rows = settings.rows
  const columns = settings.columns

  const isValidPosition = (pos: Position): boolean => {
    const { x, y } = pos
    return x >= 0 && x < rows && y >= 0 && y < columns
  }

  const isBlocked = (pos: Position): boolean => {
    return blockingObject.some((b) => isSamePosition(pos, b)) || movingObject.some((m) => isSamePosition(pos, m))
  }

  const getNeighbors = (pos: Position): Position[] => {
    const neighbors: Position[] = []
    const { x, y } = pos

    const dx = [-1, 0, 1, 0]
    const dy = [0, 1, 0, -1]

    for (let i = 0; i < 4; i++) {
      const newX = x + dx[i]
      const newY = y + dy[i]
      const neighborPos: Position = { x: newX, y: newY }

      if (isValidPosition(neighborPos) && !isBlocked(neighborPos)) {
        neighbors.push(neighborPos)
      }
    }

    return neighbors
  }

  const queue: Position[] = [movingObject[movingObject.length - 1]]
  const visited: Set<string> = new Set()
  const cameFrom: Map<string, Position> = new Map()

  visited.add(`${movingObject[movingObject.length - 1].x}-${movingObject[movingObject.length - 1].y}`)

  while (queue.length > 0) {
    const current = queue.shift()!

    if (current.x === settings.endingPosition.x && current.y === settings.endingPosition.y) {
      const path: Position[] = []
      let currPos: Position | undefined = current
      while (currPos) {
        path.unshift(currPos)
        currPos = cameFrom.get(`${currPos.x}-${currPos.y}`)
      }
      return path
    }

    const neighbors = getNeighbors(current)
    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.x}-${neighbor.y}`
      if (!visited.has(neighborKey)) {
        visited.add(neighborKey)
        queue.push(neighbor)
        cameFrom.set(neighborKey, current)
      }
    }
  }
  // checking for alternative paths
  for (let x = 0; x < rows; x++) {
    for (let y = 0; y < columns; y++) {
      const pos: Position = { x, y };
      if (isValidPosition(pos) && !isBlocked(pos) && !visited.has(`${x}-${y}`)) {
        return [pos];
      }
    }
  }

  return null;
}

export { addBlockers, isSamePosition, randomNumber, findShortestPath }
