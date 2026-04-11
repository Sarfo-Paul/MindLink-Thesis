import { useState, useEffect, useRef } from "react";
import { generateAIResponse, type ChatMessage, MINDLINK_SYSTEM_PROMPT } from "../components/chatagent";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const streamingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Load chat history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("chatHistory");
    if (stored) {
      const parsed = JSON.parse(stored) as Array<Omit<Message, 'timestamp'> & { timestamp: string }>;
      const messagesWithDates = parsed.map(m => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }));
      setMessages(messagesWithDates);
    }
  }, []);

  // Auto-scroll to bottom only when messages are complete (not during streaming)
  useEffect(() => {
    if (!isLoading && !streamingMessage) {
      // Use requestAnimationFrame for smoother scroll
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      });
    }
  }, [messages, isLoading, streamingMessage]);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatHistory", JSON.stringify(messages));
    }
  }, [messages]);

  // Cleanup streaming timeout on unmount
  useEffect(() => {
    return () => {
      if (streamingTimeoutRef.current) {
        clearTimeout(streamingTimeoutRef.current);
      }
    };
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    // Generate AI response with typewriter effect
    try {
      // Convert messages to format expected by OpenRouter API
      // Include system message for context and conversation history
      const conversationMessages: ChatMessage[] = [
        {
          role: "system",
          content: MINDLINK_SYSTEM_PROMPT,
        },
        ...messages.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
        {
          role: "user",
          content: userMessage.content,
        },
      ];

      const aiResponse = await generateAIResponse(conversationMessages);
      const messageId = (Date.now() + 1).toString();
      setStreamingMessage("");
      setIsLoading(false);
      
      // Typewriter effect - no scrolling during typing for ChatGPT-like feel
      let currentIndex = 0;
      const typeSpeed = 15; // milliseconds per character
      
      const typeNextChar = () => {
        if (currentIndex < aiResponse.length) {
          setStreamingMessage(aiResponse.slice(0, currentIndex + 1));
          currentIndex++;
          streamingTimeoutRef.current = setTimeout(typeNextChar, typeSpeed);
        } else {
          // Typing complete, add to messages
          const assistantMessage: Message = {
            id: messageId,
            role: "assistant",
            content: aiResponse,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, assistantMessage]);
          setStreamingMessage("");
        }
      };
      
      typeNextChar();
    } catch (error) {
      console.error("Chat error:", error);
      
      let errorContent = "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.";
      
      if (error instanceof Error) {
        // Provide specific error messages based on error type
        if (error.message.includes('API key') || error.message.includes('missing')) {
          errorContent = "⚠️ API configuration error: Please ensure VITE_OPENROUTER_API_KEY is set in your .env file. The chat feature requires a valid OpenRouter API key to work.";
        } else if (error.message.includes('Rate limit')) {
          errorContent = "I'm receiving too many requests right now. Please wait a moment and try again.";
        } else if (error.message.includes('Network') || error.message.includes('connection')) {
          errorContent = "I'm having trouble connecting to the server. Please check your internet connection and try again.";
        } else {
          errorContent = `I apologize, but I encountered an error: ${error.message}. Please try again.`;
        }
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: errorContent,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
      setStreamingMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
    // Scroll to bottom when input is focused
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
  };

  const quickPrompts = [
    "I'm feeling anxious",
    "Help me manage stress",
    "I need support",
    "How do I track my mood?",
  ];

  const handleQuickPrompt = (prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  return (
    <div 
      className="flex flex-col bg-transparent w-full overflow-hidden" 
      style={{ 
        height: isInputFocused ? "100%" : "100vh",
        minHeight: "-webkit-fill-available",
        maxHeight: "100vh",
        position: "relative"
      }}
    >
      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-2 sm:px-4 w-full"
        style={{ 
          scrollBehavior: "smooth", 
          WebkitOverflowScrolling: "touch",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}
      >
        <div className="max-w-2xl mx-auto pt-3 sm:pt-6 pb-20 sm:pb-32 space-y-3 sm:space-y-6 w-full">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 sm:gap-4 w-full ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-[85%] sm:max-w-[85%] min-w-0">
                <div
                  className={`rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 ${
                    message.role === "user"
                      ? "bg-gray-100 text-gray-900"
                      : "bg-transparent text-gray-900"
                  }`}
                  style={{
                    boxShadow: message.role === "user" 
                      ? "0 1px 2px 0 rgba(0, 0, 0, 0.05)" 
                      : "none"
                  }}
                >
                  <div className="whitespace-pre-wrap break-words leading-relaxed text-[15px] sm:text-[15px] overflow-wrap-anywhere">
                    {message.content}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator - three dots while thinking */}
          {isLoading && !streamingMessage && (
            <div className="flex gap-2 sm:gap-4 justify-start w-full">
              <div className="max-w-[85%] sm:max-w-[85%] min-w-0">
                <div className="rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 bg-transparent text-gray-900">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Streaming message */}
          {streamingMessage && (
            <div className="flex gap-2 sm:gap-4 justify-start w-full">
              <div className="max-w-[85%] sm:max-w-[85%] min-w-0">
                <div className="rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 bg-transparent text-gray-900">
                  <div className="whitespace-pre-wrap break-words leading-relaxed text-[15px] sm:text-[15px] overflow-wrap-anywhere">
                    {streamingMessage}
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* Quick prompts (show only when no messages) */}
          {messages.length === 0 && !isLoading && (
            <div className="space-y-3 pt-4 px-2">
              <p className="text-sm text-gray-500 text-center">Try asking:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="px-3 py-2 sm:px-4 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 rounded-full text-xs sm:text-sm transition-colors touch-manipulation"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="border-t border-gray-200 bg-transparent backdrop-blur-sm safe-area-inset-bottom w-full overflow-hidden" style={{ flexShrink: 0 }}>
        <div className="w-full mx-auto px-3 sm:px-4 py-2 sm:py-3" style={{ maxWidth: "640px", boxSizing: "border-box" }}>
          <div className="relative flex items-end gap-1.5 sm:gap-2 bg-white rounded-2xl sm:rounded-2xl border border-gray-300 shadow-sm focus-within:border-gray-400 focus-within:shadow-md transition-all w-full" style={{ maxWidth: "100%", boxSizing: "border-box" }}>
            <div className="flex-1 relative min-h-[44px] flex items-center min-w-0" style={{ maxWidth: "100%" }}>
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder="Message AI..."
                className="w-full px-3 sm:px-4 py-2.5 pr-10 sm:pr-12 bg-transparent border-0 focus:outline-none resize-none text-sm text-gray-900 placeholder-gray-500 overflow-wrap-anywhere"
                rows={1}
                style={{
                  minHeight: "44px",
                  maxHeight: "200px",
                  lineHeight: "1.5",
                  width: "100%",
                  boxSizing: "border-box",
                  overflow: "hidden"
                }}
              />
            </div>
            <button
              className="mb-1.5 p-1.5 rounded-lg transition-colors flex-shrink-0 text-gray-500 hover:text-gray-700 active:bg-gray-200 touch-manipulation"
              aria-label="Voice input"
              style={{ minWidth: "28px", minHeight: "28px" }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </button>
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className={`mr-1.5 mb-1.5 p-1.5 rounded-lg transition-colors flex-shrink-0 touch-manipulation ${
                inputValue.trim() && !isLoading
                  ? "bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              style={{ minWidth: "28px", minHeight: "28px" }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1.5 text-center px-2">
            AI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
}
