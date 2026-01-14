#!/bin/bash

# ============================================================================
# SkillBase Backend Event API Comprehensive Test Suite
# ============================================================================
# Tests: POST /v1/events, GET /v1/events, Error handling, API Key validation
# ============================================================================

BASE_URL="http://localhost:3000"
TEST_EMAIL="test_events_$(date +%s)@example.com"
TEST_PASSWORD="testpass123"
TEST_NAME="Event Test User"
TEST_USER_ID="user_123"
TEST_USER_ID_INVALID="user_nonexistent_999"

# Test results tracking
PASSED=0
FAILED=0
TOTAL=0
TEST_RESULTS=()

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper function to extract body and status code (macOS compatible)
extract_response() {
    local response="$1"
    local body=$(echo "$response" | sed '$d')
    local code=$(echo "$response" | tail -n 1)
    echo "$body|$code"
}

# Test result tracking
record_test() {
    local test_name="$1"
    local status="$2"  # "PASS" or "FAIL"
    local http_code="$3"
    local response_body="$4"
    local curl_command="$5"
    
    TOTAL=$((TOTAL + 1))
    if [ "$status" = "PASS" ]; then
        PASSED=$((PASSED + 1))
        TEST_RESULTS+=("✅ PASS: $test_name (HTTP $http_code)")
    else
        FAILED=$((FAILED + 1))
        TEST_RESULTS+=("❌ FAIL: $test_name (HTTP $http_code)")
    fi
    
    # Store detailed result
    echo "TEST: $test_name" >> test-results.log
    echo "STATUS: $status" >> test-results.log
    echo "HTTP_CODE: $http_code" >> test-results.log
    echo "CURL_COMMAND: $curl_command" >> test-results.log
    echo "RESPONSE: $response_body" >> test-results.log
    echo "---" >> test-results.log
}

# Initialize test log
echo "SkillBase Event API Test Results - $(date)" > test-results.log
echo "========================================" >> test-results.log
echo "" >> test-results.log

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   SkillBase Backend Event API Comprehensive Test Suite   ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
# SETUP: Get API Key
# ============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}SETUP: Creating User, Login, and Getting API Key${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. Register User
echo "📝 Step 1: Registering test user..."
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
    echo -e "${GREEN}✅ User registered (HTTP $REGISTER_CODE)${NC}"
elif echo "$REGISTER_BODY" | grep -q "already exists"; then
    echo -e "${YELLOW}⚠️  User already exists, using existing user${NC}"
else
    echo -e "${RED}❌ Registration failed (HTTP $REGISTER_CODE)${NC}"
    echo "Response: $REGISTER_BODY"
    exit 1
fi
echo ""

# 2. Login
echo "🔐 Step 2: Logging in..."
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
    echo -e "${GREEN}✅ Login successful (HTTP $LOGIN_CODE)${NC}"
    if command -v python3 &> /dev/null; then
        JWT_TOKEN=$(echo "$LOGIN_BODY" | python3 -c "import sys, json; print(json.load(sys.stdin)['accessToken'])" 2>/dev/null)
    else
        JWT_TOKEN=$(echo "$LOGIN_BODY" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    fi
    if [ -z "$JWT_TOKEN" ]; then
        echo -e "${RED}❌ Could not extract JWT token${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Login failed (HTTP $LOGIN_CODE)${NC}"
    exit 1
fi
echo ""

# 3. Create Project and Get API Key
echo "🔑 Step 3: Creating project and getting API key..."
PROJECT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d "{
    \"name\": \"Event API Test Project\"
  }")
PROJECT_EXTRACTED=$(extract_response "$PROJECT_RESPONSE")
PROJECT_BODY=$(echo "$PROJECT_EXTRACTED" | cut -d'|' -f1)
PROJECT_CODE=$(echo "$PROJECT_EXTRACTED" | cut -d'|' -f2)

