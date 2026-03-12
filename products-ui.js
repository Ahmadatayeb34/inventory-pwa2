// products-ui.js

const ProductsUI = {
    renderList: function() {
        const products = ProductsStorage.getAll();
        const listContainer = document.getElementById('products-list-tb');
        if (!listContainer) return;
        
        listContainer.innerHTML = '';
        products.forEach(p => {
            const stock = InventoryEngine.getProductStock(p.id);
            const lowStockIndicator = stock <= (Number(p.minStock) || 0) ? '<span class="text-danger ms-2">⚠ مخزون منخفض</span>' : '';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.sku || p.id}</td>
                <td>${p.name} ${lowStockIndicator}</td>
                <td>${p.category || 'عام'}</td>
                <td>${stock} ${p.unit || 'حبة'}</td>
                <td>${p.costPrice || 0}</td>
                <td>${p.salePrice || 0}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="ProductsUI.editProduct('${p.id}')">تعديل</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="ProductsUI.deleteProduct('${p.id}')">حذف</button>
                </td>
            `;
            listContainer.appendChild(tr);
        });
        
        this.renderInventoryReport(); // Update the report when products change
    },
    
    renderInventoryReport: function() {
        const reportContainer = document.getElementById('inventory-alerts-list');
        if (!reportContainer) return;
        
        const lowStock = InventoryEngine.getLowStockProducts();
        reportContainer.innerHTML = '';
        
        if (lowStock.length === 0) {
            reportContainer.innerHTML = '<div class="alert alert-success">جميع المخزونات بمستويات جيدة.</div>';
            return;
        }
        
        lowStock.forEach(p => {
            const div = document.createElement('div');
            div.className = 'alert alert-danger mb-2';
            div.innerHTML = `<strong>⚠ مخزون منخفض:</strong> ${p.name} - المتبقي ${p.currentStock} ${p.unit || ''} (الحد الأدنى: ${p.minStock})`;
            reportContainer.appendChild(div);
        });
    },

    saveProduct: function(event) {
        event.preventDefault();
        const form = event.target;
        const id = document.getElementById('product-id').value;
        const pData = {
            name: document.getElementById('product-name').value,
            sku: document.getElementById('product-sku').value,
            barcode: document.getElementById('product-barcode').value,
            category: document.getElementById('product-category').value,
            unit: document.getElementById('product-unit').value,
            costPrice: parseFloat(document.getElementById('product-cost-price').value),
            salePrice: parseFloat(document.getElementById('product-sale-price').value),
            minStock: parseFloat(document.getElementById('product-min-stock').value)
        };
        
        if (id) {
            ProductsStorage.updateProduct(id, pData);
        } else {
            ProductsStorage.addProduct(pData);
        }
        
        form.reset();
        document.getElementById('product-id').value = '';
        this.renderList();
        
        const modalEl = document.getElementById('productModal');
        if (modalEl && typeof bootstrap !== 'undefined') {
            const modal = bootstrap.Modal.getInstance(modalEl);
            if(modal) modal.hide();
        }
    },
    
    editProduct: function(id) {
        const p = ProductsStorage.getProduct(id);
        if(!p) return;
        document.getElementById('product-id').value = p.id;
        document.getElementById('product-name').value = p.name || '';
        document.getElementById('product-sku').value = p.sku || '';
        document.getElementById('product-barcode').value = p.barcode || '';
        document.getElementById('product-category').value = p.category || '';
        document.getElementById('product-unit').value = p.unit || '';
        document.getElementById('product-cost-price').value = p.costPrice || '';
        document.getElementById('product-sale-price').value = p.salePrice || '';
        document.getElementById('product-min-stock').value = p.minStock || '';
        
        const modalEl = document.getElementById('productModal');
        if (modalEl && typeof bootstrap !== 'undefined') {
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        }
    },
    
    deleteProduct: function(id) {
        if(confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
            ProductsStorage.deleteProduct(id);
            this.renderList();
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    const pForm = document.getElementById('product-form');
    if(pForm) pForm.addEventListener('submit', (e) => ProductsUI.saveProduct(e));
});
