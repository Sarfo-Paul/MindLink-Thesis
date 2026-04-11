import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { apiUrl } from "../../config/api";
import type { MoodType } from "../../types";
import { RiskAlertModal } from "./RiskAlertModal";

interface MoodCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMoodRecorded: (mood: MoodType) => void;
}

type Step = "mood" | "sleep" | "stress" | "energy" | "social" | "done";
const steps: Step[] = ["mood", "sleep", "stress", "energy", "social", "done"];

const scaleOptions = [
  { value: 1, label: "Awful" },
  { value: 2, label: "Poor" },
  { value: 3, label: "Okay" },
  { value: 4, label: "Good" },
  { value: 5, label: "Great" },
];

const boolOptions = [
  { value: 1, label: "No, isolated" },
  { value: 5, label: "Yes, connected" },
];

export function MoodCheckInModal({
  isOpen,
  onClose,
  onMoodRecorded,
}: MoodCheckInModalProps) {
  const { user } = useSelector((state: RootState) => state.auth!);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultAssessment, setResultAssessment] = useState<any>(null);
  const [showRiskAlert, setShowRiskAlert] = useState(false);
  const [formData, setFormData] = useState({
    mood: 3,
    sleep: 3,
    stress: 3,
    energy: 3,
    social: 3,
  });

  if (!isOpen) return null;
  const currentStep = steps[currentStepIndex];

  const handleNext = async (val: number) => {
    const updatedData = { ...formData, [currentStep]: val };
    setFormData(updatedData);

    if (currentStepIndex === steps.length - 2) {
      setIsSubmitting(true);
      setCurrentStepIndex(currentStepIndex + 1);
      try {
        const response = await axios.post(
          apiUrl("/api/checkins"),
          {
            userId: user?.userId,
            ...updatedData,
            source: "WEB",
          },
        );
        const assessment = response.data.assessment;
        setResultAssessment(assessment);
        const m = updatedData.mood > 3 ? "happy" : "stressed";
        onMoodRecorded(m as MoodType);
        // Trigger risk alert if score warrants escalation
        if (
          assessment?.riskLevel === "RED" ||
          assessment?.riskLevel === "YELLOW"
        ) {
          setTimeout(() => setShowRiskAlert(true), 1200);
        }
      } catch (err) {
        console.error("Failed to submit check-in", err);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleClose = () => {
    setCurrentStepIndex(0);
    setResultAssessment(null);
    setShowRiskAlert(false);
    onClose();
  };

  const renderQuestion = () => {
    let title = "";
    let options = scaleOptions;
    switch (currentStep) {
      case "mood":
        title = "How are you feeling right now?";
        break;
      case "sleep":
        title = "How well did you sleep last night?";
        break;
      case "stress":
        title = "What's your stress level today?";
        break;
      case "energy":
        title = "How is your energy level?";
        break;
      case "social":
        title = "Did you meaningfully connect with anyone today?";
        options = boolOptions;
        break;
      default:
        return null;
    }

    return (
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center w-full"
      >
        <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-3">
          Step {currentStepIndex + 1} of 5
        </span>
        <div className="w-full bg-gray-200 rounded-full h-1 mb-6">
          <div
            className="bg-purple-600 h-1 rounded-full transition-all duration-500"
            style={{ width: `${(currentStepIndex / 5) * 100}%` }}
          />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-8">
          {title}
        </h2>
        <div className="flex gap-3 w-full flex-wrap justify-center">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleNext(opt.value)}
              className="px-6 py-3 flex-1 min-w-[100px] max-w-[150px] bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-xl transition-all duration-200 hover:scale-105 text-center"
            >
              <div className="font-bold text-xl text-gray-700">{opt.value}</div>
              <div className="text-xs font-medium text-gray-400 mt-0.5">
                {opt.label}
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderDone = () => (
    <motion.div
      key="done"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center text-center w-full"
    >
      {isSubmitting ? (
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4" />
      ) : (
        <>
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Check-in complete!
          </h2>
          {resultAssessment?.riskLevel === "RED" ||
          resultAssessment?.riskLevel === "YELLOW" ? (
            <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
              We noticed things have been tough lately. Our support team is here
              for you. Would you like to speak with someone?
            </p>
          ) : (
            <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
              Thank you for checking in. Tracking your wellbeing consistently
              helps build your baseline.
            </p>
          )}
          {resultAssessment && (
            <div
              className={`text-xs font-semibold px-3 py-1.5 rounded-full mb-6 ${
                resultAssessment.riskLevel === "RED"
                  ? "bg-red-100 text-red-700"
                  : resultAssessment.riskLevel === "YELLOW"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
              }`}
            >
              Wellbeing Score: {Math.round(resultAssessment.dailyScore)} —{" "}
              {resultAssessment.riskLevel}
            </div>
          )}
          <button
            onClick={handleClose}
            className="px-6 py-2.5 bg-purple-600 text-white rounded-full font-semibold text-sm hover:bg-purple-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </>
      )}
    </motion.div>
  );

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-lg bg-white shadow-2xl rounded-2xl p-8 md:p-10"
        >
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="min-h-[260px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {currentStep === "done" ? renderDone() : renderQuestion()}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Risk Alert — renders on top when triggered */}
      <RiskAlertModal
        isOpen={showRiskAlert}
        onClose={() => setShowRiskAlert(false)}
        onCloseParent={onClose}
        riskLevel={resultAssessment?.riskLevel as "RED" | "YELLOW"}
        score={resultAssessment?.dailyScore || 0}
      />
    </>
  );
}
