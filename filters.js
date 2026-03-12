// filters.js

let filterTimeout;

/**
 * دالة رئيسية لتطبيق جميع الفلاتر بعدหน่วง زمني بسيط (Debounce)
 * لتقليل عمليات إعادة رسم الجدول (Render) أثناء الكتابة السريعة
 */
function applyFilters() {
    clearTimeout(filterTimeout);
    filterTimeout = setTimeout(() => {
        // يتم استدعاء دالة renderOrdersTable من index.html
        if (typeof renderOrdersTable === 'function') {
            renderOrdersTable();
        }
    }, 150);
}

/**
 * فلتر البحث النصي الشامل
 */
function searchOrders(list, query) {
    if (!query) return list;
    const q = query.toLowerCase().trim();
    return list.filter(o => 
        (o.title && o.title.toLowerCase().includes(q)) ||
        (o.description && o.description.toLowerCase().includes(q)) ||
        (o.number && o.number.toLowerCase().includes(q)) ||
        (o.company && o.company.toLowerCase().includes(q)) ||
        (o.notes && o.notes.toLowerCase().includes(q))
    );
}

/**
 * فلتر نوع الطلب الدقيق
 */
function filterByType(list, type) {
    if (!type || type === 'all') return list;
    
    // مطابقة دقيقة وصارمة (Exact match) بين الحقل المخزن والمدخل في الفلتر متجاهلًا أي مسافات زائدة
    const targetType = type.trim().toLowerCase();
    
    return list.filter(o => {
       if (!o.type) return false;
       return o.type.trim().toLowerCase() === targetType;
    });
}

/**
 * فلتر الحالة
 */
function filterByStatus(list, status) {
    if (!status || status === 'all') return list;
    return list.filter(o => o.status === status);
}

/**
 * فلتر الأولوية
 */
function filterByPriority(list, priority) {
    if (!priority || priority === 'all') return list;
    return list.filter(o => o.priority === priority);
}

/**
 * فلتر التاريخ
 */
function filterByDate(list, dateFilter) {
    if (!dateFilter || dateFilter === 'all') return list;
    
    const now = new Date();
    now.setHours(0, 0, 0, 0); // توحيد الوقت لبداية اليوم
    
    return list.filter(o => {
        const orderDateRaw = o.createdAt || o.date;
        if (!orderDateRaw) return false;
        
        const orderDate = new Date(orderDateRaw);
        orderDate.setHours(0, 0, 0, 0);
        
        if (dateFilter === 'today') {
            return orderDate.getTime() === now.getTime();
        }
        if (dateFilter === 'week') {
            const diffTime = Math.abs(now - orderDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 7;
        }
        if (dateFilter === 'month') {
            return orderDate.getMonth() === now.getMonth() && 
                   orderDate.getFullYear() === now.getFullYear();
        }
        return true;
    });
}

/**
 * توليد الخيارات الديناميكية لقائمة الفلترة الخاصة بأنواع الطلبات
 * يتم استخلاص الأنواع من البيانات المخزنة مباشرة مع معالجة الاستثناءات والفراغات
 */
function populateOrderTypesDropdown(orders) {
    const typeSelect = document.getElementById('filter-type');
    if (!typeSelect) return;
    
    // الاحتفاظ بالقيمة المحددة حالياً حتى لا تتغير أثناء إعادة الرسم
    const currentVal = typeSelect.value;
    
    // استخراج الأنواع الفريدة من الطلبات الحالية (للتأكد من الاعتماد المطلق على orders_v2)
    const types = new Set();
    orders.forEach(o => {
        // نستخدم الترجمة المباشرة للأنواع الموجودة فعلياً سواء أكانت إنجليزية أو عربية
        if (o.type && o.type.trim() !== '') {
            types.add(o.type.trim());
        }
    });
    
    // إنشاء خيارات القائمة
    let html = '<option value="all">كل الأنواع</option>';
    
    // ترتيب الأنواع أبجدياً للتسهيل
    Array.from(types).sort().forEach(t => {
        html += `<option value="${t}">${t}</option>`;
    });
    
    typeSelect.innerHTML = html;
    
    // استعادة القيمة المحددة بعد التحديث، إذا كانت ضمن الأنواع الحالية
    if (types.has(currentVal) || currentVal === 'all') {
        typeSelect.value = currentVal;
    } else {
        // إذا كان النوع المحدد غير موجود (مثلاً تم مسح الطلب المرتبط به) نعود للكل
        typeSelect.value = 'all';
    }
}
