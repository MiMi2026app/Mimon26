// Stan aplikacji
let companies = JSON.parse(localStorage.getItem('companies')) || [];
let currentCompany = localStorage.getItem('currentCompany') || '';
let currentProperty = localStorage.getItem('currentProperty') || '';
let activeTab = localStorage.getItem('activeTab') || 'properties';

let properties = JSON.parse(localStorage.getItem('properties')) || [];
let contractors = JSON.parse(localStorage.getItem('contractors')) || [];
let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
let inspections = JSON.parse(localStorage.getItem('inspections')) || [];

let editingContractorIndex = null;

// Elementy DOM
const companyFormMain = document.getElementById('company-form-main');
const companyFormModal = document.getElementById('company-form-modal');
const currentCompanySelect = document.getElementById('current-company');
const companySelectionBar = document.getElementById('company-selection-bar');
const companySelectionCard = document.getElementById('company-selection-card');
const navigationBar = document.getElementById('navigation-bar');
const changeCompanyBtn = document.getElementById('change-company-btn');

const propertiesView = document.getElementById('properties-view');
const contractorsView = document.getElementById('contractors-view');
const reportsView = document.getElementById('reports-view');
const importExportView = document.getElementById('import-export-view');
const propertyView = document.getElementById('property-view');
const noCompanyWarning = document.getElementById('no-company-warning');

const propertyGrid = document.getElementById('property-grid');
const contractorList = document.getElementById('contractor-list');
const currentPropTitle = document.getElementById('current-prop-title');
const propertySummaryView = document.getElementById('property-summary-view');
const propertyAttachmentsView = document.getElementById('property-attachments-view');

const propertyForm = document.getElementById('property-form');
const contractorForm = document.getElementById('contractor-form');
const contractorEditForm = document.getElementById('contractor-edit-form');
const propertyDetailsForm = document.getElementById('property-details-form');
const invoiceForm = document.getElementById('invoice-form');
const inspectionForm = document.getElementById('inspection-form');

const invoiceList = document.getElementById('invoice-list');
const companyInvoiceList = document.getElementById('company-invoice-list');
const inspectionList = document.getElementById('inspection-list');
const invContractorSelect = document.getElementById('inv-contractor');

// Elementy Filtru Eksportu
const expProperty = document.getElementById('exp-property');
const expContractor = document.getElementById('exp-contractor');
const expYear = document.getElementById('exp-year');
const expMedia = document.getElementById('exp-media');

// Elementy Wyszukiwania
const searchPropName = document.getElementById('search-prop-name');
const searchPropCity = document.getElementById('search-prop-city');
const searchCtrName = document.getElementById('search-ctr-name');
const searchCtrNip = document.getElementById('search-ctr-nip');

// Obsługa stanów czyszczenia pól wyszukiwania oraz podświetlania kontenerów
const searchInputs = [searchPropName, searchPropCity, searchCtrName, searchCtrNip];

searchInputs.forEach(input => {
  if (!input) return;
  
  const updateWrapperState = () => {
    const wrapper = input.closest('.oneui-search-box');
    if (wrapper) {
      if (input.value.trim().length > 0) {
        wrapper.classList.add('has-value');
      } else {
        wrapper.classList.remove('has-value');
      }
    }
  };

  input.addEventListener('input', () => {
    updateWrapperState();
    renderUI();
  });

  // Stan początkowy
  updateWrapperState();
});

function clearSearchInput(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.value = '';
    const wrapper = input.closest('.oneui-search-box');
    if (wrapper) wrapper.classList.remove('has-value');
    renderUI();
    input.focus();
  }
}

// Zarządzanie widokami i przełączaniem zakładek
function switchTab(tabName) {
  activeTab = tabName;
  currentProperty = '';
  saveData();
}

function openPropertyCard(propName) {
  currentProperty = propName;
  saveData();
}

function closePropertyCard() {
  currentProperty = '';
  saveData();
}

function changeCompany() {
  currentCompany = '';
  currentProperty = '';
  saveData();
}

function openModal(id) { 
  if (id === 'modal-invoice') {
    document.getElementById('inv-year').value = new Date().getFullYear();
    document.getElementById('inv-date-issue').valueAsDate = new Date();
  }
  if (id === 'modal-edit-details') {
    populatePropertyEditForm();
  }
  document.getElementById(id).style.display = 'block'; 
}

function closeModal(id) { 
  document.getElementById(id).style.display = 'none'; 
}

window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.style.display = 'none';
  }
};

function saveData() {
  localStorage.setItem('companies', JSON.stringify(companies));
  localStorage.setItem('currentCompany', currentCompany);
  localStorage.setItem('currentProperty', currentProperty);
  localStorage.setItem('activeTab', activeTab);
  localStorage.setItem('properties', JSON.stringify(properties));
  localStorage.setItem('contractors', JSON.stringify(contractors));
  localStorage.setItem('invoices', JSON.stringify(invoices));
  localStorage.setItem('inspections', JSON.stringify(inspections));
  renderUI();
}

