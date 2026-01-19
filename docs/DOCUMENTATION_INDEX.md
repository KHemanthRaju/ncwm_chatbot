# Learning Navigator - Documentation Index

Complete index of all project documentation with descriptions and links.

---

## 📚 Quick Navigation

### For Stakeholders & Business Users
- [Simple Architecture](SIMPLE_ARCHITECTURE.md) ⭐ **Start Here** - High-level overview with simple diagrams

### For Technical Teams
- [Technical Documentation](architecture/TECHNICAL_DOCUMENTATION.md) - Complete technical reference
- [User AWS Architecture](USER_AWS_ARCHITECTURE.md) - Detailed user flow with diagrams
- [Admin AWS Architecture](ADMIN_AWS_ARCHITECTURE.md) - Detailed admin flow with diagrams

### For Operations
- [Deployment Guide](deployment/CLIENT_DEPLOYMENT_GUIDE.md) - Step-by-step deployment instructions
- [Troubleshooting Guide](TROUBLESHOOTING_FILE_UPLOAD.md) - Common issues and solutions

---

## 📖 Documentation Overview

### Architecture Documentation

| Document | Description | Audience | Diagrams |
|----------|-------------|----------|----------|
| [SIMPLE_ARCHITECTURE.md](SIMPLE_ARCHITECTURE.md) | High-level system overview with simple, easy-to-understand diagrams | Executives, PMs, Business Users | 5 simple diagrams |
| [USER_AWS_ARCHITECTURE.md](USER_AWS_ARCHITECTURE.md) | Complete user flow with detailed AWS service integration | Architects, Developers | 7 detailed diagrams |
| [ADMIN_AWS_ARCHITECTURE.md](ADMIN_AWS_ARCHITECTURE.md) | Complete admin portal flow with detailed sequences | Architects, Developers | 6 detailed diagrams |
| [AWS_ARCHITECTURE.md](AWS_ARCHITECTURE.md) | Full system architecture with all components | Technical Teams | 3 comprehensive diagrams |
| [TECHNICAL_DOCUMENTATION.md](architecture/TECHNICAL_DOCUMENTATION.md) | Complete technical reference (2100+ lines) | All Technical Roles | Architecture diagrams |

### Flow Documentation

| Document | Description | Steps | Focus |
|----------|-------------|-------|-------|
| [USER_FLOW_STEPS.md](USER_FLOW_STEPS.md) | Detailed 32-step user interaction breakdown | 32 steps | Guest chat, feedback, escalation |
| [ADMIN_FLOW_STEPS.md](ADMIN_FLOW_STEPS.md) | Detailed 39-step admin workflow breakdown | 39 steps | Auth, analytics, documents, queries |

### Feature Documentation

| Document | Description | Purpose |
|----------|-------------|---------|
| [ADMIN_FEATURES.md](features/ADMIN_FEATURES.md) | Admin portal features and capabilities | Feature reference |
| [SENTIMENT_ANALYSIS_EXPLAINED.md](features/SENTIMENT_ANALYSIS_EXPLAINED.md) | Sentiment analysis system explanation | Quality metrics |
| [PERSONALIZED_RECOMMENDATIONS_GUIDE.md](features/PERSONALIZED_RECOMMENDATIONS_GUIDE.md) | Role-based recommendations system | User personalization |
| [KB_AUTO_SYNC.md](KB_AUTO_SYNC.md) | Knowledge Base auto-sync functionality | Content management |

### Deployment & Operations

| Document | Description | Audience |
|----------|-------------|----------|
| [CLIENT_DEPLOYMENT_GUIDE.md](deployment/CLIENT_DEPLOYMENT_GUIDE.md) | Complete deployment instructions | DevOps, Developers |
| [BEDROCK_AGENT_FIX.md](deployment/BEDROCK_AGENT_FIX.md) | Bedrock agent troubleshooting | DevOps, Developers |
| [TROUBLESHOOTING_FILE_UPLOAD.md](TROUBLESHOOTING_FILE_UPLOAD.md) | File upload issues and solutions | Admins, DevOps |

