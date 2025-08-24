// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  uploadIncome();

  document.getElementById('incomeCsvFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const errorDiv = document.getElementById('errorMessages');
    errorDiv.innerHTML = '';

    if (!file) return;

    const errors = [];

    // 1. File type check
    if (!file.name.endsWith('.csv')) {
      errors.push('File must be a .csv format.');
    }

    // 2. File size check (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      errors.push('File size must be less than 5MB.');
    }

    if (errors.length > 0) {
      errorDiv.innerHTML = errors.join('<br>');
      return;
    }

    // 3. Read file content
    const reader = new FileReader();
    reader.onload = function(event) {
        const content = event.target.result;
        const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');

        if (lines.length < 2) {
            errors.push('File must contain at least one data row.');
        }

        // Check headers
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        if (!headers.includes('date') || !headers.includes('amount')) {
            errors.push('File must include "Date" and "Amount" columns.');
        }

        // Validate rows
        const dateIndex = headers.indexOf('date');
        const amountIndex = headers.indexOf('amount');

        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(',');
            if (row.length < 2) continue;

            const dateVal = row[dateIndex]?.trim();
            const amountVal = row[amountIndex]?.trim();

            // Check for valid date
            if (isNaN(Date.parse(dateVal))) {
                errors.push(`Row ${i + 1}: Invalid date value ("${dateVal}").`);
            }

            // Check for numeric amount
            if (isNaN(parseFloat(amountVal))) {
                errors.push(`Row ${i + 1}: Amount must be numeric.`);
            }
        }

        if (errors.length > 0) {
            errorDiv.innerHTML = errors.join('<br>');
        } else {
            errorDiv.innerHTML = '✅ File looks good!';
            const uploadButton = document.getElementById('uploadIncomeBtn');
            uploadButton.disabled = false; // Enable button if validation passes
          }
    };

    reader.readAsText(file);
  });
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

