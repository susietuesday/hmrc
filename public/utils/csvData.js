export function uploadCsv() {
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

    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    return formData;
  });
};