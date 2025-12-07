// =======================================
// Global Variables
// =======================================
let currentProgram = '';
let currentStation = '';

let p1_points = [];
let p2_points = [];
let p3_points = [];
let p3_allPoints = [];
let savedStations = {}; // بيانات الوقفات
let savedPoints = {}; // بيانات النقاط المدخلة سابقاً

// =======================================
// Navigation
// =======================================
function showProgram(program) {
    currentProgram = program;
    document.getElementById('mainInterface').classList.add('hidden');
    document.getElementById('stationSelect').classList.remove('hidden');
}

function selectStation(stationNum) {
    currentStation = 'Station' + stationNum;
    document.getElementById('stationSelect').classList.add('hidden');
    document.getElementById(currentProgram).classList.remove('hidden');
    loadStationData(currentProgram);
}

function backToMain() {
    saveStationData(currentProgram);
    ['p1', 'p2', 'p3', 'dataHistory'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    document.getElementById('mainInterface').classList.remove('hidden');
}

// =======================================
// Save & Load Station Data
// =======================================
function saveStationData(program) {
    if (!currentStation) return;
    let data = {};
    if (program === 'p1') data = {
        px: document.getElementById('p1_px').value,
        py: document.getElementById('p1_py').value,
        zx: document.getElementById('p1_zx').value,
        zy: document.getElementById('p1_zy').value,
        points: p1_points
    };
    else if (program === 'p2') data = {
        px: document.getElementById('p2_px').value,
        py: document.getElementById('p2_py').value,
        zx: document.getElementById('p2_zx').value,
        zy: document.getElementById('p2_zy').value,
        points: p2_points
    };
    else if (program === 'p3') data = {
        px: document.getElementById('p3_px').value,
        py: document.getElementById('p3_py').value,
        points: p3_points,
        allPoints: p3_allPoints
    };
    localStorage.setItem(currentStation + '_' + program, JSON.stringify(data));
}

function loadStationData(program) {
    if (!currentStation) return;
    let stored = localStorage.getItem(currentStation + '_' + program);
    if (!stored) {
        if (program === 'p1') { p1_points = []; document.querySelector('#p1_resultTable tbody').innerHTML = ''; }
        else if (program === 'p2') { p2_points = []; document.querySelector('#p2_resultTable tbody').innerHTML = ''; }
        else if (program === 'p3') { p3_points = []; p3_allPoints = []; updateP3Select(); document.querySelector('#p3_resultTable tbody').innerHTML = ''; }
        return;
    }
    let data = JSON.parse(stored);
    if (program === 'p1') {
        document.getElementById('p1_px').value = data.px;
        document.getElementById('p1_py').value = data.py;
        document.getElementById('p1_zx').value = data.zx;
        document.getElementById('p1_zy').value = data.zy;
        p1_points = data.points || [];
        p1_calculate();
    }
    else if (program === 'p2') {
        document.getElementById('p2_px').value = data.px;
        document.getElementById('p2_py').value = data.py;
        document.getElementById('p2_zx').value = data.zx;
        document.getElementById('p2_zy').value = data.zy;
        p2_points = data.points || [];
        p2_calculate();
    }
    else if (program === 'p3') {
        document.getElementById('p3_px').value = data.px;
        document.getElementById('p3_py').value = data.py;
        p3_points = data.points || [];
        p3_allPoints = data.allPoints || [];
        updateP3Select();
        p3_calculate();
    }
}

// =======================================
// Program 1: Distance & Angle from Coordinates
// =======================================
function p1_addPoint() {
    let x = parseFloat(document.getElementById('p1_inputX').value);
    let y = parseFloat(document.getElementById('p1_inputY').value);
    if (isNaN(x) || isNaN(y)) return;
    x = (x > 0) ? -x : x;
    p1_points.push({ x, y });
    document.getElementById('p1_inputX').value = '';
    document.getElementById('p1_inputY').value = '';
    p1_calculate();
    saveStationData('p1');
}

function p1_calculate() {
    const px = parseFloat(document.getElementById('p1_px').value);
    const py = parseFloat(document.getElementById('p1_py').value);
    const zx = parseFloat(document.getElementById('p1_zx').value);
    const zy = parseFloat(document.getElementById('p1_zy').value);
    const tbody = document.querySelector('#p1_resultTable tbody');
    tbody.innerHTML = '';
    const baseX = (px > 0) ? -px : px;
    const baseY = py;
    const zeroX = (zx > 0) ? -zx : zx;
    const zeroY = zy;
    p1_points.forEach((p, idx) => {
        const vecZeroX = zeroX - baseX;
        const vecZeroY = zeroY - baseY;
        const vecTargetX = p.x - baseX;
        const vecTargetY = p.y - baseY;
        let dot = vecZeroX * vecTargetX + vecZeroY * vecTargetY;
        let magZero = Math.sqrt(vecZeroX ** 2 + vecZeroY ** 2);
        let magTarget = Math.sqrt(vecTargetX ** 2 + vecTargetY ** 2);
        let angleRad = Math.acos(dot / (magZero * magTarget));
        const cross = vecZeroX * vecTargetY - vecZeroY * vecTargetX;
        if (cross < 0) angleRad = 2 * Math.PI - angleRad;
        const angleGrad = angleRad * (200 / Math.PI);
        const dist = Math.sqrt((p.x - baseX) ** 2 + (p.y - baseY) ** 2);
        tbody.innerHTML += `<tr><td>${idx + 1}</td><td>${p.x.toFixed(2)}</td><td>${p.y.toFixed(2)}</td><td>${dist.toFixed(2)}</td><td>${angleGrad.toFixed(4)}</td></tr>`;
    });
}

// =======================================
// Program 2: Coordinates from Distance & Angle
// =======================================
function p2_addPoint() {
    let angle = parseFloat(document.getElementById('p2_inputAngle').value);
    let dist = parseFloat(document.getElementById('p2_inputDist').value);
    if (isNaN(angle) || isNaN(dist)) return;
    p2_points.push({ angle, dist });
    document.getElementById('p2_inputAngle').value = '';
    document.getElementById('p2_inputDist').value = '';
    p2_calculate();
    saveStationData('p2');
}

function p2_calculate() {
    const px = parseFloat(document.getElementById('p2_px').value);
    const py = parseFloat(document.getElementById('p2_py').value);
    const zx = parseFloat(document.getElementById('p2_zx').value);
    const zy = parseFloat(document.getElementById('p2_zy').value);
    const tbody = document.querySelector('#p2_resultTable tbody');
    tbody.innerHTML = '';
    const baseX = (px > 0) ? -px : px;
    const baseY = py;
    const zeroX = (zx > 0) ? -zx : zx;
    const zeroY = zy;
    p2_points.forEach((p, idx) => {
        const angleRad = p.angle * (Math.PI / 200);
        const vecZeroX = zeroX - baseX;
        const vecZeroY = zeroY - baseY;
        const dx = baseX + vecZeroX + p.dist * Math.cos(angleRad);
        const dy = baseY + vecZeroY + p.dist * Math.sin(angleRad);
        const vecTargetX = dx - baseX;
        const vecTargetY = dy - baseY;
        const vecRefX = zeroX - baseX;
        const vecRefY = zeroY - baseY;
        let dot = vecRefX * vecTargetX + vecRefY * vecTargetY;
        let magRef = Math.sqrt(vecRefX ** 2 + vecRefY ** 2);
        let magTarget = Math.sqrt(vecTargetX ** 2 + vecTargetY ** 2);
        let angleRadResult = Math.acos(dot / (magRef * magTarget));
        const cross = vecRefX * vecTargetY - vecRefY * vecTargetX;
        if (cross < 0) angleRadResult = 2 * Math.PI - angleRadResult;
        const angleGrad = angleRadResult * (200 / Math.PI);
        const dist = Math.sqrt(vecTargetX ** 2 + vecTargetY ** 2);
        tbody.innerHTML += `<tr><td>${idx + 1}</td><td>${dx.toFixed(2)}</td><td>${dy.toFixed(2)}</td><td>${dist.toFixed(2)}</td><td>${angleGrad.toFixed(4)}</td></tr>`;
    });
}

// =======================================
// Program 3: Survey Verification
// =======================================
function updateP3Select() {
    const sel = document.getElementById('p3_selectPoints');
    sel.innerHTML = '';
    p3_allPoints.forEach((p, idx) => {
        const option = document.createElement('option');
        option.value = idx;
        option.text = p.name;
        sel.appendChild(option);
    });
}

function p3_addNewPoint() {
    const name = document.getElementById('p3_newName').value;
    const x = parseFloat(document.getElementById('p3_newX').value);
    const y = parseFloat(document.getElementById('p3_newY').value);
    if (!name || isNaN(x) || isNaN(y)) return alert("أدخل جميع القيم أولاً");
    const newPt = { name, x, y };
    p3_allPoints.push(newPt);
    updateP3Select();
    document.getElementById('p3_newName').value = '';
    document.getElementById('p3_newX').value = '';
    document.getElementById('p3_newY').value = '';
    saveStationData('p3');
}

function p3_addPoint() {
    const sel = document.getElementById('p3_selectPoints');
    const tbody = document.querySelector('#p3_resultTable tbody');
    for (let option of sel.selectedOptions) {
        const idx = parseInt(option.value);
        const pt = p3_allPoints[idx];
        const baseX = parseFloat(document.getElementById('p3_px').value);
        const baseY = parseFloat(document.getElementById('p3_py').value);
        const dist = Math.sqrt((pt.x - baseX) ** 2 + (pt.y - baseY) ** 2);
        const angleRad = Math.atan2(pt.y - baseY, pt.x - baseX);
        const angleGrad = angleRad * (200 / Math.PI);
        tbody.innerHTML += `<tr><td>${pt.name}</td><td>${pt.x.toFixed(2)}</td><td>${pt.y.toFixed(2)}</td><td>${dist.toFixed(2)}</td><td>${angleGrad.toFixed(4)}</td></tr>`;
        p3_points.push(pt);
    }
    saveStationData('p3');
}

function p3_calculate() {
    const tbody = document.querySelector('#p3_resultTable tbody');
    tbody.innerHTML = '';
    const baseX = parseFloat(document.getElementById('p3_px').value);
    const baseY = parseFloat(document.getElementById('p3_py').value);
    p3_points.forEach((pt, idx) => {
        const dist = Math.sqrt((pt.x - baseX) ** 2 + (pt.y - baseY) ** 2);
        const angleRad = Math.atan2(pt.y - baseY, pt.x - baseX);
        const angleGrad = angleRad * (200 / Math.PI);
        tbody.innerHTML += `<tr><td>${pt.name}</td><td>${pt.x.toFixed(2)}</td><td>${pt.y.toFixed(2)}</td><td>${dist.toFixed(2)}</td><td>${angleGrad.toFixed(4)}</td></tr>`;
    });
}

// =======================================
// Export to Excel
// =======================================
function exportExcel(program) {
    let wb = XLSX.utils.book_new();
    let ws_data = [];

    const engineer = "المهندس عمار يوسف";
    let px = '';
    let py = '';
    let zx = '';
    let zy = '';
    let results = [];

    if (program === 'p1') {
        px = document.getElementById('p1_px').value;
        py = document.getElementById('p1_py').value;
        zx = document.getElementById('p1_zx').value;
        zy = document.getElementById('p1_zy').value;
        const rows = document.querySelectorAll('#p1_resultTable tbody tr');
        rows.forEach(r => {
            const tds = r.querySelectorAll('td');
            results.push([tds[0].innerText, tds[1].innerText, tds[2].innerText, tds[3].innerText, tds[4].innerText]);
        });
    } else if (program === 'p2') {
        px = document.getElementById('p2_px').value;
        py = document.getElementById('p2_py').value;
        zx = document.getElementById('p2_zx').value;
        zy = document.getElementById('p2_zy').value;
        const rows = document.querySelectorAll('#p2_resultTable tbody tr');
        rows.forEach(r => {
            const tds = r.querySelectorAll('td');
            results.push([tds[0].innerText, tds[1].innerText, tds[2].innerText, tds[3].innerText, tds[4].innerText]);
        });
    } else if (program === 'p3') {
        px = document.getElementById('p3_px').value;
        py = document.getElementById('p3_py').value;
        const rows = document.querySelectorAll('#p3_resultTable tbody tr');
        rows.forEach(r => {
            const tds = r.querySelectorAll('td');
            results.push([tds[0].innerText, tds[1].innerText, tds[2].innerText, tds[3].innerText, tds[4].innerText]);
        });
    }

    // Add header
    ws_data.push([program]);
    ws_data.push([engineer]);
    ws_data.push(['نقطة الوقوف', px, py]);
    ws_data.push(['نقطة الزيرو', zx, zy]);
    ws_data.push([]);
    ws_data.push(['رقم النقطة', 'X', 'Y', 'المسافة', 'الزاوية']);

    // Add results
    ws_data = ws_data.concat(results);

    let ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, "Results");

    const fileName = program + "_Results_" + new Date().toLocaleDateString() + ".xlsx";
    XLSX.writeFile(wb, fileName);
}