import { SunIcon, MoonIcon } from "../components/icons";

export function getTimeBasedGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return { 
      greeting: "Good Morning", 
      icon: <SunIcon className="w-8 h-8 text-yellow-500" /> 
    };
  } else if (hour < 18) {
    return { 
      greeting: "Good Afternoon", 
      icon: <SunIcon className="w-8 h-8 text-orange-500" /> 
    };
  } else {
    return { 
      greeting: "Good Evening", 
      icon: <MoonIcon className="w-8 h-8 text-gray-700" /> 
    };
  }
}

