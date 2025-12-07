let currentProgram = '';
let currentStation = '';

let p1_points = [];
let p2_points = [];
let p3_points = [];
let savedPoints = JSON.parse(localStorage.getItem('savedPoints') || '{}');

// ===== التنقل =====
function showProgram(program){
  currentProgram = program;
  document.getElementById('mainInterface').classList.add('hidden');
  document.getElementById('stationSelect').classList.add('hidden');
  if(program==='p4'){ loadSavedPoints(); document.getElementById('p4').classList.remove('hidden'); return; }
  document.getElementById(program).classList.remove('hidden');
}

function selectStation(stationNum){
  currentStation = 'Station'+stationNum;
  document.getElementById('stationSelect').classList.add('hidden');
  document.getElementById(currentProgram).classList.remove('hidden');
  loadStationData(currentProgram);
}

function backToMain(){
  saveStationData(currentProgram);
  document.querySelectorAll('.program').forEach(p=>p.classList.add('hidden'));
  document.getElementById('mainInterface').classList.remove('hidden');
  document.getElementById('stationSelect').classList.add('hidden');
}

// ===== حفظ واسترجاع الوقفات =====
function saveStationData(program){
  if(!currentStation) return;
  let data={};
  if(program==='p1') data={px: document.getElementById('p1_px').value, py: document.getElementById('p1_py').value, zx: document.getElementById('p1_zx').value, zy: document.getElementById('p1_zy').value, points:p1_points};
  if(program==='p2') data={px: document.getElementById('p2_px').value, py: document.getElementById('p2_py').value, zx: document.getElementById('p2_zx').value, zy: document.getElementById('p2_zy').value, points:p2_points};
  if(program==='p3') data={px: document.getElementById('p3_px').value, py: document.getElementById('p3_py').value, zx: document.getElementById('p3_zx').value, zy: document.getElementById('p3_zy').value, points:p3_points};
  localStorage.setItem(currentStation+'_'+program, JSON.stringify(data));
}

function loadStationData(program){
  if(!currentStation) return;
  let stored = localStorage.getItem(currentStation+'_'+program);
  if(!stored) return;
  let data = JSON.parse(stored);
  if(program==='p1'){ document.getElementById('p1_px').value=data.px; document.getElementById('p1_py').value=data.py; document.getElementById('p1_zx').value=data.zx; document.getElementById('p1_zy').value=data.zy; p1_points=data.points||[]; p1_calculate(); }
  if(program==='p2'){ document.getElementById('p2_px').value=data.px; document.getElementById('p2_py').value=data.py; document.getElementById('p2_zx').value=data.zx; document.getElementById('p2_zy').value=data.zy; p2_points=data.points||[]; p2_calculate(); }
  if(program==='p3'){ document.getElementById('p3_px').value=data.px; document.getElementById('p3_py').value=data.py; document.getElementById('p3_zx').value=data.zx; document.getElementById('p3_zy').value=data.zy; p3_points=data.points||[]; p3_calculate(); }
}

// ===== حفظ نقاط الوقوف والزيرو =====
function savePoint(program,type){
  let x=document.getElementById(program+'_'+(type==='station'?'px':'zx')).value;
  let y=document.getElementById(program+'_'+(type==='station'?'py':'zy')).value;
  if(!x || !y) return alert('ادخل X و Y أولاً');
  if(!savedPoints[program]) savedPoints[program]={station:[],zero:[],verify:[]};
  savedPoints[program][type].push({x,y});
  localStorage.setItem('savedPoints', JSON.stringify(savedPoints));
  alert('تم حفظ النقطة');
}

