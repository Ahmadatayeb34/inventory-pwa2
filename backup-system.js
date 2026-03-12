// backup-system.js

const BackupSystem = {
    exportData: function() {
        // Collect all data from localStorage
        const data = {
            orders: localStorage.getItem('ims_orders_data_v2'),
            suppliers: localStorage.getItem('ims_suppliers_data_v1'),
            shipments: localStorage.getItem('ims_shipments_data_v1'),
            products: localStorage.getItem('ims_products_data_v1'),
            inventory_transactions: localStorage.getItem('ims_inventory_transactions_v1')
        };
        
        let validDataStr = JSON.stringify(data);
        const blob = new Blob([validDataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    importData: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.orders) localStorage.setItem('ims_orders_data_v2', data.orders);
                    if (data.suppliers) localStorage.setItem('ims_suppliers_data_v1', data.suppliers);
                    if (data.shipments) localStorage.setItem('ims_shipments_data_v1', data.shipments);
                    if (data.products) localStorage.setItem('ims_products_data_v1', data.products);
                    if (data.inventory_transactions) localStorage.setItem('ims_inventory_transactions_v1', data.inventory_transactions);
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    }
};
