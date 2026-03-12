// inventory-engine.js

const TRANSACTIONS_STORAGE_KEY = 'ims_inventory_transactions_v1';

const InventoryEngine = {
    getAllTransactions: function() {
        const data = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    saveAllTransactions: function(transactions) {
        localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
    },

    // type can be: 'purchase', 'transfer', 'adjustment', 'sale'
    addTransaction: function(productId, type, quantity, referenceId = null, notes = '') {
        const transactions = this.getAllTransactions();
        const transaction = {
            id: 'TRX-' + Date.now().toString() + Math.random().toString(36).substr(2, 5),
            productId,
            type,
            quantity: Number(quantity), // Positive for incoming (purchase, positive adjustment), negative for outgoing (sale, negative adjustment)
            referenceId,
            notes,
            date: new Date().toISOString()
        };
        
        // Adjust signs conventionally if needed:
        if (type === 'sale' && transaction.quantity > 0) {
            transaction.quantity = -transaction.quantity;
        }

        transactions.push(transaction);
        this.saveAllTransactions(transactions);
        if(typeof logActivity !== 'undefined') logActivity('add', 'inventory_transaction', type);
        
        return transaction;
    },

    getProductStock: function(productId) {
        const transactions = this.getAllTransactions();
        const productTransactions = transactions.filter(t => t.productId === productId);
        return productTransactions.reduce((total, t) => total + t.quantity, 0);
    },

    getLowStockProducts: function() {
        if(typeof ProductsStorage === 'undefined') return [];
        const products = ProductsStorage.getAll();
        return products.filter(p => {
            const stock = this.getProductStock(p.id);
            return stock <= (Number(p.minStock) || 0);
        }).map(p => ({ ...p, currentStock: this.getProductStock(p.id) }));
    }
};
