// Test script for Devin AI API integration
// @ts-check
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testDevinAPI() {
  console.log('🧪 Testing Devin AI API Integration...\n');

  try {
    // Test 1: Pull Request Analysis
    console.log('📋 Test 1: Pull Request Analysis');
    const prResponse = await axios.post(`${BASE_URL}/api/devin/analyze`, {
      type: 'pull-request',
      content: {
        url: 'https://github.com/example/repo/pull/123'
      }
    });
    
    console.log('✅ PR Analysis Response:', {
      status: prResponse.status,
      sessionId: prResponse.data.session_id,
      sessionUrl: prResponse.data.url,
      isNewSession: prResponse.data.is_new_session
    });
    console.log('');

    // Test 2: Code Analysis
    console.log('💻 Test 2: Code Analysis');
    const codeResponse = await axios.post(`${BASE_URL}/api/devin/analyze`, {
      type: 'code',
      content: {
        code: 'function hello() { console.log("Hello World"); }',
        context: 'Simple greeting function'
      }
    });
    
    console.log('✅ Code Analysis Response:', {
      status: codeResponse.status,
      sessionId: codeResponse.data.session_id,
      sessionUrl: codeResponse.data.url,
      isNewSession: codeResponse.data.is_new_session
    });
    console.log('');

    // Test 3: Code Generation
    console.log('🔧 Test 3: Code Generation');
    const generateResponse = await axios.post(`${BASE_URL}/api/devin/analyze`, {
      type: 'generate',
      content: {
        description: 'Create a function that calculates the factorial of a number',
        language: 'TypeScript'
      }
    });
    
    console.log('✅ Code Generation Response:', {
      status: generateResponse.status,
      sessionId: generateResponse.data.session_id,
      sessionUrl: generateResponse.data.url,
      isNewSession: generateResponse.data.is_new_session
    });
    console.log('');

    // Test 4: Session Creation
    console.log('🆕 Test 4: Direct Session Creation');
    const sessionResponse = await axios.post(`${BASE_URL}/api/devin/sessions`, {
      prompt: 'Test session creation',
      idempotent: true
    });
    
    console.log('✅ Session Creation Response:', {
      status: sessionResponse.status,
      sessionId: sessionResponse.data.session_id,
      sessionUrl: sessionResponse.data.url,
      isNewSession: sessionResponse.data.is_new_session
    });
    console.log('');

    console.log('🎉 All tests completed successfully!');
    console.log('\n📖 Usage:');
    console.log('- Visit http://localhost:3000/devin to use the web interface');
    console.log('- API endpoints are available at /api/devin/*');
    console.log('- Sessions are created on Devin AI and can be accessed via the provided URLs');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      console.log('\n💡 Possible issues:');
      console.log('- Devin API key not configured');
      console.log('- Devin API service unavailable');
      console.log('- Network connectivity issues');
    }
  }
}

// Run tests if this script is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  testDevinAPI();
}

export { testDevinAPI };
