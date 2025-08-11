// PlayNexus Admin Toolkit: Omega Control Suite - Main JavaScript

class PlayNexusAdminToolkit {
    constructor() {
        this.currentTab = 'dashboard';
        this.isLoading = true;
        this.notifications = [];
        this.recentCommands = [];
        this.serverStatus = {
            connected: true,
            players: 0,
            dinos: 0,
            uptime: 0,
            memory: 0
        };
        this.soundEnabled = JSON.parse(localStorage.getItem('soundEnabled') || 'true');
        this.securityValid = false;
        
        // Check if required modules are available before initializing
        if (typeof Components === 'undefined') {
            console.error('❌ Components module not available. Waiting for it to load...');
            // Wait for Components to be available
            const checkComponents = setInterval(() => {
                if (typeof Components !== 'undefined') {
                    clearInterval(checkComponents);
                    console.log('✅ Components module now available, initializing...');
                    this.init();
                }
            }, 50);
            
            // Timeout after 5 seconds
            setTimeout(() => {
                clearInterval(checkComponents);
                console.error('❌ Components module failed to load after 5 seconds');
                alert('Critical error: Components module failed to load. Please refresh the page.');
            }, 5000);
        } else {
            this.init();
        }
    }

    async init() {
        console.log('🚀 Initializing PlayNexus Admin Toolkit: Omega Control Suite...');
        
        // Set a timeout to prevent infinite loading
        const initTimeout = setTimeout(() => {
            console.warn('⚠️ Initialization timeout, forcing interface display...');
            this.hideLoadingScreen();
            this.showMainInterface();
            this.setupEventListeners();
        }, 10000); // 10 second timeout
        
        try {
            // Show loading screen
            this.showLoadingScreen();
            
            // Validate security systems
            await this.validateSecurity();
            
            // Initialize components with error handling
            await this.initializeComponents();
            
            // Load data
            await this.loadData();
            
            // Clear timeout since we completed successfully
            clearTimeout(initTimeout);
            
            // Hide loading screen and show main interface
            console.log('✅ All initialization complete, showing main interface...');
            this.hideLoadingScreen();
            this.showMainInterface();
            
            // Set up event listeners AFTER the interface is shown
            setTimeout(() => {
                this.setupEventListeners();
                console.log('✅ Event listeners attached');
            }, 100);
            
            // Start background processes
            this.startBackgroundProcesses();
            
            console.log('✅ PlayNexus Admin Toolkit initialized successfully!');
        } catch (error) {
            console.error('❌ Error during initialization:', error);
            clearTimeout(initTimeout);
            this.showNotification('Initialization failed: ' + error.message, 'error');
            // Still show the interface even if there are errors
            this.hideLoadingScreen();
            this.showMainInterface();
            // Set up event listeners even if there were errors
            setTimeout(() => {
                this.setupEventListeners();
            }, 100);
        }
    }

    async validateSecurity() {
        try {
            if (window.electronAPI) {
                const security = await window.electronAPI.validateSecurity();
                this.securityValid = security.overallValid;
                
                if (!this.securityValid) {
                    console.error('❌ Security validation failed');
                    this.showNotification('Security validation failed. Some features may be limited.', 'warning');
                } else {
                    console.log('✅ Security validation successful');
                }
            }
        } catch (error) {
            console.error('❌ Error validating security:', error);
            this.securityValid = false;
        }
    }