// Obsługa Formularzy Firmy
if (companyFormMain) {
  companyFormMain.addEventListener('submit', (e) => {
    e.preventDefault();
    const companyName = document.getElementById('company-name-main').value.trim();
    if (companyName && !companies.includes(companyName)) {
      companies.push(companyName);
      currentCompany = companyName;
      currentProperty = '';
      document.getElementById('company-name-main').value = '';
      saveData();
    }
  });
}

if (companyFormModal) {
  companyFormModal.addEventListener('submit', (e) => {
    e.preventDefault();
    const companyName = document.getElementById('company-name-modal').value.trim();
    if (companyName && !companies.includes(companyName)) {
      companies.push(companyName);
      currentCompany = companyName;
      currentProperty = '';
      document.getElementById('company-name-modal').value = '';
      closeModal('modal-company');
      saveData();
    }
  });
}

currentCompanySelect.addEventListener('change', (e) => {
  currentCompany = e.target.value;
  currentProperty = '';
  saveData();
});

propertyForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const propName = document.getElementById('prop-name').value.trim();
  if (propName && currentCompany) {
    properties.push({ 
      name: propName, 
      company: currentCompany,
      city: '', zip: '', address: '', type: '', condition: 'Dobry',
      buildingArea: '', landArea: '', plotNum: '', kw: '', kob: '',
      contactPerson: '', contactPhone: '', contactEmail: '', notes: '', attachments: []
    });
    document.getElementById('prop-name').value = '';
    closeModal('modal-property');
    saveData();
  }
});

contractorForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('ctr-name').value.trim();
  if (name && currentCompany) {
    contractors.push({
      company: currentCompany,
      name,
      nip: document.getElementById('ctr-nip').value,
      address: document.getElementById('ctr-address').value,
      contact: document.getElementById('ctr-contact').value,
      contractNum: document.getElementById('ctr-contract-num').value,
      contractDate: document.getElementById('ctr-contract-date').value,
      notes: document.getElementById('ctr-notes').value
    });
    contractorForm.reset();
    closeModal('modal-contractor');
    saveData();
  }
});

function openEditContractorModal(index) {
  const compCtrs = contractors.filter(c => c.company === currentCompany);
  const target = compCtrs[index];
  if (!target) return;

  editingContractorIndex = contractors.findIndex(c => c === target);

  document.getElementById('edit-ctr-name').value = target.name || '';
  document.getElementById('edit-ctr-nip').value = target.nip || '';
  document.getElementById('edit-ctr-contract-num').value = target.contractNum || '';
  document.getElementById('edit-ctr-address').value = target.address || '';
  document.getElementById('edit-ctr-contact').value = target.contact || '';
  document.getElementById('edit-ctr-contract-date').value = target.contractDate || '';
  document.getElementById('edit-ctr-notes').value = target.notes || '';

  openModal('modal-edit-contractor');
}

contractorEditForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (editingContractorIndex !== null && contractors[editingContractorIndex]) {
    contractors[editingContractorIndex].name = document.getElementById('edit-ctr-name').value.trim();
    contractors[editingContractorIndex].nip = document.getElementById('edit-ctr-nip').value;
    contractors[editingContractorIndex].contractNum = document.getElementById('edit-ctr-contract-num').value;
    contractors[editingContractorIndex].address = document.getElementById('edit-ctr-address').value;
    contractors[editingContractorIndex].contact = document.getElementById('edit-ctr-contact').value;
    contractors[editingContractorIndex].contractDate = document.getElementById('edit-ctr-contract-date').value;
    contractors[editingContractorIndex].notes = document.getElementById('edit-ctr-notes').value;

    closeModal('modal-edit-contractor');
    editingContractorIndex = null;
    saveData();
  }
});

propertyDetailsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const propIndex = properties.findIndex(p => p.company === currentCompany && p.name === currentProperty);
  if (propIndex !== -1) {
    properties[propIndex].city = document.getElementById('detail-city').value;
    properties[propIndex].zip = document.getElementById('detail-zip').value;
    properties[propIndex].address = document.getElementById('detail-address').value;
    properties[propIndex].type = document.getElementById('detail-type').value;
    properties[propIndex].condition = document.getElementById('detail-condition').value;
    properties[propIndex].buildingArea = document.getElementById('detail-building-area').value;
    properties[propIndex].landArea = document.getElementById('detail-land-area').value;
    properties[propIndex].plotNum = document.getElementById('detail-plot-num').value;
    properties[propIndex].kw = document.getElementById('detail-kw').value;
    properties[propIndex].kob = document.getElementById('detail-kob').value;
    properties[propIndex].contactPerson = document.getElementById('detail-contact-person').value;
    properties[propIndex].contactPhone = document.getElementById('detail-contact-phone').value;
    properties[propIndex].contactEmail = document.getElementById('detail-contact-email').value;
    properties[propIndex].notes = document.getElementById('detail-notes').value;

    const fileInput = document.getElementById('detail-files');
    if (fileInput.files.length > 0) {
      if (!properties[propIndex].attachments) properties[propIndex].attachments = [];
      
      Array.from(fileInput.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(evt) {
          properties[propIndex].attachments.push({
            name: file.name,
            type: file.type,
            data: evt.target.result
          });
          saveData();
        };
        reader.readAsDataURL(file);
      });
    }

    closeModal('modal-edit-details');
    saveData();
  }
});

invoiceForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const brutto = parseFloat(document.getElementById('inv-brutto').value);
  const netto = parseFloat(document.getElementById('inv-netto').value);

  if (currentProperty && !isNaN(brutto) && currentCompany) {
    invoices.push({
      company: currentCompany,
      property: currentProperty,
      contractor: document.getElementById('inv-contractor').value,
      docNum: document.getElementById('inv-doc-num').value,
      dateIssue: document.getElementById('inv-date-issue').value,
      year: document.getElementById('inv-year').value,
      netto: netto,
      brutto: brutto,
      mediaType: document.getElementById('inv-media-type').value,
      mediaQty: document.getElementById('inv-media-qty').value,
      description: document.getElementById('inv-description').value,
      descDate: document.getElementById('inv-desc-date').value,
      costSplit: document.getElementById('inv-cost-split').value,
      ksef: document.getElementById('inv-ksef').value,
      notes: document.getElementById('inv-notes').value,
      dateAdded: new Date().toLocaleDateString('pl-PL')
    });
    invoiceForm.reset();
    closeModal('modal-invoice');
    saveData();
  }
});

inspectionForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const type = document.getElementById('insp-type').value;
  const dueDate = document.getElementById('insp-date').value;
  const note = document.getElementById('insp-note').value;

  if (currentProperty && dueDate && currentCompany) {
    inspections.push({ 
      company: currentCompany, 
      property: currentProperty, 
      type, 
      dueDate,
      note 
    });
    document.getElementById('insp-date').value = '';
    document.getElementById('insp-note').value = '';
    closeModal('modal-inspection');
    saveData();
  }
});

function deleteContractor(index) {
  const compCtrs = contractors.filter(c => c.company === currentCompany);
  const target = compCtrs[index];
  if (confirm(`Czy na pewno chcesz usunąć kontrahenta: ${target.name}?`)) {
    contractors = contractors.filter(c => c !== target);
    saveData();
  }
}

function deleteInvoice(index) {
  const propInvs = invoices.filter(i => i.company === currentCompany && i.property === currentProperty);
  const target = propInvs[index];
  if (confirm(`Usunąć dokument ${target.docNum}?`)) {
    invoices = invoices.filter(i => i !== target);
    saveData();
  }
}

function deleteCompanyInvoice(index) {
  const compInvs = invoices.filter(i => i.company === currentCompany);
  const target = compInvs[index];
  if (confirm(`Usunąć dokument ${target.docNum}?`)) {
    invoices = invoices.filter(i => i !== target);
    saveData();
  }
}

function deleteInspection(index) {
  const propInsps = inspections.filter(i => i.company === currentCompany && i.property === currentProperty);
  const target = propInsps[index];
  if (confirm(`Usunąć przegląd ${target.type}?`)) {
    inspections = inspections.filter(i => i !== target);
    saveData();
  }
}

function deleteAttachment(attIndex) {
  const propIndex = properties.findIndex(p => p.company === currentCompany && p.name === currentProperty);
  if (propIndex !== -1 && properties[propIndex].attachments) {
    if (confirm('Czy na pewno chcesz usunąć ten załącznik?')) {
      properties[propIndex].attachments.splice(attIndex, 1);
      saveData();
    }
  }
}

function populatePropertyEditForm() {
  const prop = properties.find(p => p.company === currentCompany && p.name === currentProperty);
  if (!prop) return;

  document.getElementById('detail-city').value = prop.city || '';
  document.getElementById('detail-zip').value = prop.zip || '';
  document.getElementById('detail-address').value = prop.address || '';
  document.getElementById('detail-type').value = prop.type || '';
  document.getElementById('detail-condition').value = prop.condition || 'Dobry';
  document.getElementById('detail-building-area').value = prop.buildingArea || '';
  document.getElementById('detail-land-area').value = prop.landArea || '';
  document.getElementById('detail-plot-num').value = prop.plotNum || '';
  document.getElementById('detail-kw').value = prop.kw || '';
  document.getElementById('detail-kob').value = prop.kob || '';
  document.getElementById('detail-contact-person').value = prop.contactPerson || '';
  document.getElementById('detail-contact-phone').value = prop.contactPhone || '';
  document.getElementById('detail-contact-email').value = prop.contactEmail || '';
  document.getElementById('detail-notes').value = prop.notes || '';
  document.getElementById('detail-files').value = '';
}

