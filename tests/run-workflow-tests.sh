#!/bin/bash

# SkillBase Workflow Test Runner
# Runs Unity and React Native workflow tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
REACT_NATIVE_TEST_DIR="sdk/tests"
UNITY_TEST_DIR="sdk-unity/Examples"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}SkillBase Workflow Test Runner${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if backend is running
echo -e "${YELLOW}Checking backend availability...${NC}"
if curl -s -f "${BASE_URL}/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running at ${BASE_URL}${NC}"
else
    echo -e "${RED}❌ Backend is not running at ${BASE_URL}${NC}"
    echo -e "${YELLOW}Please start the backend first:${NC}"
    echo "  docker-compose up -d"
    exit 1
fi
echo ""

# Function to run React Native tests
run_react_native_tests() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Running React Native Workflow Tests${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    if [ ! -f "${REACT_NATIVE_TEST_DIR}/react-native-workflow.test.ts" ]; then
        echo -e "${RED}❌ Test file not found: ${REACT_NATIVE_TEST_DIR}/react-native-workflow.test.ts${NC}"
        return 1
    fi

    cd sdk

    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing SDK dependencies...${NC}"
        npm install
    fi

    # Check if ts-node is available
    if ! command -v ts-node &> /dev/null; then
        echo -e "${YELLOW}Installing ts-node...${NC}"
        npm install -g ts-node typescript
    fi

    echo -e "${YELLOW}Running React Native tests...${NC}"
    BASE_URL="${BASE_URL}" ts-node tests/react-native-workflow.test.ts

    cd ..
    echo ""
}

# Function to check Unity test file
check_unity_tests() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Unity Workflow Test Status${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    if [ -f "${UNITY_TEST_DIR}/SkillBaseWorkflowTest.cs" ]; then
        echo -e "${GREEN}✅ Unity test file found: ${UNITY_TEST_DIR}/SkillBaseWorkflowTest.cs${NC}"
        echo ""
        echo -e "${YELLOW}To run Unity tests:${NC}"
        echo "  1. Open Unity project"
        echo "  2. Attach SkillBaseWorkflowTest.cs to a GameObject"
        echo "  3. Run the scene"
        echo ""
        echo -e "${YELLOW}Test file location:${NC}"
        echo "  ${UNITY_TEST_DIR}/SkillBaseWorkflowTest.cs"
        echo ""
    else
        echo -e "${RED}❌ Unity test file not found: ${UNITY_TEST_DIR}/SkillBaseWorkflowTest.cs${NC}"
    fi
    echo ""
}

# Main execution
main() {
    # Run React Native tests
    if [ "$1" != "--unity-only" ]; then
        run_react_native_tests
    fi

    # Check Unity tests
    if [ "$1" != "--react-only" ]; then
        check_unity_tests
    fi

    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN}Test execution completed!${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Parse arguments
case "${1:-}" in
    --react-only)
        run_react_native_tests
        ;;
    --unity-only)
        check_unity_tests
        ;;
    *)
        main
        ;;
esac

