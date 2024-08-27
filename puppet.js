import fetch from 'node-fetch';

// Define your API key and endpoint
const apiKey = "acc879a4c7f2413599c613653eefb51e";
const azureEndpoint = "https://voilacode.openai.azure.com/";
const apiVersion = "2023-07-01-preview";
const model = "chat-voila";

// Define the prompt
const promptMessages = [
    { role: "system", content: "You are a poet." },
    { role: "user", content: "Write a poem about the beauty of seas and mountains." }
];

// Function to send the prompt
async function createPoem() {
    try {
        const response = await fetch(`${azureEndpoint}openai/deployments/${model}/chat/completions?api-version=${apiVersion}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey
            },
            body: JSON.stringify({
                messages: promptMessages
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Run the function
createPoem();