### Change Documentation

| Document | Description | Purpose |
|----------|-------------|---------|
| [RENAMING_CFEVALUATOR.md](RENAMING_CFEVALUATOR.md) | Lambda function renaming guide | Migration reference |
| [RENAMING_SUMMARY.md](RENAMING_SUMMARY.md) | Complete renaming summary | Change tracking |
| [WCAG_ACCESSIBILITY_IMPROVEMENTS.md](WCAG_ACCESSIBILITY_IMPROVEMENTS.md) | Accessibility enhancements | Compliance reference |

### Architecture Deep Dives

| Document | Description | Focus Area |
|----------|-------------|------------|
| [ARCHITECTURE_DIAGRAMS.md](architecture/ARCHITECTURE_DIAGRAMS.md) | All architecture diagrams in one place | Visual reference |
| [CUSTOM_RAG_MIGRATION_PLAN.md](architecture/CUSTOM_RAG_MIGRATION_PLAN.md) | RAG implementation details | AI/ML architecture |
| [KAFKA_STREAMING_ARCHITECTURE.md](architecture/KAFKA_STREAMING_ARCHITECTURE.md) | Streaming architecture (if applicable) | Data processing |

---

## 🗺️ Documentation by Role

### Executives & Project Managers
**Recommended Reading Order:**
1. [SIMPLE_ARCHITECTURE.md](SIMPLE_ARCHITECTURE.md) - Understand the system
2. [README.md](../README.md) - Project overview and features
3. [ADMIN_FEATURES.md](features/ADMIN_FEATURES.md) - Admin capabilities

### Software Architects
**Recommended Reading Order:**
1. [SIMPLE_ARCHITECTURE.md](SIMPLE_ARCHITECTURE.md) - High-level overview
2. [USER_AWS_ARCHITECTURE.md](USER_AWS_ARCHITECTURE.md) - User flows
3. [ADMIN_AWS_ARCHITECTURE.md](ADMIN_AWS_ARCHITECTURE.md) - Admin flows
4. [TECHNICAL_DOCUMENTATION.md](architecture/TECHNICAL_DOCUMENTATION.md) - Complete reference
5. [ARCHITECTURE_DIAGRAMS.md](architecture/ARCHITECTURE_DIAGRAMS.md) - All diagrams

### Backend Developers
**Recommended Reading Order:**
1. [USER_AWS_ARCHITECTURE.md](USER_AWS_ARCHITECTURE.md) - User flows
2. [ADMIN_AWS_ARCHITECTURE.md](ADMIN_AWS_ARCHITECTURE.md) - Admin flows
3. [USER_FLOW_STEPS.md](USER_FLOW_STEPS.md) - Detailed user steps
4. [ADMIN_FLOW_STEPS.md](ADMIN_FLOW_STEPS.md) - Detailed admin steps
5. [TECHNICAL_DOCUMENTATION.md](architecture/TECHNICAL_DOCUMENTATION.md) - API reference

### Frontend Developers
**Recommended Reading Order:**
1. [SIMPLE_ARCHITECTURE.md](SIMPLE_ARCHITECTURE.md) - System overview
2. [USER_FLOW_STEPS.md](USER_FLOW_STEPS.md) - User interaction flows
3. [TECHNICAL_DOCUMENTATION.md](architecture/TECHNICAL_DOCUMENTATION.md) - Frontend section
4. [PERSONALIZED_RECOMMENDATIONS_GUIDE.md](features/PERSONALIZED_RECOMMENDATIONS_GUIDE.md) - UI features

