let pointsDB = JSON.parse(localStorage.getItem('pointsDB')) || {
    standingPoints: [],
    zeroPoints: [],
    investigationPoints: []
};

function saveDB() {
    localStorage.setItem('pointsDB', JSON.stringify(pointsDB));
}

function openProgram(name) {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('programContainer').style.display = 'block';
    document.querySelectorAll('.program').forEach(p => p.style.display = 'none');
    document.getElementById(name+'Program').style.display = 'block';
    if (name === 'investigation') setupInvestigation();
    if (name === 'previous') setupPrevious();
}

function backToMenu() {
    document.getElementById('programContainer').style.display = 'none';
    document.getElementById('mainMenu').style.display = 'block';
}

function setupInvestigation() {
    const container = document.getElementById('investigationProgram');
    container.innerHTML = '';

    container.innerHTML += `<h3>نقطة الوقوف</h3>
        <input type="text" id="standingSearch" placeholder="ابحث عن نقطة الوقوف">
        <input type="number" id="standingX" placeholder="X">
        <input type="number" id="standingY" placeholder="Y">
        <button onclick="saveStanding()">حفظ نقطة الوقوف</button>
        <div id="standingDropdown" class="searchDropdown"></div>
        <hr>`;

    container.innerHTML += `<h3>نقطة الزيرو</h3>
        <input type="text" id="zeroSearch" placeholder="ابحث عن نقطة الزيرو">
        <input type="number" id="zeroX" placeholder="X">
        <input type="number" id="zeroY" placeholder="Y">
        <button onclick="saveZero()">حفظ نقطة الزيرو</button>
        <div id="zeroDropdown" class="searchDropdown"></div>
        <hr>`;

    container.innerHTML += `<h3>نقاط التحقيق</h3>
        <input type="text" id="investSearch" placeholder="بحث نقاط التحقيق">
        <div id="investDropdown" class="searchDropdown"></div>
        <table id="resultsTable">
            <tr><th>نوع النقطة</th><th>X</th><th>Y</th><th>إلغاء</th></tr>
        </table>
        <button onclick="exportExcel()">تصدير Excel</button>`;

    setupSearch('standing');
    setupSearch('zero');
    setupSearch('invest');
}

function saveStanding() {
    const name = document.getElementById('standingSearch').value.trim();
    const x = document.getElementById('standingX').value;
    const y = document.getElementById('standingY').value;
    if (!name) return alert('ادخل اسم النقطة!');
    pointsDB.standingPoints.push({name, x, y});
    saveDB();
    alert('تم حفظ نقطة الوقوف');
    document.getElementById('standingSearch').value='';
    document.getElementById('standingX').value='';
    document.getElementById('standingY').value='';
}

function saveZero() {
    const name = document.getElementById('zeroSearch').value.trim();
    const x = document.getElementById('zeroX').value;
    const y = document.getElementById('zeroY').value;
    if (!name) return alert('ادخل اسم النقطة!');
    pointsDB.zeroPoints.push({name, x, y});
    saveDB();
    alert('تم حفظ نقطة الزيرو');
    document.getElementById('zeroSearch').value='';
    document.getElementById('zeroX').value='';
    document.getElementById('zeroY').value='';
}

function setupSearch(type) {
    const input = document.getElementById(type+'Search');
    const dropdown = document.getElementById(type+'Dropdown');

    input.addEventListener('input', function() {
        const query = this.value.trim().toLowerCase();
        dropdown.innerHTML = '';
        let list = [];
        if (type === 'standing') list = pointsDB.standingPoints;
        if (type === 'zero') list = pointsDB.zeroPoints;
        if (type === 'invest') list = pointsDB.investigationPoints;

        list.filter(p => p.name.toLowerCase().includes(query)).forEach(p => {
            const div = document.createElement('div');
            div.className = 'searchItem';
            div.textContent = `${p.name} (${p.x},${p.y})`;
            div.onclick = () => addInvestigationPoint(p, type);
            dropdown.appendChild(div);
        });
        dropdown.style.display = query ? 'block' : 'none';
    });
}

function addInvestigationPoint(p, type) {
    const table = document.getElementById('resultsTable');
    const tr = table.insertRow();
    tr.insertCell(0).textContent = p.name;
    tr.insertCell(1).textContent = p.x;
    tr.insertCell(2).textContent = p.y;
    const btn = document.createElement('button');
    btn.textContent = 'إلغاء';
    btn.onclick = () => table.deleteRow(tr.rowIndex);
    tr.insertCell(3).appendChild(btn);
}

function setupPrevious() {
    const container = document.getElementById('previousProgram');
    container.innerHTML = `<button onclick="backToMenu()">العودة الى القائمة السابقة</button>`;
    container.innerHTML += `<input type="text" id="prevSearch" placeholder="بحث نقاط سابقة">`;
    const listDiv = document.createElement('div');
    listDiv.id='prevList';
    container.appendChild(listDiv);

    displayPreviousList();

    document.getElementById('prevSearch').addEventListener('input', function() {
        displayPreviousList(this.value);
    });
}

function displayPreviousList(filter='') {
    const listDiv = document.getElementById('prevList');
    listDiv.innerHTML = '';
    const allPoints = [...pointsDB.standingPoints, ...pointsDB.zeroPoints, ...pointsDB.investigationPoints];
    allPoints.sort((a,b)=>a.name.localeCompare(b.name));
    allPoints.filter(p=>p.name.toLowerCase().includes(filter.toLowerCase()))
        .forEach(p=>{
            const div = document.createElement('div');
            div.textContent = `${p.name} (${p.x},${p.y})`;
            listDiv.appendChild(div);
        });
}

function exportExcel() {
    const wb = XLSX.utils.book_new();
    const ws_data = [];

    ws_data.push(['اسم البرنامج: برنامج التحقيق']);
    ws_data.push(['تصميم: المهندس عمار يوسف']);
    ws_data.push([]);

    ws_data.push(['نقطة الوقوف', 'X', 'Y']);
    ws_data.push(pointsDB.standingPoints.map(p=>[p.name,p.x,p.y])[0] || ['','','']);
    ws_data.push(['نقطة الزيرو', 'X', 'Y']);
    ws_data.push(pointsDB.zeroPoints.map(p=>[p.name,p.x,p.y])[0] || ['','','']);
    ws_data.push([]);

    ws_data.push(['نوع النقطة','X','Y']);
    const table = document.getElementById('resultsTable');
    for(let i=1;i<table.rows.length;i++){
        const row = table.rows[i];
        ws_data.push([row.cells[0].textContent,row.cells[1].textContent,row.cells[2].textContent]);
    }

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, 'نتائج');
    XLSX.writeFile(wb,'نتائج_التحقيق.xlsx');
    alert('تم تصدير ملف Excel بنجاح');
}