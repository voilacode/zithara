import axios from 'axios';
import * as cheerio from 'cheerio';

const SCRAPER_API_KEY = '2e4b43e575835cc0ff7f7afc26eba551';

export const fetchPageData = async (url) => {
  try {
    const response = await axios.get('http://api.scraperapi.com', {
      params: {
        api_key: SCRAPER_API_KEY,
        url,
      }
    });

    const webpageText = response.data;
    const $ = cheerio.load(webpageText);

    let websiteName = $('title').text() || $('meta[property="og:site_name"]').attr('content');
    if (!websiteName) {
      websiteName = $('img[alt*="logo"], img[src*="logo"]').attr('alt');
    }

    const contactInfo = $('a[href^="tel:"], a[href^="mailto:"]').map((i, el) => $(el).text().trim()).get().join(', ');
    const discountOffer = $('body').text().match(/(\d+% off|\$\d+ off|buy \d+ get \d+)/i);

    return { websiteName, contactInfo, discountOffer: discountOffer ? discountOffer[0] : ' ' };
  } catch (error) {
    throw new Error(`Error fetching the webpage: ${error.message}`);
  }
};