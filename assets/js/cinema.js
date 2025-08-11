// ARK Admin Toolkit: Omega Control Suite - Cinema Mode

const CinemaMode = {
    isActive: false,
    currentScene: null,
    cameraSettings: {
        fov: 90,
        dof: false,
        motionBlur: false,
        bloom: true,
        vignette: false
    },
    recording: {
        isRecording: false,
        duration: 0,
        startTime: null
    },
    
    async init() {
        this.setupEventListeners();
        this.loadCinemaData();
        this.updateCinemaUI();
    },
    
    setupEventListeners() {
        // Cinema mode toggle
        document.getElementById('toggle-cinema')?.addEventListener('click', () => {
            this.toggleCinemaMode();
            Components.showNotification('Toggled UI (stub)', 'info');
        });
        // Free camera
        document.getElementById('free-camera')?.addEventListener('click', () => {
            Components.showNotification('Free Camera activated (stub)', 'info');
        });
        // Auto pilot
        document.getElementById('auto-pilot')?.addEventListener('click', () => {
            Components.showNotification('Auto Pilot started (stub)', 'info');
        });
        // Creative mode buttons
        document.getElementById('instant-build')?.addEventListener('click', () => {
            Components.showNotification('Instant Build triggered (stub)', 'info');
        });
        document.getElementById('structure-cleaner')?.addEventListener('click', () => {
            Components.showNotification('Structure Cleaner activated (stub)', 'info');
        });
        document.getElementById('base-preview')?.addEventListener('click', () => {
            Components.showNotification('Base Preview opened (stub)', 'info');
        });
        
        // Camera controls
        document.getElementById('camera-fov')?.addEventListener('input', (e) => {
            this.setCameraFOV(parseInt(e.target.value));
        });
        
        document.getElementById('camera-dof')?.addEventListener('change', (e) => {
            this.setDepthOfField(e.target.checked);
        });
        
        document.getElementById('camera-motion-blur')?.addEventListener('change', (e) => {
            this.setMotionBlur(e.target.checked);
        });
        
        document.getElementById('camera-bloom')?.addEventListener('change', (e) => {
            this.setBloom(e.target.checked);
        });
        
        document.getElementById('camera-vignette')?.addEventListener('change', (e) => {
            this.setVignette(e.target.checked);
        });
        
        // Recording controls
        document.getElementById('start-recording')?.addEventListener('click', () => {
            this.startRecording();
        });
        
        document.getElementById('stop-recording')?.addEventListener('click', () => {
            this.stopRecording();
        });
        
        // Scene presets
        document.querySelectorAll('.scene-preset').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.loadScenePreset(e.target.dataset.scene);
            });
        });
        
        // Camera presets
        document.querySelectorAll('.camera-preset').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.loadCameraPreset(e.target.dataset.preset);
            });
        });
    },
    
    loadCinemaData() {
        // Scene presets
        this.scenePresets = {
            'action': {
                name: 'Action Scene',
                fov: 75,
                dof: true,
                motionBlur: true,
                bloom: true,
                vignette: false,
                commands: [
                    'admincheat SetTimeOfDay 12',
                    'admincheat SetWeather 0',
                    'admincheat SetFogDensity 0.1'
                ]
            },
            'dramatic': {
                name: 'Dramatic Scene',
                fov: 60,
                dof: true,
                motionBlur: false,
                bloom: false,
                vignette: true,
                commands: [
                    'admincheat SetTimeOfDay 18',
                    'admincheat SetWeather 2',
                    'admincheat SetFogDensity 0.3'
                ]
            },
            'scenic': {
                name: 'Scenic View',
                fov: 90,
                dof: false,
                motionBlur: false,
                bloom: true,
                vignette: false,
                commands: [
                    'admincheat SetTimeOfDay 6',
                    'admincheat SetWeather 0',
                    'admincheat SetFogDensity 0.0'
                ]
            },
            'night': {
                name: 'Night Scene',
                fov: 80,
                dof: true,
                motionBlur: false,
                bloom: true,
                vignette: true,
                commands: [
                    'admincheat SetTimeOfDay 22',
                    'admincheat SetWeather 0',
                    'admincheat SetFogDensity 0.2'
                ]
            }
        };
        
        // Camera presets
        this.cameraPresets = {
            'wide': {
                name: 'Wide Angle',
                fov: 120,
                dof: false,
                motionBlur: false
            },
            'telephoto': {
                name: 'Telephoto',
                fov: 45,
                dof: true,
                motionBlur: false
            },
            'cinematic': {
                name: 'Cinematic',
                fov: 70,
                dof: true,
                motionBlur: true
            },
            'first-person': {
                name: 'First Person',
                fov: 90,
                dof: false,
                motionBlur: false
            }
        };
    },
    
    toggleCinemaMode() {
        this.isActive = !this.isActive;
        
        if (this.isActive) {
            this.enterCinemaMode();
        } else {
            this.exitCinemaMode();
        }
        
        this.updateCinemaUI();
    },
    
    enterCinemaMode() {
        // Execute cinema mode commands
        const commands = [
            'admincheat SetCameraMode 1', // Free camera mode
            'admincheat SetShowHUD 0', // Hide HUD
            'admincheat SetShowCrosshair 0', // Hide crosshair
            'admincheat SetShowPlayerNames 0' // Hide player names
        ];
        
        commands.forEach(command => {
            if (window.app) {
                window.app.executeCommand(command);
            }
        });
        
        Components.showNotification('Cinema Mode activated', 'success');
    },
    
    exitCinemaMode() {
        // Restore normal view
        const commands = [
            'admincheat SetCameraMode 0', // Normal camera mode
            'admincheat SetShowHUD 1', // Show HUD
            'admincheat SetShowCrosshair 1', // Show crosshair
            'admincheat SetShowPlayerNames 1' // Show player names
        ];
        
        commands.forEach(command => {
            if (window.app) {
                window.app.executeCommand(command);
            }
        });
        
        // Stop recording if active
        if (this.recording.isRecording) {
            this.stopRecording();
        }
        
        Components.showNotification('Cinema Mode deactivated', 'info');
    },
    
    updateCinemaUI() {
        const toggleBtn = document.getElementById('toggle-cinema');
        const cinemaContainer = document.getElementById('cinema-controls');
        
        if (toggleBtn) {
            toggleBtn.textContent = this.isActive ? 'Exit Cinema Mode' : 'Enter Cinema Mode';
            toggleBtn.className = this.isActive ? 'btn-danger' : 'btn-primary';
        }
        
        if (cinemaContainer) {
            cinemaContainer.style.display = this.isActive ? 'block' : 'none';
        }
        
        // Update recording UI
        this.updateRecordingUI();
    },
    
    setCameraFOV(fov) {
        this.cameraSettings.fov = fov;
        
        if (this.isActive && window.app) {
            window.app.executeCommand(`admincheat SetCameraFOV ${fov}`);
        }
        
        // Update FOV display
        const fovDisplay = document.getElementById('fov-display');
        if (fovDisplay) {
            fovDisplay.textContent = fov;
        }
    },
    
    setDepthOfField(enabled) {
        this.cameraSettings.dof = enabled;
        
        if (this.isActive && window.app) {
            window.app.executeCommand(`admincheat SetDepthOfField ${enabled ? '1' : '0'}`);
        }
    },
    
    setMotionBlur(enabled) {
        this.cameraSettings.motionBlur = enabled;
        
        if (this.isActive && window.app) {
            window.app.executeCommand(`admincheat SetMotionBlur ${enabled ? '1' : '0'}`);
        }
    },
    
    setBloom(enabled) {
        this.cameraSettings.bloom = enabled;
        
        if (this.isActive && window.app) {
            window.app.executeCommand(`admincheat SetBloom ${enabled ? '1' : '0'}`);
        }
    },
    
    setVignette(enabled) {
        this.cameraSettings.vignette = enabled;
        
        if (this.isActive && window.app) {
            window.app.executeCommand(`admincheat SetVignette ${enabled ? '1' : '0'}`);
        }
    },
    
    loadScenePreset(sceneKey) {
        const preset = this.scenePresets[sceneKey];
        if (!preset) {
            Components.showNotification(`Scene preset "${sceneKey}" not found`, 'error');
            return;
        }
        
        this.currentScene = sceneKey;
        
        // Apply camera settings
        this.cameraSettings = {
            fov: preset.fov,
            dof: preset.dof,
            motionBlur: preset.motionBlur,
            bloom: preset.bloom,
            vignette: preset.vignette
        };
        
        // Update UI
        this.updateCameraUI();
        
        // Apply settings if cinema mode is active
        if (this.isActive) {
            this.applyCameraSettings();
            this.executeSceneCommands(preset.commands);
        }
        
        Components.showNotification(`Loaded ${preset.name} scene`, 'success');
    },
    
    loadCameraPreset(presetKey) {
        const preset = this.cameraPresets[presetKey];
        if (!preset) {
            Components.showNotification(`Camera preset "${presetKey}" not found`, 'error');
            return;
        }
        
        // Apply camera settings
        this.cameraSettings = {
            ...this.cameraSettings,
            fov: preset.fov,
            dof: preset.dof,
            motionBlur: preset.motionBlur
        };
        
        // Update UI
        this.updateCameraUI();
        
        // Apply settings if cinema mode is active
        if (this.isActive) {
            this.applyCameraSettings();
        }
        
        Components.showNotification(`Loaded ${preset.name} camera preset`, 'success');
    },
    
    updateCameraUI() {
        // Update FOV slider
        const fovSlider = document.getElementById('camera-fov');
        const fovDisplay = document.getElementById('fov-display');
        if (fovSlider) fovSlider.value = this.cameraSettings.fov;
        if (fovDisplay) fovDisplay.textContent = this.cameraSettings.fov;
        
        // Update checkboxes
        const dofCheckbox = document.getElementById('camera-dof');
        const motionBlurCheckbox = document.getElementById('camera-motion-blur');
        const bloomCheckbox = document.getElementById('camera-bloom');
        const vignetteCheckbox = document.getElementById('camera-vignette');
        
        if (dofCheckbox) dofCheckbox.checked = this.cameraSettings.dof;
        if (motionBlurCheckbox) motionBlurCheckbox.checked = this.cameraSettings.motionBlur;
        if (bloomCheckbox) bloomCheckbox.checked = this.cameraSettings.bloom;
        if (vignetteCheckbox) vignetteCheckbox.checked = this.cameraSettings.vignette;
    },
    
    applyCameraSettings() {
        const settings = this.cameraSettings;
        
        if (window.app) {
            window.app.executeCommand(`admincheat SetCameraFOV ${settings.fov}`);
            window.app.executeCommand(`admincheat SetDepthOfField ${settings.dof ? '1' : '0'}`);
            window.app.executeCommand(`admincheat SetMotionBlur ${settings.motionBlur ? '1' : '0'}`);
            window.app.executeCommand(`admincheat SetBloom ${settings.bloom ? '1' : '0'}`);
            window.app.executeCommand(`admincheat SetVignette ${settings.vignette ? '1' : '0'}`);
        }
    },
    
    executeSceneCommands(commands) {
        commands.forEach(command => {
            if (window.app) {
                window.app.executeCommand(command);
            }
        });
    },
    
    startRecording() {
        if (!this.isActive) {
            Components.showNotification('Cinema Mode must be active to record', 'warning');
            return;
        }
        
        this.recording.isRecording = true;
        this.recording.startTime = new Date();
        this.recording.duration = 0;
        
        // Start recording timer
        this.recordingTimer = setInterval(() => {
            this.recording.duration++;
            this.updateRecordingUI();
        }, 1000);
        
        // Execute recording commands
        if (window.app) {
            window.app.executeCommand('admincheat StartRecording');
        }
        
        Components.showNotification('Recording started', 'success');
        this.updateRecordingUI();
    },
    
    stopRecording() {
        if (!this.recording.isRecording) return;
        
        this.recording.isRecording = false;
        
        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
            this.recordingTimer = null;
        }
        
        // Execute stop recording commands
        if (window.app) {
            window.app.executeCommand('admincheat StopRecording');
        }
        
        const duration = this.formatDuration(this.recording.duration);
        Components.showNotification(`Recording stopped. Duration: ${duration}`, 'success');
        this.updateRecordingUI();
    },
    
    updateRecordingUI() {
        const startBtn = document.getElementById('start-recording');
        const stopBtn = document.getElementById('stop-recording');
        const recordingStatus = document.getElementById('recording-status');
        const recordingDuration = document.getElementById('recording-duration');
        
        if (startBtn) {
            startBtn.disabled = this.recording.isRecording || !this.isActive;
        }
        
        if (stopBtn) {
            stopBtn.disabled = !this.recording.isRecording;
        }
        
        if (recordingStatus) {
            recordingStatus.textContent = this.recording.isRecording ? 'Recording' : 'Not Recording';
            recordingStatus.className = this.recording.isRecording ? 'status recording' : 'status idle';
        }
        
        if (recordingDuration) {
            recordingDuration.textContent = this.formatDuration(this.recording.duration);
        }
    },
    
    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    },
    
    showCinemaHelp() {
        const content = `
            <div class="cinema-help">
                <h3>Cinema Mode Controls</h3>
                <div class="help-section">
                    <h4>Camera Controls</h4>
                    <ul>
                        <li><strong>WASD:</strong> Move camera</li>
                        <li><strong>Mouse:</strong> Look around</li>
                        <li><strong>Q/E:</strong> Roll camera</li>
                        <li><strong>Shift:</strong> Fast movement</li>
                        <li><strong>Ctrl:</strong> Slow movement</li>
                    </ul>
                </div>
                <div class="help-section">
                    <h4>Recording</h4>
                    <ul>
                        <li>Start/Stop recording with buttons</li>
                        <li>Recordings saved to game directory</li>
                        <li>Use scene presets for quick setup</li>
                    </ul>
                </div>
                <div class="help-section">
                    <h4>Effects</h4>
                    <ul>
                        <li><strong>FOV:</strong> Field of view adjustment</li>
                        <li><strong>DOF:</strong> Depth of field blur</li>
                        <li><strong>Motion Blur:</strong> Movement blur effect</li>
                        <li><strong>Bloom:</strong> Light bloom effect</li>
                        <li><strong>Vignette:</strong> Darkened edges</li>
                    </ul>
                </div>
            </div>
        `;
        
        Components.showPopup('Cinema Mode Help', content);
    },
    
    refresh() {
        this.loadCinemaData();
        this.updateCinemaUI();
    }
};

window.CinemaMode = CinemaMode;
export default CinemaMode; 