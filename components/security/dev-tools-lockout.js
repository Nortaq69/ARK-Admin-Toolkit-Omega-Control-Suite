// PlayNexus Admin Toolkit - Dev Tools Lockout System
const { BrowserWindow, app } = require('electron');

class DevToolsLockout {
    constructor() {
        this.isLocked = false;
        this.checkInterval = null;
    }

    // Disable right-click context menu
    disableContextMenu(mainWindow) {
        mainWindow.webContents.on('context-menu', (event) => {
            event.preventDefault();
        });
    }

    // Block DevTools opening
    blockDevTools(mainWindow) {
        mainWindow.webContents.on('devtools-opened', () => {
            console.log('⚠️ DevTools attempted to open - blocking');
            mainWindow.webContents.closeDevTools();
        });

        // Prevent DevTools from being opened via keyboard shortcuts
        mainWindow.webContents.on('before-input-event', (event, input) => {
            if (input.control && (input.key === 'F12' || input.key === 'I' || input.key === 'J')) {
                event.preventDefault();
                console.log('⚠️ DevTools shortcut blocked');
            }
        });
    }

    // Inject anti-debugging JavaScript
    injectAntiDebugScript(mainWindow) {
        const antiDebugScript = `
            // Anti-debugging measures
            (function() {
                // Detect debugger
                function detectDebugger() {
                    const startTime = performance.now();
                    debugger;
                    const endTime = performance.now();
                    
                    if (endTime - startTime > 100) {
                        console.log('⚠️ Debugger detected');
                        document.body.innerHTML = '<div style="text-align: center; padding: 50px; color: red; font-size: 24px;">⚠️ Debugging is not allowed</div>';
                        return true;
                    }
                    return false;
                }

                // Disable console methods
                const originalConsole = {
                    log: console.log,
                    warn: console.warn,
                    error: console.error,
                    info: console.info
                };

                // Override console methods in production
                if (!window.location.href.includes('--dev')) {
                    console.log = function() {};
                    console.warn = function() {};
                    console.error = function() {};
                    console.info = function() {};
                }

                // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J
                document.addEventListener('keydown', function(e) {
                    if (e.key === 'F12' || 
                        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                }, true);

                // Disable right-click
                document.addEventListener('contextmenu', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }, true);

                // Disable text selection
                document.addEventListener('selectstart', function(e) {
                    e.preventDefault();
                    return false;
                }, true);

                // Disable drag and drop
                document.addEventListener('dragstart', function(e) {
                    e.preventDefault();
                    return false;
                }, true);

                // Periodic debugger detection
                setInterval(detectDebugger, 1000);

                // Disable source view
                document.addEventListener('keydown', function(e) {
                    if (e.ctrlKey && e.key === 'U') {
                        e.preventDefault();
                        return false;
                    }
                }, true);

                console.log('🛡️ Anti-debugging measures activated');
            })();
        `;

        mainWindow.webContents.executeJavaScript(antiDebugScript);
    }

    // Monitor for DevTools attempts
    monitorDevTools(mainWindow) {
        this.checkInterval = setInterval(() => {
            if (mainWindow.webContents.isDevToolsOpened()) {
                console.log('⚠️ DevTools detected - closing');
                mainWindow.webContents.closeDevTools();
            }
        }, 1000);
    }

    // Initialize dev tools lockout
    init(mainWindow) {
        console.log('🔒 Initializing dev tools lockout...');
        
        // Skip in development mode
        if (process.argv.includes('--dev')) {
            console.log('🔧 Development mode - dev tools lockout disabled');
            return;
        }

        this.disableContextMenu(mainWindow);
        this.blockDevTools(mainWindow);
        this.injectAntiDebugScript(mainWindow);
        this.monitorDevTools(mainWindow);
        
        this.isLocked = true;
        console.log('✅ Dev tools lockout activated');
    }

    // Cleanup
    cleanup() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    // Get lockout status
    isLocked() {
        return this.isLocked;
    }
}

module.exports = DevToolsLockout; 