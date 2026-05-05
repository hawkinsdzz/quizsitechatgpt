const MODULES = ['Magie', 'Politique', 'Guerre', 'Divin', 'Technologie'];

const defaultUniverse = () => ({
  id: crypto.randomUUID(),
  name: 'Nouvel Univers',
  modules: Object.fromEntries(MODULES.map(m => [m, true])),
  entities: [],
  factions: [],
  places: [],
  grimoire: [],
  timeline: [],
  customFields: [{ key: 'aura', type: 'text' }],
});

const state = {
  universes: [defaultUniverse()],
  activeUniverseId: null,
  activeView: 'entities',
  split: true,
  filter: '',
};
state.activeUniverseId = state.universes[0].id;

const $ = s => document.querySelector(s);
const activeUniverse = () => state.universes.find(u => u.id === state.activeUniverseId);
const editorPanel = $('#editorPanel');
const previewPanel = $('#previewPanel');

function save() { localStorage.setItem('loreforge_v1', JSON.stringify(state.universes)); }
function load() {
  const raw = localStorage.getItem('loreforge_v1');
  if (!raw) return;
  try {
    state.universes = JSON.parse(raw);
    if (state.universes.length) state.activeUniverseId = state.universes[0].id;
  } catch {}
}

function bindTopControls() {
  $('#newUniverseBtn').onclick = () => {
    const name = prompt('Nom du nouvel univers ?');
    if (!name) return;
    const u = defaultUniverse();
    u.name = name;
    state.universes.push(u);
    state.activeUniverseId = u.id;
    save(); render();
  };
  $('#splitToggle').onclick = () => {
    state.split = !state.split;
    $('#splitContainer').classList.toggle('single', !state.split);
  };
  $('#searchInput').oninput = e => { state.filter = e.target.value.toLowerCase(); renderPreview(); };
  $('#aiGenerateBtn').onclick = aiGenerateMock;

  $('#exportBtn').onclick = () => {
    const blob = new Blob([JSON.stringify(activeUniverse(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${activeUniverse().name.replace(/\s+/g,'_')}.json`;
    a.click();
  };
  $('#importInput').onchange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    const data = JSON.parse(await file.text());
    data.id = crypto.randomUUID();
    state.universes.push(data);
    state.activeUniverseId = data.id;
    save(); render();
  };
}

function aiGenerateMock() {
  const u = activeUniverse();
  if (state.activeView === 'entities') {
    u.entities.push({ name:'Nyra Voss', age:27, role:'Mage tacticienne', rank:'A', tags:['Mage','Traître'], stats:{force:40,vitesse:65,intelligence:92}, relations:['Orin: mentor'], timeline:'Exil -> Renaissance' });
  } else if (state.activeView === 'grimoire') {
    u.grimoire.push({ name:'Éclipse Quantique', type:'Magie/Technologie', mastery:3, condition:'Nécessite un noyau lunaire' });
  } else {
    u.timeline.push({ year:'1324', title:'Convergence des mondes', arc:'Arc Oméga' });
  }
  save(); renderPreview();
}

function renderUniverseSelector() {
  const sel = $('#universeSelect');
  sel.innerHTML = state.universes.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
  sel.value = state.activeUniverseId;
  sel.onchange = e => { state.activeUniverseId = e.target.value; render(); };
}

function renderModules() {
  const box = $('#moduleToggles');
  const u = activeUniverse();
  box.innerHTML = MODULES.map(m => `<label><input type="checkbox" data-mod="${m}" ${u.modules[m] ? 'checked' : ''}/> ${m}</label>`).join('');
  box.querySelectorAll('input').forEach(i => i.onchange = (e) => {
    u.modules[e.target.dataset.mod] = e.target.checked;
    save();
  });
}

function viewButtons() {
  document.querySelectorAll('[data-view]').forEach(btn => btn.onclick = () => {
    state.activeView = btn.dataset.view;
    $('#viewTitle').textContent = btn.textContent;
    renderEditor(); renderPreview();
  });
}

function renderEditor() {
  const u = activeUniverse();
  if (state.activeView === 'entities') {
    editorPanel.innerHTML = `<h3>Créer personnage</h3>
      <input id='eName' placeholder='Nom'/> <input id='eAge' type='number' placeholder='Âge'/>
      <input id='eRole' placeholder='Rôle'/> <input id='eRank' placeholder='Rang (S-E)'/>
      <textarea id='eTags' placeholder='Tags, séparés par virgules'></textarea>
      <button id='addEntity'>Ajouter</button>`;
    $('#addEntity').onclick = () => {
      u.entities.push({
        name: $('#eName').value,
        age: Number($('#eAge').value || 0),
        role: $('#eRole').value,
        rank: $('#eRank').value || 'C',
        tags: $('#eTags').value.split(',').map(s => s.trim()).filter(Boolean),
        stats: { force: 50, vitesse: 50, intelligence: 50 },
        relations: [], timeline: ''
      }); save(); renderPreview();
    };
  } else if (state.activeView === 'factions') {
    editorPanel.innerHTML = `<h3>Créer faction</h3><input id='fName' placeholder='Nom'/> <input id='fAlign' placeholder='Alignement'/> <button id='addFaction'>Ajouter</button>`;
    $('#addFaction').onclick = () => { u.factions.push({ name: $('#fName').value, alignment: $('#fAlign').value, influence: 50, history:'' }); save(); renderPreview(); };
  } else if (state.activeView === 'places') {
    editorPanel.innerHTML = `<h3>Ajouter lieu</h3><input id='pName' placeholder='Lieu'/> <input id='pType' placeholder='Ville, donjon...'/> <input id='pDanger' type='range' min='1' max='100' value='50'/> <button id='addPlace'>Ajouter</button>`;
    $('#addPlace').onclick = () => { u.places.push({ name: $('#pName').value, type: $('#pType').value, danger: Number($('#pDanger').value), climate:'Tempéré' }); save(); renderPreview(); };
  } else if (state.activeView === 'grimoire') {
    editorPanel.innerHTML = `<h3>Créer pouvoir</h3><input id='gName' placeholder='Nom'/> <input id='gType' placeholder='Type'/> <input id='gMastery' type='range' min='1' max='5' value='1'/> <button id='addSpell'>Ajouter</button>`;
    $('#addSpell').onclick = () => { u.grimoire.push({ name: $('#gName').value, type: $('#gType').value, mastery: Number($('#gMastery').value), condition:'-' }); save(); renderPreview(); };
  } else if (state.activeView === 'timeline') {
    editorPanel.innerHTML = `<h3>Événement global</h3><input id='tYear' placeholder='Année'/> <input id='tTitle' placeholder='Titre'/> <input id='tArc' placeholder='Arc narratif'/> <button id='addEvent'>Ajouter</button>`;
    $('#addEvent').onclick = () => { u.timeline.push({ year: $('#tYear').value, title: $('#tTitle').value, arc: $('#tArc').value }); save(); renderPreview(); };
  } else if (state.activeView === 'rpg') {
    editorPanel.innerHTML = `<h3>Mode JDR</h3><button id='rollDice'>Lancer 1d20</button><p id='diceOut'></p><button id='genScenario'>Générer scénario</button><p id='scenarioOut'></p>`;
    $('#rollDice').onclick = () => $('#diceOut').textContent = `Résultat: ${1 + Math.floor(Math.random()*20)}`;
    $('#genScenario').onclick = () => $('#scenarioOut').textContent = 'Mission: infiltrer la Cité Eclipse pour voler le Codex Brisé.';
  } else {
    editorPanel.innerHTML = `<h3>Architecte No-Code</h3><p>Créez des templates et des champs personnalisés réutilisables.</p><input id='cKey' placeholder='Nom du champ'/><select id='cType'><option>text</option><option>number</option><option>slider</option><option>color</option><option>image</option><option>relation</option></select><button id='addField'>Ajouter champ</button><div id='customList'></div>`;
    $('#addField').onclick = () => { u.customFields.push({ key: $('#cKey').value, type: $('#cType').value }); save(); renderEditor(); };
    const list = $('#customList');
    list.innerHTML = u.customFields.map(f => `<div class='card'>${f.key} <span class='small'>(${f.type})</span></div>`).join('');
  }
}

function includesFilter(obj) {
  if (!state.filter) return true;
  return JSON.stringify(obj).toLowerCase().includes(state.filter);
}

function renderPreview() {
  const u = activeUniverse();
  const title = `<h3 class='title'>Aperçu Live – ${u.name}</h3>`;
  let html = title;
  if (state.activeView === 'entities') {
    html += u.entities.filter(includesFilter).map(e => `<div class='card'><h4>${e.name} <span class='small'>(${e.rank})</span></h4><div class='meta'>${e.role} • ${e.age} ans</div><div>${e.tags.map(t=>`<span class='tag'>${t}</span>`).join('')}</div><div class='stats'><div>FOR ${e.stats.force}</div><div>VIT ${e.stats.vitesse}</div><div>INT ${e.stats.intelligence}</div></div></div>`).join('');
  } else if (state.activeView === 'factions') {
    html += u.factions.filter(includesFilter).map(f => `<div class='card'><h4>${f.name}</h4><div>${f.alignment}</div><div class='progress'><span style='width:${f.influence}%'></span></div></div>`).join('');
  } else if (state.activeView === 'places') {
    html += u.places.filter(includesFilter).map(p => `<div class='card'><h4>${p.name}</h4><div>${p.type} • ${p.climate}</div><div>Niveau de danger: ${p.danger}</div><div class='progress'><span style='width:${p.danger}%'></span></div></div>`).join('');
  } else if (state.activeView === 'grimoire') {
    html += u.grimoire.filter(includesFilter).map(g => `<div class='card'><h4>${g.name}</h4><div>${g.type}</div><div>Maîtrise: ${'★'.repeat(g.mastery)}</div><div class='small'>Condition: ${g.condition}</div></div>`).join('');
  } else if (state.activeView === 'timeline') {
    html += u.timeline.filter(includesFilter).map(t => `<div class='card'><h4>${t.year} — ${t.title}</h4><div>${t.arc}</div></div>`).join('');
  } else if (state.activeView === 'analytics') {
    const avg = u.entities.length ? Math.round(u.entities.reduce((a,e)=>a+e.stats.force+e.stats.vitesse+e.stats.intelligence,0)/(u.entities.length*3)) : 0;
    html += `<div class='card'><h4>Puissance moyenne</h4><div class='progress'><span style='width:${avg}%'></span></div><p>${avg}/100</p></div>`;
    html += `<div class='card'><h4>Équilibre des factions</h4>${u.factions.map(f=>`<div>${f.name}: ${f.influence}</div>`).join('') || '<p>Aucune faction</p>'}</div>`;
  } else if (state.activeView === 'codex') {
    html += `<div class='card'><h4>Mode exploration</h4><p>Naviguez: Personnage → Relations → Lieux → Factions.</p><p>Simulation de graphe dynamique (mindmap) activable dans une future version canvas.</p></div>`;
  } else if (state.activeView === 'rpg') {
    html += `<div class='card'><h4>Campagne active</h4><p>Chapitre 1: Fracture du Nexus</p></div>`;
  }
  previewPanel.innerHTML = html;
}

function render() {
  renderUniverseSelector();
  renderModules();
  renderEditor();
  renderPreview();
}

load();
bindTopControls();
viewButtons();
render();
setInterval(save, 5000);
