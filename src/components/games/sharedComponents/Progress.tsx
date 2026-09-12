import React from 'react'

interface IProgressBar {
  value: number;
}

export const ProgressBar: React.FC<IProgressBar> = ({value}) => {
  return (
    <div className="w-full bg-gray-200 rounded-md h-3 overflow-hidden">
      <div
        className="bg-green-500 h-3 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${value}%` }}
      ></div>
    </div>
  )
}
