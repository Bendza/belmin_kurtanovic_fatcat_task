import { useEffect, useRef, useState } from 'react';
import './App.css';

interface Position {
  x: number;
  y: number;
}

function App() {
  const [matrix, setMatrix] = useState<string[][]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [moveCount, setMoveCount] = useState<number>(0);
  let movingObject = useRef<Position[]>([{x:0,y:0}]);
  let blockingObject = useRef<Position[]>([]);
  const [matrixState, setMatrixState] = useState<{
    rows: number;
    columns: number;
    startingPosition: Position;
    endingPosition: Position;
    numberOfBlockings: number;
  }>({
    rows: 5,
    columns: 5,
    startingPosition: { x: 0, y: 0 },
    endingPosition: { x: 4, y: 4 },
    numberOfBlockings: 3,
  });

  const [settings, setSettings] = useState({
    rows: 5,
    columns: 5,
    startingPositionX: 0,
    startingPositionY: 0,
    endingPositionX: 4,
    endingPositionY: 4,
    numberOfBlockings: 3
  });

  function randomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
  }


  const isSamePosition = (pos1: Position, pos2: Position): boolean => {
    return pos1.x === pos2.x && pos1.y === pos2.y;
  };


  const isPositionBlocked = (pos: Position, blockers: Position[], currentPos?: Position): boolean => {

    if (isSamePosition(matrixState.startingPosition, pos) || isSamePosition(matrixState.endingPosition, pos)) {
      return true;
    }
    if (currentPos) {
      if (isSamePosition(pos, currentPos)) {
        return true;
      }
    }
    if (blockers.some((b) => isSamePosition(b, pos))) {
      return true;
    }
    if (movingObject.current.some((b) => isSamePosition(b, pos))) {
      return true;
    }
    return false;
  };

  const generateBlocker = (blockers: Position[], currentPos?: Position): Position => {
    const x = randomNumber(0, settings.rows);
    const y = randomNumber(0, settings.columns);
    const blocker: Position = { x, y };

    if (isPositionBlocked(blocker, blockers, currentPos)) {
      return generateBlocker(blockers, currentPos);
    }
    return blocker
  }

  const addBlockers = (currentPos?: Position) => {
    const newBlockers: Position[] = [];
    for (let index = 0; index < matrixState.numberOfBlockings; index++) {
      newBlockers.push(generateBlocker(newBlockers, currentPos));
    }
    return newBlockers;
  }

  function generateMatrix() {
    const matrix: string[][] = [];

    for (let i = 0; i < matrixState.rows; i++) {
      const row: string[] = [];

      for (let j = 0; j < matrixState.columns; j++) {
        row.push(`[${i},${j}]`);
      }

      matrix.push(row);
    }
    setMatrix(matrix);
  }

  const handleInputChange = (event: { target: { name: any; value: any; }; }) => {
    const { name, value } = event.target;

    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: typeof value === "string" ? parseInt(value) : value,
    }));
  };

  const applySettings = () => {
    setMatrixState(() => ({
      ...matrixState,
      rows: settings.rows,
      columns: settings.columns,
      startingPosition: { x: settings.startingPositionX, y: settings.startingPositionY },
      endingPosition: { x: settings.endingPositionX, y: settings.endingPositionY },
      numberOfBlockings: settings.numberOfBlockings,
      movingObject: [{ x: settings.startingPositionX, y: settings.startingPositionY }],
      blockingObjects: [],
    }))
    setMoveCount(0)
  }

  const nextMove = () => {
    if (!isComplete) {
      setMoveCount((prevState) => prevState + 1);
      let path: Position[] | null = findShortestPath();
      if (path && path.length > 1) { // Check if a valid path exists
        let nextPosition = path[1];
        movingObject.current.push(path[1]);
        blockingObject.current = addBlockers();
      } else {
        setMatrixState((prevState) => ({
          ...prevState,
          numberOfBlockings: prevState.numberOfBlockings - 1,
        }));
        blockingObject.current = addBlockers();
      }
    }
  };
  
  const complete = async () => {
    while(!isSamePosition(movingObject.current[movingObject.current.length-1], matrixState.endingPosition)){
      nextMove();

      await new Promise((resolve,reject) => {
        setTimeout(() => {
          resolve(true);
        },10)
      }) 
    }
  };

  useEffect(() => {
    generateMatrix();
  }, [matrixState])

  const findShortestPath = (): Position[] | null => {
    const rows = matrixState.rows;
    const columns = matrixState.columns;

    const isValidPosition = (pos: Position): boolean => {
      const { x, y } = pos;
      return x >= 0 && x < rows && y >= 0 && y < columns;
    };

    const isBlocked = (pos: Position): boolean => {
      return blockingObject.current.some((b) => isSamePosition(pos, b)) || movingObject.current.some((m) => isSamePosition(pos, m));
    };

    const getNeighbors = (pos: Position): Position[] => {
      const neighbors: Position[] = [];
      const { x, y } = pos;

      const dx = [-1, 0, 1, 0];
      const dy = [0, 1, 0, -1];

      for (let i = 0; i < 4; i++) {
        const newX = x + dx[i];
        const newY = y + dy[i];
        const neighborPos: Position = { x: newX, y: newY };

        if (isValidPosition(neighborPos) && !isBlocked(neighborPos)) {
          neighbors.push(neighborPos);
        }
      }

      return neighbors;
    };

    const queue: Position[] = [movingObject.current[movingObject.current.length - 1]];
    const visited: Set<string> = new Set();
    const cameFrom: Map<string, Position> = new Map();

    visited.add(`${movingObject.current[movingObject.current.length - 1].x}-${movingObject.current[movingObject.current.length - 1].y}`);

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.x === matrixState.endingPosition.x && current.y === matrixState.endingPosition.y) {
        // Reconstruct the path
        const path: Position[] = [];
        let currPos: Position | undefined = current;
        while (currPos) {
          path.unshift(currPos);
          currPos = cameFrom.get(`${currPos.x}-${currPos.y}`);
        }
        return path;
      }

      const neighbors = getNeighbors(current);
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x}-${neighbor.y}`;
        if (!visited.has(neighborKey)) {
          visited.add(neighborKey);
          queue.push(neighbor);
          cameFrom.set(neighborKey, current);
        }
      }
    }
    // No path found
    return null;
  };

  return (
    <div className="App">
      <div className='table'>
        <table>
          <thead>
            <td></td>
            {Array.from({ length: matrixState.columns }, (_, index) => (
              <td key={index} className='cell'>{index}</td>
            ))}
          </thead>
          <tbody>
            {matrix.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className='cell'>{rowIndex}</td>
                {row.map((cell, cellIndex) => {

                  const currentCell: Position = { x: cellIndex, y: rowIndex };

                  const isBlockingObject = blockingObject.current.some((obj) =>
                    isSamePosition(obj, currentCell)
                  );
                  const isMovingObject = movingObject.current.some((obj) =>
                    isSamePosition(obj, currentCell)
                  );

                  const cellClassName = `cell border 
                  ${isBlockingObject ? 'red' : ''} ${isMovingObject ? 'green' : ''}`;

                  return (
                    <td key={cellIndex} className={cellClassName}>
                      {isSamePosition(currentCell, matrixState.startingPosition) && <span>start</span>}
                      {isSamePosition(currentCell, matrixState.endingPosition) && <span>end</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="options">
        <label>
          <p>Rows:</p>
          <input
            type="number"
            name="rows"
            value={settings.rows}
            onChange={handleInputChange}
          />
        </label>
        <label>
          <p>Columns:</p>
          <input
            type="number"
            name="columns"
            value={settings.columns}
            onChange={handleInputChange}
          />
        </label>
        <label>
          <p>Starting Position:</p>
          x:
          <input
            type="number"
            name="startingPositionY"
            value={settings.startingPositionY}
            onChange={handleInputChange}
          />
          y:
          <input
            type="number"
            name="startingPositionX"
            value={settings.startingPositionX}
            onChange={handleInputChange}
          />

        </label>
        <label>
          <p>Ending Position:</p>
          x:
          <input
            type="number"
            name="endingPositionY"
            value={settings.endingPositionY}
            onChange={handleInputChange}
          />
          y:
          <input
            type="number"
            name="endingPositionX"
            value={settings.endingPositionX}
            onChange={handleInputChange}
          />
        </label>
        <label>
          <p>Number of blocking Objects:</p>
          <input
            type="number"
            name="numberOfBlockings"
            value={settings.numberOfBlockings}
            onChange={handleInputChange}
          />
        </label>
        <button onClick={applySettings}>Apply settings</button>
      </div>
      <div className='controls'>
        <button>{'<'}</button>
        <button onClick={nextMove}>{'>'}</button>
        <button onClick={complete}>Complete</button>
        {moveCount} <br />
        {matrixState.numberOfBlockings} <br/>
      </div>
    </div>
  );
}

export default App;
