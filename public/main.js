//const { render } = require("ejs");

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

window.addEventListener('load', sendFraudPreventionData);
