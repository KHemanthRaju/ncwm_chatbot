# Learning Navigator - User Workflows

**Step-by-Step User Interaction Flows**

---

## Overview

This document provides detailed, step-by-step workflows for end users interacting with the Learning Navigator chatbot. Each workflow includes screenshots placeholders, expected behaviors, and troubleshooting tips.

---

## 🌐 Workflow 1: First-Time User Experience

### Scenario: New user accessing the Learning Navigator for the first time

**Duration:** 2-3 minutes
**User Type:** Any (Instructor, Staff, Learner, General Public)
**Login Required:** No

### Steps:

**Step 1: Access the Application**
```
Action: Navigate to https://main.d1disyogbqgwn4.amplifyapp.com
Result: Landing page loads with chat interface
```
**What You See:**
- MHFA logo in the header
- "Learning Navigator" title
- Language toggle button (globe icon)
- Profile icon for role selection
- Chat input area with placeholder text
- Example queries displayed as suggestion chips

**Expected Loading Time:** 2-3 seconds

---

**Step 2: Review the Interface**
```
Action: Observe the main components of the page
```
**Components Visible:**
1. **Header Bar:**
   - Application title: "Learning Navigator"
   - Language toggle (🌐 icon)
   - Profile/Role selector (👤 icon)
   - Admin link (if available)

2. **Chat Area:**
   - Welcome message explaining the chatbot purpose
   - About Us section with system description
   - FAQ section with common questions

3. **Input Area:**
   - Text input box with placeholder
   - Send button
   - Character counter (optional)

4. **Footer:**
   - Feedback option
   - Privacy policy link
   - Powered by AWS Bedrock badge

---

**Step 3: Read Welcome Information**
```
Action: Scroll through About Us and FAQ sections
```
**About Us Content:**
- "Your AI-powered assistant for the MHFA Learning Ecosystem"
- "Helping instructors, learners, and administrators navigate training resources"

**FAQ Items:**
- What can Learning Navigator help me with?
- How do I access MHFA Connect?
- Who can use Learning Navigator?

---

**Step 4: Try an Example Query**
```
Action: Click one of the suggested query chips (e.g., "What is Mental Health First Aid?")
Result: Query is automatically entered in the input field and sent
```
**What Happens:**
1. Query chip is clicked
2. Text appears in input field
3. Message is sent automatically
4. User message appears in chat with timestamp
5. Bot starts typing indicator appears
6. Response streams in real-time

---

**Step 5: Observe Response Streaming**
```
Action: Watch the AI response being generated
Duration: 15-25 seconds for first query
```
**Streaming Process:**
1. **Initial Status** (2-3 seconds):
   - "Searching knowledge base..." message appears

2. **Response Streaming** (10-20 seconds):
   - Text appears progressively, word-by-word or phrase-by-phrase
   - Smooth scrolling keeps latest text visible

3. **Completion**:
   - Full response displayed
   - Citations appear at the bottom
   - Timestamp shows when response completed

**Expected Response Format:**
```
[Bot response text explaining Mental Health First Aid, including:
- Definition
- Purpose
- Target audience
- Training overview]

Citations:
🔗 Source: MHFA Training Manual [Link]
🔗 Source: Instructor Guide [Link]
```

---

**Step 6: Click on Citations**
```
Action: Click a citation link
Result: Source document opens in new tab (if available) or shows document name
```

---

## 🌍 Workflow 2: Language Switching

### Scenario: User wants to switch from English to Spanish

**Duration:** 30 seconds
**User Type:** Any
**Login Required:** No

### Steps:

**Step 1: Locate Language Toggle**
```
Action: Look for globe icon (🌐) in the header
Location: Top-right corner of the screen
```

---

**Step 2: Click Language Toggle**
```
Action: Click the globe icon
Result: Language switches from English to Spanish (or vice versa)
```
**UI Changes (English → Spanish):**
- Title: "Learning Navigator" → "Navegador de Aprendizaje"
- Placeholder: "Ask about training, courses, or resources..." → "Pregunte sobre capacitación, cursos o recursos..."
- Send Button: "Send" → "Enviar"
- About Us: "About Learning Navigator" → "Acerca del Navegador de Aprendizaje"
- FAQ: "Frequently Asked Questions" → "Preguntas Frecuentes"

