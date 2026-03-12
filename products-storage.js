// products-storage.js

const PRODUCTS_STORAGE_KEY = 'ims_products_data_v1';

const ProductsStorage = {
    getAll: function() {
        const data = localStorage.getItem(PRODUCTS_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },
    
    saveAll: function(products) {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    },
    
    addProduct: function(product) {
        const products = this.getAll();
        product.id = 'PRD-' + Date.now().toString() + Math.random().toString(36).substr(2, 5);
        product.createdAt = new Date().toISOString();
        products.push(product);
        this.saveAll(products);
        if(typeof logActivity !== 'undefined') logActivity('add', 'product', product.name);
        return product;
    },
    
    updateProduct: function(id, updatedData) {
        const products = this.getAll();
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = { 
                ...products[index], 
                ...updatedData,
                updatedAt: new Date().toISOString()
            };
            this.saveAll(products);
            if(typeof logActivity !== 'undefined') logActivity('edit', 'product', products[index].name);
            return products[index];
        }
        return null;
    },

    deleteProduct: function(id) {
        let products = this.getAll();
        const match = products.find(p => p.id === id);
        if(match && typeof logActivity !== 'undefined') logActivity('delete', 'product', match.name);
        products = products.filter(p => p.id !== id);
        this.saveAll(products);
    },
    
    getProduct: function(id) {
        const products = this.getAll();
        return products.find(p => p.id === id) || null;
    }
};
