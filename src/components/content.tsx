// ContentComponent.tsx
import React from 'react'

interface ContentProps {
  moveCount: number
  numberOfBlockings: number
  exeTime: number
  nextMove: () => void
  complete: () => void
}

const ContentComponent: React.FC<ContentProps> = ({ moveCount, numberOfBlockings, exeTime, nextMove, complete }) => {
  return (
    <div className='content'>
      <p className='header'>Controls:</p>
      <div className='stats'>
        <p>Move: {moveCount} </p>
        <p>Blockers: {numberOfBlockings}</p>
        <p>Execution time: {exeTime} miliseconds</p>
      </div>
      <div className='controls'>
        <button onClick={nextMove}>Next move</button>
        <button onClick={complete}>Complete</button>
      </div>
    </div>
  )
}

export default ContentComponent
