// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  renderObligations();
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