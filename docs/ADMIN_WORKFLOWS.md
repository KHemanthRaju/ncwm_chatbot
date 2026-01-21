# Learning Navigator - Admin Workflows

**Step-by-Step Administrator Operation Flows**

---

## Overview

This document provides detailed workflows for administrators using the Learning Navigator admin portal. All admin operations require authentication via Amazon Cognito.

**Admin Portal Access:** https://main.d1disyogbqgwn4.amplifyapp.com (Click "Admin" tab)

---

## 🔐 Workflow 1: Admin Login

### Scenario: Administrator accessing the admin portal for the first time

**Duration:** 1-2 minutes
**User Type:** Administrator with Cognito credentials
**Prerequisites:** Admin account created in Cognito User Pool

### Steps:

**Step 1: Navigate to Admin Portal**
```
Action: Open app URL and click "Admin" tab in navigation
Result: Redirected to admin login page
```
**URL:** https://main.d1disyogbqgwn4.amplifyapp.com/admin

---

**Step 2: Enter Credentials**
```
Action: Fill in login form
Fields:
- Username: [Your admin username]
- Password: [Your password]
```
**Security Note:** Initial login may require password change if using temporary password.

---

**Step 3: Submit Login**
```
Action: Click "Sign In" button
Result: Authentication processed via AWS Cognito
```
**Loading:** 1-2 seconds for authentication

---

**Step 4: Handle First-Time Login (If Applicable)**
```
Scenario: Temporary password provided by system admin
Actions:
1. Enter temporary password
2. Prompted to set new password
3. Create strong password (min 8 chars, uppercase, lowercase, number, special char)
4. Confirm new password
5. Submit
```

---

**Step 5: Access Admin Dashboard**
```
Result: Successfully logged in, dashboard loads
```
**Dashboard Overview:**
- Welcome message with admin name
- Navigation menu with sections:
  - Dashboard
  - Document Management
  - Conversation Logs
  - Escalated Queries
  - User Management (if applicable)
  - Analytics
- Quick stats summary cards

---

## 📊 Workflow 2: Viewing Analytics Dashboard

### Scenario: Admin wants to review system performance and usage metrics

**Duration:** 3-5 minutes
**Prerequisites:** Logged into admin portal

### Steps:

**Step 1: Navigate to Dashboard**
```
Action: Click "Dashboard" in left sidebar (or default landing page)
Result: Analytics dashboard loads
```

---

**Step 2: Review Summary Metrics**
```
Action: View metric cards at top of dashboard
```
**Metrics Displayed:**
1. **Total Conversations** (Last 30 days)
   - Count: e.g., 1,247
   - Trend: ↑ 12% vs previous period

2. **Average Sentiment Score**
   - Score: e.g., 82.5/100
   - Category: "Good"
   - Trend: ↑ 3 points

3. **Total Users**
   - Count: e.g., 856
   - New users: 142 this month

4. **Escalation Rate**
   - Percentage: e.g., 8.3%
   - Count: 103 queries escalated

---

**Step 3: View Sentiment Distribution Chart**
```
Action: Scroll to sentiment analysis section
```
**Chart Type:** Pie chart or bar graph
**Categories:**
- Excellent (90-100): Green segment
- Good (75-89): Blue segment
- Acceptable (60-74): Yellow segment
- Needs Improvement (45-59): Orange segment
- Poor (0-44): Red segment

**Interaction:**
- Hover over segments to see exact counts
- Click segment to filter conversation logs

---

**Step 4: Review Conversation Timeline**
```
Action: View line graph showing conversations over time
```
**Time Periods:** Daily, Weekly, Monthly (toggle buttons)
**Data Points:**
- Number of conversations per time unit
- Peak usage times
- Trend line

---

**Step 5: Analyze User Role Distribution**
```
Action: View role breakdown chart
```
**Chart:** Donut chart with role segments
**Roles:**
- Instructors: e.g., 45%
- Staff: e.g., 25%
- Learners: e.g., 30%

---

**Step 6: Check Language Usage**
```
Action: View language distribution stats
```
**Display:**
- English: 72%
- Spanish: 28%
- Total queries by language over time

---

**Step 7: Review Top Queries**
```
Action: Scroll to "Most Common Questions" section
```
**Format:** Table or list
**Columns:**
- Query text (truncated)
- Frequency (count)
- Average sentiment score
- Last asked (date)

