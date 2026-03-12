function initShipmentsUI() {
    renderShipmentsTable();
}

function renderShipmentsTable() {
    const list = ShipmentsStorage.getAll();
    const tbody = document.getElementById('shipments-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    if (list.length === 0) {
        if (document.getElementById('shipments-empty')) {
            document.getElementById('shipments-empty').classList.remove('hidden');
        }
        return;
    } else {
        if (document.getElementById('shipments-empty')) {
            document.getElementById('shipments-empty').classList.add('hidden');
        }
    }

    list.forEach(shipment => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition border-b border-slate-100";
        tr.innerHTML = `
            <td class="p-3 text-slate-800 font-bold">${shipment.trackingNumber || '-'}</td>
            <td class="p-3 text-slate-600">${shipment.supplier || '-'}</td>
            <td class="p-3 text-sm text-slate-500">${shipment.status || 'Pending'}</td>
            <td class="p-3 text-center no-print">
                <button onclick="openTrackingTimeline(${shipment.id})" class="text-brand-500 hover:text-brand-700 ml-2" title="عرض التتبع">
                    <i class="fa-solid fa-list-ol"></i>
                </button>
                <button onclick="deleteShipment(${shipment.id})" class="text-red-500 hover:text-red-700" title="حذف">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.openTrackingTimeline = function(id) {
    const list = ShipmentsStorage.getAll();
    const shipment = list.find(s => s.id === id);
    if (!shipment) return;
    
    const container = document.getElementById('timelineContainer');
    if (!container) return;

    // Handle old shipment missing tracking
    let tracking = shipment.tracking || [];
    if (tracking.length === 0) {
        tracking.push({ status: shipment.status || 'preparing', date: shipment.createdAt || new Date().toISOString() });
    }

    const translations = {
        preparing: 'جاري التجهيز',
        shipped: 'تم الشحن',
        in_transit: 'في الطريق',
        arrived: 'وصل المستودع',
        delivered: 'تم التسليم'
    };

    let html = '';
    tracking.forEach(t => {
        const d = new Date(t.date);
        const formattedDate = d.toLocaleDateString('ar-SA') + ' ' + d.toLocaleTimeString('ar-SA', {hour: '2-digit', minute:'2-digit'});
        const statusLabel = translations[t.status] || t.status;
        html += `
            <div class="timeline-item">
                <div class="circle border-brand-100 bg-brand-500"></div>
                <div class="bg-slate-50 rounded-xl p-4 shadow-sm border border-slate-100">
                    <h4 class="font-bold text-slate-800">${statusLabel}</h4>
                    <p class="text-sm text-slate-500 mt-1 flex items-center gap-1">
                        <i class="fa-regular fa-clock text-xs"></i>
                        ${formattedDate}
                    </p>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    
    const modal = document.getElementById('timelineModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
};

function deleteShipment(id) {
    if (confirm('هل أنت متأكد من الحذف؟')) {
        ShipmentsStorage.delete(id);
        renderShipmentsTable();
        if (typeof showToast === 'function') {
            showToast('تم الحذف بنجاح');
        }
    }
}
