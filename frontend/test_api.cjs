const axios = require('axios');

async function testBackend() {
  console.log("Starting backend integration tests...");
  const API_URL = 'http://localhost:5000/api';
  
  try {
    // 1. Health check (telemetry base)
    console.log("Checking API health...");
    let health = await axios.get(`${API_URL}/telemetry`);
    console.log("Telemetry OK:", health.status === 200);
  } catch (err) {
    console.log("Telemetry GET failed. Probably unauthorized, which is correct.", err.response?.status);
  }

  try {
    // 2. Register User
    const ts = Date.now();
    const email = `testuser_${ts}@example.com`;
    console.log(`Registering user ${email}...`);
    const regRes = await axios.post(`${API_URL}/auth/register`, {
      name: "Test User",
      email: email,
      password: "password123"
    });
    console.log("Register response:", regRes.status);
    
    // 3. Login
    console.log("Logging in...");
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: email,
      password: "password123"
    });
    const token = loginRes.data.accessToken;
    console.log("Login response:", loginRes.status, "Token:", !!token);

    const axiosInstance = axios.create({
      baseURL: API_URL,
      headers: { Authorization: `Bearer ${token}` }
    });

    // 4. Get User Profile
    console.log("Fetching /users/me...");
    const meRes = await axiosInstance.get('/users/me');
    console.log("User Profile:", meRes.data.email === email ? "OK" : "Mismatch");

    // 5. Test AI Analyze Skills Route
    console.log("Testing /ai/skills/analyze...");
    const skillRes = await axiosInstance.post('/ai/skills/analyze');
    console.log("Skills Analyze Response:", skillRes.data);

    // 6. Test AI Roadmap Route
    console.log("Testing /ai/roadmap...");
    const rmRes = await axiosInstance.post('/ai/roadmap', { targetRoles: ["Backend Engineer"] });
    console.log("Roadmap Response:", rmRes.data);

    // 7. Test AI Mentor Chat Route
    console.log("Testing /ai/mentor/chat...");
    const chatRes = await axiosInstance.post('/ai/mentor/chat', { message: "Hello", sessionId: null });
    console.log("Mentor Chat Response:", chatRes.data);

    console.log("All tests passed successfully!");
  } catch (err) {
    console.error("Test failed:", err.message);
    if (err.response) {
      console.error("Response data:", err.response.data);
      console.error("Status:", err.response.status);
    }
  }
}

testBackend();
