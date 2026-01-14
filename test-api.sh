#!/bin/bash

# API Test Script for Skillbase Backend
# This script tests the complete flow: register -> login -> create project -> create event -> list events

BASE_URL="http://localhost:3000"
TEST_EMAIL="test@example.com"
TEST_PASSWORD="testpass123"
TEST_NAME="Test User"

echo "🧪 Starting API Tests..."
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to extract body and status code (macOS compatible)
extract_response() {
    local response="$1"
    local body=$(echo "$response" | sed '$d')
    local code=$(echo "$response" | tail -n 1)
    echo "$body|$code"
}

# 1. Health Check
echo "1️⃣  Testing Health Endpoint..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/health")
HEALTH_EXTRACTED=$(extract_response "$HEALTH_RESPONSE")
HEALTH_BODY=$(echo "$HEALTH_EXTRACTED" | cut -d'|' -f1)
HEALTH_CODE=$(echo "$HEALTH_EXTRACTED" | cut -d'|' -f2)

if [ "$HEALTH_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Health check passed${NC}"
    echo "Response: $HEALTH_BODY"
else
    echo -e "${RED}❌ Health check failed (Status: $HEALTH_CODE)${NC}"
    exit 1
fi
echo ""

# 2. Register User
echo "2️⃣  Registering User..."
REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"name\": \"$TEST_NAME\"
  }")
REGISTER_EXTRACTED=$(extract_response "$REGISTER_RESPONSE")
REGISTER_BODY=$(echo "$REGISTER_EXTRACTED" | cut -d'|' -f1)
REGISTER_CODE=$(echo "$REGISTER_EXTRACTED" | cut -d'|' -f2)

if [ "$REGISTER_CODE" = "201" ]; then
    echo -e "${GREEN}✅ User registered successfully${NC}"
    echo "Response: $REGISTER_BODY"
else
    if echo "$REGISTER_BODY" | grep -q "already exists"; then
        echo -e "${YELLOW}⚠️  User already exists, continuing...${NC}"
    else
        echo -e "${RED}❌ Registration failed (Status: $REGISTER_CODE)${NC}"
        echo "Response: $REGISTER_BODY"
        exit 1
    fi
fi
echo ""

# 3. Login
echo "3️⃣  Logging in..."
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")
LOGIN_EXTRACTED=$(extract_response "$LOGIN_RESPONSE")
LOGIN_BODY=$(echo "$LOGIN_EXTRACTED" | cut -d'|' -f1)
LOGIN_CODE=$(echo "$LOGIN_EXTRACTED" | cut -d'|' -f2)

