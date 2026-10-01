const axios = require('axios');

const AI_SERVER_URL = process.env.AI_SERVER_URL;

const askWithContext = async (message) => {
    const response = await axios.post(`${AI_SERVER_URL}/api/chatbot`, { question: message });
    return response.data.message;
};

module.exports = { askWithContext };