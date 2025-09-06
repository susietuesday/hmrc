import { uploadSummary } from './summary.js';
import { enableUploadButton, uploadCsv } from './utils/csvData.js';


// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // QUARTERLY UPDATE
  uploadSummary();

  // ANNUAL UPDATE

  // --- File upload controls ---
  const fileInput = document.getElementById('csvAnnualFile');
  const uploadBtn = document.getElementById('uploadAnnualBtn');
  
  // Enable upload button after file has been selected
  enableUploadButton(fileInput, uploadBtn);

  // Wait for upload button to be cicked
  uploadBtn.addEventListener('click', async () => {

    const formData = uploadCsv(fileInput);

    const res = await fetch('/property-annual', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) throw new Error('Upload failed');

    const json = await res.json();
    console.log('Response JSON:', JSON.stringify(json, null, 2));

    document.getElementById('uploadAnnualStatus').textContent = 'Upload successful!';

    // Display the transaction rows
    const previewDiv = document.getElementById('csvAnnualPreview');
  });

});

