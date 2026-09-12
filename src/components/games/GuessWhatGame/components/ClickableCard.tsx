import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { playSound } from "../../../../utils/sound";
import { selectCardThunk } from "../../../../redux/slices/games-slice/thunks";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../../redux/store";

interface CardProps {
    index: number;
    id: number;
    image: string;
    matched: boolean;
}

const ClickableCard = ({ index, id, image, matched }: CardProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { isPaused, gameState } = useSelector((state: RootState) => state.guessWhat);
    const attempts = gameState!.attempts;
    const maxAttempts = gameState!.maxAttempts;
    const isAllSelected = gameState!.currentImagesToFind.length === 0;

    const [wrongSelection, setWrongSelection] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (matched && wrongSelection) {
        setWrongSelection(false); // Reset wrong state when card becomes matched
        }
    }, [matched, wrongSelection]);

    const handleClick = async () => {
        if (isPaused || matched || wrongSelection || isProcessing || attempts >= maxAttempts || isAllSelected) return;

        setIsProcessing(true);
        try {
        const isMatch = await dispatch(selectCardThunk(id)).unwrap();
            if (isMatch) {
                playSound("/sounds/correct2.wav");
            } else {
                playSound("/sounds/wrong2.wav");
                setWrongSelection(true);
            }
        } catch (error) {
            console.error("Error selecting card:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <motion.div
            className={`p-5 rounded-lg shadow-lg cursor-pointer flex justify-center items-center text-center text-5xl text-[#EADEB8] font-bold
            ${
            matched
                ? "bg-green-500 pointer-events-none"
                : wrongSelection
                ? "bg-red-500 pointer-events-none"
                : "bg-[#1b3848]"
            }
            ${maxAttempts === attempts ? "pointer-events-none" : ""}
        `}

        onClick={handleClick}
        initial={{ scale: 1 }}
        whileHover={{ scale: matched ? 1 : 1.03 }}
        whileTap={{ scale: matched ? 1 : 0.98 }}
        animate={wrongSelection ? { x: [0, -8, 8, -8, 8, 0] } : {}}
        transition={{ duration: 0.4 }}
        >
        {matched ? (
            <motion.img
            src={image}
            alt="Card"
            className="w-14 h-14 object-contain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            />
        ) : (
            <div className="px-4 py-2">{index + 1}</div>
        )}
        </motion.div>
    );
};

export default ClickableCard;
