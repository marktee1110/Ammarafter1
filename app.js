// app.js

// قاعدة بيانات محلية للتطبيق
let storedPoints = {
  standingPoints: [],
  zeroPoints: [],
  investigationPoints: []
};

// تحميل البيانات المحفوظة من LocalStorage عند بدء التطبيق
function loadStoredPoints() {
  const data = localStorage.getItem('storedPoints');
  if (data) {
    storedPoints = JSON.parse(data);
  }
}

// حفظ البيانات في LocalStorage
function saveStoredPoints() {
  localStorage.setItem('storedPoints', JSON.stringify(storedPoints));
}

// إضافة نقطة جديدة
function addPoint(type, name, x, y) {
  if (!name) return;
  const point = { name, x, y };
  storedPoints[type].push(point);
  saveStoredPoints();
  renderPoints(type);
}

// تعديل نقطة موجودة
function editPoint(type, index, name, x, y) {
  storedPoints[type][index] = { name, x, y };
  saveStoredPoints();
  renderPoints(type);
}

// حذف نقطة
function deletePoint(type, index) {
  storedPoints[type].splice(index, 1);
  saveStoredPoints();
  renderPoints(type);
}

// عرض النقاط في الواجهة
function renderPoints(type) {
  const container = document.getElementById(`${type}Container`);
  container.innerHTML = '';

  storedPoints[type].forEach((p, i) => {
    const div = document.createElement('div');
    div.className = 'pointRow';

    div.innerHTML = `
      <span>${p.name} (X: ${p.x}, Y: ${p.y})</span>
      <button onclick="editUI('${type}', ${i})">تعديل</button>
      <button onclick="deletePoint('${type}', ${i})">حذف</button>
    `;
    container.appendChild(div);
  });
}

// واجهة التعديل
function editUI(type, index) {
  const point = storedPoints[type][index];
  const name = prompt('اسم النقطة:', point.name);
  if (name === null) return; // إلغاء
  const x = prompt('إحداثية X:', point.x);
  if (x === null) return;
  const y = prompt('إحداثية Y:', point.y);
  if (y === null) return;

  editPoint(type, index, name, parseFloat(x), parseFloat(y));
}

// البحث والفلترة
function filterPoints(type, inputId) {
  const query = document.getElementById(inputId).value.toLowerCase();
  const container = document.getElementById(`${type}Container`);
  container.innerHTML = '';
  storedPoints[type]
    .filter(p => p.name.toLowerCase().includes(query))
    .forEach((p, i) => {
      const div = document.createElement('div');
      div.className = 'pointRow';
      div.innerHTML = `
        <span>${p.name} (X: ${p.x}, Y: ${p.y})</span>
        <button onclick="editUI('${type}', ${i})">تعديل</button>
        <button onclick="deletePoint('${type}', ${i})">حذف</button>
      `;
      container.appendChild(div);
    });
}

// تصدير البيانات إلى ملف Excel
function exportExcel() {
  const wb = XLSX.utils.book_new();

  ['standingPoints', 'zeroPoints', 'investigationPoints'].forEach(type => {
    const ws_data = [['اسم النقطة', 'X', 'Y']];
    storedPoints[type].forEach(p => {
      ws_data.push([p.name, p.x, p.y]);
    });
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, type);
  });

  XLSX.writeFile(wb, 'Project_Data.xlsx');
}

// تهيئة التطبيق
function initApp() {
  loadStoredPoints();
  renderPoints('standingPoints');
  renderPoints('zeroPoints');
  renderPoints('investigationPoints');
}

window.onload = initApp;