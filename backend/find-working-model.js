const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

const testAll = async () => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const modelsToTest = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-flash-latest',
    'gemini-pro-latest'
  ];

  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('hi');
      console.log(`✅ ${modelName} works!`);
      return modelName;
    } catch (error) {
      console.error(`❌ ${modelName} failed: ${error.message}`);
    }
  }
};

testAll().then(workingModel => {
  if (workingModel) {
    console.log('Use this model:', workingModel);
  } else {
    console.log('No models worked. Check API key or billing.');
  }
});
