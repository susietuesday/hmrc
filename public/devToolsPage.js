// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  uploadIncome();
});

function uploadIncome() {
  // --- Upload button handler ---
  const fileInput = document.getElementById('csvFile');
  const uploadBtn = document.getElementById('uploadBtn');

  // Enable the button when a file is selected
  fileInput.addEventListener('change', () => {
    uploadBtn.disabled = fileInput.files.length === 0;
  });

  uploadBtn.addEventListener('click', async () => {

    const file = fileInput.files[0];

    if (!file) {
      document.getElementById('uploadStatus').textContent = 'Please select a file';
      return;
    }

    const formData = new FormData();
    formData.append('csv', file);

    try {
      const res = await fetch('/property-summary', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');

      const json = await res.json();

      document.getElementById('uploadStatus').textContent = 'Upload successful!';

      // Display the transaction rows
      const previewDiv = document.getElementById('csvPreview');
      //previewDiv.innerHTML = `<pre>${JSON.stringify(json.data.ukProperty, null, 2)}</pre>`;
      previewDiv.innerHTML = getTableHtml(json.data.ukProperty);

    } catch (err) {
      document.getElementById('uploadStatus').textContent = 'Error uploading file';
      console.error(err);
    }
  });
};

function getTableHtml(ukProperty) {
  let html = '<table class="table table-bordered"><thead><tr><th>Category</th><th>Amount</th></tr></thead><tbody>';

  for (const section of ['income', 'expenses']) {
    for (const key in ukProperty[section]) {
      if (key === 'rentARoom') {
        for (const subKey in ukProperty[section].rentARoom) {
          html += `<tr><td>${section}.rentARoom.${subKey}</td><td>£${ukProperty[section].rentARoom[subKey]}</td></tr>`;
        }
      } else {
        html += `<tr><td>${section}.${key}</td><td>£${ukProperty[section][key]}</td></tr>`;
      }
    }
  }

  html += '</tbody></table>';
  return html;
}