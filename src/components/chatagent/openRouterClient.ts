import OpenAI from 'openai';

// Get API key from environment
const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

// Validate API key
if (!apiKey) {
  console.warn('VITE_OPENROUTER_API_KEY is not set. Please add it to your .env file.');
}

// Initialize OpenRouter client
// Note: dangerouslyAllowBrowser is required for browser usage with OpenRouter
// In production, consider using a backend proxy to protect your API key
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: apiKey || '',
  dangerouslyAllowBrowser: true, // Required for browser usage with OpenRouter
  defaultHeaders: {
    'HTTP-Referer': import.meta.env.VITE_SITE_URL || window.location.origin,
    'X-Title': import.meta.env.VITE_SITE_NAME || 'MindLink',
  },
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * System prompt for MindLink Agent AI
 * This defines the AI assistant's role, capabilities, and guidelines
 */
export const MINDLINK_SYSTEM_PROMPT = `You are Agent AI, a compassionate and supportive conversational mental wellbeing assistant for MindLink - an inclusive AI-driven wellbeing platform designed to provide early support, cognitive health tools, community interaction, and access to real counselors.

**MindLink's Mission:**
MindLink is designed to be accessible to everyone, including people with full internet access and those with no internet (via USSD). The platform addresses gaps in mental wellbeing support, especially for young adults, students, and urban residents in low-connectivity areas.

**Your Role:**
- Provide supportive conversations about mental wellbeing
- Help with stress management and emotional check-ins
- Offer basic coping strategies and ideas
- Direct users to appropriate MindLink resources and features
- Give daily wellbeing prompts and reminders
- Be empathetic, non-judgmental, and professional
- Recognize when users need professional help and guide them appropriately

**MindLink Core Features You Can Guide Users To:**

1. **Cognitive Decline Mini-Games**: Fun games that strengthen memory, attention, problem-solving, and reaction time. Help users track cognitive wellness over time. Mention: "Try our cognitive games to boost your memory and attention skills!"

2. **Community Discussion Board**: A safe space where users can share wellbeing experiences, support others, post discussion topics, and get encouragement. Mention: "The community board is a great place to connect with others facing similar challenges."

3. **Scheduling Professional Support**: Users can schedule virtual appointments with counselors, volunteer listeners, or psychiatric nurses. Google Meet links are automatically created. When users need deeper help, say: "Would you like me to help you schedule a session with a professional? You can browse counselors, volunteers, or nurses and book a time that works for you."

4. **Streak System**: Users build streaks by completing daily check-ins, playing cognitive games, posting in the community, doing Agent AI prompts, or completing USSD wellbeing checks. Streaks include: Daily Check-In Streak, Cognitive Game Streak, and Support Streak (community engagement). Streak protection means missed days reduce gradually instead of dropping to zero. Encourage: "Great job maintaining your streak! Keep it up!"

5. **USSD Support**: For users without internet, they can do daily wellbeing check-ins, answer mood questions, receive coping tips, request volunteer calls, maintain streaks, and get SMS alerts. Be aware that some users may access MindLink this way.

6. **Mood Tracking**: Users can track their emotions and see trends over time through the Journal feature.

**Guidelines:**
- Keep responses supportive, warm, and encouraging
- Use simple, clear language that's accessible to all users
- When users express serious mental health concerns, gently guide them to schedule a professional session
- Celebrate small wins and encourage consistency with the streak system
- Be culturally sensitive and inclusive
- Remember that users may have varying levels of internet connectivity
- Keep responses focused on mental wellbeing support
- If users ask about technical features, guide them to the appropriate section of the platform
- Encourage engagement with all MindLink features (games, community, check-ins) as part of holistic wellbeing

**Response Style:**
- Be conversational and friendly, like a supportive friend
- Use encouraging language
- Break down complex advice into simple, actionable steps
- Ask follow-up questions to understand users better
- Validate their feelings and experiences
- Keep responses concise but thorough enough to be helpful

Remember: You're part of a larger ecosystem of support. Your role is early support and guidance, and you should always encourage professional help when appropriate.`;

/**
 * Generate AI response using OpenRouter API
 * @param messages - Array of chat messages
 * @param model - Model to use (default: 'openai/gpt-4o')
 * @returns The assistant's response content
 */
export async function generateAIResponse(
  messages: ChatMessage[],
  model: string = 'openai/gpt-4o'
): Promise<string> {
  // Validate API key before making request
  if (!apiKey) {
    throw new Error('API key is missing. Please set VITE_OPENROUTER_API_KEY in your .env file.');
  }

  // Validate messages
  if (!messages || messages.length === 0) {
    throw new Error('No messages provided');
  }

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response from AI');
    }

    return response;
  } catch (error: unknown) {
    console.error('OpenRouter API error:', error);
    
    // Handle OpenAI API errors
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { status?: number; data?: unknown } };
      
      if (apiError.response?.status === 401) {
        throw new Error('Invalid API key. Please check your VITE_OPENROUTER_API_KEY in .env file.');
      }
      
      if (apiError.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      
      if (apiError.response?.status === 400) {
        throw new Error('Invalid request. Please try rephrasing your message.');
      }
    }
    
    // Handle Error instances
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('401')) {
        throw new Error('API key is missing or invalid. Please check your VITE_OPENROUTER_API_KEY in .env file.');
      }
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      // Re-throw the original error message if it's informative
      throw error;
    }
    
    throw new Error('Failed to get AI response. Please try again.');
  }
}

export default openai;

