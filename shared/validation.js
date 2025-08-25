// Function to get current UK tax year start and end
export function getTaxYearBounds() {
  const today = new Date();
  const year = today.getFullYear();
  let start, end;

  if (today.getMonth() + 1 >= 4 && today.getDate() >= 6) {
    // After 6 April: current tax year started this year
    start = new Date(year, 3, 6); // 6 April
    end = new Date(year + 1, 3, 5); // 5 April next year
  } else {
    // Before 6 April: still in previous tax year
    start = new Date(year - 1, 3, 6);
    end = new Date(year, 3, 5);
  }

  return { start, end };
};