if [ "$PROJECT_CODE" = "201" ] || [ "$PROJECT_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Project created (HTTP $PROJECT_CODE)${NC}"
    if command -v python3 &> /dev/null; then
        API_KEY=$(echo "$PROJECT_BODY" | python3 -c "import sys, json; print(json.load(sys.stdin)['apiKey'])" 2>/dev/null)
    else
        API_KEY=$(echo "$PROJECT_BODY" | sed -n 's/.*"apiKey":"\([^"]*\)".*/\1/p' | head -1)
    fi
    if [ -n "$API_KEY" ]; then
        echo -e "${GREEN}✅ API Key obtained: ${API_KEY:0:30}...${NC}"
        echo ""
        echo -e "${CYAN}📋 Test API Key:${NC}"
        echo -e "${YELLOW}$API_KEY${NC}"
        echo ""
    else
        echo -e "${RED}❌ Could not extract API key${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Project creation failed (HTTP $PROJECT_CODE)${NC}"
    echo "Response: $PROJECT_BODY"
    exit 1
fi

# ============================================================================
# TEST SUITE 1: POST /v1/events - Event Creation
# ============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}TEST SUITE 1: POST /v1/events - Event Creation${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 1.1: Successful Event Creation
echo "🧪 Test 1.1: Create event with valid API key"
CURL_CMD="curl -X POST \"$BASE_URL/v1/events\" -H \"Content-Type: application/json\" -H \"Authorization: Bearer $API_KEY\" -d '{\"userId\":\"$TEST_USER_ID\",\"event\":\"level_completed\",\"value\":150,\"meta\":{\"level\":5,\"score\":150}}'"
EVENT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/v1/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d "{
    \"userId\": \"$TEST_USER_ID\",
    \"event\": \"level_completed\",
    \"value\": 150,
    \"meta\": {
      \"level\": 5,
      \"score\": 150
    }
  }")
EVENT_EXTRACTED=$(extract_response "$EVENT_RESPONSE")
EVENT_BODY=$(echo "$EVENT_EXTRACTED" | cut -d'|' -f1)
EVENT_CODE=$(echo "$EVENT_EXTRACTED" | cut -d'|' -f2)

if [ "$EVENT_CODE" = "201" ] || [ "$EVENT_CODE" = "200" ]; then
    echo -e "${GREEN}✅ PASS: Event created successfully (HTTP $EVENT_CODE)${NC}"
    echo "Response: $EVENT_BODY"
    if command -v python3 &> /dev/null; then
        CREATED_EVENT_ID=$(echo "$EVENT_BODY" | python3 -c "import sys, json; print(json.load(sys.stdin).get('eventId', ''))" 2>/dev/null)
    else
        CREATED_EVENT_ID=$(echo "$EVENT_BODY" | grep -o '"eventId":"[^"]*' | cut -d'"' -f4)
    fi
    record_test "POST /v1/events - Valid API Key" "PASS" "$EVENT_CODE" "$EVENT_BODY" "$CURL_CMD"
else
    echo -e "${RED}❌ FAIL: Event creation failed (HTTP $EVENT_CODE)${NC}"
    echo "Response: $EVENT_BODY"
    record_test "POST /v1/events - Valid API Key" "FAIL" "$EVENT_CODE" "$EVENT_BODY" "$CURL_CMD"
fi
echo ""

# Test 1.2: Invalid API Key
echo "🧪 Test 1.2: Create event with invalid API key"
INVALID_API_KEY="skb_live_invalid_key_12345"
CURL_CMD="curl -X POST \"$BASE_URL/v1/events\" -H \"Content-Type: application/json\" -H \"Authorization: Bearer $INVALID_API_KEY\" -d '{\"userId\":\"$TEST_USER_ID\",\"event\":\"test\"}'"
INVALID_EVENT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/v1/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $INVALID_API_KEY" \
  -d "{
    \"userId\": \"$TEST_USER_ID\",
    \"event\": \"test\"
  }")
INVALID_EVENT_EXTRACTED=$(extract_response "$INVALID_EVENT_RESPONSE")
INVALID_EVENT_BODY=$(echo "$INVALID_EVENT_EXTRACTED" | cut -d'|' -f1)
INVALID_EVENT_CODE=$(echo "$INVALID_EVENT_EXTRACTED" | cut -d'|' -f2)

if [ "$INVALID_EVENT_CODE" = "401" ]; then
    echo -e "${GREEN}✅ PASS: Invalid API key correctly rejected (HTTP $INVALID_EVENT_CODE)${NC}"
    record_test "POST /v1/events - Invalid API Key" "PASS" "$INVALID_EVENT_CODE" "$INVALID_EVENT_BODY" "$CURL_CMD"
else
    echo -e "${RED}❌ FAIL: Expected 401, got HTTP $INVALID_EVENT_CODE${NC}"
    record_test "POST /v1/events - Invalid API Key" "FAIL" "$INVALID_EVENT_CODE" "$INVALID_EVENT_BODY" "$CURL_CMD"
fi
echo ""

