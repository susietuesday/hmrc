// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  uploadIncome();
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

function renderTable(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return '<p>No transactions found</p>';
  }

  const headers = Object.keys(data[0]);

  let html = '<table border="1" cellpadding="5"><thead><tr>';
  headers.forEach(h => {
    html += `<th>${h}</th>`;
  });
  html += '</tr></thead><tbody>';

  data.forEach(row => {
    html += '<tr>';
    headers.forEach(h => {
      html += `<td>${row[h]}</td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table>';
  return html;
};