function getStatus(dueDateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: `Po terminie (${Math.abs(diffDays)} dni)`, class: 'status-expired' };
  if (diffDays <= 30) return { label: `Ważny jeszcze ${diffDays} dni`, class: 'status-warning' };
  return { label: `Ważny (${dueDateStr})`, class: 'status-ok' };
}

function generateGoogleCalendarLink(insp) {
  const title = encodeURIComponent(`Przegląd: ${insp.type} (${currentProperty})`);
  const details = encodeURIComponent(`Obiekt: ${currentProperty}\nPodmiot: ${currentCompany}\nNotatka: ${insp.note || 'Brak dodatkowych notatek'}`);
  const dateFormatted = insp.dueDate.replace(/-/g, '');
  const nextDay = new Date(insp.dueDate);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextDayFormatted = nextDay.toISOString().split('T')[0].replace(/-/g, '');
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateFormatted}/${nextDayFormatted}&details=${details}`;
}

function generateExcelFile(dataArray, fileName) {
  const worksheet = XLSX.utils.json_to_sheet(dataArray);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Raport Kosztów");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

function exportFilteredInvoicesToExcel() {
  const selectedProp = expProperty.value;
  const selectedCtr = expContractor.value;
  const selectedYear = expYear.value;
  const selectedMedia = expMedia.value;

  let filtered = invoices.filter(i => i.company === currentCompany);

  if (selectedProp) filtered = filtered.filter(i => i.property === selectedProp);
  if (selectedCtr) filtered = filtered.filter(i => i.contractor === selectedCtr);
  if (selectedYear) filtered = filtered.filter(i => i.year == selectedYear);
  if (selectedMedia) filtered = filtered.filter(i => i.mediaType === selectedMedia);

  if (filtered.length === 0) {
    alert('Brak danych do wyeksportowania dla wybranych filtrów!');
    return;
  }

  const excelData = filtered.map(item => ({
    'Obiekt / Budynek': item.property,
    'Rok': item.year,
    'Kontrahent': item.contractor || '-',
    'Nr Dokumentu': item.docNum,
    'Data Wystawienia': item.dateIssue,
    'Kategoria / Media': item.mediaType,
    'Ilość': item.mediaQty || '-',
    'Wartość Netto (zł)': item.netto,
    'Wartość Brutto (zł)': item.brutto,
    'Klucz Narzutowy / Podział': item.costSplit || '-',
    'Opis Pozycji': item.description || '-',
    'Data Opisu': item.descDate || '-',
    'Numer KSeF': item.ksef || '-',
    'Uwagi': item.notes || '-'
  }));

  generateExcelFile(excelData, `Raport_Kosztow_${currentCompany.replace(/\s+/g, '_')}`);
}

function exportCurrentPropertyToExcel() {
  const filtered = invoices.filter(i => i.company === currentCompany && i.property === currentProperty);

  if (filtered.length === 0) {
    alert('Brak zarejestrowanych kosztów dla tego obiektu!');
    return;
  }

  const excelData = filtered.map(item => ({
    'Rok': item.year,
    'Kontrahent': item.contractor || '-',
    'Nr Dokumentu': item.docNum,
    'Data Wystawienia': item.dateIssue,
    'Kategoria / Media': item.mediaType,
    'Ilość': item.mediaQty || '-',
    'Wartość Netto (zł)': item.netto,
    'Wartość Brutto (zł)': item.brutto,
    'Klucz Narzutowy': item.costSplit || '-',
    'Opis Pozycji': item.description || '-',
    'Numer KSeF': item.ksef || '-'
  }));

  generateExcelFile(excelData, `Koszty_${currentProperty.replace(/\s+/g, '_')}`);
}

function importExcelData() {
  const fileInput = document.getElementById('excel-file-input');
  const file = fileInput.files[0];

  if (!file) {
    alert('Najpierw wybierz plik Excel (.xlsx / .xls)!');
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (jsonRows.length === 0) {
        alert('Wybrany arkusz jest pusty!');
        return;
      }

      processImportedRows(jsonRows);

      fileInput.value = '';
      alert('Import zakończony sukcesem! Baza danych została zaktualizowana.');
      saveData();

    } catch (error) {
      console.error(error);
      alert('Wystąpił błąd podczas odczytu pliku Excel. Upewnij się, że plik nie jest uszkodzony.');
    }
  };

  reader.readAsArrayBuffer(file);
}

function processImportedRows(rows) {
  rows.forEach(row => {
    const companyName = (row['Firma'] || row['Podmiot'] || currentCompany || '').toString().trim();
    if (companyName && !companies.includes(companyName)) {
      companies.push(companyName);
    }

    const propertyName = (row['Obiekt / Budynek'] || row['Obiekt'] || row['Budynek'] || '').toString().trim();
    if (propertyName && companyName) {
      const existsProp = properties.some(p => p.company === companyName && p.name === propertyName);
      if (!existsProp) {
        properties.push({
          company: companyName,
          name: propertyName,
          city: row['Miejscowość'] || '',
          zip: row['Kod pocztowy'] || '',
          address: row['Adres'] || '',
          type: row['Typ'] || '',
          condition: row['Stan'] || 'Dobry',
          buildingArea: row['Pow. Budynku'] || '',
          landArea: row['Pow. Działki'] || '',
          plotNum: row['Nr Działki'] || '',
          kw: row['KW'] || '',
          kob: row['KOB'] || '',
          contactPerson: row['Kontakt Osoba'] || '',
          contactPhone: row['Kontakt Telefon'] || '',
          contactEmail: row['Kontakt Email'] || '',
          notes: row['Uwagi Obiekt'] || '',
          attachments: []
        });
      }
    }

    const contractorName = (row['Kontrahent'] || row['Dostawca'] || '').toString().trim();
    if (contractorName && companyName) {
      const existsCtr = contractors.some(c => c.company === companyName && c.name === contractorName);
      if (!existsCtr) {
        contractors.push({
          company: companyName,
          name: contractorName,
          nip: row['NIP'] || '',
          address: row['Adres Kontrahenta'] || '',
          contact: row['Kontakt'] || '',
          contractNum: row['Nr Umowy'] || '',
          contractDate: row['Data Umowy'] || '',
          notes: row['Uwagi Kontrahent'] || ''
        });
      }
    }

    const docNum = (row['Nr Dokumentu'] || row['Nr Faktury'] || '').toString().trim();
    const bruttoVal = parseFloat(row['Wartość Brutto (zł)'] || row['Brutto'] || row['Kwota Brutto']);

    if (docNum && !isNaN(bruttoVal) && companyName && propertyName) {
      const existsInvoice = invoices.some(i => i.company === companyName && i.docNum === docNum);
      if (!existsInvoice) {
        const nettoVal = parseFloat(row['Wartość Netto (zł)'] || row['Netto']) || (bruttoVal / 1.23);
        invoices.push({
          company: companyName,
          property: propertyName,
          contractor: contractorName,
          docNum: docNum,
          dateIssue: row['Data Wystawienia'] || new Date().toISOString().split('T')[0],
          year: row['Rok'] || new Date().getFullYear(),
          netto: parseFloat(nettoVal.toFixed(2)),
          brutto: parseFloat(bruttoVal.toFixed(2)),
          mediaType: row['Kategoria / Media'] || row['Kategoria'] || 'Inne',
          mediaQty: row['Ilość'] || '',
          costSplit: row['Klucz Narzutowy / Podział'] || row['Podział'] || '',
          description: row['Opis Pozycji'] || row['Opis'] || '',
          descDate: row['Data Opisu'] || '',
          ksef: row['Numer KSeF'] || row['KSeF'] || '',
          notes: row['Uwagi'] || '',
          dateAdded: new Date().toLocaleDateString('pl-PL')
        });
      }
    }
  });
}

function updateDataLists() {
  const compProps = properties.filter(p => p.company === currentCompany);
  const compCtrs = contractors.filter(c => c.company === currentCompany);

  const dlPropNames = document.getElementById('dl-prop-names');
  const dlPropCities = document.getElementById('dl-prop-cities');
  if (dlPropNames) {
    const names = [...new Set(compProps.map(p => p.name))];
    dlPropNames.innerHTML = names.map(n => `<option value="${n}">`).join('');
  }
  if (dlPropCities) {
    const cities = [...new Set(compProps.map(p => p.city).filter(Boolean))];
    dlPropCities.innerHTML = cities.map(c => `<option value="${c}">`).join('');
  }

  const dlCtrNames = document.getElementById('dl-ctr-names');
  const dlCtrNips = document.getElementById('dl-ctr-nips');
  if (dlCtrNames) {
    const names = [...new Set(compCtrs.map(c => c.name))];
    dlCtrNames.innerHTML = names.map(n => `<option value="${n}">`).join('');
  }
  if (dlCtrNips) {
    const nips = [...new Set(compCtrs.map(c => c.nip).filter(Boolean))];
    dlCtrNips.innerHTML = nips.map(n => `<option value="${n}">`).join('');
  }
}

function renderUI() {
  currentCompanySelect.innerHTML = '<option value="">-- Wybierz Firmę --</option>';
  companies.forEach(comp => {
    const opt = document.createElement('option');
    opt.value = comp;
    opt.textContent = comp;
    if (comp === currentCompany) opt.selected = true;
    currentCompanySelect.appendChild(opt);
  });

  companySelectionBar.style.display = 'block';

  if (!currentCompany) {
    companySelectionCard.style.display = 'block';
    navigationBar.style.display = 'none';
    changeCompanyBtn.style.display = 'none';
    propertiesView.style.display = 'none';
    contractorsView.style.display = 'none';
    reportsView.style.display = 'none';
    importExportView.style.display = 'none';
    propertyView.style.display = 'none';
    noCompanyWarning.style.display = 'block';
    return;
  }

  companySelectionCard.style.display = 'none';
  noCompanyWarning.style.display = 'none';
  navigationBar.style.display = 'block';
  changeCompanyBtn.style.display = 'inline-flex';

  document.getElementById('tab-btn-properties').classList.toggle('active', activeTab === 'properties' && !currentProperty);
  document.getElementById('tab-btn-contractors').classList.toggle('active', activeTab === 'contractors' && !currentProperty);
  document.getElementById('tab-btn-reports').classList.toggle('active', activeTab === 'reports' && !currentProperty);
  document.getElementById('tab-btn-import-export').classList.toggle('active', activeTab === 'import-export' && !currentProperty);

  if (activeTab === 'import-export' && !currentProperty) {
    propertiesView.style.display = 'none';
    contractorsView.style.display = 'none';
    reportsView.style.display = 'none';
    propertyView.style.display = 'none';
    importExportView.style.display = 'block';
    return;
  }

  importExportView.style.display = 'none';

  if (activeTab === 'reports' && !currentProperty) {
    propertiesView.style.display = 'none';
    contractorsView.style.display = 'none';
    propertyView.style.display = 'none';
    reportsView.style.display = 'block';

    expProperty.innerHTML = '<option value="">-- Wszystkie obiekty --</option>';
    properties.filter(p => p.company === currentCompany).forEach(p => {
      expProperty.innerHTML += `<option value="${p.name}">${p.name}</option>`;
    });

    expContractor.innerHTML = '<option value="">-- Wszyscy kontrahenci --</option>';
    contractors.filter(c => c.company === currentCompany).forEach(c => {
      expContractor.innerHTML += `<option value="${c.name}">${c.name}</option>`;
    });

    const compInvs = invoices.filter(i => i.company === currentCompany);
    const uniqueYears = [...new Set(compInvs.map(i => i.year).filter(Boolean))].sort().reverse();
    
    expYear.innerHTML = '<option value="">-- Wszystkie lata --</option>';
    uniqueYears.forEach(y => {
      expYear.innerHTML += `<option value="${y}">${y}</option>`;
    });

    const uniqueMedia = [...new Set(compInvs.map(i => i.mediaType).filter(Boolean))].sort();
    
    expMedia.innerHTML = '<option value="">-- Wszystkie kategorie --</option>';
    uniqueMedia.forEach(m => {
      expMedia.innerHTML += `<option value="${m}">${m}</option>`;
    });

    companyInvoiceList.innerHTML = '';
    if (compInvs.length === 0) {
      companyInvoiceList.innerHTML = '<li style="color: var(--oneui-text-sub);">Brak zarejestrowanych kosztów w podmiocie.</li>';
    } else {
      compInvs.forEach((inv, idx) => {
        const li = document.createElement('li');
        li.style.flexDirection = 'column';
        li.style.alignItems = 'flex-start';
        li.innerHTML = `
          <div style="display: flex; justify-content: space-between; width: 100%;">
            <strong style="font-size: 15px;">🏢 ${inv.property} | ${inv.docNum} | ${inv.contractor || 'Brak kontrahenta'} (${inv.year})</strong>
            <span style="font-weight: 700; color: #10b981; font-size: 16px;">${inv.brutto.toFixed(2)} zł brutto</span>
          </div>
          <div style="font-size: 13px; color: var(--oneui-text-sub); margin-top: 6px; width: 100%; display: flex; justify-content: space-between; align-items: center;">
            <span>Kategoria: <strong>${inv.mediaType}</strong> ${inv.mediaQty ? `(${inv.mediaQty})` : ''} | Podział: ${inv.costSplit || 'Brak'}</span>
            <button class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;" onclick="deleteCompanyInvoice(${idx})">Usuń</button>
          </div>
        `;
        companyInvoiceList.appendChild(li);
      });
    }

    return;
  }

  reportsView.style.display = 'none';

  if (currentProperty) {
    propertiesView.style.display = 'none';
    contractorsView.style.display = 'none';
    propertyView.style.display = 'block';
    currentPropTitle.textContent = currentProperty;

    const prop = properties.find(p => p.company === currentCompany && p.name === currentProperty) || {};
    
    propertySummaryView.innerHTML = `
      <div class="summary-item"><label>Lokalizacja</label><div>${prop.zip || ''} ${prop.city || ''}, ${prop.address || 'Nie skonfigurowano'}</div></div>
      <div class="summary-item"><label>Typ / Stan Techniczny</label><div>${prop.type || '-'} (${prop.condition || 'Brak danych'})</div></div>
      <div class="summary-item"><label>Pow. Budynku / Działki</label><div>${prop.buildingArea ? prop.buildingArea + ' m²' : '-'} / ${prop.landArea ? prop.landArea + ' m²' : '-'}</div></div>
      <div class="summary-item"><label>Działka / KW</label><div>${prop.plotNum || '-'} / ${prop.kw || '-'}</div></div>
      <div class="summary-item"><label>Książka KOB</label><div>${prop.kob || '-'}</div></div>
      <div class="summary-item"><label>Osoba Kontaktowa</label><div>${prop.contactPerson || '-'} (${prop.contactPhone || '-'})</div></div>
      ${prop.notes ? `<div class="summary-item" style="grid-column: 1 / -1;"><label>Uwagi</label><div>${prop.notes}</div></div>` : ''}
    `;

    // Renderowanie załączników
    propertyAttachmentsView.innerHTML = '';
    if (prop.attachments && prop.attachments.length > 0) {
      prop.attachments.forEach((att, attIdx) => {
        const badge = document.createElement('div');
        badge.className = 'attachment-chip';
        badge.innerHTML = `
          <span>📎 <a href="${att.data}" target="_blank" download="${att.name}" style="color: var(--oneui-primary); text-decoration: none; font-weight: 600;">${att.name}</a></span>
          <button class="btn btn-danger" style="padding: 2px 6px; font-size: 11px;" onclick="deleteAttachment(${attIdx})">✕</button>
        `;
        propertyAttachmentsView.appendChild(badge);
      });
    } else {
      propertyAttachmentsView.innerHTML = '<span style="color: var(--oneui-text-sub); font-size: 13px;">Brak załączników lub rzutów dla tego obiektu.</span>';
    }

    invContractorSelect.innerHTML = '<option value="">-- Wybierz Kontrahenta --</option>';
    contractors.filter(c => c.company === currentCompany).forEach(c => {
      invContractorSelect.innerHTML += `<option value="${c.name}">${c.name}</option>`;
    });

    inspectionList.innerHTML = '';
    const propInsps = inspections.filter(i => i.company === currentCompany && i.property === currentProperty);
    if (propInsps.length === 0) {
      inspectionList.innerHTML = '<li style="color: var(--oneui-text-sub);">Brak zaplanowanych przeglądów.</li>';
    } else {
      propInsps.forEach((insp, idx) => {
        const st = getStatus(insp.dueDate);
        const gcalUrl = generateGoogleCalendarLink(insp);
        const li = document.createElement('li');
        li.style.flexDirection = 'column';
        li.style.alignItems = 'stretch';
        li.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <div>
              <strong style="font-size: 15px;">${insp.type}</strong>
              <span class="badge ${st.class}" style="margin-left: 10px;">${st.label}</span>
            </div>
            <div style="display: flex; gap: 8px;">
              <a href="${gcalUrl}" target="_blank" class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px; text-decoration: none;">📅 Dodaj do Kalendarza</a>
              <button class="btn btn-danger" style="padding: 6px 12px; font-size: 13px;" onclick="deleteInspection(${idx})">Usuń</button>
            </div>
          </div>
          ${insp.note ? `<div style="margin-top: 8px; font-size: 13px; color: var(--oneui-text-sub); background: #ffffff; padding: 8px; border-radius: var(--oneui-radius-sm); border: 1px solid var(--oneui-border);"><strong>Notatka:</strong> ${insp.note}</div>` : ''}
        `;
        inspectionList.appendChild(li);
      });
    }

    invoiceList.innerHTML = '';
    const propInvs = invoices.filter(i => i.company === currentCompany && i.property === currentProperty);
    if (propInvs.length === 0) {
      invoiceList.innerHTML = '<li style="color: var(--oneui-text-sub);">Brak zarejestrowanych kosztów.</li>';
    } else {
      propInvs.forEach((inv, idx) => {
        const li = document.createElement('li');
        li.style.flexDirection = 'column';
        li.style.alignItems = 'flex-start';
        li.innerHTML = `
          <div style="display: flex; justify-content: space-between; width: 100%;">
            <strong style="font-size: 15px;">${inv.docNum} | ${inv.contractor || 'Brak kontrahenta'} (${inv.year})</strong>
            <span style="font-weight: 700; color: #10b981; font-size: 16px;">${inv.brutto.toFixed(2)} zł brutto</span>
          </div>
          <div style="font-size: 13px; color: var(--oneui-text-sub); margin-top: 6px; width: 100%; display: flex; justify-content: space-between; align-items: center;">
            <span>Kategoria: <strong>${inv.mediaType}</strong> ${inv.mediaQty ? `(${inv.mediaQty})` : ''} | Podział: ${inv.costSplit || 'Brak'}</span>
            <button class="btn btn-danger" style="padding: 4px 8px; font-size: 12px;" onclick="deleteInvoice(${idx})">Usuń</button>
          </div>
        `;
        invoiceList.appendChild(li);
      });
    }

  } else {
    propertyView.style.display = 'none';
    updateDataLists();

    const valPropName = searchPropName ? searchPropName.value.toLowerCase().trim() : '';
    const valPropCity = searchPropCity ? searchPropCity.value.toLowerCase().trim() : '';
    const valCtrName = searchCtrName ? searchCtrName.value.toLowerCase().trim() : '';
    const valCtrNip = searchCtrNip ? searchCtrNip.value.toLowerCase().trim() : '';

    if (activeTab === 'contractors') {
      propertiesView.style.display = 'none';
      contractorsView.style.display = 'block';

      contractorList.innerHTML = '';
      let compCtrs = contractors.filter(c => c.company === currentCompany);

      if (valCtrName) compCtrs = compCtrs.filter(c => c.name.toLowerCase().includes(valCtrName));
      if (valCtrNip) compCtrs = compCtrs.filter(c => (c.nip || '').toLowerCase().includes(valCtrNip));

      if (compCtrs.length === 0) {
        contractorList.innerHTML = '<li style="color: var(--oneui-text-sub);">Brak kontrahentów spełniających kryteria wyszukiwania.</li>';
      } else {
        compCtrs.forEach((ctr, idx) => {
          const li = document.createElement('li');
          li.style.flexDirection = 'column';
          li.style.alignItems = 'stretch';
          li.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
              <div>
                <strong style="font-size: 15px;">${ctr.name}</strong> ${ctr.nip ? `(NIP: ${ctr.nip})` : ''}
              </div>
            </div>
            
            <details style="margin-top: 10px; width: 100%; font-size: 13px; color: var(--oneui-text-sub);">
              <summary style="cursor: pointer; font-weight: 600; color: var(--oneui-primary);">Szczegóły kontrahenta</summary>
              <div style="margin-top: 8px; padding: 12px; background: #f8fafc; border-radius: var(--oneui-radius-sm); border: 1px solid var(--oneui-border);">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; margin-bottom: 12px;">
                  <div><strong>Adres:</strong> ${ctr.address || 'Brak'}</div>
                  <div><strong>Kontakt:</strong> ${ctr.contact || 'Brak'}</div>
                  <div><strong>Nr Umowy:</strong> ${ctr.contractNum || 'Brak'}</div>
                  <div><strong>Data Umowy:</strong> ${ctr.contractDate || 'Brak'}</div>
                  <div style="grid-column: 1 / -1;"><strong>Uwagi:</strong> ${ctr.notes || 'Brak'}</div>
                </div>
                <div style="display: flex; gap: 8px; justify-content: flex-end; border-top: 1px solid var(--oneui-border); padding-top: 10px;">
                  <button class="btn btn-secondary" style="padding: 6px 14px; font-size: 13px;" onclick="openEditContractorModal(${idx})">✏️ Edytuj</button>
                  <button class="btn btn-danger" style="padding: 6px 14px; font-size: 13px;" onclick="deleteContractor(${idx})">🗑️ Usuń</button>
                </div>
              </div>
            </details>
          `;
          contractorList.appendChild(li);
        });
      }

    } else {
      contractorsView.style.display = 'none';
      propertiesView.style.display = 'block';

      propertyGrid.innerHTML = '';
      let compProps = properties.filter(p => p.company === currentCompany);

      if (valPropName) compProps = compProps.filter(p => p.name.toLowerCase().includes(valPropName));
      if (valPropCity) compProps = compProps.filter(p => (p.city || '').toLowerCase().includes(valPropCity));

      if (compProps.length === 0) {
        propertyGrid.innerHTML = '<p style="color: var(--oneui-text-sub); grid-column: 1/-1;">Brak obiektów spełniających kryteria wyszukiwania.</p>';
      } else {
        compProps.forEach(prop => {
          const div = document.createElement('div');
          div.className = 'property-card-item';
          div.onclick = () => openPropertyCard(prop.name);
          div.innerHTML = `
            <h3>🏢 ${prop.name}</h3>
            <p style="font-size: 13px; color: var(--oneui-text-sub); margin: 0;">${prop.city ? prop.city : 'Brak lokalizacji'}</p>
          `;
          propertyGrid.appendChild(div);
        });
      }
    }
  }
}

// Start
renderUI();