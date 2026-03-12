const STORAGE_KEY_SHIPMENTS = 'ims_shipments_data';

const ShipmentsStorage = {
    getAll: () => {
        const data = localStorage.getItem(STORAGE_KEY_SHIPMENTS);
        return data ? JSON.parse(data) : [];
    },
    saveAll: (list) => {
        localStorage.setItem(STORAGE_KEY_SHIPMENTS, JSON.stringify(list));
    },
    add: (item) => {
        const list = ShipmentsStorage.getAll();
        item.id = Date.now();
        item.createdAt = new Date().toISOString();
        item.tracking = [{ status: item.status || 'preparing', date: new Date().toISOString() }];
        list.push(item);
        ShipmentsStorage.saveAll(list);
        return item;
    },
    update: (id, data) => {
        const list = ShipmentsStorage.getAll();
        const index = list.findIndex(i => i.id === id);
        if (index > -1) {
            const oldStatus = list[index].status;
            list[index] = { ...list[index], ...data, updatedAt: new Date().toISOString() };
            
            if (!list[index].tracking) {
                list[index].tracking = [{ status: oldStatus || 'preparing', date: list[index].createdAt || new Date().toISOString() }];
            }
            if (data.status && data.status !== oldStatus) {
                list[index].tracking.push({ status: data.status, date: new Date().toISOString() });
            }

            // Trigger InventoryTransaction when status changes to 'arrived' or 'delivered'
            const newStatus = list[index].status;
            if (oldStatus !== newStatus && (newStatus === 'arrived' || newStatus === 'delivered')) {
                if (typeof InventoryEngine !== 'undefined' && list[index].items && Array.isArray(list[index].items)) {
                    list[index].items.forEach(item => {
                        if (item.productId && item.quantity) {
                            InventoryEngine.addTransaction(item.productId, 'purchase', Number(item.quantity), 'SHP-' + id, `تحديث الشحنة إلى ${newStatus}`);
                        }
                    });
                }
            }
            
            ShipmentsStorage.saveAll(list);
            return list[index];
        }
        return null;
    },
    delete: (id) => {
        let list = ShipmentsStorage.getAll();
        list = list.filter(i => i.id !== id);
        ShipmentsStorage.saveAll(list);
    },
    getById: (id) => {
        const list = ShipmentsStorage.getAll();
        return list.find(i => i.id === id);
    }
};
