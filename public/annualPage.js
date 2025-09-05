import { enableUploadButton, uploadCsv } from './utils/csvData.js';

// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // --- Upload button handler ---
  const fileInput = document.getElementById('csvFile');
  const uploadBtn = document.getElementById('uploadBtn');
  
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

    document.getElementById('uploadStatus').textContent = 'Upload successful!';

    // Display the transaction rows
    const previewDiv = document.getElementById('csvPreview');
  });
});