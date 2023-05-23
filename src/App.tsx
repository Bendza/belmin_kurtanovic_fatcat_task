import { useEffect, useRef, useState } from 'react'
import './App.css'

interface Position {
  x: number
  y: number
}

interface Stats {
  moves?: number
  exe?: number
  iteration: number
}

function App() {
  const [matrix, setMatrix] = useState<string[][]>([])
  const [moveCount, setMoveCount] = useState<number>(0)
  const [exeTime, setExeTime] = useState<number>(0)
  const [isChanged, setIsChanged] = useState<boolean>(false)
  const statsTable = useRef<Stats[]>([{ iteration: 1 }, { iteration: 2 }, { iteration: 3 }])
  let movingObject = useRef<Position[]>([{ x: 0, y: 0 }])
  let blockingObject = useRef<Position[]>([])
  let numberOfBlockings = useRef<number>(3)

  const settings = useRef<{
    rows: number
    columns: number
    startingPosition: Position
    endingPosition: Position
  }>({
    rows: 5,
    columns: 5,
    startingPosition: { x: 0, y: 0 },
    endingPosition: { x: 4, y: 4 },
  })

  const [settingsTemp, setSettingsTemp] = useState({
    rows: 5,
    columns: 5,
    startingPositionX: 0,
    startingPositionY: 0,
    endingPositionX: 4,
    endingPositionY: 4,
    numberOfBlockings: 3,
  })

  function randomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min)
  }

  const isEnd = () => {
    return isSamePosition(movingObject.current[movingObject.current.length - 1], settings.current.endingPosition)
  }

  const isSamePosition = (pos1: Position, pos2: Position): boolean => {
    return pos1.x === pos2.x && pos1.y === pos2.y
  }

  const isPositionBlocked = (pos: Position, blockers: Position[], currentPos?: Position): boolean => {
    if (isSamePosition(settings.current.startingPosition, pos) || isSamePosition(settings.current.endingPosition, pos)) {
      return true
    }
    if (currentPos) {
      if (isSamePosition(pos, currentPos)) {
        return true
      }
    }
    if (blockers.some((b) => isSamePosition(b, pos))) {
      return true
    }
    if (movingObject.current.some((b) => isSamePosition(b, pos))) {
      return true
    }
    return false
  }

  const generateBlockers = (blockers: Position[], count: number): Position[] => {
    const newBlockers: Position[] = []
    let remainingCount = count

    while (remainingCount > 0) {
      const x = randomNumber(0, settings.current.rows)
      const y = randomNumber(0, settings.current.columns)
      const blocker: Position = { x, y }

      if (!isPositionBlocked(blocker, newBlockers)) {
        newBlockers.push(blocker)
        remainingCount--
      }
    }

    return newBlockers
  }

  const addBlockers = () => {
    return generateBlockers(blockingObject.current, numberOfBlockings.current)
  }

  function generateMatrix() {
    const matrix: string[][] = []

    for (let i = 0; i < settings.current.rows; i++) {
      const row: string[] = []

      for (let j = 0; j < settings.current.columns; j++) {
        row.push(`[${i},${j}]`)
      }

      matrix.push(row)
    }
    setMatrix(matrix)
  }

  const handleInputChange = (event: { target: { name: any; value: any } }) => {
    const { name, value } = event.target

    setSettingsTemp((prevSettings) => ({
      ...prevSettings,
      [name]: typeof value === 'string' ? parseInt(value) : value,
    }))
  }

  const reset = () => {
    setIsChanged(!isChanged)
    blockingObject.current = []
    movingObject.current = [settings.current.startingPosition]
    numberOfBlockings.current = 0
    setExeTime(0)
    setMoveCount(0)
  }

  const applySettings = (rows: number, columns: number, start: Position, end: Position, blockings: number) => {
    reset()
    settings.current.rows = rows
    settings.current.columns = columns
    settings.current.startingPosition = start
    settings.current.endingPosition = end
    numberOfBlockings.current = blockings
    movingObject.current = [start]
  }

  const nextMove = () => {
    setIsChanged(!isChanged)
    if (!isEnd()) {
      let path: Position[] | null = findShortestPath()
      if (path && path.length > 1) {
        // Check if a valid path exists
        movingObject.current.push(path[1])
        blockingObject.current = addBlockers()
      } else {
        numberOfBlockings.current = numberOfBlockings.current - 1
        blockingObject.current = addBlockers()
      }
    }
  }

  const complete = () => {
    const recursiveMove = () => {
      nextMove()
      setMoveCount((prevMoveCount) => prevMoveCount + 1)
      if (!isEnd()) {
        setTimeout(recursiveMove, 0)
      }
    }

    return new Promise<{ exeTime: number; moves: number }>((resolve) => {
      const start = performance.now() // start time
      recursiveMove() // initiate the first move
      const end = performance.now() // end time
      const executionTime = end - start
      setExeTime(executionTime)
      resolve({ exeTime: executionTime, moves: moveCount })
    })
  }

  const execute = async (rowsE: number, columnsE: number, iterations: number[]) => {
    const updatedStatsTable = [...statsTable.current]

    // First iteration
    applySettings(rowsE, columnsE, settings.current.startingPosition, settings.current.endingPosition, iterations[0])

    numberOfBlockings.current = iterations[0]
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Delay of 1 second
    const { exeTime: executionTime1, moves: moves1 } = await complete()
    updatedStatsTable[0] = { ...updatedStatsTable[0], moves: moves1, exe: executionTime1 }

    statsTable.current = updatedStatsTable

    await new Promise((resolve) => setTimeout(resolve, 1000)) // Delay of 1 second

    // Second iteration
    applySettings(rowsE, columnsE, settings.current.startingPosition, settings.current.endingPosition, iterations[1])

    numberOfBlockings.current = iterations[1]
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Delay of 3 seconds
    const { exeTime: executionTime2, moves: moves2 } = await complete()
    updatedStatsTable[1] = { ...updatedStatsTable[1], moves: moves2, exe: executionTime2 }

    statsTable.current = updatedStatsTable

    await new Promise((resolve) => setTimeout(resolve, 1000)) // Delay of 1 second

    // Third iteration
    applySettings(rowsE, columnsE, settings.current.startingPosition, settings.current.endingPosition, iterations[2])

    numberOfBlockings.current = iterations[2]
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Delay of 3 seconds
    const { exeTime: executionTime3, moves: moves3 } = await complete()
    updatedStatsTable[2] = { ...updatedStatsTable[2], moves: moves3, exe: executionTime3 }

    statsTable.current = updatedStatsTable
  }

  useEffect(() => {
    generateMatrix()
  }, [isChanged])

  const findShortestPath = (): Position[] | null => {
    const rows = settings.current.rows
    const columns = settings.current.columns

    const isValidPosition = (pos: Position): boolean => {
      const { x, y } = pos
      return x >= 0 && x < rows && y >= 0 && y < columns
    }

    const isBlocked = (pos: Position): boolean => {
      return blockingObject.current.some((b) => isSamePosition(pos, b)) || movingObject.current.some((m) => isSamePosition(pos, m))
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

    const queue: Position[] = [movingObject.current[movingObject.current.length - 1]]
    const visited: Set<string> = new Set()
    const cameFrom: Map<string, Position> = new Map()

    visited.add(`${movingObject.current[movingObject.current.length - 1].x}-${movingObject.current[movingObject.current.length - 1].y}`)

    while (queue.length > 0) {
      const current = queue.shift()!

      if (current.x === settings.current.endingPosition.x && current.y === settings.current.endingPosition.y) {
        // Reconstruct the path
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
    // No path found
    return null
  }

  return (
    <div className='App'>
      <div>
        <table>
          <thead>
            <td></td>
            {Array.from({ length: settings.current.columns }, (_, index) => (
              <td key={index} className='cell'>
                {index}
              </td>
            ))}
          </thead>
          <tbody>
            {matrix.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className='cell'>{rowIndex}</td>
                {row.map((cell, cellIndex) => {
                  const currentCell: Position = { x: rowIndex, y: cellIndex }

                  const isBlockingObject = blockingObject.current.some((obj) => isSamePosition(obj, currentCell))
                  const isMovingObject = movingObject.current.some((obj) => isSamePosition(obj, currentCell))

                  const cellClassName = `cell border 
                  ${isBlockingObject ? 'red' : ''} ${isMovingObject ? 'green' : ''}`

                  return (
                    <td key={cellIndex} className={cellClassName}>
                      {isSamePosition(currentCell, settings.current.startingPosition) && <span>start</span>}
                      {isSamePosition(currentCell, settings.current.endingPosition) && <span>end</span>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className='options'>
        <label>
          <p>Rows:</p>
          <input type='number' name='rows' value={settingsTemp.rows} onChange={handleInputChange} />
        </label>
        <label>
          <p>Columns:</p>
          <input type='number' name='columns' value={settingsTemp.columns} onChange={handleInputChange} />
        </label>
        <label>
          <p>Starting Position:</p>
          x:
          <input type='number' name='startingPositionY' value={settingsTemp.startingPositionY} onChange={handleInputChange} />
          y:
          <input type='number' name='startingPositionX' value={settingsTemp.startingPositionX} onChange={handleInputChange} />
        </label>
        <label>
          <p>Ending Position:</p>
          x:
          <input type='number' name='endingPositionY' value={settingsTemp.endingPositionY} onChange={handleInputChange} />
          y:
          <input type='number' name='endingPositionX' value={settingsTemp.endingPositionX} onChange={handleInputChange} />
        </label>
        <label>
          <p>Number of blocking Objects:</p>
          <input type='number' name='numberOfBlockings' value={settingsTemp.numberOfBlockings} onChange={handleInputChange} />
        </label>
        <button
          onClick={() => {
            applySettings(
              settingsTemp.rows,
              settingsTemp.columns,
              {
                x: settingsTemp.startingPositionX,
                y: settingsTemp.startingPositionY,
              },
              {
                x: settingsTemp.endingPositionX,
                y: settingsTemp.endingPositionY,
              },
              settingsTemp.numberOfBlockings,
            )
          }}
        >
          Apply settings
        </button>
        <div className='controls'>
          <button onClick={reset}>Reset</button>
          <button onClick={nextMove}>Next move</button>
          <button onClick={complete}>Complete</button>
        </div>
        <div className='controls'>
          <button onClick={() => execute(5, 5, [5, 10, 15])}>5 * 5</button>
          <button onClick={() => execute(10, 10, [10, 30, 81])}>10 * 10</button>
          <button onClick={() => execute(20, 20, [30, 100, 361])}>20 * 20</button>
        </div>
        <div className='stats'>
          <p>Move: {moveCount} </p>
          <p>Blockers: {numberOfBlockings.current}</p>
          <p>Execution time: {exeTime} miliseconds</p>
        </div>
      </div>
      <table className='table'>
        <thead>
          <tr>
            <th></th>
            <th>MOVES</th>
            <th>EXE TIME</th>
          </tr>
        </thead>
        {statsTable.current.map((stat) => (
          <tr>
            <td>{stat.iteration}</td>
            <td>{stat.moves}</td>
            <td>{stat.exe} miliseconds</td>
          </tr>
        ))}
      </table>
    </div>
  )
}

export default App
