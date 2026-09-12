import { SearchIcon } from "../icons";
import { getTimeBasedGreeting } from "../../utils/greeting";

interface GreetingProps {
  userName: string;
}

export function Greeting({ userName }: GreetingProps) {
  const { greeting, icon } = getTimeBasedGreeting();

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <h2 className="text-3xl font-bold text-gray-900">
          {greeting}{userName ? `, ${userName}` : ''}!
        </h2>
        {icon}
      </div>
      {/* Search Bar */}
      <div className="relative max-w-md w-full">
        <input
          type="text"
          placeholder="Search anything..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
}

