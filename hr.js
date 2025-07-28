document.addEventListener('DOMContentLoaded', function () {
  const tableBody = document.querySelector('table tbody');
  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');
  const clearBtn = document.querySelector('.clear-btn');

  let requests = JSON.parse(localStorage.getItem('assetRequests')) || [];

  function renderTable(data) {
    tableBody.innerHTML = '';

    if (data.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" class="no-data">No Requests Found</td></tr>`;
      return;
    }

    data.forEach((req, index) => {
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${req.employeeId}</td>
        <td>${req.employeeName}</td>
        <td>${req.status}</td>
        <td>
          <button onclick="viewDetails(${index})">View</button>
        </td>
      `;

      tableBody.appendChild(row);
    });

    updateSummary(data);
  }

  function updateSummary(data) {
    const total = data.length;
    const pending = data.filter(r => r.status === 'Pending').length;
    const approved = data.filter(r => r.status === 'Approved').length;
    const rejected = data.filter(r => r.status === 'Rejected').length;

    document.querySelectorAll('.box span')[0].textContent = total;
    document.querySelectorAll('.box span')[1].textContent = pending;
    document.querySelectorAll('.box span')[2].textContent = approved;
    document.querySelectorAll('.box span')[3].textContent = rejected;
  }


  function filterTable() {
    const query = searchInput.value.toLowerCase();
    const status = statusFilter.value;

    const filtered = requests.filter(req => {
      const matchesSearch =
        req.employeeName.toLowerCase().includes(query) ||
        req.employeeId.toLowerCase().includes(query);

      const matchesStatus = status === "All" || req.status === status;

      return matchesSearch && matchesStatus;
    });

    renderTable(filtered);
  }

  // Clear records
  clearBtn.addEventListener('click', function () {
    if (confirm("Are you sure you want to clear all records?")) {
      localStorage.removeItem('assetRequests');
      requests = [];
      renderTable([]);
    }
  });

  searchInput.addEventListener('input', filterTable);
  statusFilter.addEventListener('change', filterTable);

  window.viewDetails = function (index) {
  const modal = document.getElementById('employeeModal');
  const modalDetails = document.getElementById('modalDetails');
  const approveBtn = document.getElementById('approveBtn');
  const rejectBtn = document.getElementById('rejectBtn');
  const request = requests[index];

  // Initial modal content
  modalDetails.innerHTML = `
    <p><strong>Employee Name:</strong> ${request.employeeName}</p>
    <p><strong>Employee ID:</strong> ${request.employeeId}</p>
    <p><strong>Asset Name:</strong> ${request.assetName}</p>
    <p><strong>Asset Type:</strong> ${request.assetType}</p>
    <p><strong>Reason:</strong> ${request.reason}</p>
    <p><strong>Status:</strong> 
      <span id="statusText" style="color: ${getStatusColor(request.status)}; font-size: 18px;">
        ${request.status}
      </span>
    </p>
  `;

  const statusText = document.getElementById('statusText');

  if (request.status === "Pending") {
    approveBtn.disabled = false;
    rejectBtn.disabled = false;

    approveBtn.style.display = "inline-block";
    rejectBtn.style.display = "inline-block";

    approveBtn.onclick = function () {
      requests[index].status = 'Approved';
      localStorage.setItem('assetRequests', JSON.stringify(requests));

      // Update modal status text and color
      statusText.textContent = 'Approved';
      statusText.style.color = 'green';

      renderTable(requests);
      // Optionally keep modal open to show status update
    };

    rejectBtn.onclick = function () {
      requests[index].status = 'Rejected';
      localStorage.setItem('assetRequests', JSON.stringify(requests));

      // Update modal status text and color
      statusText.textContent = 'Rejected';
      statusText.style.color = 'red';
      

      renderTable(requests);
    };
  } else {
    approveBtn.style.display = "none";
    rejectBtn.style.display = "none";
  }

  modal.style.display = 'flex';
};

// Helper to determine color based on status
function getStatusColor(status) {
  if (status === 'Approved') return 'green';
  if (status === 'Rejected') return 'red';
  return 'black';
}

window.closeModal = function () {
  document.getElementById('employeeModal').style.display = 'none';
};


  renderTable(requests);
});