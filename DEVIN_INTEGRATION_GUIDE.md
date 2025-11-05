# Devin AI Integration Guide

## Overview

This guide describes the Devin AI integration that has been added to the AgroInsight platform. The integration allows users to create Devin AI sessions for code analysis, pull request reviews, and code generation.

## Features

### 1. Session Management

- Create new Devin AI sessions with custom prompts
- Support for idempotent session creation
- Direct session URL access for real-time interaction

### 2. Analysis Types

- **Pull Request Analysis**: Review GitHub pull requests
- **Code Analysis**: Analyze code snippets with optional context
- **Code Generation**: Generate code based on descriptions

### 3. Web Interface

- User-friendly interface at `/devin`
- Real-time session creation
- Direct links to Devin AI sessions

## API Endpoints

### POST `/api/devin/sessions`

Create a new Devin AI session.

**Request Body:**

```json
{
  "prompt": "string",
  "idempotent": "boolean (optional)"
}
```

**Response:**

```json
{
  "session_id": "string",
  "url": "string",
  "is_new_session": "boolean"
}
```

### GET `/api/devin/sessions/[sessionId]`

Get session details (if available).

### POST `/api/devin/analyze`

Unified endpoint for all analysis types.

**Request Body:**

```json
{
  "type": "pull-request" | "code" | "generate",
  "content": {
    // Type-specific content
  }
}
```

**Pull Request Content:**

```json
{
  "url": "https://github.com/example/repo/pull/123"
}
```

**Code Analysis Content:**

```json
{
  "code": "function hello() { console.log('Hello World'); }",
  "context": "optional context description"
}
```

**Code Generation Content:**

```json
{
  "description": "Create a factorial function",
  "language": "TypeScript"
}
```

## Configuration

### Environment Variables

Add to your `.env` file:

```env
DEVIN_API_KEY="your-devin-api-key-here"
```

### Dependencies

The integration uses:

- `axios` for HTTP requests
- Existing Next.js API routes
- React components with TypeScript

## Usage Examples

### 1. Using the Web Interface

1. Navigate to `http://localhost:3000/devin`
2. Select analysis type (Pull Request, Code Analysis, or Code Generation)
3. Fill in the required fields
4. Click "Analyze" to create a session
5. Click the provided session URL to interact with Devin AI

### 2. Using the API Directly

**Create a pull request analysis session:**

```bash
curl -X POST http://localhost:3000/api/devin/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "type": "pull-request",
    "content": {
      "url": "https://github.com/example/repo/pull/123"
    }
  }'
```

**Create a code analysis session:**

```bash
curl -X POST http://localhost:3000/api/devin/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "type": "code",
    "content": {
      "code": "function hello() { console.log(\"Hello World\"); }",
      "context": "Simple greeting function"
    }
  }'
```

**Create a code generation session:**

```bash
curl -X POST http://localhost:3000/api/devin/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "type": "generate",
    "content": {
      "description": "Create a function that calculates factorial",
      "language": "TypeScript"
    }
  }'
```

## Testing

Run the test script to verify the integration:

```bash
node test-devin-api.mjs
```

This will test all API endpoints and provide usage information.

## File Structure

```text
├── services/
│   └── devin.service.ts          # Devin API service
├── app/api/devin/
│   ├── sessions/
│   │   ├── route.ts             # POST /api/devin/sessions
│   │   └── [sessionId]/
│   │       └── route.ts         # GET /api/devin/sessions/[id]
│   └── analyze/
│       └── route.ts             # POST /api/devin/analyze
├── components/devin/
│   └── DevinInterface.tsx       # Web interface component
├── app/devin/
│   └── page.tsx                 # Devin integration page
├── test-devin-api.mjs            # API test script
└── test-devin-direct.mjs         # Direct API test
```

## Security Considerations

1. **API Key Protection**: The Devin API key is stored in environment variables and not exposed to the client

2. **Input Validation**: All API endpoints validate input parameters

3. **Error Handling**: Comprehensive error handling prevents information leakage

4. **Rate Limiting**: Consider implementing rate limiting for production use

## Integration with Existing Features

The Devin AI integration is standalone and doesn't interfere with existing AgroInsight features:

- Agricultural analysis tools remain unchanged
- Multi-species support is unaffected
- Reference system continues to work independently

## Future Enhancements

Potential improvements for the Devin integration:

1. **Session Polling**: Automatically check session status and display results

2. **History Tracking**: Store session history for users

3. **Templates**: Pre-defined prompts for common agricultural coding tasks

4. **Batch Processing**: Analyze multiple code snippets in one session

5. **Export Options**: Export Devin AI responses to various formats

## Troubleshooting

### Common Issues

1. **API Key Not Found**
   - Ensure `DEVIN_API_KEY` is set in `.env`
   - Restart the development server after adding the key

2. **Session Creation Fails**
   - Check network connectivity
   - Verify API key validity
   - Check Devin AI service status

3. **UI Not Loading**
   - Ensure all components are properly imported
   - Check for TypeScript errors
   - Verify Next.js is running correctly

### Debug Commands

```bash
# Test direct Devin API connection
node test-devin-direct.mjs

# Test full integration
node test-devin-api.mjs

# Check environment variables
echo $DEVIN_API_KEY
```

## Support

For issues related to:

- **Devin AI API**: Check Devin AI documentation

- **Integration Code**: Review the implementation in `/services/devin.service.ts`

- **UI Components**: Check `/components/devin/DevinInterface.tsx`

- **API Routes**: Review `/app/api/devin/` endpoints
