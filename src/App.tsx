import { useEffect, useRef, useState } from 'react'
import { Position, Settings, isSamePosition, addBlockers, findShortestPath } from './utils'
import SettingsComponent from './components/settings'
import ContentComponent from './components/content'

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
  const numberOfBlockings = useRef<number>(200)

  //selceted algorithm state
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('BFS') // Move the selectedAlgorithm state here

  //default settings
  const settings = useRef<Settings>({
    rows: 20,
    columns: 20,
    startingPosition: { x: 0, y: 0 },
    endingPosition: { x: 16, y: 16 },
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
    numberOfBlockings.current = 200
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
      setMoveCount((prevMoveCount) => prevMoveCount + 1)
    }
  }

  //completing whole path
  const complete = () => {
    const recursiveMove = () => {
      nextMove()

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

  //updating matrix visuals
  useEffect(() => {
    generateMatrix()
  }, [isChanged])

  return (
    <div className='App'>
      <div className='table'>
        <table>
          <thead>
            <tr>
              <th></th>
              {/* column header */}
              {Array.from({ length: settings.current.columns }, (column, index) => (
                <th key={index} className='cell'>
                  {/* {index} */}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {/* row header */}
                {/* <td className='cell'>{rowIndex}</td> */}
                {row.map((cell, cellIndex) => {
                  const currentCell: Position = { x: rowIndex, y: cellIndex }
                  // setting background of cell based on its position
                  const isBlockingObject = blockingObject.current.some((obj) => isSamePosition(obj, currentCell))
                  const isMovingObject = movingObject.current.some((obj) => isSamePosition(obj, currentCell))

                  const cellClassName = `cell-${settings.current.columns} border 
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
      <div className='settings-controls'>
        <label className='description'>
          This application solves a matrix problem by finding a path for a moving object (MO) from start to end coordinates, while generating blocking
          objects (BO) on each step. If there are no possible paths found, number of blocking objects is reduced by one and we try again until path is
          found.
        </label>
        <SettingsComponent
          selectedAlgorithm={selectedAlgorithm}
          setSelectedAlgorithm={setSelectedAlgorithm}
          applySettings={applySettings}
          reset={reset}
        />
        <ContentComponent
          moveCount={moveCount}
          numberOfBlockings={numberOfBlockings.current}
          exeTime={exeTime}
          nextMove={nextMove}
          complete={() => complete()}
        />
      </div>
    </div>
  )
}

export default App