    async initializeComponents() {
        console.log('🔧 Initializing components...');

        // Ensure DataManager is available and initialized first
        if (typeof DataManager !== 'undefined') {
            console.log('Initializing DataManager...');
            if (typeof DataManager.init === 'function') {
                await DataManager.init();
                console.log('✅ DataManager initialized');
            }
        }

        const components = [
            { name: 'Components', module: Components },
            { name: 'Spawner', module: typeof Spawner !== 'undefined' ? Spawner : null },
            { name: 'Terminals', module: typeof Terminals !== 'undefined' ? Terminals : null },
            { name: 'Map', module: typeof MapTools !== 'undefined' ? MapTools : null },
            { name: 'Commands', module: typeof Commands !== 'undefined' ? Commands : null },
            { name: 'Macros', module: typeof Macros !== 'undefined' ? Macros : null },
            { name: 'Players', module: typeof Players !== 'undefined' ? Players : null },
            { name: 'ServerMonitor', module: typeof ServerMonitor !== 'undefined' ? ServerMonitor : null },
            { name: 'CinemaMode', module: typeof CinemaMode !== 'undefined' ? CinemaMode : null }
        ];

        for (const component of components) {
            try {
                if (component.module && typeof component.module.init === 'function') {
                    console.log(`Initializing ${component.name}...`);
                    await component.module.init();
                    console.log(`✅ ${component.name} initialized`);
                    // After Spawner is initialized, render recommended creatures
                    if (component.name === 'Spawner' && typeof component.module.renderRecommendedCreatures === 'function') {
                        component.module.renderRecommendedCreatures();
                    }
                } else {
                    console.warn(`⚠️ ${component.name} not available or no init method`);
                }
            } catch (error) {
                console.error(`❌ Error initializing ${component.name}:`, error);
                // Continue with other components even if one fails
            }
        }
    }

    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');
        
        // Navigation tabs
        const navTabs = document.querySelectorAll('.nav-tab');
        console.log(`Found ${navTabs.length} navigation tabs`);
        
        navTabs.forEach((tab, index) => {
            const tabName = tab.dataset.tab;
            console.log(`Attaching event listener to tab ${index + 1}: ${tabName}`);
            
            tab.addEventListener('click', (e) => {
                console.log(`Tab clicked: ${tabName}`);
                this.visualFeedback(e.currentTarget);
                this.playSound('click');
                this.switchTab(tabName);
            });
        });

        // Header buttons
        document.getElementById('settings-btn')?.addEventListener('click', () => {
            this.showSettings();
        });

        document.getElementById('help-btn')?.addEventListener('click', () => {
            this.showHelp();
        });

        document.getElementById('minimize-btn')?.addEventListener('click', () => {
            this.minimizeWindow();
        });

        document.getElementById('close-btn')?.addEventListener('click', () => {
            this.closeWindow();
        });

