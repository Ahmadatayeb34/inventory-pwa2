// orders-ui.js

// ═══════════════════════════════════════════════════════════════════════
//  إعدادات التطبيق (اسم الشركة والفرع)
// ═══════════════════════════════════════════════════════════════════════
function getAppSettings() {
    const data = localStorage.getItem('app_settings_v1');
    try { return data ? JSON.parse(data) : {}; } catch { return {}; }
}
function saveAppSettings(settings) {
    localStorage.setItem('app_settings_v1', JSON.stringify(settings));
}

// ═══════════════════════════════════════════════════════════════════════
//  محرك الطباعة المشترك  (Print Engine)
//  يُستخدم من جميع تقارير النظام
// ═══════════════════════════════════════════════════════════════════════

/**
 * تولید CSS الطباعة المشترك
 * @param {number} rowCount   - عدد الصفوف لتحديد حجم الخط تلقائياً
 * @param {string} orientation - 'portrait' | 'landscape'
 */
function _buildPrintCSS(rowCount, orientation) {
    // ── تقليص تلقائي للخط والمسافات عند كثرة الصفوف ──
    let fontSize = '9.5pt';
    let cellPad  = '5px 6px';
    let thPad    = '7px 6px';

    if (rowCount > 60)      { fontSize = '7pt';   cellPad = '2px 3px'; thPad = '4px 3px'; }
    else if (rowCount > 45) { fontSize = '7.5pt'; cellPad = '3px 4px'; thPad = '5px 4px'; }
    else if (rowCount > 30) { fontSize = '8.5pt'; cellPad = '4px 5px'; thPad = '6px 5px'; }

    const pgMargin = orientation === 'landscape' ? '12mm 10mm 12mm 10mm' : '12mm 12mm 12mm 12mm';

    return `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
        font-family: 'Tahoma', 'Arial', sans-serif;
        font-size: ${fontSize};
        color: #1a1a1a;
        background: #fff;
        direction: rtl;
    }
    @page { size: A4 ${orientation}; margin: ${pgMargin}; }

    /* ══ جدول التخطيط العام – الرأس والتذييل يتكرران في كل صفحة ══
       هذا هو الأسلوب القياسي CSS2.1 المدعوم في جميع المتصفحات.   */
    table.rpt-layout {
        width: 100%;
        border-collapse: collapse;
    }
    table.rpt-layout > thead { display: table-header-group; }
    table.rpt-layout > tfoot { display: table-footer-group; }
    table.rpt-layout > tbody { display: table-row-group; }

    /* ── رأس الصفحة ── */
    .rpt-hdr-cell {
        text-align: center;
        padding: 0 4px 8px 4px;
        border-bottom: 2.5px solid #1e3a5f;
        background: #fff;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
    .co-name   { font-size: 16pt; font-weight: 900; color: #1e3a5f; line-height: 1.3; }
    .br-name   { font-size: 11pt; color: #34495e; margin-top: 2px; }
    .rpt-title { font-size: 12pt; font-weight: bold; color: #c0392b; margin-top: 4px; }
    .rpt-meta  { font-size: 8pt; color: #777; margin-top: 3px; }

    /* ── تذييل الصفحة ── */
    .rpt-ftr-cell {
        text-align: center;
        padding: 6px 4px 0 4px;
        border-top: 1px solid #bbb;
        font-size: 8pt;
        color: #555;
        background: #fff;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }

    /* مسافة فوق المحتوى */
    .rpt-content-cell { padding-top: 8px; }

    /* ── جدول البيانات ── */
    table.rpt-data {
        width: 100%;
        border-collapse: collapse;
        font-size: ${fontSize};
        table-layout: fixed; /* توزيع الأعمدة حسب النسب المحددة في colgroup */
    }
    table.rpt-data thead th {
        background-color: #1e3a5f;
        color: #fff;
        padding: ${thPad};
        text-align: center;
        border: 1px solid #14294a;
        word-break: normal;         /* كلمات كاملة دائماً */
        overflow-wrap: break-word; /* كسر عند الضرورة فقط */
        vertical-align: bottom;
        line-height: 1.35;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
    table.rpt-data tbody td {
        padding: ${cellPad};
        text-align: center;
        border: 1px solid #ccc;
        overflow-wrap: break-word; /* للنصوص الطويلة جداً */
    }
    table.rpt-data tbody tr:nth-child(even) td {
        background-color: #f4f6fa;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
    /* لا قطع داخل صف واحد */
    table.rpt-data tbody tr { break-inside: avoid; }

    /* الأعمدة الرقمية والتواريخ – لا لفّ للنص إطلاقاً */
    table.rpt-data .col-num {
        white-space: nowrap !important;
        overflow: visible;
    }

    /* ── حالات الطلبات ── */
    .row-late td { background-color: #fff0f0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .row-done td { color: #999; }
    .cell-late   { font-weight: 900; color: #b71c1c; }
    .cell-done   { color: #aaa; }

    /* ── حالات الصلاحية ── */
    .exp-ok     { color: #1b5e20; font-weight: bold; }
    .exp-warn   { color: #e65100; font-weight: bold; }
    .exp-danger { color: #b71c1c; font-weight: bold; }
    .exp-out    { color: #888; text-decoration: line-through; }

    /* ── ملخص ── */
    .summary {
        margin-bottom: 6px; font-size: 8.5pt; color: #444;
        border: 1px solid #ddd; padding: 4px 8px;
        background: #f9fafb; border-radius: 3px;
        -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    `;
}

