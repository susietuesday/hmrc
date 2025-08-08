function getOrCreateDeviceId() {
  const match = document.cookie.match(/(^|;) ?deviceId=([^;]*)(;|$)/);
  if (match) return match[2];

  const newId = crypto.randomUUID();
  document.cookie = `deviceId=${newId}; path=/; max-age=31536000`; // 1 year
  return newId;
}

function getTimezoneOffsetUTC() {
  const offset = new Date().getTimezoneOffset(); // in minutes
  const sign = offset > 0 ? '-' : '+';
  const absOffset = Math.abs(offset);
  const hours = String(Math.floor(absOffset / 60)).padStart(2, '0');
  const minutes = String(absOffset % 60).padStart(2, '0');
  return `UTC${sign}${hours}:${minutes}`;
}

function sendFraudPreventionData() {
  const deviceId = getOrCreateDeviceId();

  const screenInfo = {
    width: window.screen.width,
    height: window.screen.height,
    scalingFactor: window.devicePixelRatio || 1,
    colourDepth: window.screen.colorDepth
  };

  const windowSize = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  const timezone = getTimezoneOffsetUTC();

  fetch('/session-data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Agent': navigator.userAgent,
      'X-Device-Id': deviceId
    },
    body: JSON.stringify({
      screenInfo,
      windowSize,
      timezone
    })
  }).catch(console.error);
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('uploadForm');
  const statusDiv = document.getElementById('uploadStatus');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

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

      if (result.data && result.data.length) {
        renderTable(result.data);
      } else {
        statusDiv.textContent = result.message || 'No data to display';
      }
    } catch (err) {
      statusDiv.textContent = 'Upload failed.';
      console.error(err);
    }
  });

  function renderTable(data) {
    statusDiv.innerHTML = ''; // Clear previous content

    const table = document.createElement('table');
    table.border = 1;

    // Create table header
    const headerRow = document.createElement('tr');
    Object.keys(data[0]).forEach((key) => {
      const th = document.createElement('th');
      th.textContent = key;
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Create rows
    data.forEach((row) => {
      const tr = document.createElement('tr');
      Object.values(row).forEach((val) => {
        const td = document.createElement('td');
        td.textContent = val;
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });

    statusDiv.appendChild(table);
  }
});

window.addEventListener('load', sendFraudPreventionData);
