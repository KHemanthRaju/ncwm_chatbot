# Learning Navigator - Client Testing Package

**Application URL:** https://main.d1disyogbqgwn4.amplifyapp.com

**Testing Period:** January 2026
**Version:** Production Release v1.0
**AWS Region:** US West (Oregon) - us-west-2

---

## 🎯 Executive Summary

The Learning Navigator is a production-ready AI-powered chatbot designed for the Mental Health First Aid (MHFA) Learning Ecosystem. It provides intelligent, context-aware responses to instructors, learners, and staff while maintaining a comprehensive knowledge base of MHFA training resources.

### Key Capabilities
- **AI-Powered Responses** - AWS Bedrock with Claude Sonnet 4 for accurate, contextual answers
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

### Admin Portal Testing

- [ ] **Document Management**
  - Upload a test PDF (< 10MB)
  - Verify successful upload confirmation

- [ ] **Analytics Dashboard**
  - View conversation metrics
  - Review sentiment analysis scores
  - Export analytics data if needed

- [ ] **Conversation Logs**
  - Browse recent chat sessions
  - Filter by date, role, or sentiment
  - View detailed transcripts

---

## 📚 Additional Documentation

For detailed technical information, refer to:

1. **[HIGH_LEVEL_DESIGN.md](HIGH_LEVEL_DESIGN.md)** - System architecture overview
2. **[USER_WORKFLOWS.md](USER_WORKFLOWS.md)** - Step-by-step user interaction flows
3. **[ADMIN_WORKFLOWS.md](ADMIN_WORKFLOWS.md)** - Admin portal operation guides
4. **[PERSONALIZED_RECOMMENDATIONS_GUIDE.md](features/PERSONALIZED_RECOMMENDATIONS_GUIDE.md)** - Role-based features
5. **[ADMIN_FEATURES.md](features/ADMIN_FEATURES.md)** - Admin capabilities reference
6. **[Main README.md](../README.md)** - Complete project overview
