const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const listModels = async () => {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
    const response = await axios.get(url);
    console.log('Available Models:');
    response.data.models.forEach(m => console.log(m.name));
  } catch (error) {
    console.error('List Models Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
};

listModels();
