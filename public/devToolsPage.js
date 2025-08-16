document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('uploadForm');
  const statusDiv = document.getElementById('uploadStatus');

  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // prevent default form submission

    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    if (!file) {
      statusDiv.textContent = 'Please choose a file.';
      return;
    }

    const formData = new FormData();
    formData.append('csvFile', file);

    try {
      const res = await fetch('/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      console.log('Response:', result);

      if (result.data?.results?.length) {
        renderTable(result.data.results, document.getElementById('resultsTable'));
      }

      if (result.data?.quarterlyTotals?.length) {
        renderTable(result.data.quarterlyTotals, document.getElementById('quarterlyTotalsTable'));
      }

    } catch (err) {
      statusDiv.textContent = 'Upload failed.';
      console.error(err);
    }
  });
});

function renderTable(data, tableElement) {
  if (!tableElement) {
    console.error('Table element not found');
    return;
  }

  tableElement.innerHTML = ''; // clear old content

  // header
  const header = tableElement.insertRow();
  Object.keys(data[0]).forEach(key => {
    const th = document.createElement('th');
    th.textContent = key;
    header.appendChild(th);
  });

  // rows
  data.forEach(row => {
    const tr = tableElement.insertRow();
    Object.values(row).forEach(value => {
      const td = tr.insertCell();
      td.textContent = value;
    });
  });
};  