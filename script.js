// Assuming you have a function to handle form submissions
function submitAdForm() {
    const advertiserNameInput = document.getElementById('advertiser_name');
    const urlLinkInput = document.getElementById('url_link');
    const adPictureInput = document.getElementById('adpicture');
    const adPictureFile = adPictureInput.files[0];
  
    const formData = new FormData();
    formData.append('advertiser_name', advertiserNameInput.value);
    formData.append('url_link', urlLinkInput.value);
    formData.append('adpicture', adPictureFile);
  
    fetch('http://localhost:5501/api/insertAd', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        // Add other necessary headers
      },
    })
    .then(response => response.json())
    .then(data => {
      console.log('Ad data saved successfully:', data);
      // Handle success (e.g., show a success message)
      alert("Ad data saved successfully");
    })
    .catch(error => {
      console.error('Error saving ad data:', error);
      // Handle error (e.g., show an error message)
      alert("Error saving ad data");
    });
  }
  
  // Assuming you have an event listener for form submission
  document.getElementById('imageForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the default form submission behavior
    submitAdForm();
  });
  