### DevOps Engineers
**Recommended Reading Order:**
1. [CLIENT_DEPLOYMENT_GUIDE.md](deployment/CLIENT_DEPLOYMENT_GUIDE.md) - Deployment
2. [TECHNICAL_DOCUMENTATION.md](architecture/TECHNICAL_DOCUMENTATION.md) - Infrastructure
3. [TROUBLESHOOTING_FILE_UPLOAD.md](TROUBLESHOOTING_FILE_UPLOAD.md) - Common issues
4. [BEDROCK_AGENT_FIX.md](deployment/BEDROCK_AGENT_FIX.md) - Bedrock troubleshooting

### QA Engineers
**Recommended Reading Order:**
1. [USER_FLOW_STEPS.md](USER_FLOW_STEPS.md) - User test scenarios
2. [ADMIN_FLOW_STEPS.md](ADMIN_FLOW_STEPS.md) - Admin test scenarios
3. [TECHNICAL_DOCUMENTATION.md](architecture/TECHNICAL_DOCUMENTATION.md) - Testing section

---

## 📊 Documentation Statistics

### Coverage Summary
- **Total Documents**: 20+ files
- **Total Lines**: 10,000+ lines of documentation
- **Diagrams**: 25+ Mermaid diagrams
- **Code Examples**: 200+ code snippets
- **Architecture Flows**: 71 detailed steps (32 user + 39 admin)

### Document Sizes
- **Largest**: TECHNICAL_DOCUMENTATION.md (2100+ lines)
- **Most Detailed**: USER_AWS_ARCHITECTURE.md (1500+ lines)
- **Most Accessible**: SIMPLE_ARCHITECTURE.md (500+ lines)

### Diagram Distribution
- **Simple Architecture**: 5 high-level diagrams
- **User Architecture**: 7 detailed sequence/flow diagrams
- **Admin Architecture**: 6 detailed sequence/flow diagrams
- **Technical Docs**: 3+ architecture diagrams
- **Flow Steps**: Code examples and JSON payloads

---

## 🔍 Quick Reference Tables

### Lambda Functions Reference

| Function Name | Purpose | Trigger | Documentation |
|---------------|---------|---------|---------------|
| websocketHandler | WebSocket connection management | API Gateway WebSocket | [User Architecture](USER_AWS_ARCHITECTURE.md) |
| chatResponseHandler | Core chat orchestration | websocketHandler (async) | [User Architecture](USER_AWS_ARCHITECTURE.md) |
| email | Low confidence escalation | chatResponseHandler | [User Architecture](USER_AWS_ARCHITECTURE.md) |
| responseFeedback | User thumbs up/down | API Gateway REST | [User Architecture](USER_AWS_ARCHITECTURE.md) |
| logclassifier | AI sentiment analysis | chatResponseHandler (async) | [User Architecture](USER_AWS_ARCHITECTURE.md) |
| userProfile | User role management | API Gateway REST | [User Architecture](USER_AWS_ARCHITECTURE.md) |
| adminFile | Document management | API Gateway REST | [Admin Architecture](ADMIN_AWS_ARCHITECTURE.md) |
| retrieveSessionLogs | Analytics aggregation | API Gateway REST | [Admin Architecture](ADMIN_AWS_ARCHITECTURE.md) |
| escalatedQueries | Query management | API Gateway REST | [Admin Architecture](ADMIN_AWS_ARCHITECTURE.md) |
| kb-sync | Auto-sync Knowledge Base | S3 events | [KB Auto Sync](KB_AUTO_SYNC.md) |

### DynamoDB Tables Reference

| Table Name | Purpose | Keys | Documentation |
|------------|---------|------|---------------|
| NCMWDashboardSessionlogs | Conversation history | session_id, original_ts | [Technical Docs](architecture/TECHNICAL_DOCUMENTATION.md) |
| NCMWResponseFeedback | User feedback (👍👎) | message_id | [Technical Docs](architecture/TECHNICAL_DOCUMENTATION.md) |
| NCMWEscalatedQueries | Escalated queries | query_id, timestamp | [Technical Docs](architecture/TECHNICAL_DOCUMENTATION.md) |
| NCMWUserProfiles | User profiles | user_id | [Technical Docs](architecture/TECHNICAL_DOCUMENTATION.md) |

