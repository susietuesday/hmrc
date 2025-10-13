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

window.addEventListener('load', sendFraudPreventionData);
