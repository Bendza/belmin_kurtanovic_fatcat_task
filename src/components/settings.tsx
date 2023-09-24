import React, { useState } from 'react'
import { Position } from '../utils'

interface SettingsProps {
  applySettings: (
    rows: number,
    columns: number,
    startingPosition: Position,
    endingPosition: Position,
    numberOfBlockings: number,
    animations: boolean,
  ) => void
  reset: () => void
  selectedAlgorithm: string;
  setSelectedAlgorithm: (algorithm: string) => void;
}

const SettingsComponent: React.FC<SettingsProps> = ({ applySettings, reset }) => {
  const [rows, setRows] = useState(20)
  const [columns, setColumns] = useState(20)
  const [startingPositionX, setStartingPositionX] = useState(0)
  const [startingPositionY, setStartingPositionY] = useState(0)
  const [endingPositionX, setEndingPositionX] = useState(16)
  const [endingPositionY, setEndingPositionY] = useState(16)
  const [numberOfBlockings, setNumberOfBlockings] = useState(200)
  const [animations, setAnimations] = useState(true)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('BFS')

  //handles changes from inputs and sets them in state
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target

    const intValue = parseInt(value)
    if (!isNaN(intValue)) {
      switch (name) {
        case 'rows':
          setRows(intValue)
          break
        case 'columns':
          setColumns(intValue)
          break
        case 'startingPositionX':
          setStartingPositionX(intValue)
          break
        case 'startingPositionY':
          setStartingPositionY(intValue)
          break
        case 'endingPositionX':
          setEndingPositionX(intValue)
          break
        case 'endingPositionY':
          setEndingPositionY(intValue)
          break
        case 'numberOfBlockings':
          setNumberOfBlockings(intValue)
          break
        default:
          break
      }
    }
  }

  //handles changes for animations checkbox
  const handleToggleAnimations = () => {
    setAnimations((prevValue) => !prevValue)
  }

  //callback for applyingSettings in app.tsx
  const handleApplySettings = () => {
    applySettings(
      rows,
      columns,
      { x: startingPositionX, y: startingPositionY },
      { x: endingPositionX, y: endingPositionY },
      numberOfBlockings,
      animations,
    )
  }

  //callback for reset in app.tsx
  const handleReset = () => {
    reset()
    setRows(rows)
    setColumns(columns)
    setStartingPositionX(startingPositionX)
    setStartingPositionY(startingPositionY)
    setEndingPositionX(endingPositionX)
    setEndingPositionY(endingPositionY)
    setNumberOfBlockings(numberOfBlockings)
    setAnimations(true)
  }

  return (
    <div className='settings'>
      <p className='header'>Settings:</p>
      <label>
        <p>Rows:</p>
        <input type='number' name='rows' value={rows} onChange={handleInputChange} />
      </label>
      <label>
        <p>Columns:</p>
        <input type='number' name='columns' value={columns} onChange={handleInputChange} />
      </label>
      <label>
        <p>Starting Position:</p>
        x:
        <input type='number' name='startingPositionY' value={startingPositionY} onChange={handleInputChange} />
        y:
        <input type='number' name='startingPositionX' value={startingPositionX} onChange={handleInputChange} />
      </label>
      <label>
        <p>Ending Position:</p>
        x:
        <input type='number' name='endingPositionY' value={endingPositionY} onChange={handleInputChange} />
        y:
        <input type='number' name='endingPositionX' value={endingPositionX} onChange={handleInputChange} />
      </label>
      <label>
        <p>Number of Blockings:</p>
        <input type='number' name='numberOfBlockings' value={numberOfBlockings} onChange={handleInputChange} />
      </label>
      <label>
        <p>Animations (don't forget to apply settings after change):</p>
        <input type='checkbox' checked={animations} onChange={handleToggleAnimations} />
      </label>
      <button onClick={handleApplySettings}>Apply settings</button>
      <button onClick={handleReset}>Reset to default</button>
      <p className='header'>Algorithm:</p>
      <div className='algorithms'>
        <button className={`algo-button ${selectedAlgorithm === 'BFS' ? 'selected' : ''}`} onClick={() => setSelectedAlgorithm('BFS')}>
          Breath first
        </button>
        <button className={`algo-button ${selectedAlgorithm === 'A*' ? 'selected' : ''}`} onClick={() => setSelectedAlgorithm('A*')}>
          A*
        </button>
        <button className={`algo-button ${selectedAlgorithm === "Dijkstra" ? 'selected' : ''}`} onClick={() => setSelectedAlgorithm("Dijkstra")}>
          Dijkstra's
        </button>
      </div>
    </div>
  )
}

export default SettingsComponent