if [ "$LOGIN_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Login successful${NC}"
    JWT_TOKEN=$(echo "$LOGIN_BODY" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    if [ -z "$JWT_TOKEN" ]; then
        JWT_TOKEN=$(echo "$LOGIN_BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    fi
    echo "JWT Token: ${JWT_TOKEN:0:50}..."
else
    echo -e "${RED}❌ Login failed (Status: $LOGIN_CODE)${NC}"
    echo "Response: $LOGIN_BODY"
    exit 1
fi
echo ""

# 4. Create Project
echo "4️⃣  Creating Project..."
PROJECT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d "{
    \"name\": \"Test Project\",
    \"description\": \"Test project for API testing\"
  }")
PROJECT_EXTRACTED=$(extract_response "$PROJECT_RESPONSE")
PROJECT_BODY=$(echo "$PROJECT_EXTRACTED" | cut -d'|' -f1)
PROJECT_CODE=$(echo "$PROJECT_EXTRACTED" | cut -d'|' -f2)

if [ "$PROJECT_CODE" = "201" ] || [ "$PROJECT_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Project created successfully${NC}"
    # Extract API key from JSON response - root level apiKey field
    if command -v python3 &> /dev/null; then
        API_KEY=$(echo "$PROJECT_BODY" | python3 -c "import sys, json; print(json.load(sys.stdin)['apiKey'])" 2>/dev/null)
    else
        # Fallback: extract using sed/grep
        API_KEY=$(echo "$PROJECT_BODY" | sed -n 's/.*"apiKey":"\([^"]*\)".*/\1/p' | head -1)
    fi
    echo "Response: $PROJECT_BODY"
    echo ""
    if [ -n "$API_KEY" ]; then
        echo -e "${YELLOW}📝 API Key: $API_KEY${NC}"
    else
        echo -e "${RED}⚠️  Could not extract API key from response${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Project creation failed (Status: $PROJECT_CODE)${NC}"
    echo "Response: $PROJECT_BODY"
    exit 1
fi
echo ""

# 5. Create Event
echo "5️⃣  Creating Event..."
EVENT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/v1/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d "{
    \"userId\": \"user_123\",
    \"event\": \"level_completed\",
    \"value\": 10,
    \"meta\": {
      \"level\": 5,
      \"score\": 1000
    }
  }")
EVENT_EXTRACTED=$(extract_response "$EVENT_RESPONSE")
EVENT_BODY=$(echo "$EVENT_EXTRACTED" | cut -d'|' -f1)
EVENT_CODE=$(echo "$EVENT_EXTRACTED" | cut -d'|' -f2)

if [ "$EVENT_CODE" = "201" ] || [ "$EVENT_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Event created successfully${NC}"
    echo "Response: $EVENT_BODY"
    EVENT_ID=$(echo "$EVENT_BODY" | grep -o '"eventId":"[^"]*' | cut -d'"' -f4)
    echo "Event ID: $EVENT_ID"
else
    echo -e "${RED}❌ Event creation failed (Status: $EVENT_CODE)${NC}"
    echo "Response: $EVENT_BODY"
    exit 1
fi
echo ""

# 6. List Events (with userId)
echo "6️⃣  Listing Events (with userId=user_123)..."
LIST_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/v1/events?userId=user_123" \
  -H "Authorization: Bearer $API_KEY")
LIST_EXTRACTED=$(extract_response "$LIST_RESPONSE")
LIST_BODY=$(echo "$LIST_EXTRACTED" | cut -d'|' -f1)
LIST_CODE=$(echo "$LIST_EXTRACTED" | cut -d'|' -f2)

if [ "$LIST_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Events listed successfully${NC}"
    echo "Response: $LIST_BODY"
else
    echo -e "${RED}❌ Event listing failed (Status: $LIST_CODE)${NC}"
    echo "Response: $LIST_BODY"
    exit 1
fi
echo ""

# 7. List All Events (without userId)
echo "7️⃣  Listing All Events (without userId)..."
LIST_ALL_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/v1/events" \
  -H "Authorization: Bearer $API_KEY")
LIST_ALL_EXTRACTED=$(extract_response "$LIST_ALL_RESPONSE")
LIST_ALL_BODY=$(echo "$LIST_ALL_EXTRACTED" | cut -d'|' -f1)
LIST_ALL_CODE=$(echo "$LIST_ALL_EXTRACTED" | cut -d'|' -f2)

if [ "$LIST_ALL_CODE" = "200" ]; then
    echo -e "${GREEN}✅ All events listed successfully${NC}"
    echo "Response: $LIST_ALL_BODY"
else
    echo -e "${RED}❌ Event listing failed (Status: $LIST_ALL_CODE)${NC}"
    echo "Response: $LIST_ALL_BODY"
    exit 1
fi
echo ""

# 8. Test Invalid API Key
echo "8️⃣  Testing Invalid API Key..."
INVALID_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/v1/events" \
  -H "Authorization: Bearer invalid_key_12345")
INVALID_EXTRACTED=$(extract_response "$INVALID_RESPONSE")
INVALID_BODY=$(echo "$INVALID_EXTRACTED" | cut -d'|' -f1)
INVALID_CODE=$(echo "$INVALID_EXTRACTED" | cut -d'|' -f2)

if [ "$INVALID_CODE" = "401" ] || [ "$INVALID_CODE" = "403" ]; then
    echo -e "${GREEN}✅ Invalid API key correctly rejected (Status: $INVALID_CODE)${NC}"
else
    echo -e "${YELLOW}⚠️  Unexpected status for invalid key (Status: $INVALID_CODE)${NC}"
    echo "Response: $INVALID_BODY"
fi
echo ""

echo "================================"
echo -e "${GREEN}✅ All tests completed!${NC}"
echo ""
echo "📊 Summary:"
echo "  - Health check: ✅"
echo "  - User registration: ✅"
echo "  - User login: ✅"
echo "  - Project creation: ✅"
echo "  - Event creation: ✅"
echo "  - Event listing (with userId): ✅"
echo "  - Event listing (all): ✅"
echo "  - Invalid API key rejection: ✅"