### API Endpoints Reference

| Endpoint | Method | Auth | Purpose | Documentation |
|----------|--------|------|---------|---------------|
| WebSocket API | WSS | None | Real-time chat | [User Architecture](USER_AWS_ARCHITECTURE.md) |
| /session-logs | GET | Cognito | Fetch analytics | [Admin Architecture](ADMIN_AWS_ARCHITECTURE.md) |
| /files | GET/POST/DELETE | Cognito | Document management | [Admin Architecture](ADMIN_AWS_ARCHITECTURE.md) |
| /escalated-queries | GET/PUT | Cognito | Query management | [Admin Architecture](ADMIN_AWS_ARCHITECTURE.md) |
| /feedback | POST | None | User feedback | [User Architecture](USER_AWS_ARCHITECTURE.md) |
| /profile | POST | None | User profiles | [User Architecture](USER_AWS_ARCHITECTURE.md) |

---

## 🔄 Recent Updates

### January 11, 2026
- ✅ Created [SIMPLE_ARCHITECTURE.md](SIMPLE_ARCHITECTURE.md) - High-level diagrams for stakeholders
- ✅ Created [USER_AWS_ARCHITECTURE.md](USER_AWS_ARCHITECTURE.md) - Detailed user flows (7 diagrams, 6 flows)
- ✅ Created [ADMIN_AWS_ARCHITECTURE.md](ADMIN_AWS_ARCHITECTURE.md) - Detailed admin flows (6 diagrams, 5 flows)
- ✅ Created [ADMIN_FLOW_STEPS.md](ADMIN_FLOW_STEPS.md) - 39-step admin workflow breakdown
- ✅ Updated [TECHNICAL_DOCUMENTATION.md](architecture/TECHNICAL_DOCUMENTATION.md) - Added architecture references
- ✅ Renamed Lambda function: cfEvaluator → chatResponseHandler (17 files updated)

### Previous Updates
- [RENAMING_SUMMARY.md](RENAMING_SUMMARY.md) - Complete renaming summary
- [WCAG_ACCESSIBILITY_IMPROVEMENTS.md](WCAG_ACCESSIBILITY_IMPROVEMENTS.md) - Accessibility enhancements
- [KB_AUTO_SYNC.md](KB_AUTO_SYNC.md) - Knowledge Base automation

---

## 📝 Contributing to Documentation

### Documentation Standards
- **Format**: Markdown (.md files)
- **Diagrams**: Mermaid syntax for version control
- **Code Examples**: Include language tags for syntax highlighting
- **Structure**: Clear headings and table of contents
- **Links**: Relative links for internal documents

### When to Update Documentation
- Adding new features → Update relevant architecture docs
- Changing Lambda functions → Update flow steps and technical docs
- Modifying API endpoints → Update API reference sections
- Infrastructure changes → Update architecture diagrams

### Documentation Review Process
1. Update relevant documents
2. Verify all links work
3. Update DOCUMENTATION_INDEX.md (this file)
4. Update version numbers and dates
5. Add to "Recent Updates" section

---

## 🎯 Documentation Goals

### Completeness ✅
- All AWS services documented
- All Lambda functions explained
- All API endpoints referenced
- All user flows mapped

### Clarity ✅
- Simple language for stakeholders
- Technical depth for developers
- Visual diagrams for architects
- Step-by-step guides for operations

### Maintainability ✅
- Version-controlled in Git
- Mermaid diagrams (text-based)
- Consistent formatting
- Clear update tracking

### Accessibility ✅
- Multiple complexity levels
- Role-based navigation
- Quick reference tables
- Comprehensive index

---

## 📧 Documentation Feedback

For questions, corrections, or suggestions:
1. Open an issue in the GitHub repository
2. Reference specific document and section
3. Provide detailed feedback or correction

---

**Index Version**: 1.0
**Last Updated**: January 11, 2026
**Total Documents Indexed**: 20+
**Status**: ✅ Complete and Current
