document.addEventListener('DOMContentLoaded', function () {
  const tableBody = document.querySelector('table tbody');
  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');
  const clearBtn = document.querySelector('.clear-btn');

  let requests = [];

  // Fetch all requests from backend
  async function fetchRequests() {
    try {
      console.log("Fetching requests...");
      const res = await fetch('http://localhost:3000/api/requests');
      if (!res.ok) throw new Error('Failed to fetch requests');
      requests = await res.json();
      console.log("Fetched data:", requests);
      renderTable(requests);
    } catch (err) {
      console.error('Error fetching requests:', err);
      tableBody.innerHTML = `<tr><td colspan="4" class="no-data">Failed to load requests</td></tr>`;
    }
  }

  // Render table
  function renderTable(data) {
    tableBody.innerHTML = '';

    if (data.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" class="no-data">No Requests Found</td></tr>`;
      updateSummary(data);
      return;
    }

    data.forEach(req => {
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${req.employeeId}</td>
        <td>${req.employeeName}</td>
        <td>${req.status}</td>
        <td><button onclick="viewDetails(${req.id})">View</button></td>
      `;

      tableBody.appendChild(row);
    });

    updateSummary(data);
  }

  // Update summary boxes
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

  // Filter table based on input and dropdown
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

  // Clear all records from backend
  clearBtn.addEventListener('click', async () => {
    if (confirm("Are you sure you want to clear all records?")) {
      try {
        const res = await fetch('http://localhost:3000/api/requests', { method: 'DELETE' });
        const data = await res.json();
        if (res.ok) {
          requests = [];
          renderTable(requests);
          alert(data.message);
        } else {
          alert(data.error || 'Failed to clear records');
        }
      } catch (err) {
        console.error('Error clearing records:', err);
        alert('Error clearing records');
      }
    }
  });

  // Search and filter events
  searchInput.addEventListener('input', filterTable);
  statusFilter.addEventListener('change', filterTable);

  // View details in modal
  window.viewDetails = function (id) {
    const modal = document.getElementById('employeeModal');
    const modalDetails = document.getElementById('modalDetails');
    const approveBtn = document.getElementById('approveBtn');
    const rejectBtn = document.getElementById('rejectBtn');

    const request = requests.find(r => r.id === id);
    if (!request) return alert('Request not found');

    modalDetails.innerHTML = `
      <p><strong>Employee Name:</strong> ${request.employeeName}</p>
      <p><strong>Employee ID:</strong> ${request.employeeId}</p>
      <p><strong>Job Role:</strong> ${request.jobRole}</p>
      <p><strong>Asset Type:</strong> ${request.assetType}</p>
      <p><strong>Start Date:</strong> ${request.startDate}</p>
      <p><strong>Reason:</strong> ${request.reason}</p>
      <p><strong>Status:</strong> 
        <span id="statusText" style="color: ${getStatusColor(request.status)}; font-size: 18px;">
          ${request.status}
        </span>
      </p>
    `;

    const statusText = document.getElementById('statusText');

    if (request.status === "Pending") {
      approveBtn.style.display = "inline-block";
      rejectBtn.style.display = "inline-block";
      approveBtn.disabled = false;
      rejectBtn.disabled = false;

      approveBtn.onclick = async () => {
        approveBtn.disabled = true;
        rejectBtn.disabled = true;
        await updateStatus(id, 'Approved');
        statusText.textContent = 'Approved';
        statusText.style.color = 'green';
      };

      rejectBtn.onclick = async () => {
        approveBtn.disabled = true;
        rejectBtn.disabled = true;
        await updateStatus(id, 'Rejected');
        statusText.textContent = 'Rejected';
        statusText.style.color = 'red';
      };
    } else {
      approveBtn.style.display = "none";
      rejectBtn.style.display = "none";
    }

    modal.style.display = 'flex';
  };

  // Update status in backend
  async function updateStatus(id, newStatus) {
    try {
      const res = await fetch(`http://localhost:3000/api/requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        const reqIndex = requests.findIndex(r => r.id === id);
        if (reqIndex !== -1) {
          requests[reqIndex].status = newStatus;
          renderTable(requests);
        }
        alert(data.message);
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error updating status');
    }
  }

  // Status color helper
  function getStatusColor(status) {
    if (status === 'Approved') return 'green';
    if (status === 'Rejected') return 'red';
    return 'black';
  }

  // Close modal
  window.closeModal = function () {
    document.getElementById('employeeModal').style.display = 'none';
  };

  // Initial fetch
  fetchRequests();
});
