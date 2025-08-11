// ARK Admin Toolkit: Omega Control Suite - UI Components

const Components = {
    async init() {
        // Initialize custom UI elements if needed
        console.log('✅ Components module initialized');
    },
    showPopup(title, content) {
        try {
            if (window.app && typeof window.app.showModal === 'function') {
                window.app.showModal(title, content);
            } else {
                console.warn('⚠️ App not available or showModal not found, falling back to alert');
                alert(`${title}\n\n${content}`);
            }
        } catch (error) {
            console.error('❌ Error showing popup:', error);
            alert(`${title}\n\n${content}`);
        }
    },
    closeModal() {
        try {
            if (window.app && typeof window.app.closeModal === 'function') {
                window.app.closeModal();
            } else {
                console.warn('⚠️ App not available or closeModal not found');
            }
        } catch (error) {
            console.error('❌ Error closing modal:', error);
        }
    },
    showNotification(message, type = 'info') {
        try {
            if (window.app && typeof window.app.showNotification === 'function') {
                window.app.showNotification(message, type);
            } else {
                console.warn('⚠️ App not available or showNotification not found, falling back to console');
                console.log(`[${type.toUpperCase()}] ${message}`);
            }
        } catch (error) {
            console.error('❌ Error showing notification:', error);
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
};

// Ensure Components is always available globally
window.Components = Components;

// Fallback for modules that might load before Components
if (typeof window.Components === 'undefined') {
    window.Components = Components;
}

// Test function to verify Components is working
Components.test = function() {
    console.log('🧪 Testing Components module...');
    console.log('✅ Components object:', Components);
    console.log('✅ window.Components:', window.Components);
    console.log('✅ window.app:', window.app);
    
    // Test notification
    this.showNotification('Components test notification', 'info');
    
    // Test modal
    this.showPopup('Components Test', 'This is a test modal to verify the Components module is working correctly.');
    
    console.log('✅ Components test complete');
}; 