// ===== البرنامج 1 =====
function p1_addPoint(){ let x=parseFloat(document.getElementById('p1_inputX').value); let y=parseFloat(document.getElementById('p1_inputY').value); if(isNaN(x)||isNaN(y)) return; p1_points.push({x:x,y:y}); document.getElementById('p1_inputX').value=''; document.getElementById('p1_inputY').value=''; p1_calculate(); saveStationData('p1'); }
function p1_calculate(){ const px=parseFloat(document.getElementById('p1_px').value); const py=parseFloat(document.getElementById('p1_py').value); const zx=parseFloat(document.getElementById('p1_zx').value); const zy=parseFloat(document.getElementById('p1_zy').value); const tbody=document.querySelector('#p1_resultTable tbody'); tbody.innerHTML=''; const baseX=(px>0)? -px:px; const baseY=py; const zeroX=(zx>0)? -zx:zx; const zeroY=zy; p1_points.forEach((p,idx)=>{ const vecZeroX=zeroX-baseX; const vecZeroY=zeroY-baseY; const vecTargetX=p.x-baseX; const vecTargetY=p.y-baseY; let dot=vecZeroX*vecTargetX+vecZeroY*vecTargetY; let magZero=Math.sqrt(vecZeroX**2+vecZeroY**2); let magTarget=Math.sqrt(vecTargetX**2+vecTargetY**2); let angleRad=Math.acos(dot/(magZero*magTarget)); const cross=vecZeroX*vecTargetY-vecZeroY*vecTargetX; if(cross<0) angleRad=2*Math.PI-angleRad; const angleGrad=angleRad*(200/Math.PI); const dist=Math.sqrt((p.x-baseX)**2+(p.y-baseY)**2); tbody.innerHTML+=`<tr><td>${idx+1}</td><td>${p.x.toFixed(2)}</td><td>${p.y.toFixed(2)}</td><td>${dist.toFixed(2)}</td><td>${angleGrad.toFixed(4)}</td></tr>`; }); }

// ===== البرنامج 2 =====
function p2_addPoint(){ let angle=parseFloat(document.getElementById('p2_inputAngle').value); let dist=parseFloat(document.getElementById('p2_inputDist').value); if(isNaN(angle)||isNaN(dist)) return; p2_points.push({angle:angle,dist:dist}); document.getElementById('p2_inputAngle').value=''; document.getElementById('p2_inputDist').value=''; p2_calculate(); saveStationData('p2'); }
function p2_calculate(){ const px=parseFloat(document.getElementById('p2_px').value); const py=parseFloat(document.getElementById('p2_py').value); const zx=parseFloat(document.getElementById('p2_zx').value); const zy=parseFloat(document.getElementById('p2_zy').value); const tbody=document.querySelector('#p2_resultTable tbody'); tbody.innerHTML=''; const baseX=(px>0)? -px:px; const baseY=py; const zeroX=(zx>0)? -zx:zx; const zeroY=zy; p2_points.forEach((p,idx)=>{ const angleRad=p.angle*(Math.PI/200); const vecZeroX=zeroX-baseX; const vecZeroY=zeroY-baseY; const dx=baseX+vecZeroX+p.dist* Math.cos(angleRad); const dy=baseY+vecZeroY+p.dist*Math.sin(angleRad); tbody.innerHTML+=`<tr><td>${idx+1}</td><td>${dx.toFixed(2)}</td><td>${dy.toFixed(2)}</td><td>${p.dist.toFixed(2)}</td><td>${p.angle.toFixed(4)}</td></tr>`; }); }

// ===== البرنامج 3 - التحقيق =====
function p3_addNewPoint(){
  const name=document.getElementById('p3_newName').value.trim();
  const x=parseFloat(document.getElementById('p3_newX').value);
  const y=parseFloat(document.getElementById('p3_newY').value);
  if(!name || isNaN(x)||isNaN(y)) return alert('ادخل الاسم وX وY');
  if(!savedPoints['p3']) savedPoints['p3']={station:[],zero:[],verify:[]};
  savedPoints['p3'].verify.push({name,x,y});
  localStorage.setItem('savedPoints',JSON.stringify(savedPoints));
  updateP3Select();
  document.getElementById('p3_newName').value=''; document.getElementById('p3_newX').value=''; document.getElementById('p3_newY').value='';
}

function updateP3Select(){
  const select=document.getElementById('p3_selectPoints');
  select.innerHTML='';
  if(!savedPoints['p3']) return;
  savedPoints['p3'].verify.forEach(p=>{ const option=document.createElement('option'); option.value=JSON.stringify(p); option.text=`${p.name} X:${p.x} Y:${p.y}`; select.add(option); });
}

function p3_addPoint(){
  const select=document.getElementById('p3_selectPoints');
  Array.from(select.selectedOptions).forEach(opt=>{
    const p=JSON.parse(opt.value);
    p3_points.push({name:p.name,x:p.x,y:p.y});
  });
  p3_calculate();
  saveStationData('p3');
}

