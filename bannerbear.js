import axios from 'axios';

const BANNERBEAR_API_KEY = 'bb_pr_012a9745d644c9b02b6053e7cd59bc';
const templates = ['0MkzgpZ4PWAgZyVrml', 'gwNr4n50QLWoDROMBd', 'Aqa9wzDPxypBDJogk7'];

export const createImage = async (data) => {
  try {
    const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];

    const response = await axios.post('https://api.bannerbear.com/v2/images', {
      template: selectedTemplate,
      modifications: data
    }, {
      headers: {
        Authorization: `Bearer ${BANNERBEAR_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const { uid } = response.data;
    return uid;
  } catch (error) {
    throw new Error(`Error creating image: ${error.message}`);
  }
};

export const checkImageStatus = async (imageId) => {
  try {
    while (true) {
      const response = await axios.get(`https://api.bannerbear.com/v2/images/${imageId}`, {
        headers: {
          Authorization: `Bearer ${BANNERBEAR_API_KEY}`
        }
      });

      const { status, image_url } = response.data;
      if (status === 'completed' && image_url) {
        return image_url;
      } else if (status === 'failed') {
        throw new Error('Image creation failed.');
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  } catch (error) {
    throw new Error(`Error checking image status: ${error.message}`);
  }
};
