# MindLink Dashboard Planning Document

## Overview
This document maps the Mindea dashboard design (from the reference image) to the MindLink platform features, creating a comprehensive plan for the dashboard implementation.

---

## Dashboard Structure Analysis

### Reference Design Elements (from Mindea)
1. **Left Sidebar Navigation**
   - Logo/Branding
   - Navigation menu items
   - User profile/logout

2. **Main Content Area**
   - Personalized greeting with time-based message
   - Mood check-in section
   - Search functionality
   - User profile & notifications
   - Content sections (breathing exercises, sessions, recommendations)

3. **Design Aesthetics**
   - Clean, minimalist white theme
   - Purple accent color (primary)
   - Light green tags for categories/status
   - Card-based layout
   - Soft, calming color palette

---

## MindLink Feature Mapping

### 1. Navigation Sidebar Components

| Mindea Reference | MindLink Feature | Implementation Notes |
|-----------------|------------------|---------------------|
| Dashboard | Dashboard (Home) | Current view, highlighted state |
| My Session | Session Management | View active/past sessions |
| Psychologists | Professional Support | Browse counselors, volunteers, nurses |
| Calendar | Scheduling | View/manage appointments |
| Journal | Mood History | Track emotions, trends over time |
| Chat | Agent AI Chat | Conversational wellbeing assistant |
| Support | Community Board | Discussion forum access |
| Settings | Settings | User preferences, USSD settings |

**Additional MindLink Items:**
- **Cognitive Games** (new) - Access to mini-games center
- **Streak Tracker** (new) - Visual streak progress indicator

---

### 2. Main Dashboard Sections

#### A. Header Section
**Components:**
- **Personalized Greeting**
  - Time-based: "Good Morning/Afternoon/Evening, [Name]!"
  - Icon based on time of day (sun/moon)
  
- **Search Bar**
  - Placeholder: "Search anything..."
  - Search across: sessions, games, community posts, resources

- **User Profile & Notifications**
  - Profile picture/avatar
  - Notification bell with badge count
  - Quick access menu

#### B. Mood Check-In Section
**MindLink Integration:**
- **Title:** "Let's check in, [Name]. How have you been feeling this week?"
- **Subtitle:** Dynamic based on user activity
  - Example: "You logged X emotions this week - mostly [dominant emotion]"
  - Pull from mood history data
- **Action Button:** "Track mood now" (purple)
  - Opens mood tracking modal/component
  - Integrates with streak system (Daily Check-In Streak)

**Data Sources:**
- Mood history API
- Weekly emotion analytics
- Streak data

#### C. Breathing/Meditation Section
**MindLink Adaptation:**
- **Title:** "Take a moment to breathe and reconnect with yourself."
- **Content:** 
  - Video/audio resources for stress management
  - Guided breathing exercises
  - Meditation prompts from Agent AI
- **Action:** "View all" button
  - Links to full wellness resources library

**Integration Points:**
- Agent AI daily prompts
- Wellness resource database
- Can count toward streak (if used as daily activity)

#### D. Upcoming Sessions Section
**MindLink Features:**
- **Title:** "Your Upcoming Sessions"
- **Session Cards Display:**
  - Session title/topic
  - Date, time, timezone
  - Professional name & photo
  - Session type badge (Individual/Group)
  - Status badge (Confirmed/Pending/Cancelled)
  - Google Meet link integration
  - "Open details" button

**Session Types:**
- Counselor sessions
- Volunteer listener sessions
- Psychiatric nurse sessions (if available)
- Group sessions

**Data Sources:**
- Scheduling API
- Google Calendar integration
- Professional profiles

#### E. Recommendations Section
**MindLink Content Types:**
- **Cognitive Game Recommendations**
  - "Try this memory game"
  - "Challenge your attention skills"
  - Game preview images
  
- **Community Engagement**
  - "Join this discussion about [topic]"
  - Trending community posts
  
- **Agent AI Prompts**
  - "Daily wellbeing prompt: [topic]"
  - Personalized suggestions
  
- **Wellness Activities**
  - Breathing exercises
  - Mindfulness tips
  - Stress management techniques

