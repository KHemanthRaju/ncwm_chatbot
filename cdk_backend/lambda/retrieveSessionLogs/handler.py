import os
import json
from datetime import datetime, timedelta
from collections import defaultdict

import boto3
from boto3.dynamodb.conditions import Attr

# ──────────────────────────────────────────────────────────────────────────────
#  Env & AWS clients
# ──────────────────────────────────────────────────────────────────────────────
TABLE_NAME = os.environ["DYNAMODB_TABLE"]
FEEDBACK_TABLE_NAME = os.environ.get("FEEDBACK_TABLE", "NCMWResponseFeedback")
ddb   = boto3.resource("dynamodb")
table = ddb.Table(TABLE_NAME)
feedback_table = ddb.Table(FEEDBACK_TABLE_NAME)

# ──────────────────────────────────────────────────────────────────────────────
#  Helpers
# ──────────────────────────────────────────────────────────────────────────────
def log(*msg):
    print("[ANALYTICS]", *msg)


def bad_request(msg):
    return {
        "statusCode": 400,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": json.dumps({"error": msg}),
    }


def ok(body_dict):
    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": json.dumps(body_dict),
    }


# ──────────────────────────────────────────────────────────────────────────────
#  Lambda entry-point
# ──────────────────────────────────────────────────────────────────────────────
def lambda_handler(event, context):
    log("=== NEW INVOCATION ============================================")
    log("Raw queryStringParameters :", event.get("queryStringParameters"))

    # 1) Parse timeframe
    params = event.get("queryStringParameters") or {}
    tf = (params.get("timeframe") or "today").lower()

    now = datetime.utcnow()
    if tf == "today":
        start = datetime(now.year, now.month, now.day)
    elif tf == "weekly":
        start = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
    elif tf == "monthly":
        start = datetime(now.year, now.month, 1)
    elif tf == "yearly":
        start = datetime(now.year, 1, 1)
    else:
        return bad_request(f'Invalid timeframe "{tf}"')

    end = now
    log("Timeframe                 :", tf)
    log("Start / End UTC           :", start, "/", end)

    # 2) Build filter & projection
    start_iso, end_iso = start.isoformat(), end.isoformat()
    filter_exp = Attr("original_ts").between(start_iso, end_iso)
    projection = "session_id, #loc, category, sentiment, satisfaction_score, #q, #r, original_ts"
    expr_names = { "#loc": "location", "#q": "query", "#r": "response" }

    # 3) Scan in pages
    items = []
    resp = table.scan(
        FilterExpression=filter_exp,
        ProjectionExpression=projection,
        ExpressionAttributeNames=expr_names,
    )
    items.extend(resp.get("Items", []))
    log("Page 1 items              :", len(resp.get("Items", [])))

    while "LastEvaluatedKey" in resp:
        resp = table.scan(
            FilterExpression=filter_exp,
            ProjectionExpression=projection,
            ExpressionAttributeNames=expr_names,
            ExclusiveStartKey=resp["LastEvaluatedKey"],
        )
        log("…Next page items          :", len(resp.get("Items", [])))
        items.extend(resp.get("Items", []))

    log("TOTAL items scanned       :", len(items))

    # 4) Fetch user feedback from feedback table
    log("Fetching user feedback...")
    feedback_resp = feedback_table.scan()
    feedback_items = feedback_resp.get("Items", [])

    # Continue scanning if there are more feedback items
    while "LastEvaluatedKey" in feedback_resp:
        feedback_resp = feedback_table.scan(
            ExclusiveStartKey=feedback_resp["LastEvaluatedKey"]
        )
        feedback_items.extend(feedback_resp.get("Items", []))

    log(f"Total feedback items      : {len(feedback_items)}")

    # Build feedback map: message_id -> feedback (positive/negative)
    feedback_map = {}
    for fb in feedback_items:
        msg_id = fb.get("message_id")
        feedback_type = fb.get("feedback")
        if msg_id and feedback_type:
            feedback_map[msg_id] = feedback_type

    log(f"Feedback map size         : {len(feedback_map)}")

    # 5) Aggregate using user feedback (thumbs up/down) only
    sessions = set()
    loc_counts = defaultdict(int)
    cat_counts = defaultdict(int)
    # Count based on user feedback (thumbs up/down)
    feedback_sentiment_counts = {"positive": 0, "negative": 0}
    satisfaction_scores = []
    conversations = []

    # Build a map of session_id+timestamp -> item for matching feedback
    session_timestamp_map = {}
    for it in items:
        session_id = it.get("session_id")
        timestamp = it.get("original_ts")
        if session_id and timestamp:
            key = f"{session_id}_{timestamp}"
            session_timestamp_map[key] = it

    for it in items:
        if sid := it.get("session_id"):
            sessions.add(sid)
        if loc := it.get("location"):
            if isinstance(loc, str) and loc:  # Only count valid location strings
                loc_counts[loc] += 1
        if cat := it.get("category"):
            cat_counts[cat] += 1
        if score := it.get("satisfaction_score"):
            satisfaction_scores.append(float(score))

        # Try to find user feedback for this conversation
        # Feedback is stored with session_id, so we need to match it
        session_id = it.get("session_id")
        timestamp = it.get("original_ts")
        user_feedback = None

        # Check if there's feedback for this specific message
        # In the feedback table, message_id might be the timestamp or a unique identifier
        if session_id:
            for msg_id, feedback_type in feedback_map.items():
                # Try to match by checking if message_id contains session or timestamp info
                if session_id in str(msg_id) or (timestamp and timestamp in str(msg_id)):
                    user_feedback = feedback_type
                    break

        # Only include conversations that have user feedback (thumbs up/down)
        if user_feedback:
            # Count the feedback
            if user_feedback == "positive":
                feedback_sentiment_counts["positive"] += 1
            elif user_feedback == "negative":
                feedback_sentiment_counts["negative"] += 1

            # Build conversation log entry with user feedback as sentiment
            conversations.append({
                "session_id": session_id,
                "timestamp": timestamp,
                "query": it.get("query", ""),
                "response": it.get("response", ""),
                "category": it.get("category", "Unknown"),
                "sentiment": user_feedback,  # Use user feedback (positive/negative)
                "satisfaction_score": float(it.get("satisfaction_score", 50))
            })

    log(f"Feedback counts - Positive: {feedback_sentiment_counts['positive']}, Negative: {feedback_sentiment_counts['negative']}")

    # Calculate average satisfaction
    avg_satisfaction = sum(satisfaction_scores) / len(satisfaction_scores) if satisfaction_scores else 0

    # Sort conversations by timestamp (most recent first)
    conversations.sort(key=lambda x: x.get("timestamp", ""), reverse=True)

    result = {
        "timeframe":  tf,
        "start_date": start.strftime("%Y-%m-%d"),
        "end_date":   end.strftime("%Y-%m-%d"),
        "user_count": len(sessions),
        "locations":  list(loc_counts.keys()),
        "categories": dict(cat_counts),
        "sentiment": feedback_sentiment_counts,  # Use user feedback instead of AI sentiment
        "avg_satisfaction": round(avg_satisfaction, 1),
        "conversations": conversations[:50]  # Return latest 50 conversations
    }

    log("Distinct sessions         :", len(sessions))
    log("Distinct locations        :", len(loc_counts))
    log("Distinct categories       :", len(cat_counts))
    log("Returning 200")
    return ok(result)
