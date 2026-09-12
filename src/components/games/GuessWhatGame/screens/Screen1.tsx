import React from "react";
import { type RootState } from "../../../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { setTimeLeft, revealCards, setLevelStartTime } from "../../../../redux/slices/games-slice/guessWhat";
import UnclickableCard from "../components/UnclickableCard";
import { type Card } from "../../../../types/game/guessWhatTypes";
import MemorizationPhaseTimer from "../components/MemorizationTimer";

interface Screen1Props {
    imagesToMemorize: Card[]
}

const Screen1: React.FC<Screen1Props> = ({ imagesToMemorize }) => {
    const dispatch = useDispatch();
    // const timeLeft = useSelector((state: RootState) => state.guessWhat.gameState?.timeLeft || 0);
    const isPaused = useSelector((state: RootState) => state.guessWhat.isPaused || false);
    const memorizationTime = useSelector((state: RootState) => state.guessWhat.gameState?.memorizationTime || 20000);

    const totalTime = Math.floor(memorizationTime / 1000);

    return (
        <div className="flex flex-col justify-center items-center m-0 p-5 w-full">
            <div className="flex text-[#EADEB8] justify-center items-center">
                <MemorizationPhaseTimer
                    initialTime={totalTime}
                    isPaused={isPaused}
                    onTick={(remaining) => dispatch(setTimeLeft(remaining))}
                    onComplete={() => {
                        dispatch(setLevelStartTime(Date.now()));
                        dispatch(revealCards());
                    }}
                />
            </div>

            <p className="flex justify-center items-center mt-4 text-lg font-semibold">
                Memorize these images and their positions
            </p>

            <div className="grid grid-cols-3 grid-rows-3 p-2 gap-5 mt-2 max-w-md">
                {imagesToMemorize.map((card) => (
                <UnclickableCard key={card.id} image={card.image} />
                ))}
            </div>
        </div>
    );
};

export default Screen1