**Card Structure:**
- Image/thumbnail
- Category tag (light green)
- Title
- Short description
- Action button ("Open details" / "Read More" / "Start")

---

## Additional MindLink-Specific Sections

### 3. Streak Progress Tracker
**Location:** Top section or dedicated sidebar widget

**Components:**
- **Visual Streak Display**
  - Fire icon or similar
  - Current streak number
  - Streak type indicators (Daily Check-In, Cognitive Game, Support)
  
- **Streak Breakdown**
  - Daily Check-In Streak: X days
  - Cognitive Game Streak: X days
  - Support Streak (Community): X days
  
- **Streak Protection Indicator**
  - Show if protection is active
  - Visual explanation of gradual reduction

- **Badges Display**
  - Recent achievements
  - Milestone badges

### 4. Cognitive Games Center
**Quick Access Widget:**
- Featured game of the day
- "Play Now" button
- Link to full games section

**Game Types:**
- Memory games
- Attention exercises
- Problem-solving challenges
- Reaction time tests

### 5. Community Board Preview
**Dashboard Widget:**
- Recent posts preview (2-3 cards)
- Trending topics
- "View all discussions" button
- Quick post creation

### 6. Agent AI Chat Window
**Options:**
- **Option A:** Embedded chat widget (bottom right corner)
- **Option B:** Dedicated section on dashboard
- **Option C:** Quick access button that opens full chat

**Features:**
- Chat history preview
- Quick prompts/suggestions
- "Start conversation" button

---

## Technical Implementation Plan

### Phase 1: Core Layout & Navigation
**Tasks:**
1. Create sidebar navigation component
2. Implement responsive layout structure
3. Set up routing (React Router)
4. Create header component (greeting, search, profile)
5. Apply base styling (Tailwind CSS)
6. Implement color scheme (purple primary, light green accents)

**Components:**
- `Sidebar.tsx`
- `Header.tsx`
- `DashboardLayout.tsx`
- `Navigation.tsx`

### Phase 2: Dashboard Sections
**Tasks:**
1. Mood check-in section
2. Breathing/meditation section
3. Upcoming sessions section
4. Recommendations section
5. Basic card components

**Components:**
- `MoodCheckIn.tsx`
- `WellnessResources.tsx`
- `UpcomingSessions.tsx`
- `Recommendations.tsx`
- `Card.tsx` (reusable)

### Phase 3: MindLink-Specific Features
**Tasks:**
1. Streak tracker component
2. Cognitive games widget
3. Community board preview
4. Agent AI chat integration

**Components:**
- `StreakTracker.tsx`
- `CognitiveGamesWidget.tsx`
- `CommunityPreview.tsx`
- `AgentAIChat.tsx` or `ChatWidget.tsx`

### Phase 4: Data Integration
**Tasks:**
1. API integration for mood history
2. Session scheduling API
3. Streak system backend
4. Community board API
5. Agent AI API integration
6. User profile API

**State Management:**
- Consider React Context or Zustand for global state
- API service layer

### Phase 5: Polish & Optimization
**Tasks:**
1. Responsive design refinement
2. Loading states
3. Error handling
4. Accessibility improvements
5. Performance optimization
6. Animation/transitions

---

## Component Hierarchy

```
App
└── DashboardLayout
    ├── Sidebar
    │   ├── Logo
    │   ├── Navigation
    │   └── UserMenu
    ├── Header
    │   ├── Greeting
    │   ├── SearchBar
    │   └── UserProfile
    └── MainContent
        ├── MoodCheckIn
        ├── WellnessResources
        ├── UpcomingSessions
        ├── Recommendations
        ├── StreakTracker
        ├── CognitiveGamesWidget
        └── CommunityPreview
```

---

## Design System

