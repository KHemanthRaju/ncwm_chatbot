#!/bin/bash

# Test script to upload a file to the admin documents API
# Usage: ./scripts/test-file-upload.sh <file-path>

API_ENDPOINT="https://tuvw7wkl4l.execute-api.us-west-2.amazonaws.com/prod/files"

if [ -z "$1" ]; then
    echo "Usage: $0 <file-path>"
    echo "Example: $0 test.pdf"
    exit 1
fi

FILE_PATH="$1"
FILENAME=$(basename "$FILE_PATH")

# Get ID token (assuming user is logged in)
ID_TOKEN=$(cat ~/.aws-tokens/id-token 2>/dev/null)
if [ -z "$ID_TOKEN" ]; then
    echo "Error: No ID token found. Please log in to the admin portal first."
    exit 1
fi

echo "Uploading file: $FILENAME"
echo "API Endpoint: $API_ENDPOINT"
echo ""

# Convert file to base64
BASE64_CONTENT=$(base64 -i "$FILE_PATH")

# Detect content type
CONTENT_TYPE="application/octet-stream"
case "${FILENAME##*.}" in
    pdf) CONTENT_TYPE="application/pdf" ;;
    txt) CONTENT_TYPE="text/plain" ;;
    doc) CONTENT_TYPE="application/msword" ;;
    docx) CONTENT_TYPE="application/vnd.openxmlformats-officedocument.wordprocessingml.document" ;;
esac

# Create JSON payload
JSON_PAYLOAD=$(cat <<EOF
{
  "filename": "$FILENAME",
  "content_type": "$CONTENT_TYPE",
  "content": "$BASE64_CONTENT"
}
EOF
)

# Upload file
echo "Uploading..."
curl -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ID_TOKEN" \
  --data "$JSON_PAYLOAD" \
  -w "\nHTTP Status: %{http_code}\n" \
  -o /tmp/upload-response.json

echo ""
echo "Response:"
cat /tmp/upload-response.json
echo ""
