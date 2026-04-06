// Admin Panel JavaScript - Complete Working Version

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    // Check if admin is logged in
    const currentAdmin = JSON.parse(localStorage.getItem('currentAdmin') || 'null');
    
    // Get DOM elements
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    const adminLoginModal = document.getElementById('adminLoginModal');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminUserName = document.getElementById('adminUserName');
    
    if (!currentAdmin) {
        // Show login button and hide logout button
        if (adminLoginBtn) adminLoginBtn.style.display = 'block';
        if (adminLogoutBtn) adminLogoutBtn.style.display = 'none';
        if (adminUserName) adminUserName.textContent = 'Not Logged In';
        
        // Setup login modal
        if (adminLoginModal) {
            adminLoginModal.style.display = 'flex';
        }
        
        // Setup login form
        if (adminLoginForm) {
            adminLoginForm.addEventListener('submit', handleAdminLogin);
        }
        
        // Setup modal close button
        if (closeLoginModal) {
            closeLoginModal.addEventListener('click', () => {
                adminLoginModal.style.display = 'none';
            });
        }
        
        return;
    }
    
    // Admin is logged in - show dashboard
    if (adminLoginBtn) adminLoginBtn.style.display = 'none';
    if (adminLogoutBtn) adminLogoutBtn.style.display = 'block';
    if (adminLoginModal) adminLoginModal.style.display = 'none';
    if (adminUserName && currentAdmin.adminName) {
        adminUserName.textContent = currentAdmin.adminName;
    }
    
    // Initialize admin panel
    initializeAdminPanel();
});

// Handle Admin Login
function handleAdminLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Get admin users from localStorage
    const adminUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
    
    // Create default admin if none exist
    if (adminUsers.length === 0) {
        const defaultAdmin = {
            id: Date.now().toString(),
            adminName: 'Admin User',
            adminId: 'ADMIN001',
            password: 'admin123',
            createdAt: new Date().toISOString()
        };
        adminUsers.push(defaultAdmin);
        localStorage.setItem('adminUsers', JSON.stringify(adminUsers));
    }
    
    // Find admin user
    const adminUser = adminUsers.find(user => user.adminId === data.adminId && user.password === data.password);
    
    if (adminUser) {
        // Store current admin session
        localStorage.setItem('currentAdmin', JSON.stringify(adminUser));
        
        // Hide login modal and show dashboard
        const modal = document.getElementById('adminLoginModal');
        if (modal) modal.style.display = 'none';
        
        // Update UI
        const loginBtn = document.getElementById('adminLoginBtn');
        const logoutBtn = document.getElementById('adminLogoutBtn');
        const userName = document.getElementById('adminUserName');
        
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (userName) userName.textContent = adminUser.adminName;
        
        // Initialize dashboard
        initializeAdminPanel();
        
        showNotification('Admin login successful!', 'success');
    } else {
        showNotification('Invalid admin credentials!', 'error');
    }
}

// Handle Admin Signup
function handleAdminSignup(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    if (!validateAdminSignup(data)) {
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    
    try {
        // Store admin data in localStorage
        const adminUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
        
        // Check if admin ID already exists
        if (adminUsers.find(user => user.adminId === data.adminId)) {
            throw new Error('Admin ID already exists');
        }
        
        const newAdmin = {
            id: Date.now().toString(),
            adminName: data.adminName,
            adminId: data.adminId,
            email: data.email,
            phone: data.phone,
            department: data.department,
            password: data.password,
            createdAt: new Date().toISOString(),
            status: 'ACTIVE'
        };
        
        adminUsers.push(newAdmin);
        localStorage.setItem('adminUsers', JSON.stringify(adminUsers));
        
        submitBtn.classList.remove('loading');
        
        // Show success and redirect to admin panel
        showNotification('Admin account created successfully! You can now sign in.', 'success');
        
        // Redirect to admin panel after 2 seconds
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 2000);
        
    } catch (error) {
        submitBtn.classList.remove('loading');
        showNotification(error.message, 'error');
    }
}

// Validate Admin Signup
function validateAdminSignup(data) {
    if (!data.adminName || data.adminName.trim() === '') {
        showNotification('Please enter your full name', 'error');
        return false;
    }
    
    if (!data.adminId || data.adminId.trim() === '') {
        showNotification('Please enter an Employee ID', 'error');
        return false;
    }
    
    if (!data.email || data.email.trim() === '') {
        showNotification('Please enter your email address', 'error');
        return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showNotification('Please enter a valid email address', 'error');
        return false;
    }
    
    if (!data.phone || data.phone.trim() === '') {
        showNotification('Please enter your phone number', 'error');
        return false;
    }
    
    if (!data.department) {
        showNotification('Please select a department', 'error');
        return false;
    }
    
    if (!data.password || data.password.length < 6) {
        showNotification('Password must be at least 6 characters long', 'error');
        return false;
    }
    
    if (data.password !== data.confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return false;
    }
    
    return true;
}

// Initialize Admin Panel
function initializeAdminPanel() {
    // Load data from localStorage
    loadProducts();
    loadOrders();
    loadCustomers();
    updateDashboardStats();
    setupEventListeners();
}

// Load Products
function loadProducts() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No products found</td></tr>';
        return;
    }
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>
                <div class="product-image-preview">
                    <i class="fas fa-${product.image || 'box'}"></i>
                </div>
            </td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>
                <span class="status ${product.status}">${product.status}</span>
            </td>
            <td>
                <button class="action-btn edit-btn" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Load Orders
