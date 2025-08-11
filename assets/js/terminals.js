// ARK Admin Toolkit: Omega Control Suite - Terminals/Mannequins

const Terminals = {
    terminalType: 'mannequin', // mannequin or player-terminal
    currentConfig: {
        skin: '',
        pose: '',
        armor: '',
        color: '#ffffff',
        gear: []
    },
    
    async init() {
        this.setupEventListeners();
        this.loadTerminalData();
        this.updatePreview();
    },
    
    setupEventListeners() {
        // Terminal type switching
        document.querySelectorAll('.terminal-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTerminalType(e.target.dataset.type);
                if (window.app) window.app.visualFeedback(btn);
                if (window.app) window.app.playSound('click');
            });
            btn.setAttribute('tabindex', '0');
            btn.setAttribute('aria-label', `Switch to ${btn.textContent}`);
        });
        
        // Configuration changes
        document.getElementById('terminal-skin')?.addEventListener('change', (e) => {
            this.currentConfig.skin = e.target.value;
            this.updatePreview();
            if (window.app) window.app.visualFeedback(e.target);
            if (window.app) window.app.playSound('click');
        });
        
        document.getElementById('terminal-pose')?.addEventListener('change', (e) => {
            this.currentConfig.pose = e.target.value;
            this.updatePreview();
            if (window.app) window.app.visualFeedback(e.target);
            if (window.app) window.app.playSound('click');
        });
        
        document.getElementById('terminal-armor')?.addEventListener('change', (e) => {
            this.currentConfig.armor = e.target.value;
            this.updatePreview();
            if (window.app) window.app.visualFeedback(e.target);
            if (window.app) window.app.playSound('click');
        });
        
        document.getElementById('terminal-color')?.addEventListener('change', (e) => {
            this.currentConfig.color = e.target.value;
            this.updatePreview();
            if (window.app) window.app.visualFeedback(e.target);
            if (window.app) window.app.playSound('click');
        });
        
        // Gear presets
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.loadGearPreset(e.target.dataset.preset);
                if (window.app) window.app.visualFeedback(btn);
                if (window.app) window.app.playSound('click');
            });
            btn.setAttribute('tabindex', '0');
            btn.setAttribute('aria-label', `Load gear preset: ${btn.textContent}`);
        });
        
        // Action buttons
        const spawnBtn = document.getElementById('spawn-terminal');
        if (spawnBtn) {
            spawnBtn.addEventListener('click', () => {
                this.spawnTerminal();
                if (window.app) window.app.visualFeedback(spawnBtn);
                if (window.app) window.app.playSound('click');
            });
            spawnBtn.setAttribute('tabindex', '0');
            spawnBtn.setAttribute('aria-label', 'Spawn terminal');
            spawnBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    spawnBtn.click();
                }
            });
        }
        const previewBtn = document.getElementById('preview-terminal');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => {
                this.showPreviewModal();
                if (window.app) window.app.visualFeedback(previewBtn);
                if (window.app) window.app.playSound('click');
            });
            previewBtn.setAttribute('tabindex', '0');
            previewBtn.setAttribute('aria-label', 'Preview terminal');
            previewBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    previewBtn.click();
                }
            });
        }
    },
    
    loadTerminalData() {
        this.terminals = DataManager.get('terminals');
        this.mannequins = DataManager.get('mannequins');
        
        // Define gear presets
        this.gearPresets = {
            'pvp-kit': {
                name: 'PvP Kit',
                items: [
                    'PrimalItem_WeaponTekRifle_C',
                    'PrimalItemArmor_TekShirt_C',
                    'PrimalItemArmor_TekPants_C',
                    'PrimalItemArmor_TekHelmet_C',
                    'PrimalItem_Consumable_Element_C',
                    'PrimalItem_WeaponTekSword_C'
                ]
            },
            'breeder-kit': {
                name: 'Breeder Kit',
                items: [
                    'PrimalItem_WeaponCryoGun_C',
                    'PrimalItem_Consumable_Kibble_Base_C',
                    'PrimalItem_WeaponWhip_C',
                    'PrimalItem_Consumable_Stimulant_C',
                    'PrimalItem_Consumable_Narcotic_C'
                ]
            },
            'builder-kit': {
                name: 'Builder Kit',
                items: [
                    'PrimalItem_WeaponTekRifle_C',
                    'PrimalItem_Consumable_Element_C',
                    'PrimalItem_WeaponTekSword_C',
                    'PrimalItem_WeaponTekGrenade_C',
                    'PrimalItem_WeaponTekBow_C'
                ]
            },
            'explorer-kit': {
                name: 'Explorer Kit',
                items: [
                    'PrimalItem_WeaponTekRifle_C',
                    'PrimalItemArmor_ScubaShirt_C',
                    'PrimalItemArmor_ScubaPants_C',
                    'PrimalItem_Consumable_Element_C',
                    'PrimalItem_WeaponTekSword_C'
                ]
            }
        };
    },
    
    switchTerminalType(type) {
        this.terminalType = type;
        
        // Update active button
        document.querySelectorAll('.terminal-type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-type="${type}"]`)?.classList.add('active');
        
        // Update configuration based on type
        this.updateConfigurationForType();
        this.updatePreview();
        
        Components.showNotification(`Switched to ${type} mode`, 'info');
    },
    
    updateConfigurationForType() {
        if (this.terminalType === 'mannequin') {
            // Reset to mannequin defaults
            this.currentConfig = {
                skin: 'default',
                pose: 'idle',
                armor: '',
                color: '#ffffff',
                gear: []
            };
        } else {
            // Reset to player terminal defaults
            this.currentConfig = {
                skin: 'tek',
                pose: '',
                armor: 'tek',
                color: '#ffffff',
                gear: []
            };
        }
        
        // Update form values
        document.getElementById('terminal-skin').value = this.currentConfig.skin;
        document.getElementById('terminal-pose').value = this.currentConfig.pose;
        document.getElementById('terminal-armor').value = this.currentConfig.armor;
        document.getElementById('terminal-color').value = this.currentConfig.color;
    },
    
    loadGearPreset(presetKey) {
        const preset = this.gearPresets[presetKey];
        if (!preset) {
            Components.showNotification(`Preset "${presetKey}" not found`, 'error');
            return;
        }
        
        this.currentConfig.gear = [...preset.items];
        this.updatePreview();
        
        Components.showNotification(`Loaded ${preset.name}`, 'success');
    },
    
    updatePreview() {
        const container = document.getElementById('terminal-preview');
        if (!container) return;
        
        const config = this.currentConfig;
        const type = this.terminalType;
        
        // Create preview HTML
        let previewHTML = `
            <div class="terminal-preview-content">
                <div class="preview-header">
                    <h4>${type === 'mannequin' ? 'Mannequin' : 'Player Terminal'} Preview</h4>
                </div>
                <div class="preview-body">
                    <div class="preview-character">
                        <div class="character-icon">
                            <i class="fas fa-${type === 'mannequin' ? 'user' : 'terminal'}"></i>
                        </div>
                        <div class="character-details">
                            <div class="detail-row">
                                <span class="label">Type:</span>
                                <span class="value">${type}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Skin:</span>
                                <span class="value">${config.skin || 'Default'}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Pose:</span>
                                <span class="value">${config.pose || 'Default'}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Armor:</span>
                                <span class="value">${config.armor || 'None'}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Color:</span>
                                <span class="value"><span style="display:inline-block;width:16px;height:16px;background:${config.color};border-radius:4px;"></span> ${config.color}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Gear:</span>
                                <span class="value">${config.gear && config.gear.length > 0 ? config.gear.length + ' items' : 'None'}</span>
                            </div>
                        </div>
                    </div>
                    <div class="preview-gear">
                        <h5>Equipment (${config.gear.length} items)</h5>
                        <div class="gear-list">
        `;
        
        if (config.gear.length === 0) {
            previewHTML += '<p class="no-gear">No equipment selected</p>';
        } else {
            config.gear.forEach(item => {
                const itemName = this.getItemDisplayName(item);
                previewHTML += `<div class="gear-item">${itemName}</div>`;
            });
        }
        
        previewHTML += `
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = previewHTML;
    },
    
    getItemDisplayName(itemId) {
        // Convert item ID to display name
        const itemMap = {
            'PrimalItem_WeaponTekRifle_C': 'Tek Rifle',
            'PrimalItemArmor_TekShirt_C': 'Tek Shirt',
            'PrimalItemArmor_TekPants_C': 'Tek Pants',
            'PrimalItemArmor_TekHelmet_C': 'Tek Helmet',
            'PrimalItem_Consumable_Element_C': 'Element',
            'PrimalItem_WeaponTekSword_C': 'Tek Sword',
            'PrimalItem_WeaponCryoGun_C': 'Cryopod',
            'PrimalItem_Consumable_Kibble_Base_C': 'Kibble',
            'PrimalItem_WeaponWhip_C': 'Whip',
            'PrimalItem_Consumable_Stimulant_C': 'Stimulant',
            'PrimalItem_Consumable_Narcotic_C': 'Narcotic',
            'PrimalItem_WeaponTekGrenade_C': 'Tek Grenade',
            'PrimalItem_WeaponTekBow_C': 'Tek Bow',
            'PrimalItemArmor_ScubaShirt_C': 'Scuba Shirt',
            'PrimalItemArmor_ScubaPants_C': 'Scuba Pants'
        };
        
        return itemMap[itemId] || itemId;
    },
    
    spawnTerminal() {
        // Validate config
        if (!this.currentConfig.skin) {
            Components.showNotification('Please select a skin.', 'warning');
            if (window.app) window.app.playSound('error');
            return;
        }
        if (this.terminalType === 'mannequin' && !this.currentConfig.pose) {
            Components.showNotification('Please select a pose.', 'warning');
            if (window.app) window.app.playSound('error');
            return;
        }
        if (this.terminalType === 'player-terminal' && !this.currentConfig.armor) {
            Components.showNotification('Please select an armor set.', 'warning');
            if (window.app) window.app.playSound('error');
            return;
        }
        // Generate command
        let command = '';
        if (this.terminalType === 'mannequin') {
            command = this.generateMannequinCommand(this.currentConfig);
        } else {
            command = this.generatePlayerTerminalCommand(this.currentConfig);
        }
        if (window.app) {
            window.app.executeCommand(command);
        }
        Components.showNotification('Terminal spawned!', 'success');
        if (window.app) window.app.playSound('success');
    },
    
    generateMannequinCommand(config) {
        let command = 'admincheat SpawnActor "Blueprint\'/Game/PrimalEarth/CoreBlueprints/Items/Structures/Misc/PrimalItemStructure_Mannequin.PrimalItemStructure_Mannequin\'"';
        
        // Add skin override
        if (config.skin && config.skin !== 'default') {
            command += ` -SkinOverride ${config.skin}`;
        }
        
        // Add pose
        if (config.pose && config.pose !== 'idle') {
            command += ` -Pose ${config.pose}`;
        }
        
        // Add color override
        if (config.color && config.color !== '#ffffff') {
            const colorIndex = this.hexToColorIndex(config.color);
            command += ` -ColorOverride ${colorIndex}`;
        }
        
        return command;
    },
    
    generatePlayerTerminalCommand(config) {
        let command = 'admincheat SpawnActor "Blueprint\'/Game/PrimalEarth/CoreBlueprints/Items/Structures/Misc/PrimalItemStructure_PlayerTerminal.PrimalItemStructure_PlayerTerminal\'"';
        
        // Add skin override
        if (config.skin && config.skin !== 'default') {
            command += ` -SkinOverride ${config.skin}`;
        }
        
        // Add armor
        if (config.armor && config.armor !== 'none') {
            command += ` -Armor ${config.armor}`;
        }
        
        // Add gear items
        if (config.gear.length > 0) {
            config.gear.forEach(item => {
                command += ` -GiveItem "${item}" 1 1 0`;
            });
        }
        
        return command;
    },
    
    hexToColorIndex(hex) {
        // Simplified color mapping
        const colorMap = {
            '#ff0000': 0, // Red
            '#00ff00': 1, // Green
            '#0000ff': 2, // Blue
            '#ffff00': 3, // Yellow
            '#ff00ff': 4, // Magenta
            '#00ffff': 5, // Cyan
            '#ffffff': 6, // White
            '#000000': 7  // Black
        };
        
        return colorMap[hex.toLowerCase()] || 6;
    },
    
    showPreviewModal() {
        const config = this.currentConfig;
        const type = this.terminalType;
        
        const content = `
            <div class="terminal-preview-modal">
                <div class="preview-header">
                    <h3>${type === 'mannequin' ? 'Mannequin' : 'Player Terminal'} Preview</h3>
                </div>
                <div class="preview-content">
                    <div class="preview-character-large">
                        <div class="character-visual">
                            <i class="fas fa-${type === 'mannequin' ? 'user' : 'terminal'} fa-4x"></i>
                        </div>
                        <div class="character-stats">
                            <div class="stat-item">
                                <span class="stat-label">Type:</span>
                                <span class="stat-value">${type}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Skin:</span>
                                <span class="stat-value">${config.skin || 'Default'}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Pose:</span>
                                <span class="stat-value">${config.pose || 'Default'}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Armor:</span>
                                <span class="stat-value">${config.armor || 'None'}</span>
                            </div>
                        </div>
                    </div>
                    <div class="preview-equipment">
                        <h4>Equipment</h4>
                        <div class="equipment-grid">
        `;
        
        if (config.gear.length === 0) {
            content += '<p class="no-equipment">No equipment selected</p>';
        } else {
            config.gear.forEach(item => {
                const itemName = this.getItemDisplayName(item);
                content += `
                    <div class="equipment-item">
                        <i class="fas fa-box"></i>
                        <span>${itemName}</span>
                    </div>
                `;
            });
        }
        
        content += `
                        </div>
                    </div>
                </div>
                <div class="preview-actions">
                    <button class="btn-primary" onclick="Terminals.spawnTerminal()">
                        <i class="fas fa-magic"></i> Spawn Terminal
                    </button>
                    <button class="btn-secondary" onclick="Components.closeModal()">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        Components.showPopup('Terminal Preview', content);
    },
    
    refresh() {
        this.loadTerminalData();
        this.updatePreview();
    }
};

window.Terminals = Terminals;
export default Terminals; 