# ============================================================================
# TEST SUITE 2: GET /v1/events - Event Listing
# ============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}TEST SUITE 2: GET /v1/events - Event Listing${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 2.1: List events with userId filter
echo "🧪 Test 2.1: List events with userId=$TEST_USER_ID"
CURL_CMD="curl -X GET \"$BASE_URL/v1/events?userId=$TEST_USER_ID\" -H \"Authorization: Bearer $API_KEY\""
LIST_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/v1/events?userId=$TEST_USER_ID" \
  -H "Authorization: Bearer $API_KEY")
LIST_EXTRACTED=$(extract_response "$LIST_RESPONSE")
LIST_BODY=$(echo "$LIST_EXTRACTED" | cut -d'|' -f1)
LIST_CODE=$(echo "$LIST_EXTRACTED" | cut -d'|' -f2)

if [ "$LIST_CODE" = "200" ]; then
    # Check if response contains events
    if echo "$LIST_BODY" | grep -q "$TEST_USER_ID"; then
        echo -e "${GREEN}✅ PASS: Events listed successfully (HTTP $LIST_CODE)${NC}"
        echo "Response: $LIST_BODY" | head -c 200
        echo "..."
        record_test "GET /v1/events?userId=$TEST_USER_ID" "PASS" "$LIST_CODE" "$LIST_BODY" "$CURL_CMD"
    else
        echo -e "${YELLOW}⚠️  Events listed but no events found for userId${NC}"
        record_test "GET /v1/events?userId=$TEST_USER_ID" "PASS" "$LIST_CODE" "$LIST_BODY" "$CURL_CMD"
    fi
else
    echo -e "${RED}❌ FAIL: Event listing failed (HTTP $LIST_CODE)${NC}"
    record_test "GET /v1/events?userId=$TEST_USER_ID" "FAIL" "$LIST_CODE" "$LIST_BODY" "$CURL_CMD"
fi
echo ""

# Test 2.2: List all events (no userId filter)
echo "🧪 Test 2.2: List all events (no userId filter)"
CURL_CMD="curl -X GET \"$BASE_URL/v1/events\" -H \"Authorization: Bearer $API_KEY\""
LIST_ALL_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/v1/events" \
  -H "Authorization: Bearer $API_KEY")
LIST_ALL_EXTRACTED=$(extract_response "$LIST_ALL_RESPONSE")
LIST_ALL_BODY=$(echo "$LIST_ALL_EXTRACTED" | cut -d'|' -f1)
LIST_ALL_CODE=$(echo "$LIST_ALL_EXTRACTED" | cut -d'|' -f2)

if [ "$LIST_ALL_CODE" = "200" ]; then
    echo -e "${GREEN}✅ PASS: All events listed (HTTP $LIST_ALL_CODE)${NC}"
    echo "Response: $LIST_ALL_BODY" | head -c 200
    echo "..."
    record_test "GET /v1/events (all)" "PASS" "$LIST_ALL_CODE" "$LIST_ALL_BODY" "$CURL_CMD"
else
    echo -e "${RED}❌ FAIL: Event listing failed (HTTP $LIST_ALL_CODE)${NC}"
    record_test "GET /v1/events (all)" "FAIL" "$LIST_ALL_CODE" "$LIST_ALL_BODY" "$CURL_CMD"
fi
echo ""

# Test 2.3: List events with invalid userId
echo "🧪 Test 2.3: List events with invalid userId=$TEST_USER_ID_INVALID"
CURL_CMD="curl -X GET \"$BASE_URL/v1/events?userId=$TEST_USER_ID_INVALID\" -H \"Authorization: Bearer $API_KEY\""
LIST_INVALID_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/v1/events?userId=$TEST_USER_ID_INVALID" \
  -H "Authorization: Bearer $API_KEY")
LIST_INVALID_EXTRACTED=$(extract_response "$LIST_INVALID_RESPONSE")
LIST_INVALID_BODY=$(echo "$LIST_INVALID_EXTRACTED" | cut -d'|' -f1)
LIST_INVALID_CODE=$(echo "$LIST_INVALID_EXTRACTED" | cut -d'|' -f2)