### Colors
- **Primary:** Purple (#8B5CF6 or similar)
- **Secondary:** Light Green (#10B981 or similar)
- **Background:** White/Light Gray
- **Text:** Dark Gray/Black
- **Accents:** Soft pastels

### Typography
- **Headings:** Bold, large
- **Body:** Regular, readable
- **Tags/Badges:** Small, uppercase or capitalized

### Spacing
- Consistent padding/margins
- Card spacing: 16-24px
- Section spacing: 32-48px

### Components Style
- **Cards:** Rounded corners, subtle shadows
- **Buttons:** Rounded, purple primary
- **Badges:** Rounded, colored backgrounds
- **Icons:** Consistent size, purple or gray

---

## Data Models (Preliminary)

### User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  timezone: string;
  ussdEnabled: boolean;
}
```

### Mood Entry
```typescript
interface MoodEntry {
  id: string;
  userId: string;
  emotion: string;
  intensity: number;
  timestamp: Date;
  notes?: string;
}
```

### Session
```typescript
interface Session {
  id: string;
  title: string;
  type: 'individual' | 'group';
  professional: {
    id: string;
    name: string;
    role: 'counselor' | 'volunteer' | 'nurse';
    avatar?: string;
  };
  dateTime: Date;
  timezone: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  meetLink?: string;
}
```

### Streak
```typescript
interface Streak {
  userId: string;
  dailyCheckIn: number;
  cognitiveGame: number;
  support: number;
  lastUpdated: Date;
  protectionActive: boolean;
}
```

### Recommendation
```typescript
interface Recommendation {
  id: string;
  type: 'game' | 'community' | 'wellness' | 'ai_prompt';
  title: string;
  description: string;
  image?: string;
  category: string;
  actionUrl: string;
}
```

---

## API Endpoints (To Be Defined)

### Mood & Wellbeing
- `GET /api/mood/history` - Get mood history
- `POST /api/mood/checkin` - Submit mood check-in
- `GET /api/mood/weekly-summary` - Weekly emotion summary

### Sessions
- `GET /api/sessions/upcoming` - Get upcoming sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:id` - Get session details

### Streaks
- `GET /api/streaks` - Get user streaks
- `POST /api/streaks/update` - Update streak

### Recommendations
- `GET /api/recommendations` - Get personalized recommendations

### Community
- `GET /api/community/recent` - Get recent posts
- `GET /api/community/trending` - Get trending topics

### Agent AI
- `POST /api/ai/chat` - Send message to AI
- `GET /api/ai/prompts` - Get daily prompts

---

## Responsive Design Considerations

### Mobile (< 768px)
- Collapsible sidebar (hamburger menu)
- Stacked card layout
- Simplified header
- Touch-friendly buttons

### Tablet (768px - 1024px)
- Sidebar can be collapsible
- 2-column grid for cards
- Maintain desktop features

### Desktop (> 1024px)
- Full sidebar visible
- 3-column grid for recommendations
- All features accessible

---

## Accessibility Features

1. **Keyboard Navigation**
   - Tab through all interactive elements
   - Enter/Space to activate buttons
   - Escape to close modals

2. **Screen Reader Support**
   - Semantic HTML
   - ARIA labels
   - Alt text for images

3. **Color Contrast**
   - WCAG AA compliance
   - Not relying solely on color

4. **Focus Indicators**
   - Visible focus states
   - Skip links

---

## Next Steps

1. **Review & Refine Plan**
   - Discuss with team
   - Adjust based on feedback
   - Prioritize features

2. **Set Up Project Structure**
   - Create component folders
   - Set up routing
   - Configure state management

3. **Create Design Mockups**
   - Figma/Sketch designs
   - Component library
   - Style guide

4. **Begin Implementation**
   - Start with Phase 1
   - Iterate based on testing
   - Integrate APIs as available

---

## Questions to Resolve

1. **Agent AI Chat Placement**
   - Widget vs. dedicated section?
   - Always visible or toggleable?

2. **Streak Tracker Location**
   - Top of dashboard or sidebar?
   - How detailed should it be?

3. **USSD User Experience**
   - How do USSD users access dashboard?
   - What's different for them?

4. **Real-time Updates**
   - WebSocket for notifications?
   - Polling frequency?

5. **Offline Support**
   - Service workers?
   - Cached content?

---

## Notes

- Keep design clean and calming (wellness-focused)
- Ensure fast loading times
- Prioritize user engagement through streaks
- Make it accessible for all users (including low connectivity)
- Consider progressive enhancement for USSD users

---

**Last Updated:** [Current Date]
**Status:** Planning Phase
**Next Review:** [To be scheduled]

