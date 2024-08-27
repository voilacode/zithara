const axios = require('axios');

const API_KEY = 'bb_pr_6d6dad63badac0d8adf21dbfbd6911';
const templates = ['6anBGWDAO3VEZO3812', 'qY4mReZpXlgAZ97lP8', 'V32jY9bBArmmDBGWrl', 'N1qMxz5v6wXQ5eQ4ko']; // Replace with your actual template IDs

// random template 
const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
console.log('Selected template:', selectedTemplate);

const data = {
  template: selectedTemplate,
  modifications: [
    {
      name: 'logo',
      text: 'zithara.ai'
    },
    {
      name: 'offer',
      text: 'Buy 1 Get 1 Free!'
    },
    {
      name: 'tag',
      text: 'Flat 20% Off'
    },
    {
      name: 'date',
      text: '21st Aug - 31st Aug'
    },
    {
      name: 'contact',
      text: 'zithara@dummy.ai.in'
    },
  ]
};

const createImage = async () => {
  try {
    const response = await axios.post('https://api.bannerbear.com/v2/images', data, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const { uid } = response.data;
    console.log('Image creation requested. Image ID:', uid);

    // Check the status of the image creation
    await checkImageStatus(uid);

  } catch (error) {
    console.error('Error creating image:', error.response ? error.response.data : error.message);
  }
};

// Function to check the image status
const checkImageStatus = async (imageId) => {
  try {
    while (true) {
      const response = await axios.get(`https://api.bannerbear.com/v2/images/${imageId}`, {
        headers: {
          Authorization: `Bearer ${API_KEY}`
        }
      });

      const { status, image_url } = response.data;
      console.log('Current status:', status);

      if (status === 'completed' && image_url) {
        console.log('Image created successfully:', image_url);
        break;
      } else if (status === 'failed') {
        console.error('Image creation failed.');
        break;
      }

      // Wait for 5 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  } catch (error) {
    console.error('Error checking image status:', error.response ? error.response.data : error.message);
  }
};

// Run the script
createImage();