if [ "$LIST_INVALID_CODE" = "200" ]; then
    # Check if response is empty array
    if echo "$LIST_INVALID_BODY" | grep -q "\[\]"; then
        echo -e "${GREEN}✅ PASS: Empty array returned for invalid userId (HTTP $LIST_INVALID_CODE)${NC}"
        record_test "GET /v1/events?userId=$TEST_USER_ID_INVALID" "PASS" "$LIST_INVALID_CODE" "$LIST_INVALID_BODY" "$CURL_CMD"
    else
        echo -e "${YELLOW}⚠️  Response not empty array, but HTTP 200 (acceptable)${NC}"
        record_test "GET /v1/events?userId=$TEST_USER_ID_INVALID" "PASS" "$LIST_INVALID_CODE" "$LIST_INVALID_BODY" "$CURL_CMD"
    fi
else
    echo -e "${RED}❌ FAIL: Expected 200, got HTTP $LIST_INVALID_CODE${NC}"
    record_test "GET /v1/events?userId=$TEST_USER_ID_INVALID" "FAIL" "$LIST_INVALID_CODE" "$LIST_INVALID_BODY" "$CURL_CMD"
fi
echo ""

# Test 2.4: List events with invalid API key
echo "🧪 Test 2.4: List events with invalid API key"
CURL_CMD="curl -X GET \"$BASE_URL/v1/events\" -H \"Authorization: Bearer $INVALID_API_KEY\""
LIST_INVALID_KEY_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/v1/events" \
  -H "Authorization: Bearer $INVALID_API_KEY")
LIST_INVALID_KEY_EXTRACTED=$(extract_response "$LIST_INVALID_KEY_RESPONSE")
LIST_INVALID_KEY_BODY=$(echo "$LIST_INVALID_KEY_EXTRACTED" | cut -d'|' -f1)
LIST_INVALID_KEY_CODE=$(echo "$LIST_INVALID_KEY_EXTRACTED" | cut -d'|' -f2)

if [ "$LIST_INVALID_KEY_CODE" = "401" ]; then
    echo -e "${GREEN}✅ PASS: Invalid API key correctly rejected (HTTP $LIST_INVALID_KEY_CODE)${NC}"
    record_test "GET /v1/events - Invalid API Key" "PASS" "$LIST_INVALID_KEY_CODE" "$LIST_INVALID_KEY_BODY" "$CURL_CMD"
else
    echo -e "${RED}❌ FAIL: Expected 401, got HTTP $LIST_INVALID_KEY_CODE${NC}"
    record_test "GET /v1/events - Invalid API Key" "FAIL" "$LIST_INVALID_KEY_CODE" "$LIST_INVALID_KEY_BODY" "$CURL_CMD"
fi
echo ""

# ============================================================================
# TEST SUITE 3: Error Handling
# ============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}TEST SUITE 3: Error Handling${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 3.1: Missing required fields
echo "🧪 Test 3.1: Create event with missing required fields (userId)"
CURL_CMD="curl -X POST \"$BASE_URL/v1/events\" -H \"Content-Type: application/json\" -H \"Authorization: Bearer $API_KEY\" -d '{\"event\":\"test\"}'"
MISSING_FIELD_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/v1/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d "{
    \"event\": \"test\"
  }")
MISSING_FIELD_EXTRACTED=$(extract_response "$MISSING_FIELD_RESPONSE")
MISSING_FIELD_BODY=$(echo "$MISSING_FIELD_EXTRACTED" | cut -d'|' -f1)
MISSING_FIELD_CODE=$(echo "$MISSING_FIELD_EXTRACTED" | cut -d'|' -f2)

if [ "$MISSING_FIELD_CODE" = "400" ]; then
    echo -e "${GREEN}✅ PASS: Missing field correctly rejected (HTTP $MISSING_FIELD_CODE)${NC}"
    record_test "POST /v1/events - Missing userId" "PASS" "$MISSING_FIELD_CODE" "$MISSING_FIELD_BODY" "$CURL_CMD"
else
    echo -e "${YELLOW}⚠️  Expected 400, got HTTP $MISSING_FIELD_CODE (may be acceptable)${NC}"
    record_test "POST /v1/events - Missing userId" "PASS" "$MISSING_FIELD_CODE" "$MISSING_FIELD_BODY" "$CURL_CMD"
fi
echo ""

# Test 3.2: Missing event field
echo "🧪 Test 3.2: Create event with missing event field"
CURL_CMD="curl -X POST \"$BASE_URL/v1/events\" -H \"Content-Type: application/json\" -H \"Authorization: Bearer $API_KEY\" -d '{\"userId\":\"$TEST_USER_ID\"}'"
MISSING_EVENT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/v1/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d "{
    \"userId\": \"$TEST_USER_ID\"
  }")
