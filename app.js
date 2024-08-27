import express from 'express';
import bodyParser from 'body-parser';
import { fetchPageData } from './scraper.js';
import { generateTagline } from './openai.js';
import { createImage, checkImageStatus } from './bannerbear.js';

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Serve the HTML form
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
        <title>Zithara.ai</title>
        <link rel="icon" href="https://zenprospect-production.s3.amazonaws.com/uploads/pictures/66812f142843cf000144104c/picture" />
        <style>
        body {
            background-image: linear-gradient(to left, #dcc2fc, #94c6fc);
            font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
        }
          .loader {
            width: 15px;
            aspect-ratio: 1;
            position: relative;
            margin: 20px auto;
          }

          .loader::before,
          .loader::after {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 50%;
            background: #3498db;
          }

          .loader::before {
            box-shadow: -25px 0;
            animation: l8-1 1s infinite linear;
          }

          .loader::after {
            transform: rotate(0deg) translateX(25px);
            animation: l8-2 1s infinite linear;
          }

          @keyframes l8-1 {
            100% { transform: translateX(25px); }
          }

          @keyframes l8-2 {
            100% { transform: rotate(-180deg) translateX(25px); }
          }

          .hidden {
            display: none;
          }

          .loading-text {
            text-align: center;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container bg-white shadow p-5 rounded mt-5" style="z-index: 99;">
          <h1 class="mt-2">Generate Ad Image</h1>
          <form action="/submit" method="post" class="mt-3">
            <div class="form-group">
              <label for="url">Enter URL:</label>
              <input type="text" id="url" name="url" class="form-control" required>
            </div>
            <button type="submit" class="btn btn-primary">Submit</button>
          </form>

          <div id="loadingContainer" class="hidden mt-5">
            <div class="loader"></div>
            <p id="loadingText" class="loading-text">Processing your request...</p>
          </div>

          <div id="result"></div>
        </div>
        <img src="/bot.png" width="200px" style="position: absolute; bottom: 0; transform: rotate(-15deg); z-index: 999;" />
        <img src="https://bitaacademy.com/wp-content/uploads/2023/10/neural-network.png" width="200px" style="position: absolute; bottom: 100px; right: 20px; transform: rotate(15deg); z-index: -1;" />

        <script>
          const form = document.querySelector('form');
          const loadingContainer = document.getElementById('loadingContainer');
          const loadingText = document.getElementById('loadingText');
          const result = document.getElementById('result');

          form.addEventListener('submit', function() {
            loadingContainer.classList.remove('hidden');
            loadingText.textContent = 'Template selected, generating your image...';
            result.innerHTML = '';
          });
        </script>
      </body>
    </html>
  `);
});

// Handle form submission
app.post('/submit', async (req, res) => {
  const urlToScrape = req.body.url;

  try {
    const { websiteName, contactInfo, discountOffer } = await fetchPageData(urlToScrape);
    const tagline = await generateTagline(websiteName, contactInfo, discountOffer);

    const data = [
      { name: 'logo', text: websiteName || ' ' },
      { name: 'contact', text: contactInfo || ' ' },
      { name: 'tag', text: tagline || ' ' },
      { name: 'date', text: ' ' },
      { name: 'offer', text: discountOffer || ' ' },
    ];

    const imageId = await createImage(data);
    const imageUrl = await checkImageStatus(imageId);

    res.send(`
      <html>
        <head>
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
          <title>Zithara.ai</title>
          <link rel="icon" href="https://zenprospect-production.s3.amazonaws.com/uploads/pictures/66812f142843cf000144104c/picture" />
        </head>
        <style>
          body {
            background-image: linear-gradient(to left, #dcc2fc, #94c6fc);
            font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
          }
        </style>
        <body>
          <div class="container bg-white shadow p-5 rounded my-5">
            <h1>Image Created Successfully</h1>
            <p>Image URL: <a href="${imageUrl}" target="_blank">Click Here</a></p>
            <img src="${imageUrl}" alt="Generated Image" class="img-fluid block mx-auto" style="width: 45vw; height: auto;">
            <br>
            <a href="/" class="block my-2 btn btn-warning">Go Back</a>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    res.send(`<p>Error: ${error.message}</p>`);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});