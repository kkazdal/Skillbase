# SkillBase Workflow Test Guide

Complete guide for running workflow tests on Unity and React Native SDKs.

## Overview

This test suite validates the complete workflow of SkillBase SDKs:
- ✅ **Auth Workflow**: Register, Login, Refresh Token, Logout
- ✅ **Event API**: Create Event, Get Events
- ✅ **Error Handling**: Invalid credentials, invalid data, network errors
- ✅ **Token Persistence**: Save/Load tokens from storage
- ✅ **Retry Mechanism**: Automatic retry with exponential backoff

## Prerequisites

### Backend Setup
1. Ensure the SkillBase backend is running:
   ```bash
   docker-compose up -d
   ```

2. Verify backend health:
   ```bash
   curl http://localhost:3000/health
   ```

### React Native Tests
- Node.js 18+ installed
- npm or yarn installed
- SDK dependencies installed (`cd sdk && npm install`)

### Unity Tests
- Unity 2020.3 or later
- SkillBase Unity SDK imported

## Running Tests

### React Native Tests

#### Option 1: Using Test Runner Script
```bash
# Run all tests
./tests/run-workflow-tests.sh

# Run only React Native tests
./tests/run-workflow-tests.sh --react-only
```

#### Option 2: Direct Execution
```bash
cd sdk
npm install
ts-node tests/react-native-workflow.test.ts
```

#### Option 3: Using npm test (if configured)
```bash
cd sdk
npm test
```

### Unity Tests

1. **Open Unity Project**
   - Import the SkillBase Unity SDK package
   - Open a scene or create a new one

2. **Add Test Script**
   - Create an empty GameObject in your scene
   - Create a test script using the SkillBase SDK
   - See [sdk-unity/README.md](../sdk-unity/README.md) for integration guide

3. **Run Tests**
   - Press Play in Unity Editor
   - Tests will run automatically and output results to Console
   - Check the Console window for detailed test results

4. **Test Output**
   - All test results are logged to Unity Console
   - ✅ = Passed test
   - ❌ = Failed test
   - Summary includes pass/fail counts and success rate

## Test Suites

### Suite 1: Auth Workflow
- **Test 1.1**: Register User
  - Creates a new user account
  - Validates user ID is returned
  - Handles duplicate user registration (409 error)

- **Test 1.2**: Login
  - Authenticates with email/password
  - Validates access token is returned
  - Sets user ID for subsequent tests

- **Test 1.3**: Refresh Token
  - Refreshes expired/invalid tokens
  - Validates new token is returned
  - Tests automatic token refresh callback

### Suite 2: Event API
- **Test 2.1**: Create Event
  - Creates a test event with metadata
  - Validates event ID is returned
  - Tests event creation with various data types

- **Test 2.2**: Get Events
  - Retrieves all events for a user
  - Validates event list is returned
  - Tests event filtering and pagination

### Suite 3: Error Handling
- **Test 3.1**: Invalid Login Credentials
  - Tests error handling for wrong credentials
  - Validates 401/404 error codes
  - Tests error message parsing

- **Test 3.2**: Invalid Event Data
  - Tests error handling for invalid event data
  - Validates 400/422 error codes
  - Tests validation error messages

### Suite 4: Token Persistence
- **Test 4.1**: Save Token
  - Tests saving token to storage (AsyncStorage/PlayerPrefs)
  - Validates token is persisted correctly

- **Test 4.2**: Load Token
  - Tests loading token from storage
  - Validates token is set on client
  - Tests token restoration on app restart

### Suite 5: Retry Mechanism
- **Test 5.1**: Retry Configuration
  - Validates retry mechanism is configured
  - Tests maxRetries and retryDelay settings

- **Test 5.2**: Retry Mechanism Available
  - Confirms retry mechanism is active
  - Tests exponential backoff configuration

## Test Results

### React Native Output
```
🧪 Starting SkillBase React Native SDK Workflow Tests...

📋 TEST SUITE 1: Auth Workflow
  Test 1.1: Register User
    ✅ PASS - Register User: User ID: user_123
  Test 1.2: Login
    ✅ PASS - Login: Token received: true
  Test 1.3: Refresh Token
    ✅ PASS - Refresh Token: Token refreshed successfully

📊 TEST RESULTS SUMMARY
============================================================
✅ Tests Passed: 12
❌ Tests Failed: 0
📊 Total Tests: 12
📈 Success Rate: 100.0%
🎉 All tests passed!
```

### Unity Output
```
🧪 Starting SkillBase Unity SDK Workflow Tests...

📋 TEST SUITE 1: Auth Workflow
  Test 1.1: Register User
    ✅ PASS - Register User: User ID: user_123
  Test 1.2: Login
    ✅ PASS - Login: Token received: true
  Test 1.3: Refresh Token
    ✅ PASS - Refresh Token: Token refreshed successfully

📊 TEST RESULTS SUMMARY
============================================================
✅ Tests Passed: 12
❌ Tests Failed: 0
📊 Total Tests: 12
📈 Success Rate: 100.0%
🎉 All tests passed!
```

## Troubleshooting

### Backend Not Running
**Error**: `Backend is not running at http://localhost:3000`

**Solution**:
```bash
docker-compose up -d
# Wait for containers to start
docker-compose ps
```

### React Native Tests Fail
**Error**: `Cannot find module 'ts-node'`

**Solution**:
```bash
cd sdk
npm install -g ts-node typescript
npm install
```

### Unity Tests Don't Run
**Error**: Tests don't execute in Unity

**Solution**:
1. Ensure `SkillBaseWorkflowTest.cs` is attached to a GameObject
2. Check that the GameObject is active in the scene
3. Verify Unity Console is open to see output
4. Check that backend is accessible from Unity (network/firewall)

### Token Refresh Fails
**Error**: `Token refresh failed`

**Solution**:
1. Ensure backend `/auth/refresh` endpoint is available
2. Check that JWT token is valid before refresh
3. Verify token hasn't expired completely (refresh before expiration)

### Network Errors
**Error**: `Network error` or timeout

**Solution**:
1. Verify backend is running and accessible
2. Check network connectivity
3. Verify BASE_URL is correct (default: `http://localhost:3000`)
4. For Unity: Ensure Unity can access localhost (may need to use IP address)

## Customization

### Change Base URL
```bash
# React Native
BASE_URL=https://api.skillbase.com ./tests/run-workflow-tests.sh

# Unity (in SkillBaseWorkflowTest.cs)
baseUrl = "https://api.skillbase.com"
```

### Adjust Retry Settings
```typescript
// React Native
const client = new SkillBaseClient({
  maxRetries: 5,      // Increase retries
  retryDelay: 2000,   // Increase delay
});
```

```csharp
// Unity
client.Initialize(new SkillBaseClientOptions
{
    maxRetries = 5,
    retryDelayMs = 2000,
});
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Workflow Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Start Backend
        run: docker-compose up -d
      - name: Run React Native Tests
        run: ./tests/run-workflow-tests.sh --react-only
```

## Next Steps

After running tests:
1. Review test results and fix any failures
2. Check backend logs for errors
3. Verify SDK functionality in your application
4. Run tests regularly as part of CI/CD pipeline

## Support

For issues or questions:
- Check backend logs: `docker-compose logs -f api`
- Review SDK documentation: `sdk/README.md`
- Check Unity SDK docs: `sdk-unity/README.md`

