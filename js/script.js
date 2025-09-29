/**
 * MEGA PROJECT - MAIN JAVASCRIPT FILE
 * Modern ES6+ implementation with comprehensive functionality
 * Handles dashboard, login, API interactions, and UI enhancements
 */

// ===================================================================
// GLOBAL CONFIGURATION & CONSTANTS
// ===================================================================
const CONFIG = {
    API_BASE_URL: 'http://localhost:8080/api',
    ENDPOINTS: {
        LOGIN: 'http://localhost:8080/api/auth/login',
        LOGOUT: 'http://localhost:8080/api/auth/logout',
        USER_INFO: 'http://localhost:8080/api/user',
        SYSTEMS: 'http://localhost:8080/api/systems',
        USERS_BY_SYSTEM: 'http://localhost:8080/api/users/system'
    },
    STORAGE_KEYS: {
        USER_SESSION: 'megaproject_session',
        REMEMBER_ME: 'megaproject_remember',
        SYSTEMS: 'megaproject_systems'
    },
    ANIMATIONS: {
        DURATION: 300,
        DELAY_INCREMENT: 100
    }
};



// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================
class Utils {
    /**
     * Debounce function to limit API calls
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Get URL parameters
     */
    static getUrlParams() {
        return new URLSearchParams(window.location.search);
    }

    /**
     * Show notification/alert
     */
    static showAlert(element, message, type = 'danger', duration = 5000) {
        if (!element) return;

        const iconMap = {
            success: 'fas fa-check-circle',
            danger: 'fas fa-exclamation-triangle',
            warning: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };

        element.className = `alert alert-${type}`;
        element.innerHTML = `
            <i class="${iconMap[type]} me-2"></i>
            ${message}
        `;
        element.classList.remove('d-none');

        if (duration > 0) {
            setTimeout(() => {
                element.classList.add('d-none');
            }, duration);
        }
    }

    /**
     * Validate email format
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Simulate API delay for realistic UX
     */
    static async simulateApiDelay(min = 500, max = 1500) {
        const delay = Math.random() * (max - min) + min;
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    /**
     * Local storage helper
     */
    static storage = {
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Storage set error:', error);
                return false;
            }
        },

        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Storage get error:', error);
                return defaultValue;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Storage remove error:', error);
                return false;
            }
        }
    };
}

// ===================================================================
// API SERVICE CLASS
// ===================================================================
class ApiService {
    /**
     * Get authentication headers
     */
    static getAuthHeaders() {
        const session = Utils.storage.get(CONFIG.STORAGE_KEYS.USER_SESSION);
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
        
        if (session && session.access_token) {
            headers['Authorization'] = `${session.token_type || 'Bearer'} ${session.access_token}`;
        }
        
        return headers;
    }

    /**
     * Get current user info
     */
    static async getUserInfo() {
        try {
            const response = await fetch(CONFIG.ENDPOINTS.USER_INFO, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to get user info');
            }

            const data = await response.json();
            return { success: true, data: data.user };
        } catch (error) {
            console.error('Get user info error:', error);
            return { 
                success: false, 
                error: error.message || 'Failed to get user information.',
                data: null
            };
        }
    }

    /**
     * Get all systems (filtered by user access)
     */
    static async getSystems() {
        try {
            // Check cache first
            const cached = Utils.storage.get(CONFIG.STORAGE_KEYS.SYSTEMS);
            if (cached && cached.timestamp > Date.now() - 5 * 60 * 1000) { // 5 minutes cache
                return { success: true, data: cached.data };
            }

            const response = await fetch(CONFIG.ENDPOINTS.SYSTEMS, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to get systems');
            }

            const data = await response.json();
            
            // Get user session to filter accessible systems
            const userSession = Utils.storage.get(CONFIG.STORAGE_KEYS.USER_SESSION);
            let filteredSystems = data.systems;
            
            if (userSession && userSession.system_id) {
                // Filter systems based on user's system_id array
                filteredSystems = data.systems.filter(system => 
                    userSession.system_id.includes(system.id)
                );
            }

            // Cache the filtered results
            Utils.storage.set(CONFIG.STORAGE_KEYS.SYSTEMS, {
                data: filteredSystems,
                timestamp: Date.now()
            });

            return { success: true, data: filteredSystems };
        } catch (error) {
            console.error('Get systems error:', error);
            return { 
                success: false, 
                error: error.message || 'Failed to load systems.',
                data: []
            };
        }
    }

