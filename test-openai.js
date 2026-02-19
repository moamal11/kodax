// اختبار OpenAI API Key
// استبدل YOUR_API_KEY بمفتاحك الفعلي

const API_KEY = 'YOUR_API_KEY_HERE';

async function testOpenAI() {
  try {
    console.log('Testing OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Say "API works!"' }],
        max_tokens: 10,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ OpenAI Error:', response.status);
      console.error('Details:', data);
      return;
    }

    console.log('✅ API Key Works!');
    console.log('Response:', data.choices[0].message.content);
  } catch (error) {
    console.error('❌ Test Failed:', error.message);
  }
}

testOpenAI();
