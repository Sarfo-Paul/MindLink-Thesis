import React from 'react'
import { type Card } from "../../../../types/game/guessWhatTypes";
import ClickableCard from '../components/ClickableCard';
import UnclickableCard from '../components/UnclickableCard';

interface Screen2Props {
  currentImagesToFind: string[]
  cards: Card[]
}

const Screen2: React.FC<Screen2Props> = ({ currentImagesToFind, cards }) => {
  return (
    <div className="flex flex-col justify-center items-center m-0 p-2">
      <div className="flex h-[6rem] justify-center items-center space-x-3 mt-2">
        {currentImagesToFind.map((image, index) => (
          <UnclickableCard key={index} image={image} />
        ))}
      </div>

      <p className="flex justify-center items-center mt-4 text-lg text-center font-semibold">
        Select the cards that match the images above
      </p>

      <div className="grid grid-cols-3 grid-rows-3 p-2 gap-5 mt-2 max-w-md">
        {cards.map((card, index) => (
          <ClickableCard index={index} key={card.id} id={card.id} image={card.image} matched={card.matched} />
        ))}
      </div>
    </div>
  )
}

export default Screen2;