    /**
     * Get users by system ID
     */
    static async getUsersBySystem(systemId) {
        try {
            const response = await fetch(`${CONFIG.ENDPOINTS.USERS_BY_SYSTEM}/${systemId}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to get users');
            }

            const data = await response.json();
            return { success: true, data: data.users };
        } catch (error) {
            console.error('Get users by system error:', error);
            return { 
                success: false, 
                error: error.message || 'Failed to load users.',
                data: []
            };
        }
    }

    /**
     * Logout user
     */
    static async logoutUser() {
        try {
            const response = await fetch(CONFIG.ENDPOINTS.LOGOUT, {
                method: 'POST',
                headers: this.getAuthHeaders()
            });

            // Clear local storage regardless of response
            Utils.storage.remove(CONFIG.STORAGE_KEYS.USER_SESSION);
            Utils.storage.remove(CONFIG.STORAGE_KEYS.SYSTEMS);

            if (!response.ok) {
                console.warn('Logout API call failed, but local session cleared');
                return { success: true, message: 'Logged out successfully' };
            }

            const data = await response.json();
            return { success: true, message: data.message || 'Logged out successfully' };
        } catch (error) {
            // Even if API call fails, clear local session
            Utils.storage.remove(CONFIG.STORAGE_KEYS.USER_SESSION);
            Utils.storage.remove(CONFIG.STORAGE_KEYS.SYSTEMS);
            
            console.error('Logout error:', error);
            return { 
                success: true, // Still return success since local session is cleared
                message: 'Logged out successfully'
            };
        }
    }

    /**
     * Login user
     */
    static async loginUser(credentials) {
        try {
            const { name, password } = credentials;
            
            if (!name || !password) {
                throw new Error('All fields are required');
            }

            if (name.length < 2) {
                throw new Error('Name must be at least 2 characters');
            }

            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            // Real API call
            const response = await fetch(CONFIG.ENDPOINTS.LOGIN, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    password: password
                })
            });

            if (!response.ok) {
                let errorMessage = 'Login failed';
                
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // If response is not JSON, use status text
                    errorMessage = response.statusText || errorMessage;
                }
                
                throw new Error(errorMessage);
            }

            const data = await response.json();

            // Store session data from API response
            const userData = {
                id: data.user.id,
                name: data.user.name,
                email: data.user.email,
                system_id: data.user.system_id,
                permission_id: data.user.permission_id,
                access_token: data.access_token,
                token_type: data.token_type,
                created_at: data.user.created_at,
                updated_at: data.user.updated_at
            };

            // Store session data
            if (credentials.rememberMe) {
                Utils.storage.set(CONFIG.STORAGE_KEYS.REMEMBER_ME, {
                    name: name
                });
            }

            Utils.storage.set(CONFIG.STORAGE_KEYS.USER_SESSION, userData);

            return { 
                success: true, 
                data: userData,
                message: data.message || 'Login successful! Redirecting to dashboard...'
            };

        } catch (error) {
            console.error('Login error:', error);
            
            let errorMessage = error.message || 'Login failed. Please check your credentials.';
            
            // Handle specific error types
            if (error instanceof TypeError && error.message.includes('fetch')) {
                errorMessage = 'Connection failed. Please check if the server is running on http://localhost:8080';
            } else if (error.message.includes('CORS')) {
                errorMessage = 'CORS error. Please ensure the API server allows cross-origin requests.';
            } else if (error.message.includes('NetworkError')) {
                errorMessage = 'Network error. Please check your internet connection.';
            }
            
            return { 
                success: false, 
                error: errorMessage,
                data: null
            };
        }
    }
}

// ===================================================================
// DASHBOARD FUNCTIONALITY
// ===================================================================
class Dashboard {
    constructor() {
        this.systemsGrid = document.getElementById('departmentsGrid') || document.getElementById('systemsGrid');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.errorMessage = document.getElementById('errorMessage');
        this.searchInput = document.getElementById('searchInput');
        this.currentUsernameSpan = document.getElementById('currentUsername');
        this.userRoleSpan = document.getElementById('userRole');
        this.logoutBtn = document.getElementById('logoutButton');
        
        this.systems = [];
        this.filteredSystems = [];
        this.currentUser = null;
        
        this.init();
    }

    async init() {
        try {
            // Check if user is authenticated
            if (!this.isAuthenticated()) {
                this.redirectToLogin();
                return;
            }

            this.setupEventListeners();
            this.updateCopyright();
            await this.loadUserInfo();
            await this.loadSystems();
        } catch (error) {
            console.error('Dashboard initialization error:', error);
            this.showError('Failed to initialize dashboard');
        }
    }

    isAuthenticated() {
        const session = Utils.storage.get(CONFIG.STORAGE_KEYS.USER_SESSION);
        return session && session.access_token;
    }

    redirectToLogin() {
        window.location.href = 'login.html';
    }

    setupEventListeners() {
        // Search functionality
        if (this.searchInput) {
            const debouncedSearch = Utils.debounce(this.handleSearch.bind(this), 300);
            this.searchInput.addEventListener('input', debouncedSearch);
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleSearch();
                }
            });
        }

        // Logout functionality
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }

        // Navigation links smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', this.handleSmoothScroll);
        });
    }

    async loadUserInfo() {
        try {
            const result = await ApiService.getUserInfo();
            
            if (result.success) {
                this.currentUser = result.data;
                this.displayUserInfo();
            } else {
                console.error('Failed to load user info:', result.error);
                // If user info fails, might be authentication issue
                this.redirectToLogin();
            }
        } catch (error) {
            console.error('Error loading user info:', error);
            this.redirectToLogin();
        }
    }

    displayUserInfo() {
        if (!this.currentUser) return;

        // Update username in navbar dropdown
        if (this.currentUsernameSpan) {
            this.currentUsernameSpan.textContent = this.currentUser.name;
        }

        // Update user role information
        if (this.userRoleSpan) {
            const systemCount = this.currentUser.system_id ? this.currentUser.system_id.length : 0;
            const permissionCount = this.currentUser.permission_id ? this.currentUser.permission_id.length : 0;
            this.userRoleSpan.textContent = `الأنظمة: ${systemCount} | الصلاحيات: ${permissionCount}`;
        }
    }

    async handleLogout() {
        try {
            const confirmLogout = confirm('هل تريد تسجيل الخروج من النظام؟');
            if (!confirmLogout) return;

            // Show loading state
            if (this.logoutBtn) {
                this.logoutBtn.disabled = true;
                this.logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>جاري تسجيل الخروج...';
            }

            const result = await ApiService.logoutUser();
            
            if (result.success) {
                // Redirect to login page
                window.location.href = 'login.html?message=' + encodeURIComponent(result.message);
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Even if logout fails, redirect to login
            window.location.href = 'login.html';
        }
    }

    async loadSystems() {
        try {
            this.showLoading(true);
            this.hideError();

            const result = await ApiService.getSystems();
            
            if (result.success) {
                this.systems = result.data;
                this.filteredSystems = [...this.systems];
                this.renderSystems();
                
                // Show message if no systems accessible
                if (result.data.length === 0) {
                    this.showError('لا توجد أنظمة متاحة مع صلاحياتك الحالية. يرجى الاتصال بالمشرف.');
                } else {
                    // Add visual indicator for accessible systems
                    const permissionInfo = document.getElementById('permissionInfo');
                    const permissionText = document.getElementById('permissionText');
                    if (permissionInfo && permissionText) {
                        const userName = this.currentUser ? this.currentUser.name : 'المستخدم';
                        permissionText.textContent = 
                            `مرحباً ${userName}، يتم عرض ${result.data.length} نظام متاح لك بناءً على صلاحياتك.`;
                        permissionInfo.classList.remove('d-none');
                    }
                }
            } else {
                this.showError(result.error);
            }
        } catch (error) {
            console.error('Error loading systems:', error);
            this.showError('فشل في تحميل الأنظمة');
        } finally {
            this.showLoading(false);
        }
    }

    renderSystems() {
        if (!this.systemsGrid) return;

        if (this.filteredSystems.length === 0) {
            this.systemsGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-search text-muted" style="font-size: 3rem;"></i>
                    <h3 class="mt-3 text-muted">لم يتم العثور على أنظمة</h3>
                    <p class="text-muted">جرب تعديل معايير البحث</p>
                </div>
            `;
            return;
        }

        const cardsHtml = this.filteredSystems.map((system, index) => 
            this.createSystemCard(system, index)
        ).join('');

        this.systemsGrid.innerHTML = cardsHtml;

        // Add click event listeners to cards
        this.setupCardClickListeners();
    }

    createSystemCard(system, index) {
        const { id, system_name, description, is_active } = system;
        
        // Choose appropriate icon based on system name
        const getSystemIcon = (systemName) => {
            const name = systemName.toLowerCase();
            if (name.includes('مستخدمين') || name.includes('users')) return 'fas fa-users';
            if (name.includes('محاسبة') || name.includes('accounting')) return 'fas fa-calculator';
            if (name.includes('مخزون') || name.includes('inventory')) return 'fas fa-boxes';
            if (name.includes('مبيعات') || name.includes('sales')) return 'fas fa-chart-line';
            if (name.includes('موارد') || name.includes('hr')) return 'fas fa-user-tie';
            return 'fas fa-cog'; // default icon
        };
        
        return `
            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                <div class="system-card card h-100" 
                     data-system-id="${id}"
                     style="animation-delay: ${index * 0.1}s; cursor: pointer;"
                     role="button"
                     aria-label="الوصول إلى نظام ${system_name}">
                    
                    ${!is_active ? '<div class="card-badge">صيانة</div>' : ''}
                    
                    <div class="department-icon">
                        <i class="${getSystemIcon(system_name)}" aria-hidden="true"></i>
                    </div>
                    
                    <h3>${system_name}</h3>
                    <p>${description}</p>
                    
                    <div class="mt-auto">
                        <small class="text-muted">
                            <i class="fas fa-shield-alt me-1"></i>
                            ${is_active ? 'نشط' : 'غير نشط'}
                        </small>
                    </div>
                </div>
            </div>
        `;
    }

    setupCardClickListeners() {
        document.querySelectorAll('.system-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const systemId = card.dataset.systemId;
                
                // Add click animation
                card.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    card.style.transform = '';
                    this.openSystem(systemId);
                }, 150);
            });

            // Keyboard accessibility
            card.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });
    }

    async openSystem(systemId) {
        try {
            // For now, show system info modal or redirect to system page
            // This can be customized based on your system structure
            
            const system = this.systems.find(s => s.id == systemId);
            if (system) {
                // Show system details modal or redirect to system URL
                alert(`سيتم فتح نظام: ${system.system_name}\n\nالوصف: ${system.description}\n\nهذه الميزة قيد التطوير.`);
                
                // Example: redirect to system URL
                // window.location.href = `system.html?id=${systemId}`;
            }
        } catch (error) {
            console.error('Error opening system:', error);
            alert('حدث خطأ في فتح النظام. يرجى المحاولة مرة أخرى.');
        }
    }

    handleSearch() {
        const query = this.searchInput.value.toLowerCase().trim();
        
        if (query === '') {
            this.filteredSystems = [...this.systems];
        } else {
            this.filteredSystems = this.systems.filter(system =>
                system.system_name.toLowerCase().includes(query) ||
                system.description.toLowerCase().includes(query) ||
                system.id.toString().includes(query)
            );
        }
        
        this.renderSystems();
    }

    handleSmoothScroll(e) {
        const href = e.currentTarget.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    }

    showLoading(show) {
        if (this.loadingSpinner) {
            this.loadingSpinner.style.display = show ? 'block' : 'none';
        }
    }

    hideError() {
        if (this.errorMessage) {
            this.errorMessage.classList.add('d-none');
        }
    }

    showError(message) {
        if (this.errorMessage) {
            const errorText = this.errorMessage.querySelector('#errorText');
            if (errorText) {
                errorText.textContent = message;
            }
            this.errorMessage.classList.remove('d-none');
        }
    }

    updateCopyright() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
}

