(() => {
  "use strict";
  const STORAGE_KEY = "legajos_static_demo_v1";
  const FILES_KEY = "legajos_static_files_v1";
  let employees = [];
  let importedFiles = [];
  let selectedFiles = [];
  let toastTimer;
  const $ = (id) => document.getElementById(id);

  const aliases = {
    legajo: ["legajo","nro legajo","numero legajo","numero de legajo","n de legajo","n° de legajo","nº de legajo","id empleado","employee id","ficha","numero de ficha"],
    nombre: ["nombre","nombres","first name","nombre de pila"],
    apellido: ["apellido","apellidos","last name","surname"],
    nombreCompleto: ["nombre completo","nombre y apellido","apellido y nombre","nombre empleado","nombre del empleado","empleado","trabajador","full name","employee name"],
    dni: ["dni","documento","numero de documento","nro dni"],
    cuil: ["cuil","cuit","cuil cuit"],
    email: ["email","e mail","mail","correo","correo electronico","email laboral"],
    telefono: ["telefono","tel","celular","movil","phone","telefono laboral"],
    sector: ["area","sector","departamento","gerencia","division","unidad organizativa"],
    puesto: ["puesto","cargo","funcion","puesto de trabajo","posicion","job title"],
    ingreso: ["fecha de ingreso","fecha ingreso","ingreso","fecha de alta","fecha alta","hire date"],
    nacimiento: ["fecha de nacimiento","fecha nacimiento","nacimiento","birth date"],
    estado: ["estado","situacion","estado laboral","situacion laboral","activo"],
    sede: ["sucursal","sede","establecimiento","planta","localidad laboral"],
    domicilio: ["domicilio","direccion","direccion particular","domicilio particular"],
    responsable: ["jefe","supervisor","responsable","jefe directo","reporta a"]
  };
  const labels = {legajo:"N.º de legajo",nombre:"Nombre",apellido:"Apellido",nombreCompleto:"Nombre completo",dni:"DNI / documento",cuil:"CUIL / CUIT",email:"Correo electrónico",telefono:"Teléfono",sector:"Área / sector",puesto:"Puesto / cargo",ingreso:"Fecha de ingreso",nacimiento:"Fecha de nacimiento",estado:"Estado laboral",sede:"Sede / sucursal",domicilio:"Domicilio",responsable:"Jefe / responsable"};

  function normalize(s) {
    return String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  }
  function clean(value) {
    if (value === null || value === undefined) return "";
    if (value instanceof Date) return value.toLocaleDateString("es-AR");
    return String(value).trim();
  }
  function readStored() {
    try { employees = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { employees = []; }
    try { importedFiles = JSON.parse(localStorage.getItem(FILES_KEY) || "[]"); } catch { importedFiles = []; }
  }
  function saveStored() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
      localStorage.setItem(FILES_KEY, JSON.stringify(importedFiles));
    } catch (e) {
      showToast("No se pudo guardar: el navegador podría haberse quedado sin espacio.");
      throw e;
    }
  }
  function fullName(emp) {
    return emp.nombreCompleto || [emp.nombre, emp.apellido].filter(Boolean).join(" ") || "Nombre no informado";
  }
  function initials(name) {
    return name.split(/\s+/).filter(Boolean).slice(0,2).map(s=>s[0]).join("").toUpperCase() || "?";
  }
  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function showToast(message) {
    const t = $("toast"); t.textContent = message; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(()=>t.classList.remove("show"), 3200);
  }
  function render() {
    const q = normalize($("search-input").value);
    const filtered = employees.filter(e => normalize([e.legajo,fullName(e),e.sector,e.puesto,e.estado,...Object.values(e.extra||{})].join(" ")).includes(q));
    $("stat-total").textContent = employees.length.toLocaleString("es-AR");
    $("stat-visible").textContent = filtered.length.toLocaleString("es-AR");
    $("stat-files").textContent = importedFiles.length.toLocaleString("es-AR");
    $("table-count").textContent = `${filtered.length} ${filtered.length === 1 ? "empleado" : "empleados"}`;
    const body = $("employee-rows");
    body.innerHTML = filtered.map(e => {
      const name = fullName(e);
      const inactive = normalize(e.estado).includes("inactiv") || normalize(e.estado).includes("baja");
      return `<tr>
        <td><span class="legajo-pill">${escapeHtml(e.legajo)}</span></td>
        <td><div class="person"><span class="avatar">${escapeHtml(initials(name))}</span><div><strong>${escapeHtml(name)}</strong><small>${escapeHtml(e.email || e.dni || "Sin dato adicional")}</small></div></div></td>
        <td>${escapeHtml(e.sector || "—")}</td><td>${escapeHtml(e.puesto || "—")}</td>
        <td>${e.estado ? `<span class="state ${inactive ? "inactive" : ""}">${escapeHtml(e.estado)}</span>` : "—"}</td>
        <td><button class="view-btn" data-profile="${escapeHtml(e.legajo)}">Ver ficha →</button></td>
      </tr>`;
    }).join("");
    $("empty-state").classList.toggle("hidden", filtered.length > 0);
    body.parentElement.classList.toggle("has-results", filtered.length > 0);
    if (!filtered.length && employees.length) {
      $("empty-state").innerHTML = `<div class="empty-icon">⌕</div><h3>No encontramos resultados</h3><p>Probá con otro número de legajo, nombre o sector.</p><button class="secondary-btn" id="empty-clear">Limpiar búsqueda</button>`;
      $("empty-clear").onclick = () => { $("search-input").value=""; render(); };
    } else if (!filtered.length) {
      $("empty-state").innerHTML = `<div class="empty-icon">▤</div><h3>Todavía no hay legajos</h3><p>Importá uno o varios Excel para empezar a armar el directorio.</p><button class="primary-btn" id="empty-import">Importar archivos</button>`;
      $("empty-import").onclick = openImport;
    }
    body.querySelectorAll("[data-profile]").forEach(btn => btn.addEventListener("click", ()=>openProfile(btn.dataset.profile)));
  }
  function openImport() { $("import-modal").classList.remove("hidden"); $("import-message").classList.add("hidden"); }
  function closeImport() { $("import-modal").classList.add("hidden"); selectedFiles=[]; $("file-input").value=""; $("selected-files").textContent="Ningún archivo seleccionado"; $("do-import").disabled=true; }
  function matchKey(header) {
    const n = normalize(header);
    for (const [key, list] of Object.entries(aliases)) if (list.some(a => normalize(a) === n)) return key;
    return "";
  }
  function fileToRows(file) {
    return new Promise((resolve,reject)=>{
      const reader = new FileReader();
      reader.onerror = ()=>reject(new Error(`No se pudo leer ${file.name}`));
      reader.onload = e => {
        try {
          let workbook;
          if (file.name.toLowerCase().endsWith(".csv")) workbook = XLSX.read(e.target.result,{type:"string",cellDates:true});
          else workbook = XLSX.read(e.target.result,{type:"array",cellDates:true});
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(sheet,{defval:"",raw:false});
          resolve(rows);
        } catch(err) { reject(new Error(`No se pudo interpretar ${file.name}: ${err.message}`)); }
      };
      if (file.name.toLowerCase().endsWith(".csv")) reader.readAsText(file,"UTF-8"); else reader.readAsArrayBuffer(file);
    });
  }
  async function importSelected() {
    if (!selectedFiles.length) return;
    $("do-import").disabled=true; $("do-import").textContent="Importando…";
    const createdBefore=employees.length;
    let created=0, updated=0, skipped=0, processed=0;
    try {
      for (const file of selectedFiles) {
        const rows = await fileToRows(file);
        if (!rows.length) { skipped++; continue; }
        let fileCount=0;
        for (const row of rows) {
          const keys = Object.keys(row);
          const legajoHeader = keys.find(k => matchKey(k)==="legajo");
          if (!legajoHeader) continue;
          const legajo = clean(row[legajoHeader]);
          if (!legajo) { skipped++; continue; }
          const mapped={}, extra={};
          for (const key of keys) {
            const value=clean(row[key]); if (!value) continue;
            const field=matchKey(key);
            if (field) mapped[field]=value; else extra[key]=value;
          }
          let emp=employees.find(e=>String(e.legajo)===legajo);
          if (!emp) { emp={legajo,extra:{},sources:[]}; employees.push(emp); created++; }
          else updated++;
          for (const [key,value] of Object.entries(mapped)) if (value !== "") emp[key]=value;
          emp.extra={...(emp.extra||{}),...extra};
          emp.sources=[...new Set([...(emp.sources||[]),file.name])];
          fileCount++;
        }
        if (fileCount) { importedFiles.push({name:file.name,at:new Date().toISOString(),count:fileCount}); processed++; }
        else skipped++;
      }
      saveStored(); render();
      const msg=`Importación terminada. ${created} legajos nuevos, ${updated} filas combinadas y ${skipped} archivos/filas omitidos.`;
      $("import-message").textContent=msg; $("import-message").classList.remove("hidden","error");
      $("do-import").textContent="Importación terminada";
      showToast(msg);
      setTimeout(()=>{closeImport();$("do-import").textContent="Importar y combinar";},1500);
    } catch(err) {
      $("import-message").textContent=err.message || "No se pudieron importar los archivos.";
      $("import-message").classList.remove("hidden"); $("import-message").classList.add("error");
      $("do-import").disabled=false; $("do-import").textContent="Reintentar";
    }
  }
  function openProfile(legajo) {
    const emp=employees.find(e=>String(e.legajo)===String(legajo)); if(!emp) return;
    $("profile-title").textContent=fullName(emp);
    $("profile-subtitle").textContent=`Legajo ${emp.legajo}`;
    const fields=[];
    for (const [key,label] of Object.entries(labels)) {
      if (key==="nombreCompleto" && emp.nombre && emp.apellido && !emp.nombreCompleto) continue;
      if (emp[key]) fields.push([label,emp[key]]);
    }
    for (const [key,val] of Object.entries(emp.extra||{})) if(val) fields.push([key,val]);
    fields.push(["Archivos de origen",(emp.sources||[]).join(", ")||"No informado"]);
    $("profile-content").innerHTML=fields.map(([label,value])=>`<div class="profile-field"><label>${escapeHtml(label)}</label><div>${escapeHtml(value)}</div></div>`).join("");
    $("profile-modal").classList.remove("hidden");
  }
  function exportCsv() {
    if (!employees.length) {showToast("No hay legajos para exportar.");return;}
    const fields=[...new Set(employees.flatMap(e=>[...Object.keys(e).filter(k=>!["extra","sources"].includes(k)),...Object.keys(e.extra||{})]))];
    const data=[fields.map(k=>labels[k]||k),...employees.map(e=>fields.map(k=>e[k] ?? e.extra?.[k] ?? ""))];
    const csv=data.map(row=>row.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(";")).join("\r\n");
    const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8;"});
    const url=URL.createObjectURL(blob), a=document.createElement("a");a.href=url;a.download="legajos_exportados.csv";a.click();URL.revokeObjectURL(url);
    showToast("Se descargó legajos_exportados.csv");
  }
  $("top-import").onclick=openImport; $("empty-import").onclick=openImport; $("nav-import").onclick=openImport;
  $("nav-home").onclick=()=>{window.scrollTo({top:0,behavior:"smooth"});$("nav-home").classList.add("active");$("nav-import").classList.remove("active");};
  $("nav-import").addEventListener("click",()=>{$("nav-import").classList.add("active");$("nav-home").classList.remove("active");});
  $("file-input").addEventListener("change",e=>{
    selectedFiles=Array.from(e.target.files||[]);
    $("selected-files").textContent=selectedFiles.length?selectedFiles.map(f=>`${f.name} · ${(f.size/1024).toFixed(0)} KB`).join("\n"):"Ningún archivo seleccionado";
    $("do-import").disabled=!selectedFiles.length; $("do-import").textContent="Importar y combinar";
    $("import-message").classList.add("hidden");
  });
  $("do-import").onclick=importSelected;
  document.querySelectorAll(".close-modal").forEach(b=>b.onclick=closeImport);
  document.querySelectorAll(".close-profile").forEach(b=>b.onclick=()=>$("profile-modal").classList.add("hidden"));
  $("import-modal").addEventListener("click",e=>{if(e.target===$("import-modal"))closeImport();});
  $("profile-modal").addEventListener("click",e=>{if(e.target===$("profile-modal"))$("profile-modal").classList.add("hidden");});
  $("search-input").addEventListener("input",render);
  $("clear-search").onclick=()=>{$("search-input").value="";render();};
  $("export-btn").onclick=exportCsv;
  $("clear-all").onclick=()=>{
    if(confirm("¿Seguro que querés borrar todos los legajos y el historial de importaciones guardados en este navegador? Esta acción no se puede deshacer.")){
      employees=[];importedFiles=[];saveStored();render();showToast("Se borraron los datos locales.");
    }
  };
  $("dismiss-notice").onclick=()=>$("privacy-notice").classList.add("hidden");
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeImport();$("profile-modal").classList.add("hidden");}});
  readStored();render();
})();