**Example:**
| Query | Count | Avg Score | Last Asked |
|-------|-------|-----------|------------|
| What is MHFA? | 234 | 95 | 2 hours ago |
| How do I register? | 187 | 88 | 1 day ago |
| Course duration? | 156 | 91 | 3 hours ago |

---

**Step 8: Export Analytics Data (Optional)**
```
Action: Click "Export Data" button
Options:
- Date range selector
- Metric selection (checkboxes)
- Export format: CSV or PDF
Result: File downloads to browser
```

---

## 📁 Workflow 3: Uploading Documents to Knowledge Base

### Scenario: Admin needs to add new training materials to the knowledge base

**Duration:** 5-10 minutes
**Prerequisites:** Logged into admin portal, PDF file ready (< 10MB)

### Steps:

**Step 1: Navigate to Document Management**
```
Action: Click "Document Management" in sidebar
Result: Document management page loads
```

---

**Step 2: View Current Documents**
```
Action: Review list of existing documents
```
**Display:** Table format
**Columns:**
- Document name
- Upload date
- File size
- Status (Synced/Pending/Failed)
- Actions (Download, Delete)

---

**Step 3: Click Upload Button**
```
Action: Click "Upload New Document" button
Result: File upload modal opens
```

---

**Step 4: Select File**
```
Action: Click "Choose File" or drag-and-drop PDF
File Requirements:
- Format: PDF only
- Max size: 10 MB
- Filename: Descriptive, no special characters
```
**Example:** `MHFA_Instructor_Guide_2024.pdf`

---

**Step 5: Add Document Metadata (Optional)**
```
Action: Fill in optional fields
Fields:
- Document title: [Human-readable name]
- Category: [Dropdown] Instructor Guide / Course Material / Policy / FAQ
- Description: [Brief summary of contents]
- Tags: [Comma-separated] e.g., "instructor, certification, 2024"
```

---

**Step 6: Initiate Upload**
```
Action: Click "Upload" button
Result: Upload progress bar appears
```
**Upload Process:**
1. File validation (format, size)
2. S3 upload (progress percentage)
3. Metadata saved to DynamoDB
4. Success confirmation

**Expected Time:** 5-30 seconds depending on file size

---

**Step 7: Confirm Upload Success**
```
Result: Success message displayed
```
**Message:**
```
✓ Document uploaded successfully!
File: MHFA_Instructor_Guide_2024.pdf
Status: Pending sync
Next: Knowledge base will sync automatically within 5 minutes
```

---

**Step 8: Trigger Manual Sync (Optional)**
```
Action: Click "Sync Knowledge Base Now" button
Result: Immediate synchronization initiated
```
**Sync Process:**
1. AWS Bedrock retrieves new documents from S3
2. Text extraction and vectorization
3. Ingestion into knowledge base
4. Status updates to "Synced"

**Expected Time:** 2-5 minutes

---

**Step 9: Verify Document in Knowledge Base**
```
Action: After sync completes, test via chatbot
Test Query: Ask a question related to the new document
Expected Result: Chatbot response includes citations from new document
```

---

## 📝 Workflow 4: Reviewing Conversation Logs

### Scenario: Admin wants to review detailed chat transcripts and sentiment scores

**Duration:** 5-10 minutes
**Prerequisites:** Logged into admin portal

### Steps:

**Step 1: Navigate to Conversation Logs**
```
Action: Click "Conversation Logs" in sidebar
Result: Logs list page loads
```

---

**Step 2: Apply Filters (Optional)**
```
Action: Use filter controls at top of page
```
**Filter Options:**
- **Date Range:** Start date - End date (calendar pickers)
- **Role:** All / Instructor / Staff / Learner / Guest
- **Language:** All / English / Spanish
- **Sentiment Score:** All / Excellent / Good / Acceptable / Needs Improvement / Poor
- **Search:** Keyword search in queries/responses

**Action:** Click "Apply Filters"

---

**Step 3: View Conversation List**
```
Action: Scroll through paginated list
```
**Table Format:**
**Columns:**
- Session ID (truncated)
- Date/Time
- User Role
- Language
- Message Count
- Sentiment Score (colored badge)
- Actions (View Details)

**Example Row:**
| Session | Date | Role | Lang | Messages | Score | Actions |
|---------|------|------|------|----------|-------|---------|
| abc123 | Jan 21, 2:30 PM | Instructor | EN | 8 | 85 (Good) | [View] |

---

**Step 4: Click View Details**
```
Action: Click "View" button on a conversation
Result: Detailed transcript modal opens
```

---

