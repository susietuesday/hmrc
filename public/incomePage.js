// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {

  // --- Upload button handler ---
  const uploadBtn = document.getElementById('uploadIncomeBtn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', async () => {
        const fileInput = document.getElementById('incomeCsvFile');
  const file = fileInput.files[0];

  if (!file) {
    document.getElementById('uploadStatus').textContent = 'Please select a file';
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

    // 👉 Only display the transaction rows, not quarterly totals
    const previewDiv = document.getElementById('incomeCsvPreview');
    previewDiv.innerHTML = renderTable(json.data.results);

  } catch (err) {
    document.getElementById('incomeUploadStatus').textContent = 'Error uploading file';
    console.error(err);
      }
    });
  }
});

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