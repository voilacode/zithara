const { exec } = require('child_process');

// Replace with the actual image ID obtained from the creation response
const IMAGE_ID = 'P523LdrvK61Vgre7Q7nypx4jW'; 

const checkStatusCommand = `curl -X GET https://api.bannerbear.com/v2/images/${IMAGE_ID} \
-H "Authorization: Bearer ${API_KEY}"`;

console.log('Executing status check command:', checkStatusCommand);

// Execute the status check command
exec(checkStatusCommand, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }

  // Print the raw response for debugging
  console.log('Status check response:', stdout);

  // Parse the JSON response
  try {
    const statusResponse = JSON.parse(stdout);

    if (statusResponse.status === 'pending') {
      console.log('Image creation is still pending.');
    } else if (statusResponse.image_url) {
      console.log('Image created:', statusResponse.image_url);
    } else {
      console.log('Response:', statusResponse);
    }
  } catch (parseError) {
    console.error('Error parsing response:', parseError);
  }
});
