/**
 * MEGA PROJECT - MAIN JAVASCRIPT FILE
 * Modern ES6+ implementation with comprehensive functionality
 * Handles dashboard, login, API interactions, and UI enhancements
 */

// ===================================================================
// GLOBAL CONFIGURATION & CONSTANTS
// ===================================================================
const CONFIG = {
    API_BASE_URL: '/api',
    ENDPOINTS: {
        DEPARTMENTS: '/api/departments',
        LOGIN: '/api/login',
        USER_INFO: '/api/user'
    },
    STORAGE_KEYS: {
        DEPARTMENTS: 'megaproject_departments',
        USER_SESSION: 'megaproject_session',
        REMEMBER_ME: 'megaproject_remember'
    },
    ANIMATIONS: {
        DURATION: 300,
        DELAY_INCREMENT: 100
    }
};

// Mock departments data for demonstration
const MOCK_DEPARTMENTS = [
    {
        id: 'hr',
        name: 'Human Resources',
        description: 'Manage employee relations, recruitment, and workforce development',
        icon: 'fas fa-users',
        color: '#667eea',
        employees: 25,
        active: true
    },
    {
        id: 'finance',
        name: 'Finance',
        description: 'Financial planning, budgeting, and accounting operations',
        icon: 'fas fa-chart-line',
        color: '#f093fb',
        employees: 18,
        active: true
    },
    {
        id: 'it',
        name: 'Information Technology',
        description: 'Technology infrastructure, development, and support services',
        icon: 'fas fa-laptop-code',
        color: '#4facfe',
        employees: 32,
        active: true
    },
    {
        id: 'security',
        name: 'Security',
        description: 'Information security, physical security, and risk management',
        icon: 'fas fa-shield-alt',
        color: '#43e97b',
        employees: 15,
        active: true
    },
    {
        id: 'hse',
        name: 'HSE',
        description: 'Health, Safety, and Environment management and compliance',
        icon: 'fas fa-hard-hat',
        color: '#fa709a',
        employees: 20,
        active: true
    },
    {
        id: 'customer-service',
        name: 'Customer Service',
        description: 'Customer support, satisfaction, and relationship management',
        icon: 'fas fa-headset',
        color: '#4facfe',
        employees: 35,
        active: true
    },
    {
        id: 'environment',
        name: 'Environment',
        description: 'Environmental protection, sustainability, and green initiatives',
        icon: 'fas fa-leaf',
        color: '#43e97b',
        employees: 18,
        active: true
    }
];

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
     * Fetch departments data
     */
    static async fetchDepartments() {
        try {
            // Check if we have cached data
            const cached = Utils.storage.get(CONFIG.STORAGE_KEYS.DEPARTMENTS);
            if (cached && cached.timestamp > Date.now() - 5 * 60 * 1000) { // 5 minutes cache
                return { success: true, data: cached.data };
            }

            // Simulate API call delay
            await Utils.simulateApiDelay();

            // For demo purposes, we'll use mock data
            // In real implementation, replace with actual fetch call:
            // const response = await fetch(CONFIG.ENDPOINTS.DEPARTMENTS);
            // const data = await response.json();

            const data = MOCK_DEPARTMENTS;

            // Cache the results
            Utils.storage.set(CONFIG.STORAGE_KEYS.DEPARTMENTS, {
                data,
                timestamp: Date.now()
            });

            return { success: true, data };
        } catch (error) {
            console.error('Failed to fetch departments:', error);
            return { 
                success: false, 
                error: 'Unable to load departments. Please try again later.',
                data: []
            };
        }
    }

    /**
     * Login user
     */
    static async loginUser(credentials) {
        try {
            await Utils.simulateApiDelay(1000, 2000);

            // For demo purposes, simulate login validation
            // In real implementation, replace with actual fetch call:
            /*
            const response = await fetch(CONFIG.ENDPOINTS.LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });
            const data = await response.json();
            */

            // Mock validation
            const { username, password, department } = credentials;
            
            if (!username || !password || !department) {
                throw new Error('All fields are required');
            }

            if (username.length < 3) {
                throw new Error('Username must be at least 3 characters');
            }

            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            // Simulate successful login
            const userData = {
                id: Date.now(),
                username,
                department,
                name: `${username.charAt(0).toUpperCase()}${username.slice(1)} User`,
                email: `${username}@megaproject.com`,
                role: 'user',
                permissions: ['read', 'write'],
                lastLogin: new Date().toISOString()
            };

            // Store session data
            if (credentials.rememberMe) {
                Utils.storage.set(CONFIG.STORAGE_KEYS.REMEMBER_ME, {
                    username,
                    department
                });
            }

            Utils.storage.set(CONFIG.STORAGE_KEYS.USER_SESSION, userData);

            return { 
                success: true, 
                data: userData,
                message: 'Login successful! Redirecting to dashboard...'
            };

        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                error: error.message || 'Login failed. Please check your credentials.',
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
        this.departmentsGrid = document.getElementById('departmentsGrid');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.errorMessage = document.getElementById('errorMessage');
        this.searchInput = document.getElementById('searchInput');
        
        this.departments = [];
        this.filteredDepartments = [];
        
        this.init();
    }

    async init() {
        try {
            this.setupEventListeners();
            this.updateCopyright();
            await this.loadDepartments();
        } catch (error) {
            console.error('Dashboard initialization error:', error);
            this.showError('Failed to initialize dashboard');
        }
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

        // Navigation links smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', this.handleSmoothScroll);
        });
    }

    async loadDepartments() {
        try {
            this.showLoading(true);
            this.hideError();

            const result = await ApiService.fetchDepartments();
            
            if (result.success) {
                this.departments = result.data;
                this.filteredDepartments = [...this.departments];
                this.renderDepartments();
            } else {
                this.showError(result.error);
            }
        } catch (error) {
            console.error('Error loading departments:', error);
            this.showError('Failed to load departments');
        } finally {
            this.showLoading(false);
        }
    }

    renderDepartments() {
        if (!this.departmentsGrid) return;

        if (this.filteredDepartments.length === 0) {
            this.departmentsGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-search text-muted" style="font-size: 3rem;"></i>
                    <h3 class="mt-3 text-muted">No departments found</h3>
                    <p class="text-muted">Try adjusting your search criteria</p>
                </div>
            `;
            return;
        }

        const cardsHtml = this.filteredDepartments.map((dept, index) => 
            this.createDepartmentCard(dept, index)
        ).join('');

        this.departmentsGrid.innerHTML = cardsHtml;

        // Add click event listeners to cards
        this.setupCardClickListeners();
    }

    createDepartmentCard(department, index) {
        const { id, name, description, icon, employees, active } = department;
        
        return `
            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                <a href="login.html?dept=${id}" 
                   class="department-card card h-100" 
                   data-dept="${id}"
                   style="animation-delay: ${index * 0.1}s"
                   role="button"
                   aria-label="Access ${name} department">
                    
                    ${active ? '' : '<div class="card-badge">Maintenance</div>'}
                    
                    <div class="department-icon">
                        <i class="${icon}" aria-hidden="true"></i>
                    </div>
                    
                    <h3>${name}</h3>
                    <p>${description}</p>
                    
                    <div class="mt-auto">
                        <small class="text-muted">
                            <i class="fas fa-users me-1"></i>
                            ${employees} employees
                        </small>
                    </div>
                </a>
            </div>
        `;
    }

    setupCardClickListeners() {
        document.querySelectorAll('.department-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const dept = card.dataset.dept;
                
                // Add click animation
                card.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    card.style.transform = '';
                    window.location.href = `login.html?dept=${dept}`;
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

    handleSearch() {
        const query = this.searchInput.value.toLowerCase().trim();
        
        if (query === '') {
            this.filteredDepartments = [...this.departments];
        } else {
            this.filteredDepartments = this.departments.filter(dept =>
                dept.name.toLowerCase().includes(query) ||
                dept.description.toLowerCase().includes(query) ||
                dept.id.toLowerCase().includes(query)
            );
        }
        
        this.renderDepartments();
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
        this.departmentSelect = document.getElementById('departmentSelect');
        this.usernameInput = document.getElementById('username');
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
            await this.loadDepartments();
            this.handleUrlParams();
            this.loadRememberedCredentials();
        } catch (error) {
            console.error('Login initialization error:', error);
            this.showAlert('Failed to initialize login form', 'danger');
        }
    }

    setupEventListeners() {
        // Form submission
        if (this.form) {
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
        }

        // Real-time validation
        [this.usernameInput, this.passwordInput, this.departmentSelect].forEach(input => {
            if (input) {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            }
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

    async loadDepartments() {
        try {
            const result = await ApiService.fetchDepartments();
            
            if (result.success && this.departmentSelect) {
                this.populateDepartmentOptions(result.data);
            }
        } catch (error) {
            console.error('Error loading departments for login:', error);
        }
    }

    populateDepartmentOptions(departments) {
        // Clear existing options except the first one
        while (this.departmentSelect.children.length > 1) {
            this.departmentSelect.removeChild(this.departmentSelect.lastChild);
        }

        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.id;
            option.textContent = dept.name;
            this.departmentSelect.appendChild(option);
        });
    }

    handleUrlParams() {
        const urlParams = Utils.getUrlParams();
        const deptParam = urlParams.get('dept');
        
        if (deptParam && this.departmentSelect) {
            this.departmentSelect.value = deptParam;
            // Trigger validation to remove any error state
            this.validateField(this.departmentSelect);
        }
    }

    loadRememberedCredentials() {
        const remembered = Utils.storage.get(CONFIG.STORAGE_KEYS.REMEMBER_ME);
        
        if (remembered) {
            if (this.usernameInput) this.usernameInput.value = remembered.username || '';
            if (this.departmentSelect) this.departmentSelect.value = remembered.department || '';
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
                username: this.usernameInput.value.trim(),
                password: this.passwordInput.value,
                department: this.departmentSelect.value,
                rememberMe: this.rememberMeCheckbox.checked
            };

            const result = await ApiService.loginUser(credentials);

            if (result.success) {
                this.showAlert(result.message, 'success');
                
                // Redirect after short delay
                setTimeout(() => {
                    // In a real app, redirect to department-specific dashboard
                    window.location.href = `index.html?success=1&dept=${credentials.department}`;
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
        
        [this.usernameInput, this.passwordInput, this.departmentSelect].forEach(field => {
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
                    errorMessage = 'Username is required';
                    isValid = false;
                } else if (value.length < 3) {
                    errorMessage = 'Username must be at least 3 characters';
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

            case 'select-one':
                if (!value) {
                    errorMessage = 'Please select a department';
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
        const filename = path.split('/').pop() || 'index.html';
        
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
        const dept = urlParams.get('dept');
        
        if (success === '1' && dept) {
            // Show success message for successful login
            setTimeout(() => {
                const alertContainer = document.createElement('div');
                alertContainer.className = 'alert alert-success alert-dismissible fade show position-fixed';
                alertContainer.style.cssText = 'top: 100px; right: 20px; z-index: 9999; max-width: 400px;';
                alertContainer.innerHTML = `
                    <i class="fas fa-check-circle me-2"></i>
                    Welcome! You've successfully logged in to ${dept.toUpperCase()}.
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
