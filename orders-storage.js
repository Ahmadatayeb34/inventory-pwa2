// orders-storage.js

const STORAGE_KEY_V2 = 'orders_v2';
const OLD_STORAGE_KEY = 'ims_orders_data_v2'; // The one currently in index.html

/**
 * Migrate old data if exists.
 */
function runOrdersMigration() {
    const oldDataRaw = localStorage.getItem(OLD_STORAGE_KEY);
    const newDataRaw = localStorage.getItem(STORAGE_KEY_V2);

    // If already migrated, do nothing
    if (newDataRaw) return;

    if (oldDataRaw) {
        try {
            const oldData = JSON.parse(oldDataRaw);
            let migratedOrders = [];

            const mapOldOrder = (o, source) => ({
                id: o.id || Date.now(),
                source: source, // 'showroom' or 'cafe', to keep tabs working without breaking
                type: o.type || 'غير محدد',
                title: o.number || o.title || 'بدون رقم',
                description: o.company || o.description || '',
                status: o.status === 'completed' ? 'completed' : 'pending',
                priority: 'medium', // default
                createdAt: o.date || new Date().toISOString().split('T')[0],
                completedAt: o.status === 'completed' ? (o.date || new Date().toISOString().split('T')[0]) : null,
                notes: o.notes || '',
                // Keep old keys just in case during transition
                number: o.number,
                company: o.company
            });

            if (oldData.showroom && Array.isArray(oldData.showroom)) {
                migratedOrders.push(...oldData.showroom.map(o => mapOldOrder(o, 'showroom')));
            }
            if (oldData.cafe && Array.isArray(oldData.cafe)) {
                migratedOrders.push(...oldData.cafe.map(o => mapOldOrder(o, 'cafe')));
            }

            localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(migratedOrders));
            console.log('Successfully migrated to orders_v2');
        } catch (e) {
            console.error('Error during data migration:', e);
        }
    } else {
        // Initialize empty array if no old data
        localStorage.setItem(STORAGE_KEY_V2, JSON.stringify([]));
    }
}

/**
 * Get all orders
 */
function getOrders() {
    runOrdersMigration();
    const data = localStorage.getItem(STORAGE_KEY_V2);
    try {
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

/**
 * Save orders to localStorage
 */
function saveOrders(ordersList) {
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(ordersList));
}

/**
 * Add a new order
 */
function addOrder(orderData) {
    const orders = getOrders();
    const newOrder = {
        id: Date.now(),
        type: orderData.type || '',
        title: orderData.title || '',
        description: orderData.description || '',
        status: orderData.status || 'pending',
        priority: orderData.priority || 'medium',
        createdAt: orderData.createdAt || new Date().toISOString().split('T')[0],
        completedAt: null,
        notes: orderData.notes || '',
        source: orderData.source || 'showroom',
        // Also add mapping for old fields to avoid breaking the UI during this stage
        number: orderData.title,
        company: orderData.description
    };
    orders.unshift(newOrder);
    saveOrders(orders);
    return newOrder;
}

/**
 * Update an existing order
 */
function updateOrder(id, updatedData) {
    const orders = getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
        orders[index] = { ...orders[index], ...updatedData };
        // Sync old UI mappings
        if (updatedData.title) orders[index].number = updatedData.title;
        if (updatedData.description) orders[index].company = updatedData.description;
        
        saveOrders(orders);
        return orders[index];
    }
    return null;
}

/**
 * Delete an order
 */
function deleteOrder(id) {
    const orders = getOrders();
    const filtered = orders.filter(o => o.id !== id);
    saveOrders(filtered);
}

/**
 * Update order status specifically
 */
function updateOrderStatus(id, newStatus) {
    const orders = getOrders();
    const order = orders.find(o => o.id === id);
    if (order) {
        order.status = newStatus;
        if (newStatus === 'completed') {
            order.completedAt = new Date().toISOString().split('T')[0];
        } else {
            order.completedAt = null;
        }
        saveOrders(orders);
        return order;
    }
    return null;
}

// Ensure migration runs on load
runOrdersMigration();