---

**Step 3: Verify Language Change**
```
Action: Review all UI elements
Check: All text has been translated
```
**Components to Verify:**
- Header text
- Button labels
- Placeholders
- About Us content
- FAQ questions and answers
- Suggestion chips (if role selected)

---

**Step 4: Send a Query in New Language**
```
Action: Type a question in Spanish (or English)
Example: "¿Qué es Primeros Auxilios en Salud Mental?"
Result: AI responds in the selected language
```

---

**Step 5: Switch Back (Optional)**
```
Action: Click globe icon again
Result: UI and responses return to previous language
```

**Note:** Language preference is saved in browser localStorage and persists across sessions.

---

## 👤 Workflow 3: Role Selection & Personalization

### Scenario: User wants to receive personalized recommendations based on their role

**Duration:** 1-2 minutes
**User Type:** Instructor, Staff, or Learner
**Login Required:** No

### Steps:

**Step 1: Click Profile Icon**
```
Action: Click the profile icon (👤) in the header
Result: Role selector modal/page opens
```

---

**Step 2: View Role Options**
```
Action: Review three role cards displayed
```
**Role Cards:**
1. **🎓 MHFA Instructor**
   - Description: Certified instructors who deliver training courses
   - Color: Blue theme

2. **💼 Internal Staff**
   - Description: Administrative and support staff managing training operations
   - Color: Orange theme

3. **👤 Learner**
   - Description: Individuals taking MHFA courses for certification
   - Color: Green theme

---

**Step 3: Select Your Role**
```
Action: Click on the appropriate role card
Example: Click "MHFA Instructor"
Result: Role is saved and personalized content loads
```

---

**Step 4: View Personalized Recommendations**
```
Action: Observe the updated interface
```
**New Elements Displayed:**

**Quick Actions Section (4 cards):**
- Action 1: Course Management
  - Sample queries: "How do I schedule a course?", "What materials do I need?", "How do I register participants?"

- Action 2: Certification & Compliance
  - Sample queries: "How do I renew my instructor certification?", "What are the teaching requirements?", "Where can I find the instructor policies?"

- Action 3: Training Resources
  - Sample queries: "Where can I download participant manuals?", "How do I access digital resources?", "What teaching aids are available?"

- Action 4: Support & Guidance
  - Sample queries: "How do I contact instructor support?", "What should I do if a participant has questions?", "How do I report technical issues?"

**Suggested Topics:**
- Course scheduling best practices
- Participant engagement strategies
- Certification renewal process
- Teaching material updates
- Instructor community forums

**Recent Updates:**
- New digital resource library launched
- Updated instructor guidelines available
- Upcoming webinar: Advanced facilitation techniques
- Q4 2025 course statistics released
- New MHFA Connect features for instructors

---

**Step 5: Use Quick Action Queries**
```
Action: Click one of the sample query chips
Example: Click "How do I schedule a course?"
Result: Query is sent to chatbot automatically
```

---

**Step 6: Explore Other Roles (Optional)**
```
Action: Click profile icon again and select a different role
Result: Quick actions, suggested topics, and updates change to match new role
```

**Comparison:**
- **Instructor**: Focus on teaching, certification, course management
- **Staff**: Focus on operations, reporting, administrative tools
- **Learner**: Focus on enrollment, course access, certification progress

---

## 💬 Workflow 4: Multi-Turn Conversation

### Scenario: User has follow-up questions based on initial response

**Duration:** 3-5 minutes
**User Type:** Any
**Login Required:** No

### Steps:

**Step 1: Ask Initial Question**
```
Action: Type "What courses does MHFA offer?"
Result: Bot provides overview of available courses
```

---

**Step 2: Review Response**
```
Action: Read the response carefully
Expected Content: List of MHFA courses (Adult, Youth, Teen, etc.)
```

---

