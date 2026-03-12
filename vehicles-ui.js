function initVehicles() {
    renderVehicles();
}

function renderVehicles() {
    const vehicles = getVehicles();
    const tbody = document.getElementById('vehicles-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (vehicles.length === 0) {
        document.getElementById('vehicles-empty').classList.remove('hidden');
        document.getElementById('vehicles-table-container').classList.add('hidden');
    } else {
        document.getElementById('vehicles-empty').classList.add('hidden');
        document.getElementById('vehicles-table-container').classList.remove('hidden');

        vehicles.forEach(vehicle => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-slate-50 transition-colors';
            
            const statusClass = vehicle.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
            const statusText = vehicle.status === 'active' ? 'متاح' : 'غير متاح';

            tr.innerHTML = `
                <td class="p-3 whitespace-nowrap"><span class="px-2 py-1 rounded-full text-[10px] font-bold ${statusClass}">${statusText}</span></td>
                <td class="p-3 font-bold text-slate-700 whitespace-nowrap">${vehicle.plateNumber}</td>
                <td class="p-3 whitespace-nowrap">${vehicle.driverName}</td>
                <td class="p-3 whitespace-nowrap" dir="ltr">${vehicle.phone}</td>
                <td class="p-3 whitespace-nowrap">${vehicle.capacity || '-'}</td>
                <td class="p-3 text-center no-print whitespace-nowrap">
                    <button onclick="openVehicleForm('${vehicle.id}')" class="text-blue-500 hover:text-blue-700 mx-1"><i class="fa-solid fa-edit"></i></button>
                    <button onclick="deleteVehicleUI('${vehicle.id}')" class="text-red-500 hover:text-red-700 mx-1"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
    
    // Update shipment forms if present
    populateVehicleSelects();
}

function openVehicleForm(id = null) {
    document.getElementById('vehicleFormModal').classList.remove('hidden');
    document.getElementById('vehicleFormModal').classList.add('flex');
    
    if (id) {
        const vehicles = getVehicles();
        const vehicle = vehicles.find(v => v.id === id);
        if (vehicle) {
            document.getElementById('vehicle-id').value = vehicle.id;
            document.getElementById('vehicle-plate').value = vehicle.plateNumber;
            document.getElementById('vehicle-driver').value = vehicle.driverName;
            document.getElementById('vehicle-phone').value = vehicle.phone;
            document.getElementById('vehicle-capacity').value = vehicle.capacity || '';
            document.getElementById('vehicle-status').value = vehicle.status || 'active';
            document.getElementById('vehicle-modal-title').innerText = 'تعديل مركبة';
        }
    } else {
        document.getElementById('vehicle-form').reset();
        document.getElementById('vehicle-id').value = '';
        document.getElementById('vehicle-status').value = 'active';
        document.getElementById('vehicle-modal-title').innerText = 'إضافة مركبة جديدة';
    }
}

function closeVehicleForm() {
    document.getElementById('vehicleFormModal').classList.add('hidden');
    document.getElementById('vehicleFormModal').classList.remove('flex');
}

function saveVehicleUI(event) {
    event.preventDefault();
    
    const id = document.getElementById('vehicle-id').value;
    const plateNumber = document.getElementById('vehicle-plate').value.trim();
    const driverName = document.getElementById('vehicle-driver').value.trim();
    const phone = document.getElementById('vehicle-phone').value.trim();
    const capacity = document.getElementById('vehicle-capacity').value.trim();
    const status = document.getElementById('vehicle-status').value;

    if (!plateNumber || !driverName) {
        alert('الرجاء إدخال رقم اللوحة واسم السائق');
        return;
    }

    const vehicle = {
        id: id || null,
        plateNumber,
        driverName,
        phone,
        capacity,
        status
    };

    saveVehicle(vehicle);
    closeVehicleForm();
    renderVehicles();
    
    const toast = document.getElementById('toast');
    if(toast) {
        toast.innerText = "تم حفظ المركبة بنجاح";
        toast.style.opacity = "1";
        setTimeout(() => toast.style.opacity = "0", 3000);
    }
}

function deleteVehicleUI(id) {
    if (confirm('هل أنت متأكد من حذف هذه المركبة؟')) {
        removeVehicle(id);
        renderVehicles();
    }
}

function populateVehicleSelects() {
    const selects = document.querySelectorAll('.vehicle-select');
    const vehicles = getVehicles();
    
    selects.forEach(select => {
        const currentVal = select.value;
        select.innerHTML = '<option value="">اختر مركبة (اختياري)</option>';
        vehicles.forEach(v => {
            const option = document.createElement('option');
            option.value = v.id;
            // Only show active or currently selected ones
            if (v.status !== 'active' && v.id !== currentVal) return; 
            option.textContent = \`\${v.plateNumber} - \${v.driverName}\`;
            select.appendChild(option);
        });
        if (currentVal) select.value = currentVal;
    });
}
