// suppliers-storage.js

const SUPPLIERS_STORAGE_KEY = 'ims_suppliers_data_v1';

const SuppliersStorage = {
    getAll: function() {
        const data = localStorage.getItem(SUPPLIERS_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },
    
    saveAll: function(suppliers) {
        localStorage.setItem(SUPPLIERS_STORAGE_KEY, JSON.stringify(suppliers));
    },
    
    addSupplier: function(supplier) {
        const suppliers = this.getAll();
        supplier.id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
        supplier.createdAt = new Date().toISOString();
        suppliers.push(supplier);
        this.saveAll(suppliers);
        if(typeof logActivity !== 'undefined') logActivity('add', 'supplier', supplier.name);
        return supplier;
    },
    
    updateSupplier: function(id, updatedData) {
        const suppliers = this.getAll();
        const index = suppliers.findIndex(s => s.id === id);
        if (index !== -1) {
            suppliers[index] = { 
                ...suppliers[index], 
                ...updatedData,
                updatedAt: new Date().toISOString()
            };
            this.saveAll(suppliers);
            if(typeof logActivity !== 'undefined') logActivity('edit', 'supplier', suppliers[index].name);
            return suppliers[index];
        }
        return null;
    },

    deleteSupplier: function(id) {
        let suppliers = this.getAll();
        const match = suppliers.find(s => s.id === id);
        if(match && typeof logActivity !== 'undefined') logActivity('delete', 'supplier', match.name);
        suppliers = suppliers.filter(s => s.id !== id);
        this.saveAll(suppliers);
    },
    
    getSupplier: function(id) {
        const suppliers = this.getAll();
        return suppliers.find(s => s.id === id) || null;
    }
};
