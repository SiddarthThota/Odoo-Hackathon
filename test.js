const axios = require('axios');

async function test() {
  try {
    console.log('Logging in...');
    const loginRes = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'sidarththota@gmail.com',
      password: 'password123' // Wait, I don't know their password, I'll just register a test user
    });
  } catch (e) {
    console.error(e.message);
  }
}

test();
