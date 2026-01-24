# Testing Role Context Frontend Implementation

## ✅ What Was Changed

1. **Added** `frontend/src/utilities/roleInstructions.js` - Role context utility
2. **Updated** `frontend/src/Components/ChatBody.jsx` - Uses role context function
3. **Frontend is live** at http://localhost:3000 (auto-recompiled)

## 🧪 How to Test

### Test 1: Check Browser Console for Context
1. Open http://localhost:3000
2. Open Browser DevTools (F12) → Console tab
3. Ask a question: "What is MHFA?"
4. **Look for the log:** `🔵 Sent payload with role:`
5. **Verify the querytext includes:** `[Context: I am learning about MHFA...]`

### Test 2: Test Different Roles

#### A. Test as Learner (default)
1. Ask: "How do I get certified?"
2. Check console - should see: `[Context: I am learning about MHFA as a course participant]`
3. Verify response is learner-appropriate

#### B. Test as Instructor
1. Select "Instructor" role (if you have role selector)
2. Ask: "How do I teach MHFA?"
3. Check console - should see: `[Context: I am a certified MHFA Instructor seeking teaching guidance]`
4. Verify response is instructor-focused

#### C. Test as Staff
1. Select "Staff" role
2. Ask: "How do I implement MHFA in my organization?"
3. Check console - should see: `[Context: I am organizational staff implementing MHFA programs]`
4. Verify response is staff/administrative focused

### Test 3: Verify Short Queries Don't Get Context
1. Ask: "Hi" or "Hello"
2. Check console - querytext should be just "Hi" (no context prefix)
3. This is correct - short queries don't need context

### Test 4: Compare Response Quality
1. Ask same question with different roles
2. Verify responses are still appropriate for each role
3. Quality should be identical to before

---

## 📊 What to Look For

### ✅ Success Indicators:
- Console shows querytext with `[Context: ...]` prefix
- Responses are still role-appropriate
- No JavaScript errors in console
- Streaming still works smoothly
- Citations still appear

### ❌ Issues to Watch For:
- JavaScript errors in console
- Missing role context in payload
- Responses not role-appropriate
- Broken streaming
- Missing citations

---

## 🔍 Backend Changes (NOT YET APPLIED)

**Important:** The Lambda function still has role instructions code.

**Current flow:**
1. Frontend adds: `[Context: I am a learner]` + "What is MHFA?"
2. Lambda receives full query with context
3. Lambda ALSO adds role instructions (redundant!)
4. Bedrock gets both frontend context AND Lambda instructions

**This is OK for testing!** It proves the frontend context works.

**Next step:** Remove Lambda role instructions to get the performance boost.

---

## 🎯 Expected Results

### Browser Console Should Show:
```javascript
🔵 Sent payload with role: {
  action: "sendMessage",
  querytext: "[Context: I am learning about MHFA as a course participant]\n\nWhat is MHFA?",
  session_id: "abc-123...",
  user_role: "learner"
}
```

### Lambda Logs Should Show:
```
Received Query - Session: abc-123, Role: learner, Query: [Context: I am learning about MHFA...]
```

The query now includes the context prefix!

---

## 🚀 Next Steps After Testing

If everything works:

1. **Remove Lambda role instructions** to get performance boost
2. **Redeploy Lambda** with optimized handler
3. **Test again** - should be 1-2 seconds faster
4. **Monitor CloudWatch** - verify latency improvement

---

## 📝 Test Results Template

Fill this out as you test:

```
✅ Frontend Changes Deployed: YES
✅ Role context appears in console: _____
✅ Learner role context works: _____
✅ Instructor role context works: _____
✅ Staff role context works: _____
✅ Short queries skip context: _____
✅ Responses still appropriate: _____
✅ No JavaScript errors: _____
✅ Streaming still works: _____
✅ Citations still appear: _____

Ready for Lambda optimization: YES / NO
```

---

## 💡 Testing Tips

1. **Keep DevTools open** - You'll see the payload being sent
2. **Test each role** - Make sure all three work
3. **Compare responses** - Quality should be same as before
4. **Check Lambda logs** - Verify context is received
5. **No need to redeploy yet** - Just test frontend changes first

Ready to test! Open http://localhost:3000 and try it out! 🎉
