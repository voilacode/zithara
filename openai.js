import fetch from 'node-fetch';

const azureEndpoint = "https://voilacode.openai.azure.com/";
const apiKey = "acc879a4c7f2413599c613653eefb51e";
const apiVersion = "2023-07-01-preview";
const model = "chat-voila";

export const generateTagline = async (websiteName, contactInfo, discountOffer) => {
  const promptMessages = [
    { role: "system", content: "You are a creative ad copywriter." },
    { role: "user", content: `Generate a creative and catchy tagline or phrase based on the following information for a website ad: Website: ${websiteName}, Contact: ${contactInfo}, Discount Offer: ${discountOffer} with limited words upto max 6` }
  ]; 

  try {
    const response = await fetch(`${azureEndpoint}openai/deployments/${model}/chat/completions?api-version=${apiVersion}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({ messages: promptMessages })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    throw new Error(`Error generating tagline: ${error.message}`);
  }
};
