import fetch from 'node-fetch';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Scraper API Key and target URL
const SCRAPER_API_KEY = '2e4b43e575835cc0ff7f7afc26eba551';
const urlToScrape = 'https://www.srikrishna.com/?gad_source=1&gclid=Cj0KCQjwz7C2BhDkARIsAA_SZKYG7xq52YVgY9LQcPGPpaIj514T47HPs_dw48r3m4feG3-qu-94MmAaAka_EALw_wcB';  // Replace with the target URL

// Azure OpenAI API credentials
const apiKey = "acc879a4c7f2413599c613653eefb51e";
const azureEndpoint = "https://voilacode.openai.azure.com/";
const apiVersion = "2023-07-01-preview";
const model = "chat-voila";

// Function to fetch webpage text using Scraper API
async function fetchWebpageText() {
  try {
    const response = await axios.get('http://api.scraperapi.com', {
      params: {
        api_key: SCRAPER_API_KEY,
        url: urlToScrape,
      }
    });

    const webpageText = response.data;
    const $ = cheerio.load(webpageText);

    // Extract Website Name/Logo
    let websiteName = $('title').text() || $('meta[property="og:site_name"]').attr('content');
    if (!websiteName) {
      websiteName = $('img[alt*="logo"], img[src*="logo"]').attr('alt');
    }

    // Extract Contact Information
    const contactInfo = $('a[href^="tel:"], a[href^="mailto:"]').map((i, el) => $(el).text().trim()).get().join(', ');

    // Extract Discount Offers
    const discountOffer = $('body').text().match(/(\d+% off|\$\d+ off|buy \d+ get \d+)/i);

    console.log("Extracted Website Name/Logo:", websiteName || 'Not Found');
    console.log("Extracted Contact Information:", contactInfo || 'Not Found');
    console.log("Extracted Discount Offer:", discountOffer ? discountOffer[0] : 'Not Found');

    await generateTagline(websiteName, contactInfo, discountOffer ? discountOffer[0] : 'Not Found');

  } catch (error) {
    console.error('Error fetching the webpage:', error);
  }
}

// Function to generate a tagline using Azure OpenAI
async function generateTagline(websiteName, contactInfo, discountOffer) {
  try {
    const text = `Website: ${websiteName}, Contact: ${contactInfo}, Discount Offer: ${discountOffer}`;
    const promptMessages = [
      { role: "system", content: "You are a creative ad copywriter." },
      { role: "user", content: `Generate a creative and catchy tagline or phrase based on the following information for a website ad: "${text}"` }
    ];

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
    const tagline = data.choices[0].message.content.trim();
    console.log("Generated Tagline:", tagline);

  } catch (error) {
    console.error('Error generating tagline:', error);
  }
}

// Run the function
fetchWebpageText();
