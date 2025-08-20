// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  uploadIncome();
});


function uploadIncome() {
  // --- Upload button handler ---
  const uploadBtn = document.getElementById('uploadIncomeBtn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', async () => {
        const fileInput = document.getElementById('incomeCsvFile');
  const file = fileInput.files[0];

  if (!file) {
    document.getElementById('incomeUploadStatus').textContent = 'Please select a file';
    return;
  }

  const formData = new FormData();
  formData.append('csv', file);

  try {
    const res = await fetch('/property-income', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) throw new Error('Upload failed');

    const json = await res.json();

    document.getElementById('incomeUploadStatus').textContent = 'Upload successful!';
    continueBtn.disabled = false;

    // Display the transaction rows
    const previewDiv = document.getElementById('incomeCsvPreview');
    previewDiv.innerHTML = renderTable(json.data.results);

  } catch (err) {
    document.getElementById('incomeUploadStatus').textContent = 'Error uploading file';
    console.error(err);
      }
    });
  }
};

