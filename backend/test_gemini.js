const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testGemini() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-pro"
        });

        const prompt = "Reply with exactly this JSON: [\"Hello\"]";
        console.log("Sending prompt to Gemini-Pro...");
        
        const result = await model.generateContent(prompt);
        console.log("SUCCESS! Received response:", result.response.text());
    } catch (error) {
        console.error("FAIL! Error encountered:", error.message);
    }
}

testGemini();
