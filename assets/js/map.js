// ARK Admin Toolkit: Omega Control Suite - Map Tools

const MapTools = {
    canvas: null,
    ctx: null,
    mapMode: 'teleport', // teleport, spawn, pin
    savedLocations: [],
    mapScale: 1,
    mapOffset: { x: 0, y: 0 },
    isDragging: false,
    lastMousePos: { x: 0, y: 0 },
    fogOfWarEnabled: false, // New property for fog of war
    
    async init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.setupMapControls();
        this.renderMap();
    },
    
    setupCanvas() {
        this.canvas = document.getElementById('map-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.renderMap();
        });
    },
    
    resizeCanvas() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        if (!container) return;
        
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    },
    
    setupEventListeners() {
        // Map mode buttons
        document.getElementById('teleport-mode')?.addEventListener('click', () => {
            this.setMapMode('teleport');
            if (window.app) window.app.visualFeedback(document.getElementById('teleport-mode'));
            if (window.app) window.app.playSound('click');
        });
        document.getElementById('teleport-mode')?.setAttribute('tabindex', '0');
        document.getElementById('teleport-mode')?.setAttribute('aria-label', 'Teleport mode');
        document.getElementById('spawn-mode')?.addEventListener('click', () => {
            this.setMapMode('spawn');
            if (window.app) window.app.visualFeedback(document.getElementById('spawn-mode'));
            if (window.app) window.app.playSound('click');
        });
        document.getElementById('spawn-mode')?.setAttribute('tabindex', '0');
        document.getElementById('spawn-mode')?.setAttribute('aria-label', 'Spawn mode');
        document.getElementById('pin-mode')?.addEventListener('click', () => {
            this.setMapMode('pin');
            if (window.app) window.app.visualFeedback(document.getElementById('pin-mode'));
            if (window.app) window.app.playSound('click');
        });
        document.getElementById('pin-mode')?.setAttribute('tabindex', '0');
        document.getElementById('pin-mode')?.setAttribute('aria-label', 'Pin mode');
        // Map canvas events
        if (this.canvas) {
            this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
            this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
            this.canvas.addEventListener('click', (e) => {
                this.handleMapClick(e);
                if (window.app) window.app.visualFeedback(this.canvas);
                if (window.app) window.app.playSound('click');
            });
            this.canvas.setAttribute('tabindex', '0');
            this.canvas.setAttribute('aria-label', 'ARK map canvas');
        }
        // Day/Night slider
        const dayNightSlider = document.getElementById('day-night-slider');
        if (dayNightSlider) {
            dayNightSlider.addEventListener('input', (e) => {
                this.setDayNightTime(e.target.value);
                if (window.app) window.app.visualFeedback(dayNightSlider);
                if (window.app) window.app.playSound('click');
            });
            dayNightSlider.setAttribute('aria-label', 'Day/Night time');
        }
        // Weather selector
        const weatherSelect = document.getElementById('weather-select');
        if (weatherSelect) {
            weatherSelect.addEventListener('change', (e) => {
                this.setWeather(e.target.value);
                if (window.app) window.app.visualFeedback(weatherSelect);
                if (window.app) window.app.playSound('click');
            });
            weatherSelect.setAttribute('aria-label', 'Weather select');
        }
        // Save location button
        const saveBtn = document.getElementById('save-location');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveCurrentLocation();
                if (window.app) window.app.visualFeedback(saveBtn);
                if (window.app) window.app.playSound('click');
            });
            saveBtn.setAttribute('tabindex', '0');
            saveBtn.setAttribute('aria-label', 'Save current location');
        }
        const fogCheckbox = document.getElementById('fog-of-war');
        if (fogCheckbox) {
            fogCheckbox.addEventListener('change', (e) => {
                this.toggleFogOfWar(e.target.checked);
                if (window.app) window.app.visualFeedback(fogCheckbox);
                if (window.app) window.app.playSound('click');
            });
            fogCheckbox.setAttribute('aria-label', 'Toggle fog of war');
        }
    },
    
    setupMapControls() {
        // Initialize map controls state
        this.updateMapModeButtons();
    },
    
    setMapMode(mode) {
        this.mapMode = mode;
        this.updateMapModeButtons();
        this.updateCursor();
    },
    
    updateMapModeButtons() {
        document.querySelectorAll('.map-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.getElementById(`${this.mapMode}-mode`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    },
    
    updateCursor() {
        if (!this.canvas) return;
        
        const cursors = {
            teleport: 'crosshair',
            spawn: 'cell',
            pin: 'pointer'
        };
        
        this.canvas.style.cursor = cursors[this.mapMode] || 'default';
    },
    
    handleMouseDown(e) {
        this.isDragging = true;
        this.lastMousePos = this.getMousePos(e);
    },
    
    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        const currentPos = this.getMousePos(e);
        const deltaX = currentPos.x - this.lastMousePos.x;
        const deltaY = currentPos.y - this.lastMousePos.y;
        
        this.mapOffset.x += deltaX;
        this.mapOffset.y += deltaY;
        
        this.lastMousePos = currentPos;
        this.renderMap();
    },
    
    handleMouseUp(e) {
        this.isDragging = false;
    },
    
    handleMapClick(e) {
        if (this.isDragging) return; // Don't trigger click if we were dragging
        
        const pos = this.getMousePos(e);
        const worldPos = this.screenToWorld(pos);
        
        switch (this.mapMode) {
            case 'teleport':
                this.teleportToLocation(worldPos);
                break;
            case 'spawn':
                this.spawnAtLocation(worldPos);
                break;
            case 'pin':
                this.addMapPin(worldPos);
                break;
        }
    },
    
    handleWheel(e) {
        e.preventDefault();
        
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.mapScale *= zoomFactor;
        this.mapScale = Math.max(0.1, Math.min(5, this.mapScale));
        
        this.renderMap();
    },
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    },
    
    screenToWorld(screenPos) {
        return {
            x: (screenPos.x - this.mapOffset.x) / this.mapScale,
            y: (screenPos.y - this.mapOffset.y) / this.mapScale
        };
    },
    
    worldToScreen(worldPos) {
        return {
            x: worldPos.x * this.mapScale + this.mapOffset.x,
            y: worldPos.y * this.mapScale + this.mapOffset.y
        };
    },
    
    renderMap() {
        if (!this.ctx || !this.canvas) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw grid
        this.drawGrid();
        
        // Draw landmarks
        this.drawLandmarks();
        
        // Draw saved locations
        this.drawSavedLocations();
        
        // Draw heatmap
        this.drawHeatmap();
    },
    
    drawBackground() {
        // Create gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#2a4a2a'); // Dark green
        gradient.addColorStop(0.5, '#4a6a4a'); // Medium green
        gradient.addColorStop(1, '#2a4a2a'); // Dark green
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },
    
    drawGrid() {
        const gridSize = 100 * this.mapScale;
        const offsetX = this.mapOffset.x % gridSize;
        const offsetY = this.mapOffset.y % gridSize;
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = offsetX; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = offsetY; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    },
    
    drawLandmarks() {
        // Draw obelisks and other landmarks
        const landmarks = [
            { name: 'Red Obelisk', x: 1000, y: 2000, color: '#ff4444' },
            { name: 'Green Obelisk', x: 4000, y: 5000, color: '#44ff44' },
            { name: 'Blue Obelisk', x: 7000, y: 3000, color: '#4444ff' }
        ];
        
        landmarks.forEach(landmark => {
            const screenPos = this.worldToScreen(landmark);
            
            // Draw landmark icon
            this.ctx.fillStyle = landmark.color;
            this.ctx.beginPath();
            this.ctx.arc(screenPos.x, screenPos.y, 8, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw label
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(landmark.name, screenPos.x, screenPos.y - 15);
        });
    },
    
    drawSavedLocations() {
        this.savedLocations.forEach(location => {
            const screenPos = this.worldToScreen(location);
            
            // Draw location pin
            this.ctx.fillStyle = '#ffff00';
            this.ctx.beginPath();
            this.ctx.arc(screenPos.x, screenPos.y, 6, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw label
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(location.name, screenPos.x, screenPos.y - 12);
        });
    },
    
    drawHeatmap() {
        const heatmapData = DataManager.get('heatmap');
        
        heatmapData.forEach(point => {
            const screenPos = this.worldToScreen(point);
            const alpha = point.density * 0.3;
            
            this.ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(screenPos.x, screenPos.y, 20, 0, Math.PI * 2);
            this.ctx.fill();
        });
    },
    
    teleportToLocation(worldPos) {
        if (!worldPos) {
            Components.showNotification('Invalid map location', 'error');
            if (window.app) window.app.playSound('error');
            return;
        }
        const command = `admincheat SetPlayerPos ${Math.round(worldPos.x)} ${Math.round(worldPos.y)} 300`;
        if (window.app) {
            window.app.executeCommand(command);
        }
        Components.showNotification('Teleported to location!', 'success');
        if (window.app) window.app.playSound('success');
    },
    spawnAtLocation(worldPos) {
        if (!worldPos) {
            Components.showNotification('Invalid map location', 'error');
            if (window.app) window.app.playSound('error');
            return;
        }
        const command = `admincheat SpawnDinoAtLocation ${Math.round(worldPos.x)} ${Math.round(worldPos.y)} 300`;
        if (window.app) {
            window.app.executeCommand(command);
        }
        Components.showNotification('Spawned at location!', 'success');
        if (window.app) window.app.playSound('success');
    },
    addMapPin(worldPos) {
        if (!worldPos) {
            Components.showNotification('Invalid map location', 'error');
            if (window.app) window.app.playSound('error');
            return;
        }
        // Add pin logic here (could push to an array and re-render overlays)
        Components.showNotification('Pin added to map!', 'success');
        if (window.app) window.app.playSound('success');
    },
    saveCurrentLocation() {
        // Validate current position (simulate for now)
        const pos = { x: Math.round(Math.random() * 10000), y: Math.round(Math.random() * 10000) };
        if (!pos.x || !pos.y) {
            Components.showNotification('Invalid location', 'error');
            if (window.app) window.app.playSound('error');
            return;
        }
        this.savedLocations.push(pos);
        this.updateLocationsList();
        Components.showNotification('Location saved!', 'success');
        if (window.app) window.app.playSound('success');
    },
    updateLocationsList() {
        const list = document.getElementById('locations-list');
        if (!list) return;
        list.innerHTML = '';
        if (this.savedLocations.length === 0) {
            list.innerHTML = '<div class="empty-state">No saved locations</div>';
            return;
        }
        this.savedLocations.forEach((loc, idx) => {
            const locDiv = document.createElement('div');
            locDiv.className = 'location-entry';
            locDiv.setAttribute('tabindex', '0');
            locDiv.setAttribute('role', 'button');
            locDiv.setAttribute('aria-label', `Teleport to location ${idx + 1}`);
            locDiv.textContent = `X: ${loc.x}, Y: ${loc.y}`;
            locDiv.addEventListener('click', () => {
                this.teleportToLocation(loc);
                if (window.app) window.app.visualFeedback(locDiv);
                if (window.app) window.app.playSound('click');
            });
            locDiv.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    locDiv.click();
                }
            });
            list.appendChild(locDiv);
        });
    },
    
    setDayNightTime(hour) {
        const timeDisplay = document.getElementById('day-night-value');
        if (timeDisplay) {
            const hours = Math.floor(hour);
            const minutes = Math.round((hour - hours) * 60);
            timeDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
        
        const command = `admincheat SetTimeOfDay ${hour}`;
        if (window.app) {
            window.app.executeCommand(command);
        }
    },
    
    setWeather(weather) {
        const weatherCommands = {
            clear: 'admincheat SetWeatherIntensity Rain 0',
            rain: 'admincheat SetWeatherIntensity Rain 1',
            storm: 'admincheat SetWeatherIntensity Storm 1',
            fog: 'admincheat SetWeatherIntensity Fog 1'
        };
        
        const command = weatherCommands[weather];
        if (command && window.app) {
            window.app.executeCommand(command);
        }
    },
    
    loadSavedLocations(locations) {
        this.savedLocations = locations || [];
        this.updateLocationsList();
        this.renderMap();
    },
    
    refresh() {
        this.renderMap();
        this.updateLocationsList();
    },

    toggleFogOfWar(enabled) {
        this.fogOfWarEnabled = enabled;
        Components.showNotification(`Fog of War ${enabled ? 'enabled' : 'disabled'}`, 'info');
        // Optionally, trigger a map re-render or effect here
    }
};

window.MapTools = MapTools;
export default MapTools; 