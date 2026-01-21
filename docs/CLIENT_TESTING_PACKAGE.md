# Learning Navigator - Client Testing Package

**Application URL:** https://main.d1disyogbqgwn4.amplifyapp.com

**Testing Period:** January 2026
**Version:** Production Release v1.0
**AWS Region:** US West (Oregon) - us-west-2

---

## 🎯 Executive Summary

The Learning Navigator is a production-ready AI-powered chatbot designed for the Mental Health First Aid (MHFA) Learning Ecosystem. It provides intelligent, context-aware responses to instructors, learners, and staff while maintaining a comprehensive knowledge base of MHFA training resources.

### Key Capabilities
- **AI-Powered Responses** - AWS Bedrock with Claude 3.5 Sonnet for accurate, contextual answers
- **Real-Time Chat** - WebSocket-based streaming responses with live citations
- **Multilingual Support** - Seamless English/Spanish language switching
- **Role-Based Personalization** - Customized content for Instructors, Staff, and Learners
- **Admin Portal** - Document management, analytics, and user oversight
- **Guest Access** - No login required for public chatbot usage

---

## 🚀 Quick Start Guide

### For End Users (Chat Interface)

1. **Access the Application**
   - Navigate to: https://main.d1disyogbqgwn4.amplifyapp.com
   - No login required - start chatting immediately

2. **Select Your Language**
   - Click the **globe icon** in the header
   - Choose English or Spanish
   - UI updates instantly

3. **Choose Your Role (Optional)**
   - Click the **profile icon** in the header
   - Select: Instructor, Staff, or Learner
   - View personalized recommendations and quick actions

4. **Start Asking Questions**
   - Type your question in the chat input
   - Click **Send** or press Enter
   - Receive real-time streaming responses with citations

5. **Use Quick Actions**
   - After selecting a role, click any suggested query chip
   - Pre-written questions provide instant assistance
   - 36+ curated queries across all roles

### For Administrators (Admin Portal)

1. **Access Admin Portal**
   - Click the **"Admin"** tab in the main navigation
   - You'll be redirected to the admin login page

2. **Login Credentials**
   - **Note:** Admin credentials should be provided separately via secure channel
   - Contact: [Your admin email]

3. **Admin Features Available:**
   - **Dashboard** - Analytics and sentiment analysis
   - **Document Management** - Upload/manage knowledge base PDFs
   - **Conversation Logs** - Review chat transcripts with scores
   - **Escalated Queries** - Handle questions requiring expert attention

---

## 📋 Testing Checklist

### User Experience Testing

- [ ] **Language Toggle**
  - Switch between English and Spanish
  - Verify all UI elements update correctly
  - Test with different browsers

- [ ] **Role Selection**
  - Select each role (Instructor, Staff, Learner)
  - Verify personalized recommendations appear
  - Test quick action query chips

- [ ] **Chat Functionality**
  - Send various questions about MHFA training
  - Verify real-time streaming responses
  - Check citation links appear and are clickable
  - Test with long and short queries

- [ ] **Accessibility**
  - Test keyboard navigation (Tab, Enter, Escape)
  - Verify screen reader compatibility
  - Check color contrast and text sizing
  - Test with assistive technologies

### Performance Testing

- [ ] **Response Time**
  - First query: Expect 15-25 seconds (Knowledge Base search)
  - Subsequent similar queries: Should be faster
  - Streaming: Text should appear progressively

- [ ] **Browser Compatibility**
  - Chrome, Firefox, Safari, Edge
  - Desktop and mobile devices
  - Different screen sizes and resolutions

### Admin Portal Testing

- [ ] **Authentication**
  - Login with provided credentials
  - Verify secure access to admin features
  - Test logout functionality

- [ ] **Document Management**
  - Upload a test PDF (< 10MB)
  - Verify successful upload confirmation
  - Check knowledge base sync status

- [ ] **Analytics Dashboard**
  - View conversation metrics
  - Review sentiment analysis scores
  - Export analytics data if needed