**Step 5: Review Full Transcript**
```
Action: Read through complete conversation
```
**Transcript Format:**
```
Session ID: abc123xyz
Date: January 21, 2026, 2:30 PM
User Role: Instructor
Language: English
Sentiment Score: 85 (Good)

--- Messages ---

[2:30:45 PM] User:
How do I schedule a new MHFA course?

[2:30:52 PM] Bot:
To schedule a new MHFA course, follow these steps:
1. Log in to MHFA Connect...
[Full response...]

Citations:
- Instructor Guide (Page 23)
- Course Scheduling Manual

[2:32:15 PM] User:
What materials do I need?

[2:32:29 PM] Bot:
For conducting an MHFA course, you'll need:
- Participant manuals...
[Full response...]

Citations:
- Training Materials Checklist
```

---

**Step 6: Review Sentiment Breakdown**
```
Action: Scroll to sentiment analysis section
```
**Breakdown Display:**
- **Relevance Score:** 90/100 (30% weight) - "Excellent"
- **Completeness Score:** 85/100 (30% weight) - "Good"
- **Clarity Score:** 80/100 (20% weight) - "Good"
- **Actionability Score:** 85/100 (20% weight) - "Good"
- **Overall Score:** 85/100 - "Good"

**AI Justification:**
```
The conversation provided relevant and complete information about course scheduling. Responses were clear and actionable. Minor improvement could be made in providing step-by-step visual guides.
```

---

**Step 7: Export Transcript (Optional)**
```
Action: Click "Export" button
Formats: PDF or TXT
Result: Transcript downloads to browser
```

---

**Step 8: Flag for Review (Optional)**
```
Action: Click "Flag for Review" button
Reason: [Dropdown] Incorrect information / Quality concern / Policy violation
Result: Conversation marked for senior admin review
```

---

## 🆘 Workflow 5: Managing Escalated Queries

### Scenario: Admin needs to respond to queries the AI couldn't confidently answer

**Duration:** 10-20 minutes per query
**Prerequisites:** Logged into admin portal

### Steps:

**Step 1: Navigate to Escalated Queries**
```
Action: Click "Escalated Queries" in sidebar
Result: List of escalated queries loads
```
**Badge Indicator:** Red badge shows count of pending queries

---

**Step 2: View Escalation List**
```
Action: Review queries requiring attention
```
**Table Format:**
**Columns:**
- Query ID
- Date escalated
- User email
- Query text (truncated)
- Status (Pending / In Progress / Resolved)
- Priority (High / Medium / Low)
- Actions (View, Respond, Resolve)

**Example:**
| ID | Date | Email | Query | Status | Priority | Actions |
|----|------|-------|-------|--------|----------|---------|
| ESC-001 | Jan 21, 10 AM | user@example.com | "Policy for out-of-state..." | Pending | High | [View] |

---

**Step 3: Open Query Details**
```
Action: Click "View" button
Result: Query detail modal opens
```

---

**Step 4: Review Full Query Context**
```
Action: Read complete query and conversation history
```
**Display:**
```
Escalation ID: ESC-2024-001234
Date: January 21, 2026, 10:15 AM
User Email: instructor@example.com
User Role: Instructor
Priority: High

Original Query:
"What is the policy for MHFA instructors who move to a different state? Do I need to recertify?"

Bot Response:
"I don't have complete information about cross-state certification policies. I've escalated this to our support team."

Conversation History:
[Shows 3 previous messages leading up to this query]

AI Confidence Score: 62% (Below 90% threshold)
Reason for Low Confidence: Policy document not in knowledge base
```

---

**Step 5: Research the Answer**
```
Action: Admin investigates internally
Resources:
- Internal policy documents
- Contact subject matter experts
- Review official MHFA guidelines
```

---

**Step 6: Compose Response**
```
Action: Click "Respond" button, fill in response form
```
**Response Form Fields:**
- **To:** instructor@example.com (pre-filled)
- **Subject:** Re: Your question about cross-state certification (pre-filled)
- **Response:**
  ```
  Hi [User],

  Thank you for your question about MHFA instructor certification when relocating to a different state.

  Here's the policy:
  [Detailed, accurate answer based on research...]

  Additional Resources:
  - [Link to policy document]
  - [Contact for further questions]

  Best regards,
  MHFA Support Team
  ```

- **Add to Knowledge Base:** ☑ [Checkbox checked]
  - If checked, response will be added to KB for future queries

---