function loadOrders() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No orders found</td></tr>';
        return;
    }
    
    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${order.customer}</td>
            <td>
                <div class="order-items-summary">
                    <span class="items-count">${order.items.length} items</span>
                    <div class="items-preview">
                        ${order.items.slice(0, 2).map(item => `
                            <div class="item-preview">
                                <i class="fas fa-${item.image || 'box'}"></i>
                                <span>${item.name}</span>
                            </div>
                        `).join('')}
                        ${order.items.length > 2 ? `<div class="more-items">+${order.items.length - 2} more</div>` : ''}
                    </div>
                </div>
            </td>
            <td>$${order.total.toFixed(2)}</td>
            <td>
                <span class="status ${order.status}">${order.status}</span>
            </td>
            <td>${order.date}</td>
            <td>
                <button class="action-btn view-btn" onclick="viewOrderDetails(${order.id})">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Load Customers
function loadCustomers() {
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const customers = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No customers found</td></tr>';
        return;
    }
    
    customers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.id}</td>
            <td>${customer.name || customer.firstName + ' ' + customer.lastName}</td>
            <td>${customer.email}</td>
            <td>${customer.phone}</td>
            <td>${customer.orders || 0}</td>
            <td>$${(customer.totalSpent || 0).toFixed(2)}</td>
            <td>
                <button class="action-btn view-btn" onclick="viewCustomer(${customer.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn edit-btn" onclick="editCustomer(${customer.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Update Dashboard Stats
function updateDashboardStats() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const customers = JSON.parse(localStorage.getItem('users') || '[]');
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    
    const totalOrders = orders.length;
    const totalCustomers = customers.length;
    const totalProducts = products.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    
    // Update dashboard stats if elements exist
    const statElements = {
        totalOrders: document.querySelector('.stat-number'),
        totalCustomers: document.querySelector('.stat-number:nth-of-type(2)'),
        totalRevenue: document.querySelector('.stat-number:nth-of-type(3)'),
        pendingOrders: document.querySelector('.stat-number:nth-of-type(4)'),
        completedOrders: document.querySelector('.stat-number:nth-of-type(5)')
    };
    
    if (statElements.totalOrders) {
        statElements.totalOrders.textContent = totalOrders;
    }
    if (statElements.totalCustomers) {
        statElements.totalCustomers.textContent = totalCustomers;
    }
    if (statElements.totalRevenue) {
        statElements.totalRevenue.textContent = `$${totalRevenue.toFixed(2)}`;
    }
    if (statElements.pendingOrders) {
        statElements.pendingOrders.textContent = pendingOrders;
    }
    if (statElements.completedOrders) {
        statElements.completedOrders.textContent = completedOrders;
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.admin-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.dataset.section;
            
            // Update active nav
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show target section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
        });
    });
    
    // Product search
    const productSearch = document.getElementById('productSearch');
    if (productSearch) {
        productSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const products = JSON.parse(localStorage.getItem('products') || '[]');
            const filteredProducts = products.filter(p => 
                p.name.toLowerCase().includes(searchTerm) ||
                p.category.toLowerCase().includes(searchTerm)
            );
            renderFilteredProducts(filteredProducts);
        });
    }
    
    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            const category = e.target.value;
            const products = JSON.parse(localStorage.getItem('products') || '[]');
            const filteredProducts = category === 'all' 
                ? products 
                : products.filter(p => p.category === category);
            renderFilteredProducts(filteredProducts);
        });
    }
    
    // Logout functionality
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                // Clear admin session
                localStorage.removeItem('currentAdmin');
                // Reload page to show login
                window.location.reload();
            }
        });
    }
}

// Render Filtered Products
function renderFilteredProducts(filteredProducts) {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No products found</td></tr>';
        return;
    }
    
    filteredProducts.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>
                <div class="product-image-preview">
                    <i class="fas fa-${product.image || 'box'}"></i>
                </div>
            </td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>
                <span class="status ${product.status}">${product.status}</span>
            </td>
            <td>
                <button class="action-btn edit-btn" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Edit Product
function editProduct(productId) {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const product = products.find(p => p.id === productId);
    if (product) {
        const form = document.getElementById('productForm');
        if (form) {
            form.productId.value = product.id;
            form.productName.value = product.name;
            form.productCategory.value = product.category;
            form.productPrice.value = product.price;
            form.productStock.value = product.stock;
            form.productDescription.value = product.description || '';
            form.productStatus.value = product.status;
            form.productImage.value = product.image || '';
            
            openProductModal();
        }
    }
}

// Delete Product
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        let products = JSON.parse(localStorage.getItem('products') || '[]');
        products = products.filter(p => p.id !== productId);
        localStorage.setItem('products', JSON.stringify(products));
        
        showNotification('Product deleted successfully!', 'success');
        loadProducts();
        updateDashboardStats();
    }
}

// View Order Details
function viewOrderDetails(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.id === orderId);
    if (order) {
        alert(`Order Details:\n\nID: ${order.id}\nCustomer: ${order.customer}\nTotal: $${order.total}\nStatus: ${order.status}\nDate: ${order.date}\n\nItems:\n${order.items.map(item => `- ${item.name} ($${item.price})`).join('\n')}`);
    }
}

// View Customer Details  
function viewCustomer(customerId) {
    const customers = JSON.parse(localStorage.getItem('users') || '[]');
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
        alert(`Customer Details:\n\nID: ${customer.id}\nName: ${customer.name || customer.firstName + ' ' + customer.lastName}\nEmail: ${customer.email}\nPhone: ${customer.phone}\nOrders: ${customer.orders || 0}\nTotal Spent: $${(customer.totalSpent || 0).toFixed(2)}`);
    }
}

// Product Modal Functions
function openProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Notification System
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'admin-notification';
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#00b894' : '#ff4757'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 1001;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
