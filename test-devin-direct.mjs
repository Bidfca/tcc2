// Direct test of Devin AI API
import axios from 'axios';

const API_KEY = 'apk_user_Z29vZ2xlLW9hdXRoMnwxMDIxMzAyNTQ1NDc5NzI4MzU0OTZfb3JnLTkxZTFiMWQzNjMxNzQ4YjJiNTg5YzYzZWY0YTQxNTNlOjU2NjgzODU5Y2IzZDRkZDdhZWQ1MWVjMzg3MTFmYjdm';

async function testDirectDevinAPI() {
  console.log('🧪 Testing Direct Devin AI API...\n');

  try {
    const response = await axios.post(
      'https://api.devin.ai/v1/sessions',
      {
        prompt: 'Test session creation',
        idempotent: true
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000
      }
    );

    console.log('✅ Direct API Response:', {
      status: response.status,
      data: response.data
    });

  } catch (error) {
    console.error('❌ Direct API test failed:', error.response?.data || error.message);
    
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

testDirectDevinAPI();
