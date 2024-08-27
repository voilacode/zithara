const axios = require('axios');

const API_URL = 'https://dataapi.octoparse.com/api/task/starttask';
const API_TOKEN = 'YOUR_API_TOKEN';  // Replace with your actual API token
const TASK_ID = 'YOUR_TASK_ID';      // Replace with your actual Task ID

// Start the task
axios.post(API_URL, {
    taskId: TASK_ID,
    access_token: API_TOKEN
})
.then(response => {
    console.log('Task Started:', response.data);

    // Once the task is started, you can check the status or retrieve the data using other API endpoints
})
.catch(error => {
    console.error('Error starting task:', error);
});

// To get the data once the task is completed, you would use the getData API
const DATA_URL = `https://dataapi.octoparse.com/api/alldata/getdata?taskId=${TASK_ID}&access_token=${API_TOKEN}`;

axios.get(DATA_URL)
.then(response => {
    console.log('Extracted Data:', response.data);
})
.catch(error => {
    console.error('Error fetching data:', error);
});
