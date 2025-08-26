// ES6 Module Import for Supabase
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Supabase Configuration
const supabaseUrl = 'https://mrujnqmedrlkdmzgkkix.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ydWpucW1lZHJsa2Rtemdra2l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxOTUwOTYsImV4cCI6MjA2OTc3MTA5Nn0.JKyiYfAYilL1Gnci2Aj-mDl1dSJ9QcPb13X76bQ8nFI';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Global variables
let isLoading = false;
let currentUser = null;

// Admin Panel Class
class KrystalAdmin {
    constructor() {
        this.init();
    }

    async init() {
        console.log('🚀 Krystal Admin Panel initialized with ES Modules');
        
        // Test Supabase connection
        await this.testSupabaseConnection();
        
        // Check if user is logged in (except on login page)
        if (!window.location.pathname.includes('login.html')) {
            await this.checkAuth();
        }
        
        // Initialize page-specific functionality
        const currentPage = window.location.pathname;
        
        if (currentPage.includes('login.html')) {
            this.initLogin();
        } else if (currentPage.includes('dashboard.html')) {
            this.initDashboard();
        } else if (currentPage.includes('add-product.html')) {
            this.initAddProduct();
        }
        
        // Listen for auth state changes
        supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event, session);
            
            if (event === 'SIGNED_OUT') {
                currentUser = null;
                if (!window.location.pathname.includes('login.html')) {
                    window.location.href = 'login.html';
                }
            } else if (event === 'SIGNED_IN' && session) {
                currentUser = session.user;
                console.log('✅ User signed in:', currentUser.email);
            }
        });
    }

    // Test Supabase Connection
    async testSupabaseConnection() {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('count', { count: 'exact', head: true });
            
            if (error) {
                console.error('❌ Supabase connection error:', error);
            } else {
                console.log('✅ Supabase connected successfully');
            }
        } catch (error) {
            console.error('❌ Supabase connection failed:', error);
        }
    }

    // Authentication Functions
    async checkAuth() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error('Auth check error:', error);
                window.location.href = 'login.html';
                return false;
            }
            
            if (!session) {
                console.log('No active session found');
                window.location.href = 'login.html';
                return false;
            }
            
            currentUser = session.user;
            console.log('✅ User authenticated:', currentUser.email);
            return true;
            
        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.href = 'login.html';
            return false;
        }
    }

    initLogin() {
        console.log('🔐 Initializing login page');
        
        const loginForm = document.getElementById('loginForm');
        const loginError = document.getElementById('loginError');
        
        if (!loginForm) {
            console.error('Login form not found');
            return;
        }
        
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('username')?.value;
            const password = document.getElementById('password')?.value;
            const submitBtn = e.target.querySelector('button[type="submit"]');
            
            if (!email || !password) {
                this.showLoginError('Please fill in all fields');
                return;
            }
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                this.showLoginError('Please enter a valid email address');
                return;
            }
            
            // Disable button during login
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Signing in...';
            }
            
            try {
                console.log('🔑 Attempting to sign in with:', email);
                
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });
                
                if (error) throw error;
                
                if (data.user) {
                    console.log('✅ Sign in successful:', data.user.email);
                    currentUser = data.user;
                    
                    this.showLoginSuccess('Login successful! Redirecting...');
                    
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                } else {
                    throw new Error('Login failed - no user returned');
                }
                
            } catch (error) {
                console.error('❌ Login error:', error);
                
                let errorMessage = 'Login failed. Please try again.';
                
                if (error.message.includes('Invalid login credentials')) {
                    errorMessage = 'Invalid email or password.';
                } else if (error.message.includes('Email not confirmed')) {
                    errorMessage = 'Please confirm your email address.';
                } else if (error.message.includes('Too many requests')) {
                    errorMessage = 'Too many attempts. Please wait.';
                }
                
                this.showLoginError(errorMessage);
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Login';
                }
            }
        });
        
        this.addPasswordResetLink();
    }

    showLoginError(message) {
        const loginError = document.getElementById('loginError');
        if (loginError) {
            loginError.textContent = message;
            loginError.style.display = 'block';
            loginError.style.backgroundColor = 'rgba(220, 20, 60, 0.2)';
            loginError.style.color = '#ff6b7a';
            
            setTimeout(() => {
                loginError.style.display = 'none';
            }, 5000);
        }
    }
    
    showLoginSuccess(message) {
        const loginError = document.getElementById('loginError');
        if (loginError) {
            loginError.textContent = message;
            loginError.style.display = 'block';
            loginError.style.backgroundColor = 'rgba(40, 167, 69, 0.2)';
            loginError.style.color = '#28a745';
        }
    }
    
    addPasswordResetLink() {
        const loginFooter = document.querySelector('.login-footer');
        if (loginFooter) {
            const resetLink = document.createElement('div');
            resetLink.innerHTML = `
                <a href="#" id="forgotPasswordLink" style="color: #457bbf; text-decoration: none; font-size: 0.9rem; margin-top: 1rem; display: block; text-align: center;">
                    Forgot your password?
                </a>
            `;
            loginFooter.appendChild(resetLink);
            
            document.getElementById('forgotPasswordLink').addEventListener('click', async (e) => {
                e.preventDefault();
                
                const email = document.getElementById('username')?.value;
                if (!email) {
                    alert('Please enter your email address first');
                    return;
                }
                
                if (!confirm(`Send password reset link to ${email}?`)) return;
                
                try {
                    const { error } = await supabase.auth.resetPasswordForEmail(email);
                    if (error) throw error;
                    alert('Password reset link sent!');
                } catch (error) {
                    console.error('Password reset error:', error);
                    alert('Error sending reset email.');
                }
            });
        }
    }

    async logout() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) console.error('Logout error:', error);
            console.log('✅ User logged out');
        } catch (error) {
            console.error('Logout failed:', error);
        }
        
        currentUser = null;
        window.location.href = 'login.html';
    }

    initDashboard() {
        console.log('📊 Initializing dashboard');
        
        this.initMobileMenu();
        this.loadDashboardStats();
        this.loadProducts();
        this.displayUserInfo();
        
        // Global logout handler
        document.addEventListener('click', (e) => {
            if (e.target.id === 'logoutBtn') {
                e.preventDefault();
                if (confirm('Are you sure you want to logout?')) {
                    this.logout();
                }
            }
        });
    }

    displayUserInfo() {
        if (currentUser) {
            const welcomeSection = document.querySelector('.welcome-section h1');
            if (welcomeSection) {
                welcomeSection.textContent = `Welcome, ${currentUser.email}`;
            }
        }
    }

    initMobileMenu() {
        const mobileToggle = document.getElementById('mobileMenuToggle');
        const adminMenu = document.getElementById('adminMenu');
        
        if (!mobileToggle || !adminMenu) return;
        
        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileToggle.classList.toggle('active');
            adminMenu.classList.toggle('active');
        });
        
        document.addEventListener('click', (e) => {
            if (!mobileToggle.contains(e.target) && !adminMenu.contains(e.target)) {
                mobileToggle.classList.remove('active');
                adminMenu.classList.remove('active');
            }
        });
        
        adminMenu.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link') && window.innerWidth <= 768) {
                mobileToggle.classList.remove('active');
                adminMenu.classList.remove('active');
            }
        });
    }

    async loadDashboardStats() {
        try {
            console.log('📈 Loading dashboard stats');
            
            const [totalResult, corporateResult, personalResult, trophyResult] = await Promise.all([
                supabase.from('products').select('*', { count: 'exact', head: true }),
                supabase.from('products').select('*', { count: 'exact', head: true }).eq('category', 'corporate'),
                supabase.from('products').select('*', { count: 'exact', head: true }).eq('category', 'personalised'),
                supabase.from('products').select('*', { count: 'exact', head: true }).eq('category', 'trophies')
            ]);
            
            const stats = {
                total: totalResult.count || 0,
                corporate: corporateResult.count || 0,
                personal: personalResult.count || 0,
                trophies: trophyResult.count || 0
            };
            
            this.animateNumber('totalProducts', stats.total);
            this.animateNumber('corporateProducts', stats.corporate);
            this.animateNumber('personalProducts', stats.personal);
            this.animateNumber('trophyProducts', stats.trophies);
            
        } catch (error) {
            console.error('Error loading stats:', error);
            
            this.animateNumber('totalProducts', 0);
            this.animateNumber('corporateProducts', 0);
            this.animateNumber('personalProducts', 0);
            this.animateNumber('trophyProducts', 0);
        }
    }

    animateNumber(elementId, targetNumber) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        let current = 0;
        const increment = Math.ceil(targetNumber / 20) || 1;
        const timer = setInterval(() => {
            current += increment;
            if (current >= targetNumber) {
                current = targetNumber;
                clearInterval(timer);
            }
            element.textContent = current;
        }, 50);
    }

    async loadProducts() {
        const tbody = document.getElementById('productsTableBody');
        
        if (!tbody) {
            console.error('Products table body not found');
            return;
        }
        
        if (isLoading) return;
        isLoading = true;
        
        try {
            tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">Loading products...</td></tr>';
            
            const { data: products, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);
            
            if (error) throw error;
            
            if (!products || products.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">No products found</td></tr>';
                return;
            }
            
            tbody.innerHTML = products.map(product => {
                // Use actual image URL from database
                const imageUrl = product.image_url || this.createPlaceholderUrl(product.product_name, product.id);
                
                return `
                    <tr>
                        <td>
                            <div class="product-image-container">
                                <img src="${imageUrl}" 
                                     alt="${this.escapeHtml(product.product_name)}" 
                                     class="product-img"
                                     onload="this.classList.add('loaded')"
                                     onerror="this.src='https://via.placeholder.com/200x150/dc3545/ffffff?text=Error'"
                                     loading="lazy">
                            </div>
                        </td>
                        <td>${this.escapeHtml(product.product_name)}</td>
                        <td>${this.formatCategory(product.category)}</td>
                        <td class="${product.is_active ? 'status-active' : 'status-inactive'}">
                            ${product.is_active ? 'Active' : 'Inactive'}
                        </td>
                        <td>${this.formatDate(product.created_at)}</td>
                        <td>
                            <div class="action-buttons">
                                <button onclick="admin.editProduct(${product.id})" class="btn-sm btn-primary">Edit</button>
                                <button onclick="admin.toggleProductStatus(${product.id}, ${product.is_active})" class="btn-sm btn-secondary">
                                    ${product.is_active ? 'Disable' : 'Enable'}
                                </button>
                                <button onclick="admin.deleteProduct(${product.id})" class="btn-sm" style="background: #dc3545; color: white;">Delete</button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
            
        } catch (error) {
            console.error('❌ Error loading products:', error);
            tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">Error loading products. Please refresh.</td></tr>';
        } finally {
            isLoading = false;
        }
    }

    createPlaceholderUrl(productName, productId) {
        const encodedName = encodeURIComponent(productName.substring(0, 12));
        return `https://via.placeholder.com/400x300/1a2742/ffffff?text=${encodedName}`;
    }

    escapeHtml(text) {
        if (!text) return '';
        return text.replace(/[&<>"']/g, (m) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[m]);
    }

    formatCategory(category) {
        if (!category) return 'Unknown';
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    formatDate(dateString) {
        try {
            return new Date(dateString).toLocaleDateString('en-US', { 
                year: 'numeric', month: 'short', day: 'numeric' 
            });
        } catch (error) {
            return 'Invalid Date';
        }
    }

    async toggleProductStatus(id, currentStatus) {
        const newStatus = !currentStatus;
        const action = newStatus ? 'enable' : 'disable';
        
        if (!confirm(`Are you sure you want to ${action} this product?`)) return;
        
        try {
            const { error } = await supabase
                .from('products')
                .update({ is_active: newStatus })
                .eq('id', id);
            
            if (error) throw error;
            
            alert(`Product ${action}d successfully!`);
            this.loadProducts();
            this.loadDashboardStats();
            
        } catch (error) {
            console.error('Error updating product status:', error);
            alert('Error updating product status.');
        }
    }

    async deleteProduct(id) {
        if (!confirm('Are you sure you want to delete this product? This cannot be undone.')) return;
        
        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            
            alert('Product deleted successfully!');
            this.loadProducts();
            this.loadDashboardStats();
            
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error deleting product.');
        }
    }

    editProduct(id) {
        alert(`Edit product ID: ${id}\n\nEdit functionality coming soon!`);
    }

    initAddProduct() {
        console.log('➕ Initializing add product page');
        
        this.initMobileMenu();
        this.displayUserInfo();
        
        const form = document.getElementById('addProductForm');
        if (!form) {
            console.error('Add product form not found');
            return;
        }
        
        form.addEventListener('submit', (e) => this.handleProductSubmit(e));
        
        const imageInput = document.getElementById('productImage');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        }
        
        const removeImageBtn = document.getElementById('removeImage');
        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', () => this.removeImage());
        }
        
        const uploadArea = document.getElementById('imageUploadArea');
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
            uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        }
        
        // Global logout handler
        document.addEventListener('click', (e) => {
            if (e.target.id === 'logoutBtn') {
                e.preventDefault();
                if (confirm('Are you sure you want to logout?')) {
                    this.logout();
                }
            }
        });
    }

    async handleProductSubmit(e) {
        e.preventDefault();
        
        if (isLoading) return;
        isLoading = true;
        
        const form = e.target;
        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        
        try {
            const formData = new FormData(form);
            const productName = formData.get('product_name');
            const category = formData.get('category');
            const imageFile = formData.get('image');
            const isActive = formData.get('is_active') === 'true';
            
            if (!productName || !category) {
                throw new Error('Please fill in all required fields');
            }
            
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
            submitBtn.disabled = true;
            
            let imageUrl = null;
            
            if (imageFile && imageFile.size > 0) {
                try {
                    const fileExt = imageFile.name.split('.').pop();
                    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                    const filePath = `products/${fileName}`;
                    
                    console.log('📤 Uploading image:', fileName);
                    
                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('product-images')
                        .upload(filePath, imageFile);
                    
                    if (uploadError) {
                        console.error('❌ Image upload error:', uploadError);
                        throw new Error('Image upload failed: ' + uploadError.message);
                    }
                    
                    const { data: urlData } = supabase.storage
                        .from('product-images')
                        .getPublicUrl(filePath);
                    
                    if (urlData?.publicUrl) {
                        imageUrl = urlData.publicUrl;
                        console.log('✅ Image uploaded:', imageUrl);
                    } else {
                        throw new Error('Failed to get public URL');
                    }
                } catch (error) {
                    console.error('❌ Image upload process failed:', error);
                    throw error;
                }
            } else {
                imageUrl = this.createPlaceholderUrl(productName, Date.now());
                console.log('ℹ️ No image provided, using placeholder');
            }
            
            const productData = {
                product_name: productName.trim(),
                category: category,
                image_url: imageUrl,
                is_active: isActive,
                created_at: new Date().toISOString()
            };
            
            console.log('💾 Inserting product:', productData);
            
            const { data, error } = await supabase
                .from('products')
                .insert([productData])
                .select();
            
            if (error) throw error;
            
            console.log('✅ Product added successfully:', data);
            this.showFormMessage('Product added successfully!', 'success');
            this.resetForm();
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
            
        } catch (error) {
            console.error('❌ Error adding product:', error);
            this.showFormMessage(error.message, 'error');
        } finally {
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
            isLoading = false;
        }
    }

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                e.target.value = '';
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file');
                e.target.value = '';
                return;
            }
            
            this.displayImagePreview(file);
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.style.borderColor = '#C5282F';
        e.currentTarget.style.background = 'rgba(197, 40, 47, 0.02)';
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.currentTarget.style.borderColor = 'rgba(69, 123, 191, 0.5)';
        e.currentTarget.style.background = 'rgba(69, 123, 191, 0.05)';
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.style.borderColor = 'rgba(69, 123, 191, 0.5)';
        e.currentTarget.style.background = 'rgba(69, 123, 191, 0.05)';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                document.getElementById('productImage').files = files;
                this.displayImagePreview(file);
            } else {
                alert('Please drop a valid image file');
            }
        }
    }

    displayImagePreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewImg = document.getElementById('previewImg');
            const imagePreview = document.getElementById('imagePreview');
            const uploadPlaceholder = document.getElementById('uploadPlaceholder');
            
            if (previewImg && imagePreview && uploadPlaceholder) {
                previewImg.src = e.target.result;
                imagePreview.style.display = 'block';
                uploadPlaceholder.style.display = 'none';
            }
        };
        reader.readAsDataURL(file);
    }

    removeImage() {
        const imageInput = document.getElementById('productImage');
        const imagePreview = document.getElementById('imagePreview');
        const uploadPlaceholder = document.getElementById('uploadPlaceholder');
        
        if (imageInput) imageInput.value = '';
        if (imagePreview) imagePreview.style.display = 'none';
        if (uploadPlaceholder) uploadPlaceholder.style.display = 'block';
    }

    resetForm() {
        const form = document.getElementById('addProductForm');
        if (form) {
            form.reset();
            this.removeImage();
            this.hideFormMessage();
        }
    }

    showFormMessage(message, type) {
        const formMessage = document.getElementById('formMessage');
        if (formMessage) {
            formMessage.textContent = message;
            formMessage.className = `form-message ${type}`;
            formMessage.style.display = 'block';
            
            if (type !== 'success') {
                setTimeout(() => this.hideFormMessage(), 5000);
            }
        }
    }

    hideFormMessage() {
        const formMessage = document.getElementById('formMessage');
        if (formMessage) {
            formMessage.style.display = 'none';
        }
    }
}

// Global Functions for onclick handlers
window.refreshData = function() {
    if (window.admin) {
        window.admin.loadDashboardStats();
        window.admin.loadProducts();
    }
};

window.loadProducts = function() {
    if (window.admin) {
        window.admin.loadProducts();
    }
};

window.resetForm = function() {
    if (window.admin) {
        window.admin.resetForm();
    }
};

// Initialize Admin Panel
document.addEventListener('DOMContentLoaded', function() {
    window.admin = new KrystalAdmin();
});

// Error handling
window.addEventListener('error', function(e) {
    console.error('💥 JavaScript error:', e.error);
});


console.log('🎯 Krystal Admin JS with ES Modules loaded successfully');
