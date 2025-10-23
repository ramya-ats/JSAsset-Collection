document.addEventListener('DOMContentLoaded', () => {
  const employeeForm = document.getElementById('employeeForm');

  const employeeNameInput = document.getElementById('employeeName');
  const employeeIdInput = document.getElementById('employeeId');
  const jobRoleInput = document.getElementById('jobRole');
  const assetNameInput = document.getElementById('assetName');
  const assetTypeInput = document.getElementById('assetType');
  const startDateInput = document.getElementById('startDate');
  const reasonInput = document.getElementById('reason');

  const nameError = document.getElementById('error-message');
  const idError = document.getElementById('employeeId-error');
  const assetTypeError = document.getElementById('assetType-error');

  const assetError = document.createElement('span');
  assetError.classList.add('error-message');
  assetNameInput.parentNode.appendChild(assetError);

  const reasonError = document.createElement('span');
  reasonError.classList.add('error-message');
  reasonInput.parentNode.appendChild(reasonError);

  // Regex patterns
  const nameRegex = /^[A-Za-z\s]*$/;
  const assetRegex = /^[A-Za-z0-9\s]*$/;
  const employeeIdRegex = /^ATS(?!0000)\d{4}$/;

  // === Employee Name ===
  employeeNameInput.addEventListener('input', () => {
    let value = employeeNameInput.value;

    if (value.length >= 30) {
      employeeNameInput.value = value.slice(0, 30);
      nameError.textContent = "Maximum 30 characters only allowed.";
      return;
    }

    const trimmed = value.trim();

    if (trimmed.length === 0) {
      nameError.textContent = "Employee name is required.";
    } else if (!nameRegex.test(value)) {
      nameError.textContent = "Only alphabets and spaces allowed.";
    } else if (trimmed.length < 5) {
      nameError.textContent = "Name must contain at least 5 characters.";
    } else {
      nameError.textContent = "";
    }
  });

  employeeNameInput.addEventListener('keypress', (e) => {
    if (!/[A-Za-z\s]/.test(e.key) || employeeNameInput.value.length >= 30) {
      e.preventDefault();
    }
  });

  // === Employee ID ===
  employeeIdInput.addEventListener('input', () => {
    employeeIdInput.value = employeeIdInput.value.toUpperCase();
    const id = employeeIdInput.value.trim();

    if (id.length === 0) {
      idError.textContent = "Employee ID is required.";
    } else if (!employeeIdRegex.test(id)) {
      idError.textContent = "Must start with 'ATS' and end with 4 digits (not all zero).";
    } else {
      idError.textContent = "";
    }
  });

  employeeIdInput.addEventListener('keypress', (e) => {
    const value = employeeIdInput.value.toUpperCase();
    if (value.length >= 7) {
      e.preventDefault();
      return;
    }

    if (value.length < 3) {
      const expected = 'ATS'.charAt(value.length);
      if (e.key.toUpperCase() !== expected) {
        e.preventDefault();
      }
    } else {
      if (!/[0-9]/.test(e.key)) {
        e.preventDefault();
      }
    }
  });

  // === Asset Name ===
  assetNameInput.addEventListener('input', () => {
    const value = assetNameInput.value;

    if (value.length >= 30) {
      assetNameInput.value = value.slice(0, 30);
      assetError.textContent = "Maximum 30 characters only allowed.";
      return;
    }

    const trimmed = value.trim();

    if (trimmed.length === 0) {
      assetError.textContent = "Asset name is required.";
    } else if (!assetRegex.test(value)) {
      assetError.textContent = "Only letters, numbers, and spaces allowed.";
    } else if (trimmed.length < 5) {
      assetError.textContent = "Asset name must be 5 - 30 characters.";
    } else {
      assetError.textContent = "";
    }
  });

  assetNameInput.addEventListener('keypress', (e) => {
    if (!/[A-Za-z0-9\s]/.test(e.key) || assetNameInput.value.length >= 30) {
      e.preventDefault();
    }
  });

  // === Reason ===
  reasonInput.addEventListener('input', () => {
    const value = reasonInput.value;
    const totalLength = value.length;
    const nonSpaceLength = value.replace(/\s/g, '').length;

    if (totalLength > 300) {
      reasonInput.value = value.slice(0, 300);
      reasonError.textContent = "Maximum 300 characters only allowed.";
      return;
    }

    if (totalLength === 0) {
      reasonError.textContent = "Reason is required.";
    } else if (nonSpaceLength < 5) {
      reasonError.textContent = "Reason must be at least 5 characters.";
    } else {
      reasonError.textContent = "";
    }
  });

  // === Asset Type ===
  assetTypeInput.addEventListener('change', () => {
    assetTypeError.textContent = assetTypeInput.value ? "" : "Please select an asset type.";
  });

  // === Form Submission ===
  employeeForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const employeeName = employeeNameInput.value.trim();
    const employeeId = employeeIdInput.value.trim();
    const assetName = assetNameInput.value.trim(); // This maps to jobRole
    const assetType = assetTypeInput.value;
    const reason = reasonInput.value.trim();
    const jobRole = assetName; // Using assetName as jobRole (since HTML still has "Asset Name" field)
    const startDate = startDateInput.value;

    const totalLength = reason.length;
    const nonSpaceLength = reason.replace(/\s/g, '').length;

    let valid = true;

    if (employeeName.length < 5 || employeeName.length > 30 || !nameRegex.test(employeeName)) {
      nameError.textContent = "Name must be 5 – 30 characters, only alphabets and spaces.";
      valid = false;
    } else {
      nameError.textContent = "";
    }

    if (!employeeIdRegex.test(employeeId)) {
      idError.textContent = "ID must be 'ATS' followed by 4 digits (not all zero).";
      valid = false;
    } else {
      idError.textContent = "";
    }

    if (jobRole.length < 5 || jobRole.length > 30 || !assetRegex.test(jobRole)) {
      assetError.textContent = "Job role must be 5 – 30 characters, letters/numbers/spaces only.";
      valid = false;
    } else {
      assetError.textContent = "";
    }

    if (totalLength === 0 || nonSpaceLength < 5) {
      reasonError.textContent = "Reason must be at least 5 characters.";
      valid = false;
    } else if (totalLength > 300) {
      reasonError.textContent = "Cannot exceed 300 total characters.";
      valid = false;
    } else {
      reasonError.textContent = "";
    }

    if (!assetType) {
      assetTypeError.textContent = "Please select an asset type.";
      valid = false;
    } else {
      assetTypeError.textContent = "";
    }

    if (!startDate) {
      alert("Start date is required.");
      valid = false;
    }

    if (!valid) return;

    const request = {
      employeeName,
      employeeId,
      jobRole,
      assetType,
      startDate,
      reason
    };

    fetch('http://localhost:3000/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      employeeForm.reset();
      nameError.textContent = "";
      idError.textContent = "";
      assetError.textContent = "";
      reasonError.textContent = "";
      assetTypeError.textContent = "";
    })
    .catch(err => {
      console.error("Submission error:", err);
      alert("Failed to submit request.");
    });
  });
});
