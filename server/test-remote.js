async function testRemote() {
  const payload = {
    businessType: 'gym',
    targetAudience: 'fat people',
    productService: 'cardio',
    platform: 'Instagram',
    tone: 'Emotional',
    goal: 'Lead Generation',
    provider: 'gemini'
  };

  console.log('Sending request to Render backend at https://marketmate-ai.onrender.com/api/generate...');
  try {
    const response = await fetch('https://marketmate-ai.onrender.com/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log('STATUS:', response.status);
    const data = await response.json();
    console.log('RESPONSE:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('API Error:', error.message);
  }
}

testRemote();
