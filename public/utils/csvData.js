// Enable upload button on the csv file upload control
export function enableUploadButton(fileInput, uploadBtn) {
  if (!fileInput || !uploadBtn) return;

  // Enable button when file selected
  fileInput.addEventListener('change', () => {
    uploadBtn.disabled = fileInput.files.length === 0;
  });
}

// Uploads csv file
export function uploadCsv(fileInput) {
  const file = fileInput.files[0];

  if (!file) {
    document.getElementById('uploadStatus').textContent = 'Please select a file';
    return;
  }

  const formData = new FormData();
  formData.append('csv', file);

  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }

  return formData;
};