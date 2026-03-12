// dashboard.js

/**
 * Calculates all analytical stats based on current orders.
 * Reads orders dynamically via getOrders() from orders-storage.js
 */
function calculateDashboardStats() {
    const orders = getOrders();
    
    let stats = {
        total: orders.length,
        inProgress: 0,
        completed: 0,
        pending: 0,
        urgent: 0
    };

    orders.forEach(order => {
        if (order.status === 'in_progress') Object.assign(stats, {inProgress: stats.inProgress + 1});
        else if (order.status === 'completed') Object.assign(stats, {completed: stats.completed + 1});
        else if (order.status === 'pending') Object.assign(stats, {pending: stats.pending + 1});
        // Note: cancelled orders are handled seamlessly by not adding to these specific counts 
        //   but still count toward total.

        if (order.priority === 'high' && order.status !== 'completed' && order.status !== 'cancelled') {
            Object.assign(stats, {urgent: stats.urgent + 1});
        }
    });

    return stats;
}

/**
 * Renders the initial layout and inserts calculated stats into the UI.
 * Call this primarily on initial load or manual refresh.
 */
function renderDashboard() {
    updateDashboard(); // We can directly proxy to updateDashboard for our specific UI layout pattern.
}

/**
 * Updates just the numeric text contents of existing dashboard widgets.
 * Call this effectively post addition/edition/deletion of order data.
 */
function updateDashboard() {
    const stats = calculateDashboardStats();
    
    // Total Orders count
    const totalEl = document.getElementById('stat-total-orders');
    const inProgressEl = document.getElementById('stat-in-progress');
    const completedEl = document.getElementById('stat-completed');
    
    // New Products and Inventory stats integration
    const dashInvCount = document.getElementById('dash-inv-count');
    if (dashInvCount && typeof ProductsStorage !== 'undefined') {
        dashInvCount.innerText = ProductsStorage.getAll().length;
    }
    
    const dashLowStockCount = document.getElementById('dash-exp-count'); // reusing this for low stock temporarily or dynamically
    if (dashLowStockCount && typeof InventoryEngine !== 'undefined') {
        dashLowStockCount.innerText = InventoryEngine.getLowStockProducts().length;
    }
    const pendingEl = document.getElementById('stat-pending');
    const urgentEl = document.getElementById('stat-urgent');

    if (totalEl) totalEl.innerText = stats.total;
    if (inProgressEl) inProgressEl.innerText = stats.inProgress;
    if (completedEl) completedEl.innerText = stats.completed;
    if (pendingEl) pendingEl.innerText = stats.pending;
    if (urgentEl) urgentEl.innerText = stats.urgent;
}
