// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  renderObligations();

  // --- Upload button handler ---
  const uploadBtn = document.getElementById('uploadBtn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', async () => {
        const fileInput = document.getElementById('csvFile');
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

    document.getElementById('uploadStatus').textContent = 'Upload successful!';

    // 👉 Only display the transaction rows, not quarterly totals
    const previewDiv = document.getElementById('csvPreview');
    previewDiv.innerHTML = renderTable(json.data.results);

  } catch (err) {
    document.getElementById('uploadStatus').textContent = 'Error uploading file';
    console.error(err);
      }
    });
  }
});

function renderObligations(){
  // Get the obligations data from the script tag
  const dataScript = document.getElementById("obligations-data");

  if (dataScript) {
    try {
      const obligationsData = JSON.parse(dataScript.textContent);

      // Render table
      const tbody = document.getElementById('obligationsTableBody');

      obligationsData.obligations.forEach(ob => {
        ob.obligationDetails.forEach(detail => {
          const tr = document.createElement('tr');

          tr.innerHTML = `
            <td>${detail.periodStartDate}</td>
            <td>${detail.periodEndDate}</td>
            <td>${detail.dueDate}</td>
            <td>${detail.status}</td>
          `;

          tbody.appendChild(tr);
        });
      });

    } catch (err) {
      console.error("Failed to parse obligations data:", err);
    }
  } else {
    console.error("Obligations data script not found");
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