**Step 3: Ask Follow-Up Question**
```
Action: Type "Tell me more about the Youth course"
Result: Bot provides detailed information about Youth MHFA
```
**AI Context Awareness:**
- Bot remembers previous conversation
- Understands "the Youth course" refers to Youth MHFA mentioned earlier
- Provides contextual, relevant information

---

**Step 4: Ask Clarifying Question**
```
Action: Type "How long is the training?"
Result: Bot provides duration specific to Youth MHFA course
```

---

**Step 5: Request Specific Information**
```
Action: Type "Where can I register?"
Result: Bot provides registration links and instructions
```

---

**Step 6: Provide Feedback (Optional)**
```
Action: Click thumbs up/down icon on any response
Result: Feedback is recorded for admin review
```

---

## 🔍 Workflow 5: Citation Navigation

### Scenario: User wants to verify information by checking source documents

**Duration:** 1-2 minutes
**User Type:** Any
**Login Required:** No

### Steps:

**Step 1: Receive Response with Citations**
```
Action: Ask a question and receive answer
Result: Response includes citation links at the bottom
```
**Citation Format:**
```
Citations:
🔗 Source: MHFA Instructor Guide (Page 42)
🔗 Source: Course Catalog 2024
🔗 Source: Training Requirements Document
```

---

**Step 2: Review Citation Details**
```
Action: Hover over citation link (desktop) or tap (mobile)
Result: Tooltip shows document name and page number
```

---

**Step 3: Click Citation Link**
```
Action: Click on a citation link
Result: One of the following:
- PDF opens in new tab (if publicly accessible)
- Download prompt for PDF file
- Message indicating document requires admin access
```

---

**Step 4: Return to Chat**
```
Action: Close document tab or return to chat window
Result: Chat conversation is preserved, can continue asking questions
```

---

## 🆘 Workflow 6: Escalation (Low Confidence Query)

### Scenario: User asks a question the AI cannot confidently answer

**Duration:** 2-3 minutes (initial), hours-days (for admin response)
**User Type:** Any
**Login Required:** No

### Steps:

**Step 1: Ask Uncommon or Complex Question**
```
Action: Type a question not well-covered in knowledge base
Example: "What is the policy for instructors who move to a different state?"
```

---

**Step 2: Receive Low-Confidence Response**
```
Result: Bot indicates it needs assistance
```
**Bot Message:**
```
I don't have complete information about this specific policy. To provide you with accurate guidance, I'd like to connect you with our support team.

Would you like to receive a detailed response via email?
[Yes, send to my email] [No, thanks]
```

---

**Step 3: Choose Escalation**
```
Action: Click "Yes, send to my email"
Result: Email input field appears
```

---

**Step 4: Enter Email Address**
```
Action: Type your email address
Example: user@example.com
Result: Email validation occurs
```

---

**Step 5: Confirm Submission**
```
Action: Click "Submit" or "Send"
Result: Confirmation message appears
```
**Confirmation Message:**
```
✓ Thank you! Your question has been forwarded to our support team.
You'll receive a detailed response at user@example.com within 1-2 business days.

Your reference number: ESC-2024-001234
```

---

**Step 6: Receive Email Response (Later)**
```
Action: Check email inbox
Result: Email from MHFA support with detailed answer
```
**Email Contents:**
- Greeting with reference number
- Detailed answer to query
- Additional resources or links
- Contact information for further questions

---

## 📱 Workflow 7: Mobile Experience

### Scenario: User accesses Learning Navigator on mobile device

**Duration:** Similar to desktop
**User Type:** Any
**Login Required:** No

### Mobile-Specific Steps:

**Step 1: Access on Mobile**
```
Action: Open browser on phone/tablet and navigate to URL
Result: Responsive mobile layout loads
```
**Mobile Layout Features:**
- Condensed header with hamburger menu (if applicable)
- Full-width chat area
- Touch-friendly buttons (minimum 44x44px)
- Optimized keyboard input
- Swipe gestures for navigation

---

**Step 2: Use Touch Interactions**
```
Actions:
- Tap to select role
- Swipe to scroll through suggestions
- Tap query chips to auto-fill
- Pinch to zoom (if needed)
```

---

