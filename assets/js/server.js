// ARK Admin Toolkit: Omega Control Suite - Server Monitor

const ServerMonitor = {
    serverStatus: 'online',
    serverInfo: {},
    performanceMetrics: {},
    updateInterval: null,
    
    async init() {
        this.setupEventListeners();
        this.loadServerInfo();
        this.startMonitoring();
        this.updateServerStatus();
    },
    
    setupEventListeners() {
        // Server control buttons
        document.getElementById('restart-server')?.addEventListener('click', () => {
            this.restartServer();
        });
        
        document.getElementById('save-world')?.addEventListener('click', () => {
            this.saveWorld();
        });
        
        document.getElementById('broadcast-message')?.addEventListener('click', () => {
            this.showBroadcastModal();
        });
        
        document.getElementById('shutdown-server')?.addEventListener('click', () => {
            this.shutdownServer();
        });
        
        // Performance settings
        document.getElementById('auto-save-toggle')?.addEventListener('change', (e) => {
            this.toggleAutoSave(e.target.checked);
        });
        
        document.getElementById('performance-mode')?.addEventListener('change', (e) => {
            this.setPerformanceMode(e.target.value);
        });
    },
    
    loadServerInfo() {
        // Sample server information
        this.serverInfo = {
            name: 'ARK Omega Server',
            version: 'v337.3',
            map: 'The Island',
            maxPlayers: 70,
            currentPlayers: 23,
            uptime: '3d 14h 22m',
            lastSave: new Date(Date.now() - 300000), // 5 minutes ago
            nextSave: new Date(Date.now() + 900000), // 15 minutes from now
            mods: ['S+', 'Dino Storage v2', 'Kraken\'s Better Dinos'],
            settings: {
                tamingSpeed: 3.0,
                harvestAmount: 2.0,
                expMultiplier: 2.0,
                breedingInterval: 0.5
            }
        };
        
        this.updateServerInfoDisplay();
    },
    
    startMonitoring() {
        // Simulate real-time monitoring
        this.updateInterval = setInterval(() => {
            this.updatePerformanceMetrics();
            this.updateServerStatus();
        }, 5000); // Update every 5 seconds
    },
    
    updatePerformanceMetrics() {
        // Simulate performance data
        this.performanceMetrics = {
            cpu: Math.random() * 30 + 20, // 20-50%
            memory: Math.random() * 40 + 30, // 30-70%
            network: Math.random() * 50 + 10, // 10-60 Mbps
            fps: Math.random() * 20 + 30, // 30-50 FPS
            entities: Math.floor(Math.random() * 5000) + 10000, // 10k-15k entities
            structures: Math.floor(Math.random() * 2000) + 5000 // 5k-7k structures
        };
        
        this.updatePerformanceDisplay();
    },
    
    updateServerStatus() {
        const statusElement = document.getElementById('server-status');
        if (!statusElement) return;
        
        // Simulate occasional server issues
        if (Math.random() < 0.05) { // 5% chance of status change
            this.serverStatus = this.serverStatus === 'online' ? 'warning' : 'online';
        }
        
        statusElement.className = `status-indicator ${this.serverStatus}`;
        statusElement.textContent = this.serverStatus.toUpperCase();
        
        // Update player count
        if (this.serverInfo.currentPlayers < this.serverInfo.maxPlayers) {
            this.serverInfo.currentPlayers += Math.floor(Math.random() * 3) - 1; // +/- 1 player
            this.serverInfo.currentPlayers = Math.max(0, Math.min(this.serverInfo.maxPlayers, this.serverInfo.currentPlayers));
        }
        
        this.updateServerInfoDisplay();
    },
    
    updateServerInfoDisplay() {
        // Update server info panel
        const infoContainer = document.getElementById('server-info');
        if (!infoContainer) return;
        
        infoContainer.innerHTML = `
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Server Name:</span>
                    <span class="info-value">${this.serverInfo.name}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Version:</span>
                    <span class="info-value">${this.serverInfo.version}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Map:</span>
                    <span class="info-value">${this.serverInfo.map}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Players:</span>
                    <span class="info-value">${this.serverInfo.currentPlayers}/${this.serverInfo.maxPlayers}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Uptime:</span>
                    <span class="info-value">${this.serverInfo.uptime}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Last Save:</span>
                    <span class="info-value">${this.serverInfo.lastSave.toLocaleTimeString()}</span>
                </div>
            </div>
        `;
        
        // Update player count display
        const playerCountElement = document.getElementById('player-count');
        if (playerCountElement) {
            playerCountElement.textContent = `${this.serverInfo.currentPlayers}/${this.serverInfo.maxPlayers}`;
        }
        
        // Update save timer
        this.updateSaveTimer();
    },
    
    updatePerformanceDisplay() {
        const metrics = this.performanceMetrics;
        const container = document.getElementById('performance-metrics');
        if (!container) return;
        
        container.innerHTML = `
            <div class="metrics-grid">
                <div class="metric-item">
                    <div class="metric-label">CPU Usage</div>
                    <div class="metric-value">${metrics.cpu.toFixed(1)}%</div>
                    <div class="metric-bar">
                        <div class="metric-fill" style="width: ${metrics.cpu}%"></div>
                    </div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Memory Usage</div>
                    <div class="metric-value">${metrics.memory.toFixed(1)}%</div>
                    <div class="metric-bar">
                        <div class="metric-fill" style="width: ${metrics.memory}%"></div>
                    </div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Network</div>
                    <div class="metric-value">${metrics.network.toFixed(1)} Mbps</div>
                    <div class="metric-bar">
                        <div class="metric-fill" style="width: ${(metrics.network / 100) * 100}%"></div>
                    </div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Server FPS</div>
                    <div class="metric-value">${metrics.fps.toFixed(1)}</div>
                    <div class="metric-bar">
                        <div class="metric-fill" style="width: ${(metrics.fps / 60) * 100}%"></div>
                    </div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Entities</div>
                    <div class="metric-value">${metrics.entities.toLocaleString()}</div>
                    <div class="metric-bar">
                        <div class="metric-fill" style="width: ${(metrics.entities / 20000) * 100}%"></div>
                    </div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Structures</div>
                    <div class="metric-value">${metrics.structures.toLocaleString()}</div>
                    <div class="metric-bar">
                        <div class="metric-fill" style="width: ${(metrics.structures / 10000) * 100}%"></div>
                    </div>
                </div>
            </div>
        `;
    },
    
    updateSaveTimer() {
        const timerElement = document.getElementById('save-timer');
        if (!timerElement) return;
        
        const now = new Date();
        const timeUntilSave = this.serverInfo.nextSave - now;
        
        if (timeUntilSave > 0) {
            const minutes = Math.floor(timeUntilSave / 60000);
            const seconds = Math.floor((timeUntilSave % 60000) / 1000);
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        } else {
            timerElement.textContent = 'Saving...';
            // Trigger save
            this.saveWorld();
        }
    },
    
    restartServer() {
        const confirmed = confirm('Are you sure you want to restart the server? This will disconnect all players.');
        if (!confirmed) return;
        
        Components.showNotification('Server restart initiated...', 'warning');
        
        // Simulate restart process
        setTimeout(() => {
            this.serverStatus = 'offline';
            this.updateServerStatus();
            
            setTimeout(() => {
                this.serverStatus = 'online';
                this.serverInfo.currentPlayers = 0;
                this.updateServerStatus();
                Components.showNotification('Server restarted successfully', 'success');
            }, 30000); // 30 second restart time
        }, 5000);
    },
    
    saveWorld() {
        Components.showNotification('World save initiated...', 'info');
        
        // Simulate save process
        setTimeout(() => {
            this.serverInfo.lastSave = new Date();
            this.serverInfo.nextSave = new Date(Date.now() + 900000); // 15 minutes from now
            this.updateServerInfoDisplay();
            Components.showNotification('World saved successfully', 'success');
        }, 3000);
    },
    
    showBroadcastModal() {
        const content = `
            <div class="broadcast-modal">
                <div class="form-group">
                    <label for="broadcast-message-text">Message:</label>
                    <textarea id="broadcast-message-text" placeholder="Enter your broadcast message..." rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label for="broadcast-type">Type:</label>
                    <select id="broadcast-type">
                        <option value="info">Information</option>
                        <option value="warning">Warning</option>
                        <option value="announcement">Announcement</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="broadcast-duration">Duration (seconds):</label>
                    <input type="number" id="broadcast-duration" value="10" min="1" max="60">
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" onclick="ServerMonitor.sendBroadcast()">
                        <i class="fas fa-broadcast-tower"></i> Send Broadcast
                    </button>
                    <button class="btn-secondary" onclick="Components.closeModal()">
                        Cancel
                    </button>
                </div>
            </div>
        `;
        
        Components.showPopup('Send Broadcast Message', content);
    },
    
    sendBroadcast() {
        const message = document.getElementById('broadcast-message-text')?.value;
        const type = document.getElementById('broadcast-type')?.value;
        const duration = document.getElementById('broadcast-duration')?.value;
        
        if (!message) {
            Components.showNotification('Please enter a message', 'warning');
            return;
        }
        
        const command = `admincheat Broadcast "${message}" ${duration || 10}`;
        
        if (window.app) {
            window.app.executeCommand(command);
        }
        
        Components.closeModal();
        Components.showNotification(`Broadcast sent: ${message}`, 'success');
    },
    
    toggleAutoSave(enabled) {
        const command = `admincheat SetAutoSaveInterval ${enabled ? '900' : '0'}`; // 15 minutes or disabled
        
        if (window.app) {
            window.app.executeCommand(command);
        }
        
        Components.showNotification(`Auto-save ${enabled ? 'enabled' : 'disabled'}`, 'success');
    },
    
    setPerformanceMode(mode) {
        let commands = [];
        
        switch (mode) {
            case 'performance':
                commands = [
                    'admincheat SetMaxStructuresInRange 1300',
                    'admincheat SetMaxPlatformSaddleStructureLimit 88',
                    'admincheat SetMaxPlatformSaddleStructureLimit 88'
                ];
                break;
            case 'balanced':
                commands = [
                    'admincheat SetMaxStructuresInRange 2000',
                    'admincheat SetMaxPlatformSaddleStructureLimit 200',
                    'admincheat SetMaxPlatformSaddleStructureLimit 200'
                ];
                break;
            case 'quality':
                commands = [
                    'admincheat SetMaxStructuresInRange 3000',
                    'admincheat SetMaxPlatformSaddleStructureLimit 400',
                    'admincheat SetMaxPlatformSaddleStructureLimit 400'
                ];
                break;
        }
        
        commands.forEach(command => {
            if (window.app) {
                window.app.executeCommand(command);
            }
        });
        
        Components.showNotification(`Performance mode set to: ${mode}`, 'success');
    },
    
    getServerLogs() {
        // Simulate server logs
        const logs = [
            { time: new Date(), level: 'info', message: 'Server started successfully' },
            { time: new Date(Date.now() - 60000), level: 'info', message: 'Player "Survivor123" joined the server' },
            { time: new Date(Date.now() - 120000), level: 'warning', message: 'High entity count detected' },
            { time: new Date(Date.now() - 180000), level: 'info', message: 'World auto-save completed' },
            { time: new Date(Date.now() - 240000), level: 'error', message: 'Connection timeout for player "BreederPro"' }
        ];
        
        return logs;
    },
    
    showServerLogs() {
        const logs = this.getServerLogs();
        
        const content = `
            <div class="server-logs">
                <div class="logs-header">
                    <h4>Recent Server Logs</h4>
                    <button class="btn-secondary" onclick="ServerMonitor.refreshLogs()">
                        <i class="fas fa-sync"></i> Refresh
                    </button>
                </div>
                <div class="logs-content">
                    ${logs.map(log => `
                        <div class="log-entry ${log.level}">
                            <span class="log-time">${log.time.toLocaleTimeString()}</span>
                            <span class="log-level">${log.level.toUpperCase()}</span>
                            <span class="log-message">${log.message}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        Components.showPopup('Server Logs', content);
    },
    
    refreshLogs() {
        // Simulate refreshing logs
        Components.showNotification('Logs refreshed', 'info');
        this.showServerLogs(); // Reopen with fresh logs
    },
    
    shutdownServer() {
        const confirmed = confirm('Are you sure you want to shut down the server? This will disconnect all players and stop the server.');
        if (!confirmed) return;
        Components.showNotification('Server shutdown initiated...', 'warning');
        setTimeout(() => {
            this.serverStatus = 'offline';
            this.updateServerStatus && this.updateServerStatus();
            Components.showNotification('Server has been shut down.', 'success');
        }, 5000);
    },
    
    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    },
    
    refresh() {
        this.loadServerInfo();
        this.updatePerformanceMetrics();
        this.updateServerStatus();
    }
};

window.ServerMonitor = ServerMonitor;
export default ServerMonitor; 