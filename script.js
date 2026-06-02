const body = document.body;
const pageTitle = document.getElementById('page-title');
const pages = document.querySelectorAll('.page-content');
const menuItems = document.querySelectorAll('.menu-item');
const patientsTbody = document.getElementById('patients-tbody');
const rapportsTbody = document.getElementById('rapports-tbody');
let patientRows = Array.from(patientsTbody.querySelectorAll('tr'));
let sortAsc = true;

function openMDT() {
    body.style.display = 'flex';
    requestAnimationFrame(() => {
        body.classList.add('visible');
    });
}

function closeMDT() {
    body.classList.remove('visible');
    setTimeout(() => {
        body.style.display = 'none';
        if (window.GetParentResourceName) {
            fetch(`https://${GetParentResourceName()}/closeMdt`, { method: 'POST' });
        }
    }, 100);
}

function openModal(id) {
    const modal = document.getElementById(id);
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('active'));
}

function closeModal(id) {
    const modal = document.getElementById(id);
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 120);
}

function submitPatientForm() {
    const nom = document.getElementById('p-form-nom').value;
    const prenom = document.getElementById('p-form-prenom').value;
    const age = document.getElementById('p-form-age').value;
    const sang = document.getElementById('p-form-sang').value;
    const soin = document.getElementById('p-form-soin').value || 'Aucun soin';
    const statut = document.getElementById('p-form-statut').value;

    if (!nom || !prenom || !age) return;

    if (window.GetParentResourceName) {
        fetch(`https://${GetParentResourceName()}/addPatient`, {
            method: 'POST',
            body: JSON.stringify({ nom, prenom, age, sang, soin, statut })
        });
    } else {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td class="p-name">${prenom} ${nom}</td><td>${age} ans</td><td>${sang}</td><td>${soin}</td><td><span class="badge ${statut === 'Sorti' ? 'success' : 'warning'}">${statut}</span></td><td><button class="btn btn-small">Voir</button></td>`;
        patientsTbody.appendChild(tr);
        patientRows = Array.from(patientsTbody.querySelectorAll('tr'));
    }
    document.getElementById('form-new-patient').reset();
    closeModal('modal-patient');
}

function submitRapportForm() {
    const patient = document.getElementById('r-form-patient').value;
    const type = document.getElementById('r-form-type').value;
    const soignant = document.getElementById('r-form-soignant').value;
    const details = document.getElementById('r-form-details').value;

    if (!patient || !type || !soignant) return;

    if (window.GetParentResourceName) {
        fetch(`https://${GetParentResourceName()}/addRapport`, {
            method: 'POST',
            body: JSON.stringify({ patient, type, soignant, details })
        });
    } else {
        const tr = document.createElement('tr');
        const num = 'R-2026-0' + (rapportsTbody.children.length + 3);
        tr.innerHTML = `<td>${num}</td><td>02/06/2026</td><td>${soignant}</td><td class="r-pname">${patient}</td><td>${type}</td><td><button class="btn btn-small">Ouvrir</button></td>`;
        rapportsTbody.appendChild(tr);
    }
    document.getElementById('form-new-rapport').reset();
    closeModal('modal-rapport');
}

document.querySelector('.menu-nav').addEventListener('click', (e) => {
    const btn = e.target.closest('.menu-item');
    if (!btn || btn.classList.contains('active')) return;

    menuItems.forEach(i => i.classList.remove('active'));
    pages.forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    const targetPage = document.getElementById(btn.dataset.page);
    targetPage.classList.add('active');
    pageTitle.innerText = btn.dataset.title;
});

document.getElementById('mini-map-trigger').addEventListener('click', () => {
    menuItems[1].click();
});

document.getElementById('patient-search').addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    for (let i = 0; i < patientRows.length; i++) {
        const name = patientRows[i].querySelector('.p-name').textContent.toLowerCase();
        patientRows[i].style.display = name.includes(val) ? '' : 'none';
    }
});

document.getElementById('btn-sort-patient').addEventListener('click', () => {
    patientRows.sort((a, b) => {
        const nameA = a.querySelector('.p-name').textContent;
        const nameB = b.querySelector('.p-name').textContent;
        return sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
    sortAsc = !sortAsc;

    const fragment = document.createDocumentFragment();
    patientRows.forEach(row => fragment.appendChild(row));
    patientsTbody.appendChild(fragment);
});

document.getElementById('set-matricule').addEventListener('input', (e) => {
    document.getElementById('header-matricule').innerText = e.target.value || 'EMS-XX';
});

const sidebarStatus = document.getElementById('sidebar-status-text');
document.getElementById('set-status').addEventListener('change', (e) => {
    const val = e.target.value;
    sidebarStatus.innerText = val;

    sidebarStatus.style.color = val === 'Disponible' ? '#17b978' : (val === 'En Intervention' ? '#ff4d5a' : '#ff9f43');
    sidebarStatus.style.borderColor = val === 'Disponible' ? 'rgba(23, 185, 120, 0.15)' : (val === 'En Intervention' ? 'rgba(218, 34, 42, 0.15)' : 'rgba(255, 159, 67, 0.15)');
    sidebarStatus.style.background = val === 'Disponible' ? 'rgba(23, 185, 120, 0.06)' : (val === 'En Intervention' ? 'rgba(218, 34, 42, 0.06)' : 'rgba(255, 159, 67, 0.06)');
});

document.querySelector('.color-picker-wrapper').addEventListener('click', (e) => {
    const dot = e.target.closest('.color-dot');
    if (!dot) return;
    document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
    dot.classList.add('active');
    document.documentElement.style.setProperty('--primary-color', dot.dataset.color);
});

window.addEventListener('message', (e) => {
    const d = e.data;
    if (d.action === 'open') {
        openMDT();
    } else if (d.action === 'close') {
        closeMDT();
    }
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal-overlay.active');
        if (activeModal) {
            closeModal(activeModal.id);
        } else {
            closeMDT();
        }
    }
});

if (!window.GetParentResourceName) {
    openMDT();
}