// reports.js
// ERP Reports Module

/**
 * تصدير تقرير الشحنات – محوَّل للمحرك المشترك
 * (الدالة محفوظة للتوافق مع أي مستدعِ قديم)
 */
function exportShipmentsPDF() {
    if (typeof printTrackingReport === 'function') {
        printTrackingReport();
    } else {
        alert('دالة تقرير الشحنات غير متاحة.');
    }
}
