// suppliers-ui.js

let currentEditSupplierId = null;

function initSuppliersUI() {
    renderSuppliers();
}

function renderSuppliers() {
    const tableBody = document.getElementById('suppliers-table-body');
    const emptyState = document.getElementById('suppliers-empty');
    const suppliers = SuppliersStorage.getAll();
    
    // التحديث في لوحة القيادة
    const dashCount = document.getElementById('dash-suppliers-count');
    if(dashCount) dashCount.innerText = suppliers.length;

    tableBody.innerHTML = '';

    if (suppliers.length === 0) {
        tableBody.parentElement.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    tableBody.parentElement.classList.remove('hidden');
    emptyState.classList.add('hidden');

    suppliers.forEach(supplier => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-slate-100 hover:bg-slate-50 transition';
        tr.innerHTML = `
            <td class="p-3 text-right font-bold text-slate-700">${supplier.name || '-'}</td>
            <td class="p-3 text-right">${supplier.contact || '-'}</td>
            <td class="p-3 text-right">${supplier.phone || '-'}</td>
            <td class="p-3 text-right wrap-text">${supplier.address || '-'}</td>
            <td class="p-3 text-center no-print whitespace-nowrap">
                <button onclick="editSupplier('${supplier.id}')" class="text-brand-600 hover:text-brand-800 mx-1 transition"><i class="fa-solid fa-edit"></i></button>
                <button onclick="deleteSupplier('${supplier.id}')" class="text-red-600 hover:text-red-800 mx-1 transition"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function saveSupplier(event) {
    event.preventDefault();

    const nameInput = document.getElementById('sup-name');
    const contactInput = document.getElementById('sup-contact');
    const phoneInput = document.getElementById('sup-phone');
    const addressInput = document.getElementById('sup-address');

    if (!nameInput.value.trim()) {
        showToast('يرجى إدخال اسم المورد', 'error');
        return;
    }

    const supplierData = {
        name: nameInput.value.trim(),
        contact: contactInput.value.trim(),
        phone: phoneInput.value.trim(),
        address: addressInput.value.trim()
    };

    if (currentEditSupplierId) {
        SuppliersStorage.updateSupplier(currentEditSupplierId, supplierData);
        showToast('تم تحديث بيانات المورد بنجاح');
    } else {
        SuppliersStorage.addSupplier(supplierData);
        showToast('تمت إضافة المورد بنجاح');
    }

    resetSupplierForm();
    renderSuppliers();
}

function editSupplier(id) {
    const supplier = SuppliersStorage.getSupplier(id);
    if (!supplier) return;

    currentEditSupplierId = id;
    
    document.getElementById('sup-name').value = supplier.name || '';
    document.getElementById('sup-contact').value = supplier.contact || '';
    document.getElementById('sup-phone').value = supplier.phone || '';
    document.getElementById('sup-address').value = supplier.address || '';
    
    document.getElementById('supplier-submit-text').innerText = 'تحديث البيانات';
    document.getElementById('sup-name').focus();
    
    // تمرير للأعلى
    document.getElementById('view-suppliers').scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteSupplier(id) {
    if (confirm('هل أنت متأكد من حذف هذا المورد؟')) {
        SuppliersStorage.deleteSupplier(id);
        if (currentEditSupplierId === id) resetSupplierForm();
        renderSuppliers();
        showToast('تم حذف المورد بنجاح');
    }
}

function resetSupplierForm() {
    currentEditSupplierId = null;
    document.getElementById('supplierForm').reset();
    document.getElementById('supplier-submit-text').innerText = 'إضافة مورد';
}

function exportSuppliersExcel() {
    const suppliers = SuppliersStorage.getAll();
    if (suppliers.length === 0) {
        showToast('لا توجد بيانات لتصديرها', 'error');
        return;
    }

    const data = suppliers.map(s => ({
        'اسم المورد': s.name,
        'الشخص المسؤول': s.contact,
        'رقم التواصل': s.phone,
        'العنوان': s.address,
        'تاريخ الإضافة': new Date(s.createdAt).toLocaleDateString('ar-SA')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الموردين");
    XLSX.writeFile(wb, "تقرير_الموردين.xlsx");
}