/**
 * إطار HTML كامل للتقرير المطبوع
 * @param {object} cfg
 *   - title        : عنوان التقرير
 *   - subtitle     : عنوان فرعي اختياري
 *   - orientation  : 'portrait' | 'landscape'
 *   - rowCount     : عدد الصفوف
 *   - summaryHtml  : HTML ملخص اختياري
 *   - tableHtml    : HTML الجدول كاملاً (thead + tbody)
 *   - totalLabel   : ملصق الإجمالي (مثل "٢٥ طلب")
 */
function _buildReportHTML(cfg) {
    const settings    = getAppSettings();
    const companyName = settings.companyName || 'اسم الشركة';
    const branchName  = settings.branchName  || 'اسم الفرع';
    const {
        title, subtitle = '', orientation = 'portrait',
        rowCount = 0, summaryHtml = '', tableHtml = '', totalLabel = ''
    } = cfg;

    const today   = new Date();
    const dateStr = today.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
    const css     = _buildPrintCSS(rowCount, orientation);
    const meta    = [
        `تاريخ التقرير: ${dateStr}`,
        totalLabel ? `إجمالي: ${totalLabel}` : ''
    ].filter(Boolean).join('  |  ');

    // الأسلوب الصحيح: table-header-group / table-footer-group
    // يجعل <thead> يتكرر في أعلى كل صفحة مطبوعة
    // و   <tfoot> يتكرر في أسفل كل صفحة مطبوعة
    // هذا الأسلوب مدعوم في جميع المتصفحات وهو المعيار القياسي CSS2.1
    return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>${css}</style>
</head>
<body>
<table class="rpt-layout">

  <!-- ═══ رأس يظهر في أعلى كل صفحة مطبوعة ═══ -->
  <thead>
    <tr>
      <td class="rpt-hdr-cell">
        <div class="co-name">${companyName}</div>
        <div class="br-name">${branchName}</div>
        <div class="rpt-title">${title}${subtitle ? ' &mdash; ' + subtitle : ''}</div>
        <div class="rpt-meta">${meta}</div>
      </td>
    </tr>
  </thead>

  <!-- ═══ تذييل يظهر في أسفل كل صفحة مطبوعة ═══ -->
  <tfoot>
    <tr>
      <td class="rpt-ftr-cell">
        نظام الإدارة المتكاملة &mdash; تطوير أحمد الطيب 0550360705
      </td>
    </tr>
  </tfoot>

  <!-- ═══ محتوى التقرير ═══ -->
  <tbody>
    <tr>
      <td class="rpt-content-cell">
        ${summaryHtml}
        ${tableHtml}
      </td>
    </tr>
  </tbody>

</table>
</body>
</html>`;
}

/**
 * فتح نافذة الطباعة
 */
function _openPrintWindow(htmlContent) {
    const pw = window.open('', '_blank', 'width=950,height=750');
    if (!pw) {
        alert('لم يتمكن المتصفح من فتح نافذة الطباعة.\nيرجى السماح بالنوافذ المنبثقة (allow pop-ups) لهذا الموقع ثم أعد المحاولة.');
        return;
    }
    pw.document.write(htmlContent);
    pw.document.close();
    pw.focus();
    // تأخير بسيط لضمان تحميل CSS قبل فتح حوار الطباعة
    setTimeout(() => pw.print(), 700);
}


// ═══════════════════════════════════════════════════════════════════════
//  تقرير طلبات قيد الانتظار
// ═══════════════════════════════════════════════════════════════════════
function printOrdersReport() {
    const settings = getAppSettings();
    const companyName = settings.companyName || 'اسم الشركة';
    const branchName  = settings.branchName  || 'اسم الفرع';

    // جلب الطلبات بنفس منطق الفلترة الظاهر في الشاشة
    let list = getOrders().filter(o => o.source === activeOrdersTab);

    if (typeof searchOrders === 'function') {
        list = searchOrders(list, document.getElementById('filter-search')?.value);
        list = filterByType(list, document.getElementById('filter-type')?.value);
        list = filterByStatus(list, document.getElementById('filter-status')?.value);
        list = filterByPriority(list, document.getElementById('filter-priority')?.value);
        list = filterByDate(list, document.getElementById('filter-date')?.value);
    }

    list.sort((a, b) => {
        if (a.status === b.status) return b.id - a.id;
        return a.status === 'completed' ? 1 : -1;
    });

    const statusTextMap = {
        pending: 'بانتظار التنفيذ', completed: 'مكتمل',
        in_progress: 'قيد التنفيذ', cancelled: 'ملغي'
    };

    let bodyRows = '';
    let pendingCount = 0, lateCount = 0;

    list.forEach((order, idx) => {
        const daysDiff    = calculateDaysSince(order.createdAt || order.date);
        const isCompleted = order.status === 'completed';
        const isLate      = !isCompleted && daysDiff > 7;
        const statusText  = statusTextMap[order.status] || order.status;

        if (!isCompleted) pendingCount++;
        if (isLate) lateCount++;

        const trClass   = isLate ? ' class="row-late"' : (isCompleted ? ' class="row-done"' : '');
        const daysDisp  = isCompleted
            ? `<span class="cell-done">-</span>`
            : `<span class="${isLate ? 'cell-late' : ''}">${daysDiff}</span>`;

        bodyRows += `
        <tr${trClass}>
            <td class="col-num">${idx + 1}</td>
            <td>${order.title || order.number || '-'}</td>
            <td class="col-num">${formatDateDisplay(order.createdAt || order.date) || '-'}</td>
            <td>${order.type || '-'}</td>
            <td>${order.notes || '-'}</td>
            <td>${order.description || order.company || '-'}</td>
            <td>${statusText}</td>
            <td class="col-num" style="font-weight:bold">${daysDisp}</td>
        </tr>`;
    });

    if (!bodyRows) {
        bodyRows = `<tr><td colspan="8" style="text-align:center;padding:16px;color:#888">لا توجد طلبات مطابقة للفلاتر الحالية</td></tr>`;
    }

    const sourceTitle = (activeOrdersTab === 'showroom') ? 'طلبات المعرض' : 'طلبات الكافيه';

    // توزيع الأعمدة على A4 عمودي (186mm مساحة مفيدة)
    // #(3%) | رقم طلب(13%) | تاريخ(11%) | اسم صنف(21%) | ملاحظات(13%) | قسم(18%) | حالة(11%) | تأخر(10%)
    const tableHtml = `
    <table class="rpt-data">
        <colgroup>
            <col style="width:3%">
            <col style="width:13%">
            <col style="width:11%">
            <col style="width:21%">
            <col style="width:13%">
            <col style="width:18%">
            <col style="width:11%">
            <col style="width:10%">
        </colgroup>
        <thead>
            <tr>
                <th class="col-num">#</th>
                <th>رقم الطلب</th>
                <th>تاريخ الطلب</th>
                <th>اسم الصنف / نوع الطلب</th>
                <th>ملاحظات</th>
                <th>القسم / الجهة الطالبة</th>
                <th>الحالة</th>
                <th>مدة التأخر<br>بالأيام</th>
            </tr>
        </thead>
        <tbody>${bodyRows}</tbody>
    </table>`;

    const summaryHtml = `
    <div class="summary">
        إجمالي الطلبات: <strong>${list.length}</strong> &nbsp;|&nbsp;
        قيد الانتظار: <strong>${pendingCount}</strong> &nbsp;|&nbsp;
        متأخرة (&gt;7 أيام): <strong style="color:#b71c1c">${lateCount}</strong>
    </div>`;

    _openPrintWindow(_buildReportHTML({
        title:      `تقرير طلبات قيد الانتظار`,
        subtitle:   sourceTitle,
        orientation: 'portrait',
        rowCount:   list.length,
        summaryHtml,
        tableHtml,
        totalLabel: `${list.length} طلب`
    }));
}


// ═══════════════════════════════════════════════════════════════════════
//  تقرير سجل الجرد
// ═══════════════════════════════════════════════════════════════════════
function printInventoryReport() {
    if (typeof inventory === 'undefined' || !inventory.length) {
        alert('لا توجد بيانات جرد لطباعتها.'); return;
    }

    const filterVal = (document.getElementById('inv-search')?.value || '').toLowerCase();
    const list = inventory.filter(item =>
        !filterVal ||
        item.name.toLowerCase().includes(filterVal) ||
        item.code.toLowerCase().includes(filterVal)
    );

    let surplus = 0, deficit = 0, match = 0;
    let bodyRows = list.map((item, idx) => {
        const diff     = item.actualQty - item.sysQty;
        const diffSign = diff > 0 ? '+' : '';
        const diffCls  = diff === 0 ? '' : (diff > 0 ? ' style="color:#1565c0;font-weight:bold"' : ' style="color:#b71c1c;font-weight:bold"');
        if (diff > 0) surplus++; else if (diff < 0) deficit++; else match++;
        return `
        <tr>
            <td style="width:24px">${idx + 1}</td>
            <td style="font-family:monospace;text-align:right">${item.code}</td>
            <td style="text-align:right">${item.name}</td>
            <td>${item.sysQty}</td>
            <td style="font-weight:bold">${item.actualQty}</td>
            <td${diffCls}>${diffSign}${diff}</td>
        </tr>`;
    }).join('');

    if (!bodyRows) {
        bodyRows = `<tr><td colspan="6" style="text-align:center;padding:16px;color:#888">لا توجد بيانات</td></tr>`;
    }

    const tableHtml = `
    <table class="rpt-data">
        <thead>
            <tr>
                <th style="width:24px">#</th>
                <th>الكود</th>
                <th>اسم الصنف</th>
                <th>الكمية (النظام)</th>
                <th>الكمية (الفعلية)</th>
                <th>الفارق</th>
            </tr>
        </thead>
        <tbody>${bodyRows}</tbody>
    </table>`;

    const summaryHtml = `
    <div class="summary">
        إجمالي الأصناف: <strong>${list.length}</strong> &nbsp;|&nbsp;
        مطابق: <strong style="color:#1b5e20">${match}</strong> &nbsp;|&nbsp;
        زيادة: <strong style="color:#1565c0">${surplus}</strong> &nbsp;|&nbsp;
        نقص: <strong style="color:#b71c1c">${deficit}</strong>
    </div>`;

    _openPrintWindow(_buildReportHTML({
        title:      'تقرير سجل الجرد',
        orientation: 'portrait',
        rowCount:   list.length,
        summaryHtml,
        tableHtml,
        totalLabel: `${list.length} صنف`
    }));
}


// ═══════════════════════════════════════════════════════════════════════
//  تقرير تواريخ الصلاحية
// ═══════════════════════════════════════════════════════════════════════
function printExpiryReport() {
    if (typeof inventory === 'undefined' || !inventory.length) {
        alert('لا توجد بيانات صلاحية لطباعتها.'); return;
    }

    const filterVal = (document.getElementById('exp-search')?.value || '').toLowerCase();

    let rowIdx = 0, expiredCount = 0, warnCount = 0, okCount = 0;
    let bodyRows = '';

    inventory.forEach(item => {
        if (filterVal && !item.name.toLowerCase().includes(filterVal)) return;

        if (!item.batches || item.batches.length === 0) {
            rowIdx++;
            bodyRows += `
            <tr>
                <td style="width:24px">${rowIdx}</td>
                <td style="font-family:monospace;text-align:right">${item.code}</td>
                <td style="text-align:right">${item.name}</td>
                <td>-</td><td>-</td><td>-</td>
                <td style="color:#aaa">لا يوجد تاريخ</td>
            </tr>`;
        } else {
            item.batches.forEach(batch => {
                rowIdx++;
                const exp = typeof calcExpiry === 'function'
                    ? calcExpiry(batch.date, batch.duration)
                    : { label: '-', colorClass: '', expiryDateStr: '-', remainingDays: 999 };

                let statCls = 'exp-ok';
                if (exp.remainingDays !== undefined) {
                    if (exp.remainingDays < 0)       { statCls = 'exp-out'; expiredCount++; }
                    else if (exp.remainingDays <= 30) { statCls = 'exp-danger'; warnCount++; }
                    else if (exp.remainingDays <= 90) { statCls = 'exp-warn'; warnCount++; }
                    else                              { statCls = 'exp-ok'; okCount++; }
                }

                bodyRows += `
                <tr>
                    <td style="width:24px">${rowIdx}</td>
                    <td style="font-family:monospace;text-align:right">${item.code}</td>
                    <td style="text-align:right">${item.name}</td>
                    <td>${typeof formatDateDisplay === 'function' ? formatDateDisplay(batch.date) : batch.date}</td>
                    <td style="color:#c62828;font-weight:bold">${exp.expiryDateStr || '-'}</td>
                    <td style="font-weight:bold">${batch.qty}</td>
                    <td class="${statCls}">${exp.label || '-'}</td>
                </tr>`;
            });
        }
    });

    if (!bodyRows) {
        bodyRows = `<tr><td colspan="7" style="text-align:center;padding:16px;color:#888">لا توجد بيانات</td></tr>`;
    }

    const tableHtml = `
    <table class="rpt-data">
        <thead>
            <tr>
                <th style="width:24px">#</th>
                <th>الكود</th>
                <th>اسم الصنف</th>
                <th>تاريخ التحميص</th>
                <th>تاريخ الانتهاء</th>
                <th>الكمية</th>
                <th>الحالة</th>
            </tr>
        </thead>
        <tbody>${bodyRows}</tbody>
    </table>`;

    const summaryHtml = `
    <div class="summary">
        إجمالي الدفعات: <strong>${rowIdx}</strong> &nbsp;|&nbsp;
        سليمة: <strong style="color:#1b5e20">${okCount}</strong> &nbsp;|&nbsp;
        تحتاج متابعة: <strong style="color:#e65100">${warnCount}</strong> &nbsp;|&nbsp;
        منتهية: <strong style="color:#b71c1c">${expiredCount}</strong>
    </div>`;

    _openPrintWindow(_buildReportHTML({
        title:      'تقرير تواريخ الصلاحية',
        orientation: 'portrait',
        rowCount:   rowIdx,
        summaryHtml,
        tableHtml,
        totalLabel: `${rowIdx} دفعة`
    }));
}


// ═══════════════════════════════════════════════════════════════════════
//  تقرير دليل القهوة / الإيحاءات
// ═══════════════════════════════════════════════════════════════════════
function printNotesReport() {
    if (typeof inventory === 'undefined' || !inventory.length) {
        alert('لا توجد بيانات لطباعتها.'); return;
    }

    const filterVal = (document.getElementById('note-search')?.value || '').toLowerCase();
    const list = inventory.filter(item => {
        if (!filterVal) return true;
        const s = (item.name + (item.roastery || '') + (item.notes || '')).toLowerCase();
        return s.includes(filterVal);
    });

    const bodyRows = list.map((item, idx) => `
        <tr>
            <td style="width:24px">${idx + 1}</td>
            <td style="font-family:monospace;text-align:right">${item.code}</td>
            <td style="text-align:right;font-weight:bold">${item.name}</td>
            <td style="text-align:right">${item.roastery || '-'}</td>
            <td style="text-align:right">${item.notes || '-'}</td>
        </tr>`).join('');

    const tableHtml = `
    <table class="rpt-data">
        <thead>
            <tr>
                <th style="width:24px">#</th>
                <th>الكود</th>
                <th>اسم الصنف</th>
                <th>المحمصة</th>
                <th>الإيحاءات / الملاحظات</th>
            </tr>
        </thead>
        <tbody>${bodyRows || `<tr><td colspan="5" style="text-align:center;padding:16px;color:#888">لا توجد بيانات</td></tr>`}</tbody>
    </table>`;

    _openPrintWindow(_buildReportHTML({
        title:      'دليل القهوة – الإيحاءات والملاحظات',
        orientation: 'portrait',
        rowCount:   list.length,
        tableHtml,
        totalLabel: `${list.length} صنف`
    }));
}


// ═══════════════════════════════════════════════════════════════════════
//  تقرير بوليصات الشحن والتتبع
// ═══════════════════════════════════════════════════════════════════════
function printTrackingReport() {
    if (typeof trackingData === 'undefined' || !trackingData.length) {
        alert('لا توجد شحنات مسجلة لطباعتها.'); return;
    }

    let list = [...trackingData];
    if (typeof currentTrackingFilter !== 'undefined') {
        if (currentTrackingFilter === 'pending')   list = list.filter(t => !t.delivered);
        if (currentTrackingFilter === 'delivered') list = list.filter(t => t.delivered);
    }

    let deliveredCount = 0, pendingCount2 = 0, lateCount = 0;
    const today = new Date(); today.setHours(0,0,0,0);

    const bodyRows = list.map((item, idx) => {
        let vehicleName = '-';
        if (item.vehicleId && typeof getVehicles === 'function') {
            const v = getVehicles().find(v => v.id === item.vehicleId);
            if (v) vehicleName = `${v.plateNumber} (${v.driverName})`;
        }

        const isDelivered = !!item.delivered;
        let arrivalDisp = item.expectedArrival || '-';
        let isLate2 = false;
        if (item.expectedArrival && !isDelivered) {
            const arrDate = new Date(item.expectedArrival); arrDate.setHours(0,0,0,0);
            if (arrDate < today) { isLate2 = true; lateCount++; }
        }
        if (isDelivered) deliveredCount++; else pendingCount2++;

        const lastUpd = item.lastUpdate
            ? new Date(item.lastUpdate).toLocaleDateString('ar-SA', { year:'numeric', month:'short', day:'numeric' })
            : '-';

        return `
        <tr${isLate2 ? ' class="row-late"' : ''}>
            <td style="width:24px">${idx + 1}</td>
            <td style="font-family:monospace;font-weight:bold">${item.orderId}</td>
            <td style="font-family:monospace">${item.shipmentNumber}</td>
            <td>${vehicleName}</td>
            <td>${item.status || '-'}</td>
            <td style="font-weight:bold;color:${isDelivered ? '#1b5e20' : '#e65100'}">${isDelivered ? 'تم الاستلام' : 'لم يُستلم'}</td>
            <td${isLate2 ? ' class="cell-late"' : ''}>${arrivalDisp}${isLate2 ? ' ⚠' : ''}</td>
            <td>${item.notes || '-'}</td>
            <td>${lastUpd}</td>
        </tr>`;
    }).join('');

    const tableHtml = `
    <table class="rpt-data">
        <thead>
            <tr>
                <th style="width:24px">#</th>
                <th>رقم الطلب</th>
                <th>رقم البوليصة</th>
                <th>المركبة / السائق</th>
                <th>حالة التتبع</th>
                <th>الاستلام</th>
                <th>تاريخ الوصول المتوقع</th>
                <th>ملاحظات</th>
                <th>آخر تحديث</th>
            </tr>
        </thead>
        <tbody>${bodyRows || `<tr><td colspan="9" style="text-align:center;padding:16px;color:#888">لا توجد شحنات</td></tr>`}</tbody>
    </table>`;

    const summaryHtml = `
    <div class="summary">
        إجمالي الشحنات: <strong>${list.length}</strong> &nbsp;|&nbsp;
        مستلمة: <strong style="color:#1b5e20">${deliveredCount}</strong> &nbsp;|&nbsp;
        قيد الشحن: <strong style="color:#e65100">${pendingCount2}</strong> &nbsp;|&nbsp;
        متأخرة: <strong style="color:#b71c1c">${lateCount}</strong>
    </div>`;

    _openPrintWindow(_buildReportHTML({
        title:      'تقرير بوليصات الشحن والتتبع',
        orientation: 'landscape',
        rowCount:   list.length,
        summaryHtml,
        tableHtml,
        totalLabel: `${list.length} شحنة`
    }));
}


// ═══════════════════════════════════════════════════════════════════════
//  فتح / حفظ نافذة إعدادات الشركة
// ═══════════════════════════════════════════════════════════════════════
function openSettingsModal() {
    const settings = getAppSettings();
    document.getElementById('settings-company-name').value = settings.companyName || '';
    document.getElementById('settings-branch-name').value  = settings.branchName  || '';
    document.getElementById('settingsModal').classList.remove('hidden');
    document.getElementById('settingsModal').classList.add('flex');
}

function closeSettingsModal() {
    document.getElementById('settingsModal').classList.add('hidden');
    document.getElementById('settingsModal').classList.remove('flex');
}

function saveSettingsForm() {
    const companyName = document.getElementById('settings-company-name').value.trim();
    const branchName  = document.getElementById('settings-branch-name').value.trim();
    saveAppSettings({ companyName, branchName });
    closeSettingsModal();
    showToast('تم حفظ إعدادات الشركة بنجاح ✓', 'success');
}

function switchOrdersTab(tabId) {
    if (typeof activeOrdersTab !== 'undefined') {
        activeOrdersTab = tabId;
    }
    const tabShowroom = document.getElementById('tab-showroom');
    const tabCafe = document.getElementById('tab-cafe');
    
    if (tabShowroom && tabCafe) {
        tabShowroom.classList.remove('border-showroom-600', 'text-showroom-600');
        tabShowroom.classList.add('border-transparent', 'text-slate-400');
        tabCafe.classList.remove('border-cafe-600', 'text-cafe-600');
        tabCafe.classList.add('border-transparent', 'text-slate-400');
        
        if (tabId === 'showroom') {
            tabShowroom.classList.remove('border-transparent', 'text-slate-400');
            tabShowroom.classList.add('border-showroom-600', 'text-showroom-600');
        } else {
            tabCafe.classList.remove('border-transparent', 'text-slate-400');
            tabCafe.classList.add('border-cafe-600', 'text-cafe-600');
        }
    }
    
    renderOrdersTable();
    if (typeof updateDashboard === 'function') updateDashboard();
}

function setOrderSource(src) {
    if (typeof activeOrderSource !== 'undefined') {
        activeOrderSource = src;
    }
    const btnShowroom = document.getElementById('btn-src-showroom');
    const btnCafe = document.getElementById('btn-src-cafe');
    
    if (btnShowroom && btnCafe) {
        btnShowroom.classList.remove('bg-white', 'text-showroom-600', 'shadow-sm');
        btnShowroom.classList.add('text-slate-500');
        btnCafe.classList.remove('bg-white', 'text-cafe-600', 'shadow-sm');
        btnCafe.classList.add('text-slate-500');
        
        if (src === 'showroom') {
            btnShowroom.classList.add('bg-white', 'text-showroom-600', 'shadow-sm');
            btnShowroom.classList.remove('text-slate-500');
        } else {
            btnCafe.classList.add('bg-white', 'text-cafe-600', 'shadow-sm');
            btnCafe.classList.remove('text-slate-500');
        }
    }
}

/**
 * Initializes the Orders UI module.
 * Responsible for initial load, filter setup, and rendering.
 */
function initOrdersUI() {
    updateDashboardStats(); // update general dashboard counters 
    if (typeof updateDashboard === 'function') updateDashboard(); // update orders specific dashboard
    
    // Ensure form is reset properly
    document.getElementById('ord-date').valueAsDate = new Date();
    
    const typeSelect = document.getElementById('ord-type');
    if (typeSelect) {
        typeSelect.addEventListener('change', (e) => {
            const isPO = ['أمر شراء', 'Purchase Order'].includes(e.target.value);
            const datalist = document.getElementById('suppliers-list');
            if (datalist && typeof SuppliersStorage !== 'undefined') {
                datalist.innerHTML = '';
                if (isPO) {
                    const suppliers = SuppliersStorage.getAll();
                    suppliers.forEach(s => {
                        const opt = document.createElement('option');
                        opt.value = s.name;
                        datalist.appendChild(opt);
                    });
                }
            }
        });
        typeSelect.dispatchEvent(new Event('change'));
    }
    
    // Initial Render
    renderOrdersTable();
}

/**
 * Handles saving a new order or updating an existing one.
 */
function saveOrder() {
    const num = document.getElementById('ord-num').value;
    const company = document.getElementById('ord-company').value;
    const type = document.getElementById('ord-type').value;
    const date = document.getElementById('ord-date').value;
    const notes = document.getElementById('ord-notes').value;
    const priority = document.getElementById('ord-priority').value;
    const editId = document.getElementById('ord-edit-id').value;

    if(!num || !company || !date) {
        showToast('يرجى ملء جميع الحقول', 'error');
        return;
    }

    if(editId) {
        updateOrder(parseInt(editId), {
            title: num,
            description: company,
            type: type,
            createdAt: date,
            notes: notes,
            priority: priority
        });
        showToast('تم تحديث الطلب بنجاح');
        cancelOrderEdit();
    } else {
        addOrder({
            title: num,
            description: company,
            type: type,
            createdAt: date,
            notes: notes,
            priority: priority,
            status: 'pending',
            source: activeOrderSource
        });
        showToast('تم إضافة الطلب بنجاح');
    }

    updateDashboardStats();
    if (typeof updateDashboard === 'function') updateDashboard();
    
    if(activeOrderSource === activeOrdersTab) {
        renderOrdersTable();
    }

    // Reset Form
    document.getElementById('ord-num').value = '';
    document.getElementById('ord-company').value = '';
    document.getElementById('ord-type').selectedIndex = 0;
    document.getElementById('ord-date').valueAsDate = new Date();
    document.getElementById('ord-notes').value = '';
    document.getElementById('ord-priority').value = 'medium';
}

/**
 * Prepares the form for editing an existing order.
 */
function editOrder(id) {
    const list = getOrders();
    const order = list.find(o => o.id === id);
    if(!order) return;

    setOrderSource(order.source || activeOrdersTab);
    
    document.getElementById('ord-num').value = order.title || order.number || '';
    document.getElementById('ord-company').value = order.description || order.company || '';
    document.getElementById('ord-type').value = order.type;
    document.getElementById('ord-date').value = order.createdAt || order.date;
    document.getElementById('ord-notes').value = order.notes || '';
    document.getElementById('ord-priority').value = order.priority || 'medium';
    document.getElementById('ord-edit-id').value = order.id;
    
    document.getElementById('order-form-title').innerText = 'تعديل الطلب';
    document.getElementById('order-save-btn-text').innerText = 'حفظ التعديلات';
    document.getElementById('cancel-edit-btn').classList.remove('hidden');
    
    document.getElementById('ord-num').focus();
}

/**
 * Cancels edit mode and resets the form.
 */
function cancelOrderEdit() {
    document.getElementById('ord-num').value = '';
    document.getElementById('ord-company').value = '';
    document.getElementById('ord-type').selectedIndex = 0;
    document.getElementById('ord-date').valueAsDate = new Date();
    document.getElementById('ord-notes').value = '';
    document.getElementById('ord-priority').value = 'medium';
    document.getElementById('ord-edit-id').value = '';
    
    document.getElementById('order-form-title').innerText = 'إضافة طلب جديد';
    document.getElementById('order-save-btn-text').innerText = 'تسجيل الطلب';
    document.getElementById('cancel-edit-btn').classList.add('hidden');
}

/**
 * Confirms with user before dispatching standard delete action.
 */
function confirmAndDeleteOrder(id) {
    if(confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟')) {
        deleteOrder(id);
        renderOrdersTable();
        updateDashboardStats();
        if (typeof updateDashboard === 'function') updateDashboard();
        showToast('تم حذف الطلب');
    }
}

/**
 * Toggles a single order between 'completed' and 'pending'.
 */
function toggleOrderStatus(id) {
    const list = getOrders();
    const order = list.find(o => o.id === id);
    if(order) {
        const newStatus = order.status === 'completed' ? 'pending' : 'completed';
        updateOrderStatus(id, newStatus);
        renderOrdersTable();
        updateDashboardStats();
        if (typeof updateDashboard === 'function') updateDashboard();
        showToast(newStatus === 'completed' ? 'تم إنجاز الطلب' : 'تم إعادة الطلب لقائمة الانتظار');
    }
}

/**
 * Calculates the number of days passed since a given date string.
 */
function calculateDaysSince(dateString) {
    if (!dateString) return 0;
    const pastDate = new Date(dateString);
    if (isNaN(pastDate.getTime())) return 0;
    
    pastDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - pastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
}

/**
 * Renders the main table after applying relevant filters.
 */
function renderOrdersTable() {
    const tbody = document.getElementById('orders-table-body');
    const emptyState = document.getElementById('orders-empty');
    if(!tbody || !emptyState) return;

    tbody.innerHTML = '';
    
    let allOrders = getOrders();
    
    // 1. تحدد الطلبات للتبويب الحالي (المعرض أو الكافيه) قبل أي شيء
    let sourceFilteredList = allOrders.filter(o => o.source === activeOrdersTab);

    // 2. توليد قائمة أنواع الطلبات الديناميكية بعد فلترة المصدر
    if (typeof populateOrderTypesDropdown === 'function') {
        populateOrderTypesDropdown(sourceFilteredList);
    }

    let list = sourceFilteredList;

    // 3. تطبيق الفلاتر الديناميكية (إن وجدت دوال الفلترة من filters.js)
    if (typeof searchOrders === 'function') {
        const query = document.getElementById('filter-search')?.value;
        list = searchOrders(list, query);
        
        const typeFilter = document.getElementById('filter-type')?.value;
        list = filterByType(list, typeFilter);
        
        const statusFilter = document.getElementById('filter-status')?.value;
        list = filterByStatus(list, statusFilter);
        
        const priorityFilter = document.getElementById('filter-priority')?.value;
        list = filterByPriority(list, priorityFilter);
        
        const dateFilter = document.getElementById('filter-date')?.value;
        list = filterByDate(list, dateFilter);
    }

    if (list.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    } else {
        emptyState.classList.add('hidden');
    }

    // ترتيب: قيد الانتظار أولاً، ثم المكتمل، ثم حسب التاريخ أو الـ id.
    list.sort((a, b) => {
        if (a.status === b.status) return b.id - a.id;
        return a.status === 'completed' ? 1 : -1;
    });

    list.forEach(order => {
        const isCompleted = order.status === 'completed';
        const daysDiff = calculateDaysSince(order.createdAt || order.date);
        
        let rowClass = isCompleted ? "bg-slate-50 opacity-60" : "hover:bg-slate-50 transition";
        let daysClass = "font-bold text-slate-600";
        let warningIcon = "";

        if (!isCompleted && daysDiff > 7) {
            rowClass = "bg-red-50 hover:bg-red-100 transition";
            daysClass = "font-black text-red-600";
            warningIcon = `<i class="fa-solid fa-triangle-exclamation text-red-500 ml-1"></i>`;
        } else if (isCompleted) {
             daysClass = "text-slate-400 line-through";
        }

        // Priority Badge
        let priorityBadge = '';
        if (order.priority === 'high') {
            priorityBadge = '<span class="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold">عاجلة</span>';
        } else if (order.priority === 'low') {
            priorityBadge = '<span class="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold">منخفضة</span>';
        } else {
            priorityBadge = '<span class="bg-blue-50 text-blue-600 px-2 py-1 rounded text-[10px] font-bold">متوسطة</span>';
        }

        // Status Badge
        let statusBadge = '';
        if (order.status === 'completed') {
            statusBadge = '<span class="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold">مكتمل</span>';
        } else if (order.status === 'in_progress') {
            statusBadge = '<span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold">قيد التنفيذ</span>';
        } else if (order.status === 'cancelled') {
            statusBadge = '<span class="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold">ملغي</span>';
        } else {
            statusBadge = '<span class="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-bold">بانتظار التنفيذ</span>';
        }

        const tr = document.createElement('tr');
        tr.className = rowClass;
        tr.innerHTML = `
            <td class="p-3 text-center">
                <button onclick="toggleOrderStatus(${order.id})" class="w-8 h-8 rounded-full flex items-center justify-center transition ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-300 hover:bg-green-50 hover:text-green-500'}">
                    <i class="fa-solid fa-check"></i>
                </button>
                <div class="mt-1">${statusBadge}</div>
            </td>
            <td class="p-3 font-mono font-bold text-slate-700 ${isCompleted ? 'line-through decoration-slate-400' : ''}">${order.title || order.number || 'بدون رقم'}</td>
            <td class="p-3 font-bold text-slate-800 ${isCompleted ? 'text-slate-500' : ''}">${order.description || order.company || 'غير محدد'}</td>
            <td class="p-3 text-xs w-28 wrap-text">
                <span class="px-2 py-1 rounded bg-white border border-slate-200 text-slate-600 block">${order.type}</span>
            </td>
            <td class="p-3 text-center">
                ${priorityBadge}
            </td>
            <td class="p-3 text-xs text-slate-500 wrap-text max-w-[150px]">${order.notes || '-'}</td>
            <td class="p-3 text-center text-slate-500 text-xs font-mono">${formatDateDisplay(order.createdAt || order.date)}</td>
            <td class="p-3 text-center text-slate-500 text-xs font-mono">${order.completedAt ? formatDateDisplay(order.completedAt) : '-'}</td>
            <td class="p-3 text-center ${daysClass}">
               ${daysDiff} يوم ${warningIcon}
            </td>
            <td class="p-3 text-center no-print">
                <button onclick="editOrder(${order.id})" class="text-blue-500 hover:text-blue-700 transition px-2 ml-1" title="تعديل">
                    <i class="fa-solid fa-edit"></i>
                </button>
                <button onclick="confirmAndDeleteOrder(${order.id})" class="text-slate-400 hover:text-red-500 transition px-2" title="حذف">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}