        // Dashboard quick actions
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.setAttribute('tabindex', '0');
            btn.setAttribute('aria-pressed', 'false');
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.visualFeedback(e.currentTarget);
                this.playSound('click');
                this.executeQuickAction(action);
            });
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                }
            });
        });

        // Admin assistant
        document.getElementById('assistant-send')?.addEventListener('click', () => {
            this.playSound('click');
            this.sendAssistantMessage();
        });

        document.getElementById('assistant-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.playSound('click');
                this.sendAssistantMessage();
            }
        });

        // Modal system initialization
        const modalClose = document.getElementById('modal-close');
        const modalOverlay = document.getElementById('modal-overlay');
        
        if (!modalClose || !modalOverlay) {
            console.error('❌ Modal elements not found during event setup:', { 
                modalClose: !!modalClose, 
                modalOverlay: !!modalOverlay 
            });
        } else {
            console.log('✅ Modal elements found, setting up event listeners');
            
            // Modal close
            modalClose.addEventListener('click', () => {
                this.closeModal();
            });

            // Modal overlay click to close
            modalOverlay.addEventListener('click', (e) => {
                if (e.target.id === 'modal-overlay') {
                    this.closeModal();
                }
            });
        }

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Window events
        window.addEventListener('beforeunload', () => {
            this.saveState();
        });
        
        console.log('✅ Event listeners setup complete');
    }

    async loadData() {
        try {
            // Load recent commands
            this.recentCommands = JSON.parse(localStorage.getItem('recentCommands') || '[]');
            this.updateRecentCommands();

            // Load saved locations
            const savedLocations = JSON.parse(localStorage.getItem('savedLocations') || '[]');
            if (typeof MapTools !== 'undefined') {
                MapTools.loadSavedLocations(savedLocations);
            }

            // Load saved macros
            const savedMacros = JSON.parse(localStorage.getItem('savedMacros') || '[]');
            if (typeof Macros !== 'undefined') {
                Macros.loadSavedMacros(savedMacros);
            }

            // Load user preferences
            const preferences = JSON.parse(localStorage.getItem('preferences') || '{}');
            this.applyPreferences(preferences);

        } catch (error) {
            console.error('Error loading data:', error);
            this.showNotification('Error loading saved data', 'error');
        }
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const mainInterface = document.getElementById('main-interface');
        
        if (loadingScreen) loadingScreen.style.display = 'flex';
        if (mainInterface) mainInterface.classList.add('hidden');
        
        // Animate loading progress
        const progressBar = document.querySelector('.loading-progress');
        if (progressBar) {
            progressBar.style.width = '0%';
            setTimeout(() => {
                progressBar.style.width = '100%';
            }, 100);
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const mainInterface = document.getElementById('main-interface');
        
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
        
        if (mainInterface) {
            mainInterface.classList.remove('hidden');
            mainInterface.style.opacity = '1';
        }
    }

    showMainInterface() {
        const mainInterface = document.getElementById('main-interface');
        if (mainInterface) {
            mainInterface.classList.remove('hidden');
            mainInterface.classList.add('fade-in');
        }
    }

    switchTab(tabName) {
        console.log(`🔄 Switching to tab: ${tabName}`);
        
        // Remove active class from all tabs and content
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Add active class to selected tab and content
        const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
        const selectedContent = document.getElementById(tabName);
        
        console.log(`Selected tab element:`, selectedTab);
        console.log(`Selected content element:`, selectedContent);
        
        if (selectedTab) {
            selectedTab.classList.add('active');
            console.log(`✅ Added active class to tab: ${tabName}`);
        } else {
            console.error(`❌ Tab element not found: ${tabName}`);
        }
        
        if (selectedContent) {
            selectedContent.classList.add('active');
            console.log(`✅ Added active class to content: ${tabName}`);
        } else {
            console.error(`❌ Content element not found: ${tabName}`);
        }

        this.currentTab = tabName;

        // Trigger tab-specific initialization
        this.initializeTab(tabName);

        // Add animation
        if (selectedContent) {
            selectedContent.classList.add('slide-in');
            setTimeout(() => {
                selectedContent.classList.remove('slide-in');
            }, 300);
        }
        
        console.log(`✅ Tab switch complete: ${tabName}`);
    }

    initializeTab(tabName) {
        switch (tabName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'spawner':
                if (typeof Spawner !== 'undefined') {
                    Spawner.refresh();
                }
                break;
            case 'items':
                if (typeof Items !== 'undefined') {
                    Items.refresh();
                }
                break;
            case 'terminals':
                if (typeof Terminals !== 'undefined') {
                    Terminals.refresh();
                }
                break;
            case 'map':
                if (typeof MapTools !== 'undefined') {
                    MapTools.refresh();
                }
                break;
            case 'commands':
                if (typeof Commands !== 'undefined') {
                    Commands.refresh();
                }
                break;
            case 'macros':
                if (typeof Macros !== 'undefined') {
                    Macros.refresh();
                }
                break;
            case 'players':
                if (typeof Players !== 'undefined') {
                    Players.refresh();
                }
                break;
            case 'server':
                if (typeof Server !== 'undefined') {
                    Server.refresh();
                }
                break;
            case 'cinema':
                if (typeof Cinema !== 'undefined') {
                    Cinema.refresh();
                }
                break;
        }
    }

    updateDashboard() {
        // Update server statistics
        this.updateServerStats();
        
        // Update recent commands
        this.updateRecentCommands();
        
        // Update admin assistant
        this.updateAdminAssistant();
    }

    updateServerStats() {
        // Simulate server stats (in real app, this would come from server API)
        const stats = {
            players: Math.floor(Math.random() * 50) + 10,
            dinos: Math.floor(Math.random() * 1000) + 500,
            uptime: Math.floor(Math.random() * 24) + 1,
            memory: Math.floor(Math.random() * 30) + 20
        };

        document.getElementById('player-count').textContent = stats.players;
        document.getElementById('dino-count').textContent = stats.dinos;
        document.getElementById('server-uptime').textContent = `${stats.uptime}h`;
        document.getElementById('memory-usage').textContent = `${stats.memory}%`;

        this.serverStatus = { ...this.serverStatus, ...stats };
    }

    updateRecentCommands() {
        const commandsList = document.getElementById('recent-commands-list');
        if (!commandsList) return;

        commandsList.innerHTML = '';

        if (this.recentCommands.length === 0) {
            commandsList.innerHTML = '<div class="empty-state">No recent commands</div>';
            return;
        }

        this.recentCommands.slice(0, 10).forEach(command => {
            const commandElement = document.createElement('div');
            commandElement.className = 'command-item';
            commandElement.setAttribute('tabindex', '0');
            commandElement.setAttribute('role', 'button');
            commandElement.setAttribute('aria-label', `Copy command: ${command.text}`);
            commandElement.innerHTML = `
                <div class="command-text">${command.text}</div>
                <div class="command-time">${command.time}</div>
            `;
            commandElement.addEventListener('click', () => {
                this.visualFeedback(commandElement);
                this.copyToClipboard(command.text);
            });
            commandElement.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    commandElement.click();
                }
            });
            commandsList.appendChild(commandElement);
        });
    }

    updateAdminAssistant() {
        // Initialize admin assistant if not already done
        if (!this.adminAssistant) {
            this.adminAssistant = {
                messages: [
                    {
                        type: 'assistant',
                        content: 'Hello, Admin! How can I help you today?'
                    }
                ]
            };
            this.renderAssistantMessages();
        }
    }

    renderAssistantMessages() {
        const messagesContainer = document.getElementById('assistant-messages');
        if (!messagesContainer) return;

        messagesContainer.innerHTML = '';

        this.adminAssistant.messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${message.type}`;
            messageElement.innerHTML = `
                <i class="fas fa-${message.type === 'assistant' ? 'robot' : 'user'}"></i>
                <div class="message-content">${message.content}</div>
            `;
            messagesContainer.appendChild(messageElement);
        });

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async sendAssistantMessage() {
        const input = document.getElementById('assistant-input');
        if (!input || !input.value.trim()) {
            this.showNotification('Please enter a message.', 'warning');
            this.playSound('error');
            return;
        }

        const userMessage = input.value.trim();
        
        // Add user message
        this.adminAssistant.messages.push({
            type: 'user',
            content: userMessage
        });

        this.renderAssistantMessages();
        input.value = '';

        // Simulate assistant response
        setTimeout(() => {
            const response = this.generateAssistantResponse(userMessage);
            this.adminAssistant.messages.push({
                type: 'assistant',
                content: response
            });
            this.renderAssistantMessages();
            this.playSound('success');
        }, 1000);
    }

    generateAssistantResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('spawn') && lowerMessage.includes('giga')) {
            return 'To spawn a Giganotosaurus, use: `admincheat SpawnDino "Blueprint\'/Game/PrimalEarth/Dinos/Giganotosaurus/Giganotosaurus_Character_BP.Giganotosaurus_Character_BP\'" 500 0 0 120`';
        }
        
        if (lowerMessage.includes('teleport')) {
            return 'To teleport to coordinates, use: `admincheat Teleport X Y Z` or `admincheat TeleportToPlayer PlayerName`';
        }
        
        if (lowerMessage.includes('god mode')) {
            return 'To enable god mode, use: `admincheat God` or `admincheat InfiniteStats`';
        }
        
        if (lowerMessage.includes('clear inventory')) {
            return 'To clear your inventory, use: `admincheat DestroyAll "PrimalItem"`';
        }
        
        if (lowerMessage.includes('time')) {
            return 'To set time, use: `admincheat SetTimeOfDay Hour` (0-24) or `admincheat SetTimeOfDay 12` for noon';
        }
        
        if (lowerMessage.includes('weather')) {
            return 'To change weather, use: `admincheat SetWeatherIntensity Rain 0` (0-1) or `admincheat SetWeatherIntensity Storm 0`';
        }
        
        return 'I can help you with ARK admin commands! Try asking about spawning dinos, teleporting, god mode, time/weather control, or any other admin functions.';
    }

    executeQuickAction(action) {
        switch (action) {
            case 'spawn-giga':
                this.executeCommand('admincheat SpawnDino "Blueprint\'/Game/PrimalEarth/Dinos/Giganotosaurus/Giganotosaurus_Character_BP.Giganotosaurus_Character_BP\'" 500 0 0 120');
                break;
            case 'teleport-spawn':
                this.executeCommand('admincheat Teleport 0 0 0');
                break;
            case 'clear-inventory':
                this.executeCommand('admincheat DestroyAll "PrimalItem"');
                break;
            case 'god-mode':
                this.executeCommand('admincheat God');
                break;
        }
    }

    executeCommand(command) {
        // Add to recent commands
        this.recentCommands.unshift({
            text: command,
            time: new Date().toLocaleTimeString()
        });

        // Keep only last 50 commands
        if (this.recentCommands.length > 50) {
            this.recentCommands = this.recentCommands.slice(0, 50);
        }

        // Save to localStorage
        localStorage.setItem('recentCommands', JSON.stringify(this.recentCommands));

        // Update UI
        this.updateRecentCommands();

        // Show notification
        this.showNotification(`Command executed: ${command}`, 'success');
        this.playSound('success');

        // In a real app, this would send the command to the ARK server
        console.log('Executing command:', command);
    }

    copyToClipboard(text) {
        if (!navigator.clipboard) {
            this.showNotification('Clipboard not supported', 'error');
            this.playSound('error');
            return;
        }
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Copied to clipboard!', 'success');
            this.playSound('success');
        }, () => {
            this.showNotification('Failed to copy', 'error');
            this.playSound('error');
        });
    }

    showNotification(message, type = 'info') {
        const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date()
        };

        this.notifications.push(notification);
        this.renderNotification(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, 5000);
        this.playSound(type === 'success' ? 'success' : type === 'error' ? 'error' : 'click');
    }

    renderNotification(notification) {
        const container = document.getElementById('notifications');
        if (!container) return;

        const element = document.createElement('div');
        element.className = `notification ${notification.type}`;
        element.dataset.id = notification.id;
        element.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${notification.message}</span>
                <button class="notification-close" onclick="app.removeNotification(${notification.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        container.appendChild(element);

        // Add slide-in animation
        setTimeout(() => {
            element.classList.add('slide-in');
        }, 100);
    }

    removeNotification(id) {
        const element = document.querySelector(`[data-id="${id}"]`);
        if (element) {
            element.classList.add('fade-out');
            setTimeout(() => {
                element.remove();
            }, 300);
        }

        this.notifications = this.notifications.filter(n => n.id !== id);
    }

    showModal(title, content) {
        try {
            // Wait for DOM to be ready
            if (document.readyState !== 'complete') {
                console.log('⏳ DOM not ready, waiting...');
                setTimeout(() => this.showModal(title, content), 100);
                return;
            }

            const modal = document.getElementById('modal');
            const modalTitle = document.getElementById('modal-title');
            const modalContent = document.getElementById('modal-content');
            const modalOverlay = document.getElementById('modal-overlay');

            if (!modalTitle || !modalContent || !modalOverlay) {
                console.error('❌ Modal elements not found:', { 
                    modalTitle: !!modalTitle, 
                    modalContent: !!modalContent, 
                    modalOverlay: !!modalOverlay,
                    readyState: document.readyState
                });
                this.showNotification('Modal system error: Required elements not found', 'error');
                return;
            }

            // Set title and content
            modalTitle.textContent = title || 'Modal';
            modalContent.innerHTML = content || '';
            
            // Show modal
            modalOverlay.classList.remove('hidden');
            
            // Ensure modal is visible
            modalOverlay.style.display = 'flex';
            
            console.log('✅ Modal displayed:', title);
        } catch (error) {
            console.error('❌ Error showing modal:', error);
            this.showNotification('Failed to display modal: ' + error.message, 'error');
        }
    }

    closeModal() {
        try {
            const modalOverlay = document.getElementById('modal-overlay');
            if (modalOverlay) {
                modalOverlay.classList.add('hidden');
                modalOverlay.style.display = 'none';
                console.log('✅ Modal closed');
            } else {
                console.warn('⚠️ Modal overlay not found');
            }
        } catch (error) {
            console.error('❌ Error closing modal:', error);
        }
    }

    showSettings() {
        const content = `
            <div class="settings-content">
                <h4>General Settings</h4>
                <div class="form-group">
                    <label>Theme</label>
                    <select id="theme-select" class="form-select">
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="auto">Auto</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Notifications</label>
                    <div class="checkbox-option">
                        <input type="checkbox" id="notifications-enabled" checked>
                        <span>Enable notifications</span>
                    </div>
                </div>
                <h4>Server Settings</h4>
                <div class="form-group">
                    <label>Server IP</label>
                    <input type="text" id="server-ip" class="form-input" placeholder="127.0.0.1">
                </div>
                <div class="form-group">
                    <label>Admin Password</label>
                    <input type="password" id="admin-password" class="form-input" placeholder="Enter admin password">
                </div>
                <div class="settings-actions">
                    <button class="btn-primary" onclick="app.saveSettings()">Save Settings</button>
                    <button class="btn-secondary" onclick="app.closeModal()">Cancel</button>
                </div>
            </div>
        `;
        this.showModal('Settings', content);
    }

    showHelp() {
        const content = `
            <div class="help-content">
                <h4>ARK Admin Toolkit Help</h4>
                <div class="help-section">
                    <h5>Quick Start</h5>
                    <p>Welcome to the ARK Admin Toolkit! This powerful tool helps you manage your ARK server with ease.</p>
                </div>
                <div class="help-section">
                    <h5>Keyboard Shortcuts</h5>
                    <ul>
                        <li><kbd>Ctrl + S</kbd> - Save settings</li>
                        <li><kbd>Ctrl + Q</kbd> - Quick spawn menu</li>
                        <li><kbd>Ctrl + T</kbd> - Teleport to cursor</li>
                        <li><kbd>Ctrl + G</kbd> - Toggle god mode</li>
                    </ul>
                </div>
                <div class="help-section">
                    <h5>Features</h5>
                    <ul>
                        <li><strong>Dino Spawner:</strong> Spawn any dinosaur with custom stats and colors</li>
                        <li><strong>Item Spawner:</strong> Spawn items with custom quality and quantities</li>
                        <li><strong>Terminals:</strong> Create mannequins and player terminals</li>
                        <li><strong>Map Tools:</strong> Teleport, save locations, and control weather</li>
                        <li><strong>Commands:</strong> Access all admin commands with search</li>
                        <li><strong>Macros:</strong> Create and save command sequences</li>
                        <li><strong>Player Management:</strong> Manage online players</li>
                        <li><strong>Server Monitor:</strong> Monitor server performance</li>
                        <li><strong>Cinema Mode:</strong> Create cinematic content</li>
                    </ul>
                </div>
                <div class="help-actions">
                    <button class="btn-primary" onclick="app.closeModal()">Got it!</button>
                </div>
            </div>
        `;
        this.showModal('Help', content);
    }

    handleKeyboardShortcuts(e) {
        // Only handle shortcuts when not typing in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        // Escape key to close modal
        if (e.key === 'Escape') {
            const modalOverlay = document.getElementById('modal-overlay');
            if (modalOverlay && !modalOverlay.classList.contains('hidden')) {
                this.closeModal();
                return;
            }
        }

        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 's':
                    e.preventDefault();
                    this.saveSettings();
                    break;
                case 'q':
                    e.preventDefault();
                    this.showQuickSpawnMenu();
                    break;
                case 't':
                    e.preventDefault();
                    this.teleportToCursor();
                    break;
                case 'g':
                    e.preventDefault();
                    this.toggleGodMode();
                    break;
                case 'm':
                    e.preventDefault();
                    this.testModal();
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                case '0':
                    e.preventDefault();
                    const tabIndex = parseInt(e.key) - 1;
                    const tabs = ['dashboard', 'spawner', 'items', 'terminals', 'map', 'commands', 'macros', 'players', 'server', 'cinema'];
                    if (tabs[tabIndex]) {
                        this.switchTab(tabs[tabIndex]);
                    }
                    break;
            }
        }
    }

    showQuickSpawnMenu() {
        const content = `
            <div class="quick-spawn-menu">
                <h4>Quick Spawn</h4>
                <div class="quick-spawn-grid">
                    <button class="quick-spawn-btn" onclick="app.quickSpawn('giga')">
                        <i class="fas fa-dragon"></i>
                        <span>Giga</span>
                    </button>
                    <button class="quick-spawn-btn" onclick="app.quickSpawn('rex')">
                        <i class="fas fa-dragon"></i>
                        <span>Rex</span>
                    </button>
                    <button class="quick-spawn-btn" onclick="app.quickSpawn('argent')">
                        <i class="fas fa-dragon"></i>
                        <span>Argent</span>
                    </button>
                    <button class="quick-spawn-btn" onclick="app.quickSpawn('quetz')">
                        <i class="fas fa-dragon"></i>
                        <span>Quetz</span>
                    </button>
                </div>
                <div class="quick-spawn-actions">
                    <button class="btn-secondary" onclick="app.closeModal()">Cancel</button>
                </div>
            </div>
        `;
        this.showModal('Quick Spawn', content);
    }

    quickSpawn(dinoType) {
        const commands = {
            giga: 'admincheat SpawnDino "Blueprint\'/Game/PrimalEarth/Dinos/Giganotosaurus/Giganotosaurus_Character_BP.Giganotosaurus_Character_BP\'" 500 0 0 120',
            rex: 'admincheat SpawnDino "Blueprint\'/Game/PrimalEarth/Dinos/Rex/Rex_Character_BP.Rex_Character_BP\'" 500 0 0 120',
            argent: 'admincheat SpawnDino "Blueprint\'/Game/PrimalEarth/Dinos/Argentavis/Argentavis_Character_BP.Argentavis_Character_BP\'" 500 0 0 120',
            quetz: 'admincheat SpawnDino "Blueprint\'/Game/PrimalEarth/Dinos/Quetzalcoatlus/Quetz_Character_BP.Quetz_Character_BP\'" 500 0 0 120'
        };

        if (commands[dinoType]) {
            this.executeCommand(commands[dinoType]);
            this.closeModal();
        }
    }

    teleportToCursor() {
        // This would integrate with the map system
        this.showNotification('Teleport to cursor feature - click on map to teleport', 'info');
    }

    toggleGodMode() {
        this.executeCommand('admincheat God');
    }

    saveSettings() {
        // Save settings to localStorage
        const settings = {
            theme: document.getElementById('theme-select')?.value || 'dark',
            notifications: document.getElementById('notifications-enabled')?.checked || true,
            serverIP: document.getElementById('server-ip')?.value || '',
            adminPassword: document.getElementById('admin-password')?.value || ''
        };

        localStorage.setItem('settings', JSON.stringify(settings));
        this.showNotification('Settings saved successfully', 'success');
        this.closeModal();
    }

    applyPreferences(preferences) {
        // Apply saved preferences
        if (preferences.theme) {
            document.body.setAttribute('data-theme', preferences.theme);
        }
    }

    saveState() {
        // Save current state before closing
        const state = {
            currentTab: this.currentTab,
            recentCommands: this.recentCommands,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('appState', JSON.stringify(state));
    }

    startBackgroundProcesses() {
        // Update server stats every 30 seconds
        setInterval(() => {
            this.updateServerStats();
        }, 30000);

        // Auto-save state every 5 minutes
        setInterval(() => {
            this.saveState();
        }, 300000);
    }

    minimizeWindow() {
        if (window.electronAPI) {
            window.electronAPI.minimize();
        }
    }

    closeWindow() {
        if (window.electronAPI) {
            window.electronAPI.close();
        } else {
            window.close();
        }
    }

    visualFeedback(element) {
        element.classList.add('glow');
        setTimeout(() => {
            element.classList.remove('glow');
        }, 400);
    }
    playSound(type) {
        if (!this.soundEnabled) return;
        let audio;
        switch (type) {
            case 'click':
                audio = new Audio('assets/sounds/click.mp3');
                break;
            case 'success':
                audio = new Audio('assets/sounds/success.mp3');
                break;
            case 'error':
                audio = new Audio('assets/sounds/error.mp3');
                break;
            default:
                return;
        }
        audio.volume = 0.2;
        audio.play();
    }
    toggleSound(enabled) {
        this.soundEnabled = enabled;
        localStorage.setItem('soundEnabled', JSON.stringify(enabled));
        this.showNotification(`Sound ${enabled ? 'enabled' : 'disabled'}`, 'info');
    }

    // Test function to verify modal system
    testModal() {
        console.log('🧪 Testing modal system...');
        
        // Check if modal elements exist
        const modalElements = {
            modal: document.getElementById('modal'),
            modalTitle: document.getElementById('modal-title'),
            modalContent: document.getElementById('modal-content'),
            modalOverlay: document.getElementById('modal-overlay'),
            modalClose: document.getElementById('modal-close')
        };
        
        console.log('Modal elements check:', modalElements);
        
        const testContent = `
            <div class="test-modal-content">
                <h4>Modal Test</h4>
                <p>This is a test modal to verify the modal system is working correctly.</p>
                <p><strong>Modal Elements Status:</strong></p>
                <ul>
                    <li>Modal: ${modalElements.modal ? '✅ Found' : '❌ Missing'}</li>
                    <li>Modal Title: ${modalElements.modalTitle ? '✅ Found' : '❌ Missing'}</li>
                    <li>Modal Content: ${modalElements.modalContent ? '✅ Found' : '❌ Missing'}</li>
                    <li>Modal Overlay: ${modalElements.modalOverlay ? '✅ Found' : '❌ Missing'}</li>
                    <li>Modal Close: ${modalElements.modalClose ? '✅ Found' : '❌ Missing'}</li>
                </ul>
                <div class="test-actions">
                    <button class="btn-primary" onclick="app.closeModal()">Close Modal</button>
                    <button class="btn-secondary" onclick="app.testModal()">Test Again</button>
                </div>
            </div>
        `;
        
        this.showModal('Modal System Test', testContent);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add a small delay to ensure all scripts are loaded
    setTimeout(() => {
        window.app = new PlayNexusAdminToolkit();
    }, 100);
});

// Export for use in other modules
window.ARKAdminToolkit = PlayNexusAdminToolkit;

// Global test functions for debugging
window.testModalSystem = function() {
    if (window.app) {
        window.app.testModal();
    } else {
        console.error('❌ App not available');
        alert('App not available. Please wait for the application to load.');
    }
};

window.checkModalElements = function() {
    const elements = {
        modal: document.getElementById('modal'),
        modalTitle: document.getElementById('modal-title'),
        modalContent: document.getElementById('modal-content'),
        modalOverlay: document.getElementById('modal-overlay'),
        modalClose: document.getElementById('modal-close')
    };
    
    console.log('🔍 Modal Elements Check:', elements);
    
    const missing = Object.entries(elements).filter(([name, element]) => !element);
    if (missing.length > 0) {
        console.error('❌ Missing modal elements:', missing.map(([name]) => name));
    } else {
        console.log('✅ All modal elements found');
    }
    
    return elements;
}; 