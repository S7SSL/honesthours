// Honest Hours — options.js

const fields = ['employeeName', 'employeeId', 'companyCode', 'apiEndpoint'];

// Load saved values
chrome.storage.sync.get(fields, (data) => {
  fields.forEach(key => {
    const el = document.getElementById(key);
    if (el && data[key]) el.value = data[key];
  });
});

document.getElementById('saveBtn').addEventListener('click', () => {
  const values = {};
  fields.forEach(key => {
    const el = document.getElementById(key);
    if (el) values[key] = el.value.trim();
  });

  chrome.storage.sync.set(values, () => {
    const toast = document.getElementById('toast');
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2500);
  });
});
