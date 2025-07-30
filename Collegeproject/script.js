document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables with Indian food items
    let products = [
        { id: 'VEG001', name: 'Paneer Butter Masala', price: 250, category: 'Main Course' },
        { id: 'VEG002', name: 'Dal Makhani', price: 200, category: 'Main Course' },
        { id: 'VEG003', name: 'Palak Paneer', price: 220, category: 'Main Course' },
        { id: 'VEG004', name: 'Chana Masala', price: 180, category: 'Main Course' },
        { id: 'VEG005', name: 'Aloo Gobi', price: 160, category: 'Main Course' },
        { id: 'NON001', name: 'Butter Chicken', price: 280, category: 'Main Course' },
        { id: 'NON002', name: 'Chicken Tikka Masala', price: 270, category: 'Main Course' },
        { id: 'STR001', name: 'Paneer Tikka', price: 220, category: 'Starters' },
        { id: 'STR002', name: 'Chicken 65', price: 240, category: 'Starters' },
        { id: 'BRD001', name: 'Butter Naan', price: 50, category: 'Breads' },
        { id: 'BRD002', name: 'Garlic Naan', price: 60, category: 'Breads' },
        { id: 'RIC001', name: 'Jeera Rice', price: 120, category: 'Rice' },
        { id: 'RIC002', name: 'Vegetable Biryani', price: 180, category: 'Rice' },
        { id: 'DES001', name: 'Gulab Jamun (2 pcs)', price: 80, category: 'Desserts' },
        { id: 'DES002', name: 'Rasmalai', price: 90, category: 'Desserts' },
        { id: 'BEV001', name: 'Mango Lassi', price: 70, category: 'Beverages' },
        { id: 'BEV002', name: 'Masala Chai', price: 40, category: 'Beverages' },
        { id: 'BEV003', name: 'Water', price: 5, category: 'Beverages' }
    ];
    
    let invoiceItems = [];
    let currentInvoiceNumber = 1001;
    
    // DOM Elements
    const customerName = document.getElementById('customer-name');
    const customerPhone = document.getElementById('customer-phone');
    const customerAddress = document.getElementById('customer-address');
    const productSearch = document.getElementById('product-search');
    const availableProducts = document.getElementById('available-products');
    const invoiceItemsTable = document.getElementById('invoice-items');
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    const invoiceNumberElement = document.getElementById('invoice-number');
    const invoiceDateElement = document.getElementById('invoice-date');
    
    // Buttons
    const newInvoiceBtn = document.getElementById('new-invoice');
    const printInvoiceBtn = document.getElementById('print-invoice');
    const addProductBtn = document.getElementById('add-product');
    const saveInvoiceBtn = document.getElementById('save-invoice');
    const clearInvoiceBtn = document.getElementById('clear-invoice');
    const saveProductBtn = document.getElementById('save-product');
    
    // Modal elements
    const productModal = document.getElementById('product-modal');
    const modalClose = document.querySelector('.close');
    const productCategory = document.getElementById('product-category');
    const paymentModal = document.getElementById('payment-modal');
    const closePaymentModal = document.querySelector('.close-payment');
    
    // Initialize the app
    init();
    
    function init() {
        // Set current date in Indian format
        const today = new Date();
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        invoiceDateElement.textContent = today.toLocaleDateString('en-IN', options);
        
        // Generate a new invoice number
        invoiceNumberElement.textContent = currentInvoiceNumber++;
        
        // Load products
        renderProducts(products);
        
        // Event listeners
        newInvoiceBtn.addEventListener('click', createNewInvoice);
        printInvoiceBtn.addEventListener('click', printInvoice);
        addProductBtn.addEventListener('click', openProductModal);
        saveInvoiceBtn.addEventListener('click', openPaymentModal);
        clearInvoiceBtn.addEventListener('click', clearInvoice);
        saveProductBtn.addEventListener('click', saveProduct);
        modalClose.addEventListener('click', closeProductModal);
        productSearch.addEventListener('input', filterProducts);
        closePaymentModal.addEventListener('click', closePaymentModalFunc);
        
        // Payment event listeners
        document.getElementById('cash-payment').addEventListener('click', processCashPayment);
        document.getElementById('upi-payment').addEventListener('click', processUPIPayment);
        document.getElementById('done-payment').addEventListener('click', completePayment);
        
        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === productModal) {
                closeProductModal();
            }
            if (event.target === paymentModal) {
                closePaymentModalFunc();
            }
        });
    }
    
    function renderProducts(productsToRender) {
        availableProducts.innerHTML = '';
        
        productsToRender.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>₹${product.price.toFixed(2)}</td>
                <td>${product.category}</td>
                <td><button class="add-to-invoice" data-id="${product.id}">Add</button></td>
            `;
            availableProducts.appendChild(row);
        });
        
        // Add event listeners to the new buttons
        document.querySelectorAll('.add-to-invoice').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                addProductToInvoice(productId);
            });
        });
    }
    
    function filterProducts() {
        const searchTerm = productSearch.value.toLowerCase();
        const filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) || 
            product.id.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
        renderProducts(filteredProducts);
    }
    
    function addProductToInvoice(productId) {
        const product = products.find(p => p.id === productId);
        
        if (!product) return;
        
        // Check if product is already in the invoice
        const existingItem = invoiceItems.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity++;
            existingItem.total = existingItem.quantity * existingItem.price;
        } else {
            // Add new item to invoice
            invoiceItems.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                total: product.price,
                category: product.category
            });
        }
        
        renderInvoiceItems();
        calculateTotals();
    }
    
    function renderInvoiceItems() {
        invoiceItemsTable.innerHTML = '';
        
        invoiceItems.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>₹${item.price.toFixed(2)}</td>
                <td>
                    <input type="number" min="1" value="${item.quantity}" class="quantity-input" 
                           data-index="${index}">
                </td>
                <td>₹${item.total.toFixed(2)}</td>
                <td><button class="remove-item" data-index="${index}">Remove</button></td>
            `;
            invoiceItemsTable.appendChild(row);
        });
        
        // Add event listeners to quantity inputs
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', function() {
                const index = parseInt(this.getAttribute('data-index'));
                const newQuantity = parseInt(this.value);
                
                if (newQuantity < 1) {
                    this.value = 1;
                    return;
                }
                
                invoiceItems[index].quantity = newQuantity;
                invoiceItems[index].total = newQuantity * invoiceItems[index].price;
                renderInvoiceItems();
                calculateTotals();
            });
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                invoiceItems.splice(index, 1);
                renderInvoiceItems();
                calculateTotals();
            });
        });
    }
    
    function calculateTotals() {
        const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
        const tax = subtotal * 0.05; // 5% GST
        const total = subtotal + tax;
        
        subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
        taxElement.textContent = `₹${tax.toFixed(2)}`;
        totalElement.textContent = `₹${total.toFixed(2)}`;
    }
    
    function createNewInvoice() {
        if (invoiceItems.length > 0 && !confirm('Are you sure you want to create a new bill? Current bill will be cleared.')) {
            return;
        }
        
        clearInvoice();
        invoiceNumberElement.textContent = currentInvoiceNumber++;
        
        const today = new Date();
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        invoiceDateElement.textContent = today.toLocaleDateString('en-IN', options);
    }
    
    function clearInvoice() {
        invoiceItems = [];
        customerName.value = '';
        customerPhone.value = '';
        customerAddress.value = '';
        renderInvoiceItems();
        calculateTotals();
    }
    
    function saveInvoice() {
        if (invoiceItems.length === 0) {
            alert('Please add at least one item to the bill!');
            return;
        }

        if (!customerName.value.trim()) {
            alert('Please enter customer name!');
            return;
        }

        const invoiceData = {
            invoiceNumber: invoiceNumberElement.textContent,
            date: invoiceDateElement.textContent,
            customer: {
                name: customerName.value,
                phone: customerPhone.value,
                address: customerAddress.value
            },
            items: invoiceItems,
            subtotal: parseFloat(subtotalElement.textContent.substring(1)),
            tax: parseFloat(taxElement.textContent.substring(1)),
            total: parseFloat(totalElement.textContent.substring(1))
        };

        console.log('Bill saved:', invoiceData);
        createNewInvoice();
    }
    
    function printInvoice() {
        if (invoiceItems.length === 0) {
            alert('No items in the bill to print!');
            return;
        }
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Bill ${invoiceNumberElement.textContent}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .invoice-header { margin-bottom: 20px; text-align: center; }
                        .restaurant-name { font-size: 24px; font-weight: bold; color: #cc3300; }
                        .customer-info { margin-bottom: 30px; border: 1px dashed #993300; padding: 10px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        th, td { border: 1px solid #993300; padding: 8px; text-align: left; }
                        th { background-color: #ffe6cc; }
                        .text-right { text-align: right; }
                        .totals { margin-left: auto; width: 300px; }
                        .thank-you { text-align: center; margin-top: 20px; font-style: italic; }
                        .footer { text-align: center; margin-top: 30px; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="invoice-header">
                        <div class="restaurant-name">INDIAN DELIGHTS RESTAURANT</div>
                        <div>123 Food Street, Mumbai - 400001</div>
                        <div>Phone: +91 9876543210 | GSTIN: 22ABCDE1234F1Z5</div>
                    </div>
                    
                    <div class="customer-info">
                        <div><strong>Bill #:</strong> ${invoiceNumberElement.textContent}</div>
                        <div><strong>Date:</strong> ${invoiceDateElement.textContent}</div>
                        <div><strong>Customer Name:</strong> ${customerName.value}</div>
                        <div><strong>Phone:</strong> ${customerPhone.value}</div>
                        <div><strong>Address:</strong> ${customerAddress.value}</div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Price (₹)</th>
                                <th>Qty</th>
                                <th>Total (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${invoiceItems.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>₹${item.price.toFixed(2)}</td>
                                    <td>${item.quantity}</td>
                                    <td>₹${item.total.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="totals">
                        <table>
                            <tr>
                                <td><strong>Subtotal:</strong></td>
                                <td>${subtotalElement.textContent}</td>
                            </tr>
                            <tr>
                                <td><strong>GST (5%):</strong></td>
                                <td>${taxElement.textContent}</td>
                            </tr>
                            <tr>
                                <td><strong>Total:</strong></td>
                                <td>${totalElement.textContent}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div class="thank-you">Thank you for dining with us!</div>
                    <div class="footer">
                        <div>** This is a computer generated bill **</div>
                        <div>** No signature required **</div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
    
    function openProductModal() {
        document.getElementById('product-id').value = '';
        document.getElementById('product-name').value = '';
        document.getElementById('product-price').value = '';
        productModal.style.display = 'block';
    }
    
    function closeProductModal() {
        productModal.style.display = 'none';
    }
    
    function saveProduct() {
        const id = document.getElementById('product-id').value.trim();
        const name = document.getElementById('product-name').value.trim();
        const price = parseFloat(document.getElementById('product-price').value);
        const category = productCategory.value;
        
        if (!id || !name || isNaN(price)) {
            alert('Please fill in all fields with valid values!');
            return;
        }
        
        if (price <= 0) {
            alert('Price must be positive!');
            return;
        }
        
        // Check if product ID already exists
        if (products.some(p => p.id === id)) {
            alert('Item code already exists!');
            return;
        }
        
        // Add new product
        products.push({
            id,
            name,
            price,
            category
        });
        
        renderProducts(products);
        closeProductModal();
    }
    
    // Payment Functions
    function openPaymentModal() {
        if (invoiceItems.length === 0) {
            alert('No items in the bill to pay!');
            return;
        }

        // Reset payment modal
        document.getElementById('upi-container').style.display = 'none';
        document.getElementById('payment-status').style.display = 'none';
        paymentModal.style.display = 'block';
    }

    function closePaymentModalFunc() {
        paymentModal.style.display = 'none';
    }

    function processCashPayment() {
        alert('Cash payment recorded successfully!');
        paymentModal.style.display = 'none';
        saveInvoice();
    }

    function processUPIPayment() {
        // Show UPI container
        document.getElementById('upi-container').style.display = 'block';
        
        // Update QR code with current total
        const totalAmount = totalElement.textContent.substring(1);
        document.getElementById('qr-code').innerHTML = `
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=shrinathshrimangale3006@oksbi&pn=Indian%20Delights%20Restaurant&am=${totalAmount}&cu=INR" alt="UPI QR Code">
        `;
        
        // Simulate payment processing (in real app, you'd integrate with UPI SDK)
        setTimeout(function() {
            document.getElementById('payment-status').style.display = 'block';
        }, 3000);
    }

    function completePayment() {
        paymentModal.style.display = 'none';
        saveInvoice();
    }
});