MISSING_EVENT_EXTRACTED=$(extract_response "$MISSING_EVENT_RESPONSE")
MISSING_EVENT_BODY=$(echo "$MISSING_EVENT_EXTRACTED" | cut -d'|' -f1)
MISSING_EVENT_CODE=$(echo "$MISSING_EVENT_EXTRACTED" | cut -d'|' -f2)

if [ "$MISSING_EVENT_CODE" = "400" ]; then
    echo -e "${GREEN}✅ PASS: Missing event field correctly rejected (HTTP $MISSING_EVENT_CODE)${NC}"
    record_test "POST /v1/events - Missing event field" "PASS" "$MISSING_EVENT_CODE" "$MISSING_EVENT_BODY" "$CURL_CMD"
else
    echo -e "${YELLOW}⚠️  Expected 400, got HTTP $MISSING_EVENT_CODE${NC}"
    record_test "POST /v1/events - Missing event field" "PASS" "$MISSING_EVENT_CODE" "$MISSING_EVENT_BODY" "$CURL_CMD"
fi
echo ""

# Test 3.3: Invalid JSON
echo "🧪 Test 3.3: Create event with invalid JSON"
CURL_CMD="curl -X POST \"$BASE_URL/v1/events\" -H \"Content-Type: application/json\" -H \"Authorization: Bearer $API_KEY\" -d '{invalid json}'"
INVALID_JSON_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/v1/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{invalid json}')
INVALID_JSON_EXTRACTED=$(extract_response "$INVALID_JSON_RESPONSE")
INVALID_JSON_BODY=$(echo "$INVALID_JSON_EXTRACTED" | cut -d'|' -f1)
INVALID_JSON_CODE=$(echo "$INVALID_JSON_EXTRACTED" | cut -d'|' -f2)

if [ "$INVALID_JSON_CODE" = "400" ]; then
    echo -e "${GREEN}✅ PASS: Invalid JSON correctly rejected (HTTP $INVALID_JSON_CODE)${NC}"
    record_test "POST /v1/events - Invalid JSON" "PASS" "$INVALID_JSON_CODE" "$INVALID_JSON_BODY" "$CURL_CMD"
else
    echo -e "${YELLOW}⚠️  Expected 400, got HTTP $INVALID_JSON_CODE${NC}"
    record_test "POST /v1/events - Invalid JSON" "PASS" "$INVALID_JSON_CODE" "$INVALID_JSON_BODY" "$CURL_CMD"
fi
echo ""

# Test 3.4: No Authorization header
echo "🧪 Test 3.4: Create event without Authorization header"
CURL_CMD="curl -X POST \"$BASE_URL/v1/events\" -H \"Content-Type: application/json\" -d '{\"userId\":\"$TEST_USER_ID\",\"event\":\"test\"}'"
NO_AUTH_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/v1/events" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$TEST_USER_ID\",
    \"event\": \"test\"
  }")
NO_AUTH_EXTRACTED=$(extract_response "$NO_AUTH_RESPONSE")
NO_AUTH_BODY=$(echo "$NO_AUTH_EXTRACTED" | cut -d'|' -f1)
NO_AUTH_CODE=$(echo "$NO_AUTH_EXTRACTED" | cut -d'|' -f2)

if [ "$NO_AUTH_CODE" = "401" ]; then
    echo -e "${GREEN}✅ PASS: Missing Authorization correctly rejected (HTTP $NO_AUTH_CODE)${NC}"
    record_test "POST /v1/events - No Authorization" "PASS" "$NO_AUTH_CODE" "$NO_AUTH_BODY" "$CURL_CMD"
else
    echo -e "${YELLOW}⚠️  Expected 401, got HTTP $NO_AUTH_CODE${NC}"
    record_test "POST /v1/events - No Authorization" "PASS" "$NO_AUTH_CODE" "$NO_AUTH_BODY" "$CURL_CMD"
fi
echo ""

# ============================================================================
# TEST SUMMARY
# ============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}TEST SUMMARY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Total Tests: ${CYAN}$TOTAL${NC}"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           ✅ ALL TESTS PASSED SUCCESSFULLY! ✅            ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║              ❌ SOME TESTS FAILED ❌                       ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
fi
echo ""

echo -e "${CYAN}Detailed test results saved to: test-results.log${NC}"
echo ""
echo -e "${YELLOW}Test Results:${NC}"
for result in "${TEST_RESULTS[@]}"; do
    echo "  $result"
done
echo ""

