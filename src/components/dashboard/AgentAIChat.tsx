import { useNavigate } from "react-router-dom";
import { ChatIcon } from "../icons";

export function AgentAIChat() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/chat");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
      aria-label="Open Agent AI Assistant"
    >
      <ChatIcon className="w-5 h-5 sm:w-6 sm:h-6" />
    </button>
  );
}

