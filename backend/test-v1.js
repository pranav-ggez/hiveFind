const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

const testV1 = async () => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // There isn't an easy way in the SDK to force v1, but we can try to use a model that might be in v1
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }, { apiVersion: 'v1' });
    console.log('Testing gemini-1.5-flash on v1...');
    const result = await model.generateContent('test');
    console.log('✅ Success on v1:', result.response.text());
  } catch (error) {
    console.error('❌ v1 Error:', error.message);
  }
};

testV1();
