// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  uploadExpenses();
});

function uploadExpenses() {
  // --- Upload button handler ---
  const uploadBtn = document.getElementById('uploadExpensesBtn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', async () => {
        const fileInput = document.getElementById('expensesCsvFile');
  const file = fileInput.files[0];

  if (!file) {
    document.getElementById('expensesUploadStatus').textContent = 'Please select a file';
    return;
  }

  const formData = new FormData();
  formData.append('csv', file);

  try {
    const res = await fetch('/property-expenses', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) throw new Error('Upload failed');

    const json = await res.json();

    document.getElementById('expensesUploadStatus').textContent = 'Upload successful!';
    continueBtn.disabled = false;

    // Display the transaction rows
    const previewDiv = document.getElementById('expensesCsvPreview');
    previewDiv.innerHTML = renderTable(json.data.results);

  } catch (err) {
    document.getElementById('expensesUploadStatus').textContent = 'Error uploading file';
    console.error(err);
      }
    });
  }
};