**Step 3: Handle Keyboard**
```
Action: Tap input field
Result: Mobile keyboard appears, interface adjusts
```
**Expected Behavior:**
- Chat area scrolls to keep input visible
- Send button remains accessible
- No content hidden behind keyboard

---

## 🔄 Workflow 8: Session Continuity

### Scenario: User returns to app after closing/refreshing

**Duration:** 30 seconds
**User Type:** Any (with previous session)
**Login Required:** No

### Steps:

**Step 1: Return to Application**
```
Action: Open URL again (new tab, new day, etc.)
Result: Previous preferences restored
```
**Restored Settings:**
- Language preference (EN/ES)
- Role selection (Instructor/Staff/Learner)
- Theme preference (if implemented)

---

**Step 2: Continue Conversation**
```
Action: Type a new question
Result: Fresh conversation starts, previous messages not shown
```
**Note:** Chat history is not persisted client-side for privacy. Each session starts fresh. Admin can view all conversations via admin portal logs.

---

## 🎯 Workflow 9: Accessibility Navigation

### Scenario: User navigating with keyboard or screen reader

**Duration:** Variable
**User Type:** Users with disabilities
**Login Required:** No

### Keyboard Navigation:

**Step 1: Tab Through Interface**
```
Action: Press Tab key repeatedly
Result: Focus moves through interactive elements in logical order
```
**Tab Order:**
1. Language toggle button
2. Profile/role button
3. Chat input field
4. Send button
5. Suggestion chips (if visible)
6. Previous messages (if any)
7. Citation links

---

**Step 2: Activate Elements**
```
Action: Press Enter or Space on focused element
Result: Element activates (button clicks, links open)
```

---

**Step 3: Use Screen Reader**
```
Action: Navigate with NVDA/JAWS/VoiceOver
Result: All elements have proper ARIA labels and roles
```
**Screen Reader Announcements:**
- "Button: Switch to Spanish"
- "Button: Select your role"
- "Text input: Ask about training, courses, or resources"
- "Button: Send message"
- "Link: MHFA Instructor Guide citation"

---

**Step 4: Skip to Main Content**
```
Action: Press Tab from page load
Result: "Skip to main content" link appears
```
**Benefit:** Allows screen reader users to bypass navigation and jump directly to chat.

---

## 💡 Tips & Best Practices

### For Optimal Experience:

1. **Be Specific**: Ask clear, focused questions for better responses
   - Good: "How do I renew my instructor certification?"
   - Less Good: "Tell me about certifications"

2. **Use Follow-Ups**: Build on previous responses for deeper information
   - First: "What is Adult MHFA?"
   - Then: "How long is the Adult MHFA course?"

3. **Select Your Role**: Get personalized recommendations matching your needs

4. **Check Citations**: Verify information by reviewing source documents

5. **Provide Feedback**: Help improve the system by rating responses

6. **Try Both Languages**: Test English and Spanish to see full capabilities

---

## 🐛 Troubleshooting Common Issues

### Issue 1: Response Takes Long Time
**Symptom:** Waiting 20+ seconds for first response
**Cause:** Knowledge base vector search on first query
**Solution:** This is expected behavior. Subsequent queries are faster.

---

### Issue 2: Citation Link Doesn't Open
**Symptom:** Clicking citation does nothing
**Cause:** Document may require admin access or URL issue
**Solution:** Note the document name and request from admin

---

### Issue 3: Language Not Switching
**Symptom:** UI stays in same language after clicking toggle
**Cause:** Browser localStorage disabled or cache issue
**Solution:** Clear browser cache and cookies, try again

---

### Issue 4: Role Selection Not Saving
**Symptom:** Role resets after page refresh
**Cause:** Browser blocking localStorage
**Solution:** Allow cookies/storage for the site in browser settings

---

### Issue 5: Mobile Keyboard Covers Input
**Symptom:** Can't see input field when typing on mobile
**Cause:** Browser not scrolling properly
**Solution:** Scroll manually or use landscape mode

---

**Document Version:** 1.0
**Last Updated:** January 21, 2026
**Prepared For:** Client Testing
