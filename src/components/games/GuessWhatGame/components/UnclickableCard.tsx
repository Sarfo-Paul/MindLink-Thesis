import { motion } from "framer-motion";

interface CardProps {
    image: string;
}

const UnclickableCard = ({ image}: CardProps) => {
    return (
        <motion.div
            className="p-5 rounded-lg shadow-lg cursor-pointer flex justify-center items-center text-center text-5xl text-[#EADEB8] bg-[#f6d297] font-bold"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
        >
            <motion.img
                src={image}
                alt="Card"
                className="w-16 h-16 object-contain"
            />
        </motion.div>
    );
};

export default UnclickableCard;
