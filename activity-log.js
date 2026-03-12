// activity-log.js
const STORAGE_KEY_AUDIT = 'ims_audit_log';

function getAuditLog() {
    const data = localStorage.getItem(STORAGE_KEY_AUDIT);
    return data ? JSON.parse(data) : [];
}

/**
 * Log user activity
 * @param {string} action - 'add', 'edit', 'delete', 'export'
 * @param {string} entity - 'order', 'supplier', 'shipment', 'inventory'
 * @param {string} entityId - associated ID or brief description
 * @param {string} user - Currently 'admin' or configurable
 */
window.logActivity = function(action, entity, entityId, user = 'admin') {
    const logs = getAuditLog();
    const logEntry = {
        id: Date.now(),
        action: action,
        entity: entity,
        entityId: entityId || '',
        date: new Date().toISOString(),
        user: user
    };
    logs.push(logEntry);
    
    // limit logs to last 1000 for safe localstorage limits
    if (logs.length > 1000) {
        logs.shift();
    }
    
    localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(logs));
};

// Optionally display or export logs.
window.exportAuditLog = function() {
    const logs = getAuditLog();
    if(logs.length === 0) {
        if(typeof showToast !== 'undefined') showToast('لا يوجد سجل نشاطات');
        return;
    }
    const data = logs.map(l => ({
        'تاريخ النشاط': new Date(l.date).toLocaleString('ar-SA'),
        'المستخدم': l.user,
        'النوع': l.entity,
        'الإجراء': l.action,
        'المعرف': l.entityId
    }));
    
    if (typeof XLSX !== 'undefined') {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "سجل النظام");
        XLSX.writeFile(wb, `Audit_Log_${new Date().getTime()}.xlsx`);
    }
};