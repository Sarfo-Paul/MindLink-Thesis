import React from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

interface Props {
  question: {
    text: string;
    fontColor: string;
    isCorrect: boolean;
  };
  onAnswer: (isUserCorrect: boolean) => void;
}

export const QuestionCard: React.FC<Props> = ({ question, onAnswer }) => {

  return (
    <div className="text-center mt-20">
      {/* Question */}
      <div
        className="text-6xl font-extrabold mb-28 transition-all duration-300"
        style={{ color: question.fontColor }}
      >
        {question.text.toUpperCase()}
      </div>

      {/* Answer Buttons */}
      <div className="flex justify-center gap-8">
        <button
          onClick={() => onAnswer(true)}
          className="flex justify-center items-center gap-2 w-[8rem] h-[5rem] px-8 py-4 rounded-xl text-white bg-slate-500 hover:bg-slate-600 hover:scale-105 transition-all duration-200 text-lg font-semibold"
        >
          <FaCheckCircle size={50} />
        </button>

        <button
          onClick={() => onAnswer(false)}
          className="flex justify-center items-center gap-2 w-[8rem] h-[5rem] px-8 py-4 rounded-xl text-white bg-slate-500 hover:bg-slate-600 hover:scale-105 transition-all duration-200 text-lg font-semibold"
        >
          <FaTimesCircle size={50} />
        </button>
      </div>
    </div>
  );
};
