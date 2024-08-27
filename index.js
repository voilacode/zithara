import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

const app = express();
const port = 3000;

// Scraper API Key and Azure OpenAI credentials
const SCRAPER_API_KEY = '2e4b43e575835cc0ff7f7afc26eba551';
const azureEndpoint = "https://voilacode.openai.azure.com/";
const apiKey = "acc879a4c7f2413599c613653eefb51e";
const apiVersion = "2023-07-01-preview";
const model = "chat-voila";
const BANNERBEAR_API_KEY = 'bb_pr_6d6dad63badac0d8adf21dbfbd6911';
const templates = ['6anBGWDAO3VEZO3812', 'qY4mReZpXlgAZ97lP8', 'V32jY9bBArmmDBGWrl', 'N1qMxz5v6wXQ5eQ4ko'];

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the HTML form
app.get('/', (req, res) => {
  res.send(`
    <form action="/submit" method="post">
      <label for="url">Enter URL:</label>
      <input type="text" id="url" name="url" required>
      <button type="submit">Submit</button>
    </form>
  `);
});

// Handle form submission
app.post('/submit', async (req, res) => {
  const urlToScrape = req.body.url;

  try {
    // Fetch webpage text
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

    // Generate Tagline using OpenAI
    const promptMessages = [
      { role: "system", content: "You are a creative ad copywriter." },
      { role: "user", content: `Generate a creative and catchy tagline or phrase based on the following information for a website ad: Website: ${websiteName}, Contact: ${contactInfo}, Discount Offer: ${discountOffer ? discountOffer[0] : 'Not Found'}` }
    ];

    const completionResponse = await fetch(`${azureEndpoint}openai/deployments/${model}/chat/completions?api-version=${apiVersion}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({ messages: promptMessages })
    });

    if (!completionResponse.ok) {
      throw new Error(`HTTP error! status: ${completionResponse.status}`);
    }

    const completionData = await completionResponse.json();
    const tagline = completionData.choices[0].message.content.trim();

    // Create image using Bannerbear
    const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];

    const data = {
      template: selectedTemplate,
      modifications: [
        { name: 'logo', text: websiteName || 'Default Logo' },
        { name: 'contact', text: contactInfo || 'Default Contact' },
        { name: 'tag', text: tagline || 'Default Tagline' },
        { name: 'date', text: '21st Aug - 31st Aug' },
        { name: 'offer', text: discountOffer ? discountOffer[0] : 'Default Offer' },
      ]
    };

    const imageResponse = await axios.post('https://api.bannerbear.com/v2/images', data, {
      headers: {
        Authorization: `Bearer ${BANNERBEAR_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const { uid } = imageResponse.data;

    // Check image status
    const checkImageStatus = async (imageId) => {
      while (true) {
        const statusResponse = await axios.get(`https://api.bannerbear.com/v2/images/${imageId}`, {
          headers: {
            Authorization: `Bearer ${BANNERBEAR_API_KEY}`
          }
        });

        const { status, image_url } = statusResponse.data;
        if (status === 'completed' && image_url) {
          res.send(`<p>Image created successfully: <a href="${image_url}">${image_url}</a></p>`);
          break;
        } else if (status === 'failed') {
          res.send('<p>Image creation failed.</p>');
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    };

    checkImageStatus(uid);

  } catch (error) {
    res.send(`<p>Error: ${error.message}</p>`);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