**Step 7: Send Response**
```
Action: Click "Send Email" button
Result: Email sent via Amazon SES
```
**Confirmation:**
```
✓ Response sent successfully to instructor@example.com
✓ Query marked as "Resolved"
✓ Response added to knowledge base (pending sync)
```

---

**Step 8: Update Knowledge Base (Automatic)**
```
Process: System automatically:
1. Creates a new document snippet from the Q&A
2. Uploads to S3 knowledge base bucket
3. Triggers KB sync
4. Future similar queries will receive accurate answers
```

---

**Step 9: Verify Knowledge Base Update (Later)**
```
Action: After sync (5 minutes), test in chatbot
Test Query: Ask the same or similar question
Expected Result: Bot now provides accurate answer with citation to new document
```

---

## 👥 Workflow 6: User Management (If Enabled)

### Scenario: Admin needs to manage admin user accounts

**Duration:** 5 minutes
**Prerequisites:** Logged into admin portal, admin permissions

### Steps:

**Step 1: Navigate to User Management**
```
Action: Click "User Management" in sidebar
Result: User list page loads
```
**Note:** This feature manages admin users, not end users (end users don't require accounts).

---

**Step 2: View Admin User List**
```
Action: Review list of admin accounts
```
**Table Format:**
**Columns:**
- Username
- Email
- Role (Super Admin / Admin / Read-Only)
- Status (Active / Disabled)
- Last Login
- Actions (Edit, Disable, Reset Password)

---

**Step 3: Add New Admin User**
```
Action: Click "Add New User" button
Result: User creation form opens
```

**Form Fields:**
- Username: [Unique identifier]
- Email: [Valid email address]
- Temporary Password: [Auto-generated or manual]
- Role: [Dropdown] Super Admin / Admin / Read-Only
- Send Welcome Email: ☑ [Checkbox]

**Action:** Click "Create User"

---

**Step 4: User Creation Process**
```
Process:
1. Cognito user created
2. Welcome email sent (if checked)
3. User added to admin group
4. Confirmation displayed
```

---

**Step 5: Reset User Password (If Needed)**
```
Action: Click "Reset Password" on user row
Result: Temporary password generated and emailed
```

---

**Step 6: Disable User Access (If Needed)**
```
Action: Click "Disable" on user row
Confirmation: "Are you sure you want to disable this user?"
Result: User account disabled, cannot log in
```

---

## 📧 Workflow 7: Email Notification Management

### Scenario: Admin wants to configure email alerts and notifications

**Duration:** 3-5 minutes
**Prerequisites:** Logged into admin portal

### Steps:

**Step 1: Navigate to Settings**
```
Action: Click "Settings" in sidebar
Result: Settings page loads
```

---

**Step 2: Configure Escalation Notifications**
```
Action: Scroll to "Email Notifications" section
```
**Options:**
- **Receive escalation alerts:** ☑ [Checkbox]
- **Email frequency:** [Dropdown] Immediate / Daily Digest / Weekly Digest
- **Minimum priority:** [Dropdown] All / High only / Critical only

---

**Step 3: Configure Report Subscriptions**
```
Action: Select report preferences
```
**Options:**
- ☑ Weekly analytics summary
- ☑ Monthly sentiment report
- ☐ User activity report
- ☐ Low-score conversation alerts

---

**Step 4: Save Settings**
```
Action: Click "Save Changes" button
Result: Settings updated, confirmation displayed
```

---

## 📦 Workflow 8: Bulk Document Upload

### Scenario: Admin needs to upload multiple documents at once

**Duration:** 10-15 minutes
**Prerequisites:** Logged into admin portal, multiple PDFs ready

### Steps:

**Step 1: Navigate to Document Management**
```
Action: Click "Document Management" in sidebar
```

---

**Step 2: Access Bulk Upload**
```
Action: Click "Bulk Upload" button
Result: Bulk upload interface opens
```

---

**Step 3: Select Multiple Files**
```
Action: Click "Choose Files" or drag-and-drop multiple PDFs
Limit: Up to 10 files at once
Max size per file: 10 MB
```

---

**Step 4: Review File List**
```
Action: Verify all selected files in list
```
**List Display:**
- Filename
- Size
- Status (Ready/Error)
- Remove button (X)

---

**Step 5: Add Bulk Metadata (Optional)**
```
Action: Fill in common metadata for all files
Fields:
- Category: [Applies to all]
- Tags: [Applies to all]
```

---

**Step 6: Start Upload**
```
Action: Click "Upload All" button
Result: Progress indicators for each file
```
**Upload Status:**
- File 1: ████████░░ 80%
- File 2: ██████████ 100% ✓
- File 3: ████░░░░░░ 40%

---

**Step 7: Review Results**
```
Result: Summary displayed after all uploads complete
```
**Summary:**
- ✓ 8 files uploaded successfully
- ⚠ 2 files failed (size exceeded)
- Total: 42 MB uploaded

---

**Step 8: Trigger Bulk Sync**
```
Action: Click "Sync All New Documents" button
Result: Knowledge base sync initiated for all new files
Expected time: 5-10 minutes
```

---

## 🔍 Workflow 9: Searching and Filtering Conversations

### Scenario: Admin needs to find specific conversations for audit or quality review

**Duration:** 2-3 minutes
**Prerequisites:** Logged into admin portal

### Steps:

**Step 1: Navigate to Conversation Logs**
```
Action: Click "Conversation Logs" in sidebar
```

---

**Step 2: Use Advanced Search**
```
Action: Click "Advanced Search" toggle
Result: Expanded search options appear
```

**Search Options:**
- **Keyword search:** "certification renewal"
- **User role:** Instructor
- **Date range:** Jan 1, 2026 - Jan 21, 2026
- **Sentiment range:** 0-100 (slider)
- **Contains escalation:** ☑
- **Language:** English
- **Minimum messages:** 5

---

**Step 3: Execute Search**
```
Action: Click "Search" button
Result: Filtered results displayed
```
**Results:** 23 conversations match criteria

---

**Step 4: Sort Results**
```
Action: Click column headers to sort
Options:
- Sort by date (newest/oldest first)
- Sort by sentiment score (highest/lowest first)
- Sort by message count
```

---

**Step 5: Export Search Results**
```
Action: Click "Export Results" button
Format: CSV with all matching conversation metadata
Result: File downloads
```

---

## 🛡️ Workflow 10: Admin Logout and Security

### Scenario: Admin finishing work session

**Duration:** 30 seconds
**Prerequisites:** Logged into admin portal

### Steps:

**Step 1: Save Any Pending Work**
```
Action: Ensure all responses sent, documents uploaded
```

---

**Step 2: Click Logout**
```
Action: Click "Logout" button in header or profile menu
Result: Session ended, redirected to login page
```

---

**Step 3: Confirm Logout**
```
Result: Confirmation message displayed
```
**Message:** "You have been successfully logged out."

---

**Security Best Practices:**
1. Always log out when finished
2. Don't share admin credentials
3. Use strong, unique passwords
4. Enable MFA if available
5. Don't leave admin portal open unattended
6. Use private/incognito mode on shared computers

---

## 💡 Admin Tips & Best Practices

### Document Management
- Use clear, descriptive filenames
- Add metadata for better organization
- Test new documents after sync completes
- Keep documents updated regularly
- Remove outdated materials

### Escalation Handling
- Respond to high-priority queries within 24 hours
- Always add quality responses to knowledge base
- Verify answers with subject matter experts
- Include helpful links and resources

### Analytics Review
- Check dashboard daily for anomalies
- Review low-score conversations weekly
- Monitor escalation rate trends
- Export monthly reports for leadership

### Security
- Change password every 90 days
- Review user access permissions quarterly
- Monitor login activity logs
- Report suspicious activity immediately

---

## 🐛 Troubleshooting Admin Issues

### Issue: Cannot Upload Document
**Symptoms:** Upload fails or error message appears
**Solutions:**
- Check file size (< 10MB)
- Verify file format (PDF only)
- Check filename (no special characters)
- Ensure stable internet connection

---

### Issue: Knowledge Base Sync Stuck
**Symptoms:** Sync status remains "Pending" for >10 minutes
**Solutions:**
- Check AWS Bedrock console for sync errors
- Verify S3 bucket permissions
- Re-trigger sync manually
- Contact technical support if persistent

---

### Issue: Email Notifications Not Received
**Symptoms:** No escalation alerts arriving
**Solutions:**
- Check spam/junk folder
- Verify email settings in admin portal
- Confirm email address in Cognito user profile
- Check AWS SES sending limits

---

### Issue: Dashboard Data Not Loading
**Symptoms:** Blank charts or "Loading..." indefinitely
**Solutions:**
- Refresh browser page
- Clear browser cache
- Check browser console for errors
- Verify DynamoDB table permissions

---

**Document Version:** 1.0
**Last Updated:** January 21, 2026
**Prepared For:** Client Testing
