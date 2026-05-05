const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/api';

async function testAuth() {
  console.log('--- Testing Imtihan Auth API ---');
  
  const testUser = {
    name: 'Test Student',
    email: `test_${Date.now()}@example.com`,
    password: 'password123',
    grade: '10',
    board: 'Punjab'
  };

  try {
    // 1. Register
    console.log('\n1. Testing Registration...');
    const regRes = await axios.post(`${BASE_URL}/auth/register`, testUser);
    console.log('Status:', regRes.status);
    console.log('Response:', regRes.data);

    // 2. Login
    console.log('\n2. Testing Login...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('Status:', loginRes.status);
    const token = loginRes.data.token;
    console.log('Token received:', token ? 'Yes' : 'No');

    // 3. Get Me
    console.log('\n3. Testing Get Me...');
    const meRes = await axios.get(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Status:', meRes.status);
    console.log('User Data:', meRes.data);
    
    if (meRes.data.grade === '10' && meRes.data.board === 'Punjab') {
      console.log('\nSUCCESS: Mapping correctly handled (10 -> ten, Punjab -> punjab)');
    } else {
      console.log('\nWARNING: Mapping results unexpected:', meRes.data.grade, meRes.data.board);
    }

    // 4. Update Me
    console.log('\n4. Testing Update Me...');
    const updateRes = await axios.post(`${BASE_URL}/users/me`, {
      grade: '12',
      board: 'Sindh'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Status:', updateRes.status);
    console.log('Updated User Data:', updateRes.data);

    if (updateRes.data.grade === '12' && updateRes.data.board === 'Sindh') {
      console.log('\nSUCCESS: Update mapping correctly handled');
    }

  } catch (error) {
    console.error('\nERROR during testing:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testAuth();
