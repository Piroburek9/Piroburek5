// Simple API test script
console.log('🧪 Testing EduPlatform API...\n');

async function testAPI() {
  const baseURL = 'http://localhost:8000';
  const endpoints = [
    '/health',
    '/api/health',
    '/api/init'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${baseURL}${endpoint}...`);
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: endpoint === '/api/init' ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint}: OK`);
        console.log(`   Status: ${data.status || 'success'}`);
        if (data.timestamp) console.log(`   Time: ${data.timestamp}`);
        if (data.version) console.log(`   Version: ${data.version}`);
      } else {
        console.log(`❌ ${endpoint}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
    console.log('');
  }

  console.log('🏁 API test completed!');
  console.log('\nIf you see ❌ errors, make sure backend is running:');
  console.log('cd server && npm run dev');
}

testAPI();