- [ ] **Conversation Logs**
  - Browse recent chat sessions
  - Filter by date, role, or sentiment
  - View detailed transcripts

---

## 🎨 Key Features to Test

### 1. Personalized Recommendations
**What to Test:**
- Click profile icon → Select "Instructor"
- Verify 4 quick action cards appear
- Click sample queries and observe responses
- Switch roles and see content change

**Expected Behavior:**
- Instant role-based content display
- 12 quick actions total (4 per role)
- Suggested topics and recent updates per role
- Smooth transitions between roles

### 2. Multilingual Support
**What to Test:**
- Click globe icon → Switch to Spanish
- Verify entire UI updates (header, buttons, placeholders)
- Send a question in Spanish
- Switch back to English

**Expected Behavior:**
- One-click language switching
- All UI elements translate immediately
- Chat responses adapt to selected language
- Preferences saved in browser

### 3. Real-Time Streaming
**What to Test:**
- Ask: "What is Mental Health First Aid?"
- Watch for progressive text display
- Observe citations appear at the end
- Check for smooth scrolling

**Expected Behavior:**
- Text streams word-by-word or phrase-by-phrase
- No lag or buffering
- Citations load with response
- Clean, readable formatting

### 4. AI Sentiment Analysis
**Admin Portal - What to Test:**
- Navigate to Dashboard
- View sentiment distribution chart
- Click on individual conversations
- Review quality scores (0-100)

**Expected Behavior:**
- Real-time sentiment scoring
- Categorical ratings (Excellent, Good, etc.)
- Detailed breakdowns by evaluation factor
- Visual charts and graphs

---

## 🐛 Known Issues / Limitations

### Response Time
- **First-time queries** require 15-25 seconds due to Knowledge Base vector search
- This is expected behavior for AWS Bedrock Agent with RAG
- Subsequent similar queries may be faster

### Browser Compatibility
- **Safari iOS**: Speech recognition feature requires HTTPS
- **Internet Explorer**: Not supported (use modern browsers)

### File Upload
- **Max file size**: 10MB per PDF
- **Supported formats**: PDF only
- **Sync time**: 2-5 minutes after upload for KB ingestion

---

## 📞 Support & Feedback

### Reporting Issues
When reporting bugs or issues, please include:
1. **Browser & Version** (e.g., Chrome 120.0)
2. **Device Type** (Desktop, Mobile, Tablet)
3. **Steps to Reproduce** (What did you do?)
4. **Expected vs Actual Behavior**
5. **Screenshots** (if applicable)

### Contact Information
- **Technical Support**: [Your email]
- **Admin Access Requests**: [Your email]
- **Feature Requests**: [Your email]

### Feedback Form
Please provide feedback on:
- User experience and interface design
- Response accuracy and relevance
- Performance and speed
- Missing features or improvements
- Accessibility and usability

---

## 📚 Additional Documentation

For detailed technical information, refer to:

1. **[HIGH_LEVEL_DESIGN.md](HIGH_LEVEL_DESIGN.md)** - System architecture overview
2. **[USER_WORKFLOWS.md](USER_WORKFLOWS.md)** - Step-by-step user interaction flows
3. **[ADMIN_WORKFLOWS.md](ADMIN_WORKFLOWS.md)** - Admin portal operation guides
4. **[PERSONALIZED_RECOMMENDATIONS_GUIDE.md](features/PERSONALIZED_RECOMMENDATIONS_GUIDE.md)** - Role-based features
5. **[ADMIN_FEATURES.md](features/ADMIN_FEATURES.md)** - Admin capabilities reference
6. **[Main README.md](../README.md)** - Complete project overview

---

## ✅ Testing Timeline

**Suggested Testing Schedule:**

- **Week 1**: User experience testing (chat, language, roles)
- **Week 2**: Admin portal testing (upload, analytics, logs)
- **Week 3**: Performance and accessibility testing
- **Week 4**: Final feedback compilation and review

---

**Last Updated:** January 21, 2026
**Prepared By:** Development Team
**Status:** Ready for Client Testing