// ===================================================================
// LOGIN FUNCTIONALITY
// ===================================================================
class LoginManager {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.nameInput = document.getElementById('name');
        this.passwordInput = document.getElementById('password');
        this.rememberMeCheckbox = document.getElementById('rememberMe');
        this.loginButton = document.getElementById('loginButton');
        this.loginButtonText = document.getElementById('loginButtonText');
        this.loginSpinner = document.getElementById('loginSpinner');
        this.loginAlert = document.getElementById('loginAlert');
        this.togglePasswordBtn = document.getElementById('togglePassword');
        this.togglePasswordIcon = document.getElementById('togglePasswordIcon');

        this.isSubmitting = false;
        
        this.init();
    }

    async init() {
        try {
            this.setupEventListeners();
            this.updateCopyright();
            this.loadRememberedCredentials();
            this.handleUrlMessages();
        } catch (error) {
            console.error('Login initialization error:', error);
            this.showAlert('Failed to initialize login form', 'danger');
        }
    }

    handleUrlMessages() {
        const urlParams = Utils.getUrlParams();
        const message = urlParams.get('message');
        
        if (message) {
            setTimeout(() => {
                this.showAlert(decodeURIComponent(message), 'success');
            }, 500);
        }
    }

    setupEventListeners() {
        // Form submission
        if (this.form) {
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
        }

        // Real-time validation
        [this.nameInput, this.passwordInput].filter(input => input).forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Password toggle
        if (this.togglePasswordBtn) {
            this.togglePasswordBtn.addEventListener('click', this.togglePasswordVisibility.bind(this));
        }

        // Forgot password link
        const forgotPasswordLink = document.querySelector('.forgot-password-link');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', this.handleForgotPassword.bind(this));
        }
    }



    loadRememberedCredentials() {
        const remembered = Utils.storage.get(CONFIG.STORAGE_KEYS.REMEMBER_ME);
        
        if (remembered) {
            if (this.nameInput) this.nameInput.value = remembered.name || '';
            if (this.rememberMeCheckbox) this.rememberMeCheckbox.checked = true;
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) return;
        
        if (!this.validateForm()) {
            this.showAlert('Please correct the errors below', 'danger');
            return;
        }

        await this.performLogin();
    }

    async performLogin() {
        this.isSubmitting = true;
        this.setLoadingState(true);

        try {
            const credentials = {
                name: this.nameInput.value.trim(),
                password: this.passwordInput.value,
                rememberMe: this.rememberMeCheckbox.checked
            };

            const result = await ApiService.loginUser(credentials);

            if (result.success) {
                this.showAlert(result.message, 'success');
                
                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = `dashboard.html?success=1`;
                }, 1500);
            } else {
                this.showAlert(result.error, 'danger');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showAlert('An unexpected error occurred. Please try again.', 'danger');
        } finally {
            this.isSubmitting = false;
            this.setLoadingState(false);
        }
    }

    validateForm() {
        let isValid = true;
        
        // Validate required fields (name and password are required)
        [this.nameInput, this.passwordInput].forEach(field => {
            if (field && !this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field) {
        if (!field) return true;

        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (field.type || field.tagName.toLowerCase()) {
            case 'text':
                if (!value) {
                    errorMessage = 'Name is required';
                    isValid = false;
                } else if (value.length < 2) {
                    errorMessage = 'Name must be at least 2 characters';
                    isValid = false;
                }
                break;

            case 'password':
                if (!value) {
                    errorMessage = 'Password is required';
                    isValid = false;
                } else if (value.length < 6) {
                    errorMessage = 'Password must be at least 6 characters';
                    isValid = false;
                }
                break;
        }

        this.setFieldValidation(field, isValid, errorMessage);
        return isValid;
    }

    setFieldValidation(field, isValid, errorMessage = '') {
        const feedbackElement = field.parentElement.querySelector('.invalid-feedback');
        
        if (isValid) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
            
            if (feedbackElement && errorMessage) {
                feedbackElement.textContent = errorMessage;
            }
        }
    }

    clearFieldError(field) {
        field.classList.remove('is-invalid', 'is-valid');
    }

    togglePasswordVisibility() {
        const isPassword = this.passwordInput.type === 'password';
        
        this.passwordInput.type = isPassword ? 'text' : 'password';
        this.togglePasswordIcon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
        
        // Maintain focus on password input
        this.passwordInput.focus();
    }

    handleForgotPassword(e) {
        e.preventDefault();
        
        // In a real application, this would open a password reset modal or redirect
        alert('Password reset functionality would be implemented here.\n\nFor demo purposes, please contact your system administrator.');
    }

    setLoadingState(loading) {
        if (this.loginButton) {
            this.loginButton.disabled = loading;
        }
        
        if (this.loginButtonText) {
            this.loginButtonText.textContent = loading ? 'Signing In...' : 'Sign In';
        }
        
        if (this.loginSpinner) {
            this.loginSpinner.classList.toggle('d-none', !loading);
        }
    }

    showAlert(message, type = 'danger') {
        if (!this.loginAlert) return;

        const iconMap = {
            success: 'fas fa-check-circle',
            danger: 'fas fa-exclamation-triangle',
            warning: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };

        this.loginAlert.className = `alert alert-${type}`;
        this.loginAlert.innerHTML = `
            <i class="${iconMap[type]} me-2"></i>
            ${message}
        `;
        this.loginAlert.classList.remove('d-none');

        // Auto-hide error messages after 5 seconds
        if (type === 'danger' || type === 'warning') {
            setTimeout(() => {
                this.loginAlert.classList.add('d-none');
            }, 5000);
        }
    }

    updateCopyright() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
}

// ===================================================================
// INITIALIZATION & EVENT HANDLING
// ===================================================================
class App {
    constructor() {
        this.currentPage = this.detectCurrentPage();
        this.init();
    }

    detectCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'login.html';
        
        if (filename.includes('login')) return 'login';
        return 'dashboard';
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        try {
            // Initialize page-specific functionality
            switch (this.currentPage) {
                case 'dashboard':
                    new Dashboard();
                    break;
                case 'login':
                    new LoginManager();
                    break;
                default:
                    console.warn('Unknown page type:', this.currentPage);
            }

            // Initialize global functionality
            this.initGlobalFeatures();
        } catch (error) {
            console.error('App initialization error:', error);
        }
    }

    initGlobalFeatures() {
        // Success message handling from URL params
        this.handleSuccessMessages();
        
        // Global keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Global error handling
        this.setupErrorHandling();
        
        // Performance monitoring
        this.setupPerformanceMonitoring();
    }

    handleSuccessMessages() {
        const urlParams = Utils.getUrlParams();
        const success = urlParams.get('success');
        
        if (success === '1') {
            // Show success message for successful login
            setTimeout(() => {
                const alertContainer = document.createElement('div');
                alertContainer.className = 'alert alert-success alert-dismissible fade show position-fixed';
                alertContainer.style.cssText = 'top: 100px; right: 20px; z-index: 9999; max-width: 400px;';
                alertContainer.innerHTML = `
                    <i class="fas fa-check-circle me-2"></i>
                    Welcome! You've successfully logged in to the system.
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                `;
                document.body.appendChild(alertContainer);
                
                // Auto-remove after 5 seconds
                setTimeout(() => {
                    if (alertContainer.parentNode) {
                        alertContainer.remove();
                    }
                }, 5000);
            }, 500);
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for search focus
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }
            
            // ESC to clear search
            if (e.key === 'Escape') {
                const searchInput = document.getElementById('searchInput');
                if (searchInput && searchInput === document.activeElement) {
                    searchInput.value = '';
                    searchInput.dispatchEvent(new Event('input'));
                    searchInput.blur();
                }
            }
        });
    }

    setupErrorHandling() {
        // Global error handler for unhandled promises
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            event.preventDefault();
        });

        // Global error handler for JavaScript errors
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
        });
    }

    setupPerformanceMonitoring() {
        // Log page load performance
        window.addEventListener('load', () => {
            if ('performance' in window) {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Page load performance:', {
                    domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                    loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
                    totalTime: perfData.loadEventEnd - perfData.fetchStart
                });
            }
        });
    }
}

// ===================================================================
// APPLICATION STARTUP
// ===================================================================
// Initialize the application
new App();

// Export for potential external usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { App, Dashboard, LoginManager, ApiService, Utils };
}
