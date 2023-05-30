import { useEffect, useRef, useState } from 'react'
import { Position, Stats, Settings, isSamePosition, addBlockers, findShortestPath } from './utils'
import SettingsComponent from './settings'

function App() {
  //matrix and state for checking if matrix changed
  const [matrix, setMatrix] = useState<string[][]>([])
  const [isChanged, setIsChanged] = useState<boolean>(false)

  //arrays of moving and blocking objects
  const movingObject = useRef<Position[]>([{ x: 0, y: 0 }])
  const blockingObject = useRef<Position[]>([])

  //display of statistics of current exectuion
  const [moveCount, setMoveCount] = useState<number>(0)
  const [exeTime, setExeTime] = useState<number>(0)
  const numberOfBlockings = useRef<number>(3)

  //display of results for preset itterations
  const statsTable = useRef<Stats[]>([
    { moves: 0, exe: 0, iteration: 1 },
    { moves: 0, exe: 0, iteration: 2 },
    { moves: 0, exe: 0, iteration: 3 },
  ])

  //default settings
  const settings = useRef<Settings>({
    rows: 5,
    columns: 5,
    startingPosition: { x: 0, y: 0 },
    endingPosition: { x: 4, y: 4 },
    animations: true,
  })

  //checks if moving object reached the destination
  const isEnd = () => {
    return isSamePosition(movingObject.current[movingObject.current.length - 1], settings.current.endingPosition)
  }

  //generating and seting matrix
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

  //reseting matrix and keeping the settings
  const reset = () => {
    setIsChanged(!isChanged)
    blockingObject.current = []
    movingObject.current = [settings.current.startingPosition]
    setExeTime(0)
    setMoveCount(0)
  }

  //reseting matrix and applying new settings
  const applySettings = (rows: number, columns: number, start: Position, end: Position, blockings: number, animations: boolean) => {
    reset()
    settings.current.rows = rows
    settings.current.columns = columns
    settings.current.startingPosition = start
    settings.current.endingPosition = end
    settings.current.animations = animations
    numberOfBlockings.current = blockings
    movingObject.current = [start]
  }

  //one move forward
  const nextMove = () => {
    setIsChanged(!isChanged)
    if (!isEnd()) {
      const path: Position[] | null = findShortestPath(movingObject.current, blockingObject.current, settings.current) //using breadth first search algorithm to find path

      //checking if valid path exists
      if (path && path.length > 1) {
        //if it does,append move object for one cell and generate new blockings
        movingObject.current.push(path[1])
        blockingObject.current = addBlockers(movingObject.current, numberOfBlockings.current, settings.current) //add new blockers
      } else {
        //if it doesn't, decrease number of blocking objects by 1 and generate new blockings
        numberOfBlockings.current = numberOfBlockings.current - 1
        blockingObject.current = addBlockers(movingObject.current, numberOfBlockings.current, settings.current)
      }
    }
  }

  //completing whole path
  const complete = (statsTableIndex?: number | undefined) => {
    const recursiveMove = () => {
      nextMove()

      setMoveCount((prevMoveCount) => {
        //setting move count and number of moves in result table
        if (statsTableIndex !== undefined) {
          statsTable.current[statsTableIndex].moves = prevMoveCount + 1
        }
        return prevMoveCount + 1
      })
      if (!isEnd()) {
        if (settings.current.animations) {
          //checking if animations are enabled, if yes setTimeout for delay
          setTimeout(recursiveMove, 0)
        } else {
          recursiveMove()
        }
      }
    }

    return new Promise<{ exeTime: number }>((resolve) => {
      const start = performance.now() // start time
      recursiveMove() // initiate the first move
      const end = performance.now() // end time
      setExeTime(end - start)
      resolve({ exeTime: end - start })
    })
  }

  //executing three preset itterations in sequence and storing their number of moves and execution times in table
  const execute = async (rows: number, columns: number, iterations: number[]) => {
    const runIteration = async (index: number) => {
      //applying preset settings for the itteration
      applySettings(rows, columns, settings.current.startingPosition, settings.current.endingPosition, iterations[index], settings.current.animations)
      numberOfBlockings.current = iterations[index]

      const { exeTime } = await complete(index) //executing complete function
      statsTable.current[index] = { ...statsTable.current[index], exe: exeTime } //seting executionTime in table
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
    for (let i = 0; i < iterations.length; i++) {
      //executing the iterrations one by one
      await runIteration(i)
    }
  }

  //updating matrix visuals
  useEffect(() => {
    generateMatrix()
  }, [isChanged])

  return (
    <div className='App'>
      <div>
        <table>
          <thead>
            <tr>
              <th></th>
              {/* column header */}
              {Array.from({ length: settings.current.columns }, (column, index) => (
                <th key={index} className='cell'>
                  {index}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {/* row header */}
                <td className='cell'>{rowIndex}</td>
                {row.map((cell, cellIndex) => {
                  const currentCell: Position = { x: rowIndex, y: cellIndex }
                  // setting background of cell based on its position
                  const isBlockingObject = blockingObject.current.some((obj) => isSamePosition(obj, currentCell))
                  const isMovingObject = movingObject.current.some((obj) => isSamePosition(obj, currentCell))

                  const cellClassName = `cell border 
                  ${isBlockingObject ? 'red' : ''} ${isMovingObject ? 'green' : ''}`

                  return (
                    <td key={cellIndex} className={cellClassName}>
                      {/* setting text in the starting and ending cell */}
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
      <SettingsComponent applySettings={applySettings} reset={reset} />
      <div className='content'>
        <table className='statsTable'>
          <thead>
            <tr>
              <th></th>
              <th>MOVES</th>
              <th>EXE TIME</th>
            </tr>
          </thead>
          <tbody>
            {/* display of results for preset itterations */}
            {statsTable.current.map((stat, index) => (
              <tr key={index}>
                <td>{stat.iteration && <>I{Array(stat.iteration).fill('I')}</>}</td>
                <td>{stat.moves}</td>
                <td>{stat.exe} miliseconds</td>
              </tr>
            ))}
          </tbody>
        </table>

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
        <div className='controls'>
          <button onClick={nextMove}>Next move</button>
          <button onClick={() => complete()}>Complete</button>
        </div>
      </div>
    </div>
  )
}

export default App