function p3_calculate(){
  const px=parseFloat(document.getElementById('p3_px').value);
  const py=parseFloat(document.getElementById('p3_py').value);
  const zx=parseFloat(document.getElementById('p3_zx').value);
  const zy=parseFloat(document.getElementById('p3_zy').value);
  const tbody=document.querySelector('#p3_resultTable tbody'); tbody.innerHTML='';
  const baseX=(px>0)? -px:px; const baseY=py; const zeroX=(zx>0)? -zx:zx; const zeroY=zy;
  p3_points.forEach(p=>{
    const vecZeroX=zeroX-baseX; const vecZeroY=zeroY-baseY; const vecTargetX=p.x-baseX; const vecTargetY=p.y-baseY;
    let dot=vecZeroX*vecTargetX+vecZeroY*vecTargetY;
    let magZero=Math.sqrt(vecZeroX**2+vecZeroY**2);
    let magTarget=Math.sqrt(vecTargetX**2+vecTargetY**2);
    let angleRad=Math.acos(dot/(magZero*magTarget));
    const cross=vecZeroX*vecTargetY-vecZeroY*vecTargetX;
    if(cross<0) angleRad=2*Math.PI-angleRad;
    const angleGrad=angleRad*(200/Math.PI);
    const dist=Math.sqrt((p.x-baseX)**2+(p.y-baseY)**2);
    tbody.innerHTML+=`<tr><td>${p.name}</td><td>${p.x.toFixed(2)}</td><td>${p.y.toFixed(2)}</td><td>${dist.toFixed(2)}</td><td>${angleGrad.toFixed(4)}</td></tr>`;
  });
}

// ===== البرنامج 4 - النقاط المدخلة سابقاً =====
function loadSavedPoints(){
  const ul=document.getElementById('p4_list');
  ul.innerHTML='';
  for(const prog in savedPoints){
    ['station','zero','verify'].forEach(type=>{
      savedPoints[prog][type]?.forEach(p=>{
        const li=document.createElement('li');
        li.textContent=(p.name?p.name:`${type} X:${p.x} Y:${p.y}`);
        li.onclick=()=>{ addToP4Table(p); };
        ul.appendChild(li);
      });
    });
  }
}

function filterSavedPoints(){
  const filter=document.getElementById('p4_search').value.toLowerCase();
  const ul=document.getElementById('p4_list'); ul.innerHTML='';
  for(const prog in savedPoints){
    ['station','zero','verify'].forEach(type=>{
      savedPoints[prog][type]?.forEach(p=>{
        const text=(p.name?p.name:`${type} X:${p.x} Y:${p.y}`);
        if(text.toLowerCase().includes(filter)){
          const li=document.createElement('li'); li.textContent=text;
          li.onclick=()=>{ addToP4Table(p); };
          ul.appendChild(li);
        }
      });
    });
  }
}

function addToP4Table(p){
  const tbody=document.querySelector('#p4_resultTable tbody');
  const row=document.createElement('tr');
  row.innerHTML=`<td>${p.name||''}</td><td>${p.x}</td><td>${p.y}</td><td><button onclick="this.parentElement.parentElement.remove()">إلغاء</button></td>`;
  tbody.appendChild(row);
}

// ===== تصدير أكسل =====
function exportExcel(program){
  let data=[];
  if(program==='p1'){ data=p1_points.map((p,idx)=>({رقم:idx+1,X:p.x,Y:p.y})); }
  if(program==='p2'){ data=p2_points.map((p,idx)=>({رقم:idx+1,X:p.x,Y:p.y})); }
  if(program==='p3'){ data=p3_points.map((p,idx)=>({اسم:p.name,X:p.x,Y:p.y})); }
  const ws=XLSX.utils.json_to_sheet(data);
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,"النتائج");
  XLSX.writeFile(wb, "results.xlsx");
}

// ===== مسح البيانات =====
function clearStation(program){
  if(!confirm('هل تريد مسح كل البيانات؟')) return;
  if(program==='p1') p1_points=[];
  if(program==='p2') p2_points=[];
  if(program==='p3') p3_points=[];
  document.querySelectorAll(`#${program} table tbody`).forEach(tbody=>tbody.innerHTML='');
}