const fetchBtn = document.getElementById('fetchCumulativeSummaryBtn');
const messageDiv = document.getElementById('cumulativeSummaryMessage');
const summaryDiv = document.getElementById('cumulativeSummaryContainer');
const incomeList = document.getElementById('incomeList');
const expensesList = document.getElementById('expensesList');
const summaryDates = document.getElementById('summaryDates');

// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  renderObligations();

  fetchBtn.addEventListener('click', async () => {
    // Reset UI
    messageDiv.classList.add('d-none');
    summaryDiv.classList.add('d-none');
    incomeList.innerHTML = '';
    expensesList.innerHTML = '';
    summaryDates.textContent = '';

    try {
      const response = await fetch('/cumulative-summary'); // Adjust endpoint
      const data = await response.json(); // parse JSON payload

      const body = data.body || {};          // safely get body
      const ukProperty = body.ukProperty || {}; // safely get ukProperty

      if (data.hmrcStatus === 404) {
        messageDiv.textContent = data.message
        messageDiv.classList.remove('d-none');
        return;
      }
      if (!response.ok) throw new Error(`Error fetching summary: ${response.status}`);

      // Populate summary dates
      summaryDates.textContent = `From: ${data.fromDate} | To: ${data.toDate} | Submitted: ${data.submittedOn}`;

      // Populate income
      const income = ukProperty.income || {};
      for (const key in incomeCategories) {
        const value = key.split('.').reduce((obj, k) => obj?.[k], income);
        if (value != null) {
          const li = document.createElement('li');
          li.className = 'list-group-item d-flex justify-content-between';
          li.innerHTML = `<span>${incomeCategories[key]}</span><span>£${value}</span>`;
          incomeList.appendChild(li);
        }
      }

      // Populate expenses
      const expenses = ukProperty.expenses || {};
      for (const key in expensesCategories) {
        const value = key.split('.').reduce((obj, k) => obj?.[k], expenses);
        if (value != null) {
          const li = document.createElement('li');
          li.className = 'list-group-item d-flex justify-content-between';
          li.innerHTML = `<span>${expensesCategories[key]}</span><span>£${value}</span>`;
          expensesList.appendChild(li);
        }
      }

      summaryDiv.classList.remove('d-none');

    } catch (err) {
      console.error(err);
      messageDiv.textContent = "An error occurred while fetching the cumulative summary. Please try again.";
      messageDiv.classList.remove('d-none');
    }
  });
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