// ARK Admin Toolkit: Omega Control Suite - Players/Tribes

const Players = {
    players: [],
    selectedPlayer: null,
    tribes: [],
    
    async init() {
        this.setupEventListeners();
        this.loadSampleData();
        this.renderPlayersList();
        this.updatePlayerActions();
    },
    
    setupEventListeners() {
        // Player action buttons
        document.getElementById('teleport-player')?.addEventListener('click', () => {
            this.teleportToPlayer();
        });
        
        document.getElementById('bring-player')?.addEventListener('click', () => {
            this.bringPlayer();
        });
        
        document.getElementById('kick-player')?.addEventListener('click', () => {
            this.kickPlayer();
        });
        
        document.getElementById('ban-player')?.addEventListener('click', () => {
            this.banPlayer();
        });
        
        // Gear cloner
        document.getElementById('clone-gear')?.addEventListener('click', () => {
            this.cloneGear();
        });
        
        // Source player selection
        document.getElementById('source-player')?.addEventListener('change', (e) => {
            this.updateGearCloner();
        });
        
        document.getElementById('target-player')?.addEventListener('change', (e) => {
            this.updateGearCloner();
        });
    },
    
    loadSampleData() {
        // Sample player data
        this.players = [
            {
                id: 1,
                name: 'AdminPlayer',
                level: 100,
                tribe: 'AdminTribe',
                online: true,
                lastSeen: new Date(),
                location: { x: 1000, y: 2000, z: 300 },
                gear: ['Tek Rifle', 'Tek Armor', 'Element']
            },
            {
                id: 2,
                name: 'Survivor123',
                level: 45,
                tribe: 'Survivors',
                online: true,
                lastSeen: new Date(),
                location: { x: 1500, y: 2500, z: 250 },
                gear: ['Bow', 'Hide Armor', 'Spear']
            },
            {
                id: 3,
                name: 'BreederPro',
                level: 78,
                tribe: 'Breeders',
                online: false,
                lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
                location: { x: 2000, y: 3000, z: 200 },
                gear: ['Cryopod', 'Kibble', 'Whip']
            },
            {
                id: 4,
                name: 'PvPWarrior',
                level: 92,
                tribe: 'Warriors',
                online: true,
                lastSeen: new Date(),
                location: { x: 800, y: 1200, z: 400 },
                gear: ['Tek Rifle', 'Tek Armor', 'Tek Sword']
            }
        ];
        
        // Sample tribe data
        this.tribes = [
            {
                name: 'AdminTribe',
                members: 1,
                powerLevel: 1000,
                alliance: null
            },
            {
                name: 'Survivors',
                members: 5,
                powerLevel: 250,
                alliance: 'Peaceful'
            },
            {
                name: 'Breeders',
                members: 3,
                powerLevel: 400,
                alliance: 'Survivors'
            },
            {
                name: 'Warriors',
                members: 8,
                powerLevel: 750,
                alliance: null
            }
        ];
        
        this.populatePlayerSelects();
    },
    
    populatePlayerSelects() {
        const sourceSelect = document.getElementById('source-player');
        const targetSelect = document.getElementById('target-player');
        
        if (sourceSelect) {
            sourceSelect.innerHTML = '<option value="">Select player...</option>';
            this.players.forEach(player => {
                const option = document.createElement('option');
                option.value = player.id;
                option.textContent = `${player.name} (Level ${player.level})`;
                sourceSelect.appendChild(option);
            });
        }
        
        if (targetSelect) {
            targetSelect.innerHTML = '<option value="">Select player...</option>';
            this.players.forEach(player => {
                const option = document.createElement('option');
                option.value = player.id;
                option.textContent = `${player.name} (Level ${player.level})`;
                targetSelect.appendChild(option);
            });
        }
    },
    
    renderPlayersList() {
        const container = document.getElementById('players-list');
        if (!container) return;
        container.innerHTML = '';
        if (this.players.length === 0) {
            container.innerHTML = '<div class="empty-state">No players online</div>';
            return;
        }
        this.players.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-entry';
            playerDiv.setAttribute('tabindex', '0');
            playerDiv.setAttribute('role', 'button');
            playerDiv.setAttribute('aria-label', `Select player: ${player.name}`);
            playerDiv.textContent = `${player.name} (Lv${player.level})`;
            playerDiv.addEventListener('click', () => {
                this.selectPlayer(player);
                if (window.app) window.app.visualFeedback(playerDiv);
                if (window.app) window.app.playSound('click');
            });
            playerDiv.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    playerDiv.click();
                }
            });
            container.appendChild(playerDiv);
        });
    },
    
    selectPlayer(player) {
        this.selectedPlayer = player;
        
        // Update visual selection
        document.querySelectorAll('.player-entry').forEach(el => {
            el.classList.remove('selected');
        });
        
        const selectedElement = document.querySelector(`[data-player-id="${player.id}"]`);
        if (selectedElement) {
            selectedElement.classList.add('selected');
        }
        
        this.updatePlayerActions();
        this.showPlayerDetails(player);
    },
    
    showPlayerDetails(player) {
        const content = `
            <div class="player-details-modal">
                <div class="player-header">
                    <div class="player-avatar-large">${player.name.charAt(0).toUpperCase()}</div>
                    <div class="player-info-large">
                        <h3>${player.name}</h3>
                        <p>Level ${player.level} • ${player.tribe}</p>
                        <p class="status ${player.online ? 'online' : 'offline'}">
                            ${player.online ? 'Online' : 'Offline'}
                        </p>
                    </div>
                </div>
                <div class="player-stats">
                    <div class="stat-item">
                        <span class="stat-label">Location:</span>
                        <span class="stat-value">${player.location.x}, ${player.location.y}, ${player.location.z}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Last Seen:</span>
                        <span class="stat-value">${player.lastSeen.toLocaleString()}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Gear Items:</span>
                        <span class="stat-value">${player.gear.length}</span>
                    </div>
                </div>
                <div class="player-gear">
                    <h4>Equipment</h4>
                    <div class="gear-list">
                        ${player.gear.map(item => `<div class="gear-item">${item}</div>`).join('')}
                    </div>
                </div>
                <div class="player-actions">
                    <button class="btn-primary" onclick="Players.teleportToPlayer()">
                        <i class="fas fa-map-marker-alt"></i> Teleport to Player
                    </button>
                    <button class="btn-secondary" onclick="Players.bringPlayer()">
                        <i class="fas fa-user-plus"></i> Bring Player
                    </button>
                    <button class="btn-warning" onclick="Players.kickPlayer()">
                        <i class="fas fa-user-times"></i> Kick Player
                    </button>
                    <button class="btn-danger" onclick="Players.banPlayer()">
                        <i class="fas fa-ban"></i> Ban Player
                    </button>
                </div>
            </div>
        `;
        
        Components.showPopup(`Player: ${player.name}`, content);
    },
    
    updatePlayerActions() {
        // Player action buttons
        const teleportBtn = document.getElementById('teleport-player');
        if (teleportBtn) {
            teleportBtn.addEventListener('click', () => {
                this.teleportToPlayer();
                if (window.app) window.app.visualFeedback(teleportBtn);
                if (window.app) window.app.playSound('click');
            });
            teleportBtn.setAttribute('tabindex', '0');
            teleportBtn.setAttribute('aria-label', 'Teleport to player');
            teleportBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    teleportBtn.click();
                }
            });
        }
        const bringBtn = document.getElementById('bring-player');
        if (bringBtn) {
            bringBtn.addEventListener('click', () => {
                this.bringPlayer();
                if (window.app) window.app.visualFeedback(bringBtn);
                if (window.app) window.app.playSound('click');
            });
            bringBtn.setAttribute('tabindex', '0');
            bringBtn.setAttribute('aria-label', 'Bring player');
            bringBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    bringBtn.click();
                }
            });
        }
        const kickBtn = document.getElementById('kick-player');
        if (kickBtn) {
            kickBtn.addEventListener('click', () => {
                this.kickPlayer();
                if (window.app) window.app.visualFeedback(kickBtn);
                if (window.app) window.app.playSound('click');
            });
            kickBtn.setAttribute('tabindex', '0');
            kickBtn.setAttribute('aria-label', 'Kick player');
            kickBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    kickBtn.click();
                }
            });
        }
        const banBtn = document.getElementById('ban-player');
        if (banBtn) {
            banBtn.addEventListener('click', () => {
                this.banPlayer();
                if (window.app) window.app.visualFeedback(banBtn);
                if (window.app) window.app.playSound('click');
            });
            banBtn.setAttribute('tabindex', '0');
            banBtn.setAttribute('aria-label', 'Ban player');
            banBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    banBtn.click();
                }
            });
        }
    },
    
    updateGearCloner() {
        const sourceId = document.getElementById('source-player')?.value;
        const targetId = document.getElementById('target-player')?.value;
        const cloneButton = document.getElementById('clone-gear');
        
        if (cloneButton) {
            cloneButton.disabled = !sourceId || !targetId || sourceId === targetId;
        }
    },
    
    teleportToPlayer() {
        if (!this.selectedPlayer) {
            Components.showNotification('Please select a player first', 'warning');
            return;
        }
        
        const command = `admincheat TeleportToPlayer "${this.selectedPlayer.name}"`;
        
        if (window.app) {
            window.app.executeCommand(command);
        }
        
        Components.showNotification(`Teleported to ${this.selectedPlayer.name}`, 'success');
    },
    
    bringPlayer() {
        if (!this.selectedPlayer) {
            Components.showNotification('Please select a player first', 'warning');
            return;
        }
        
        const command = `admincheat TeleportPlayer "${this.selectedPlayer.name}"`;
        
        if (window.app) {
            window.app.executeCommand(command);
        }
        
        Components.showNotification(`Brought ${this.selectedPlayer.name} to you`, 'success');
    },
    
    kickPlayer() {
        if (!this.selectedPlayer) {
            Components.showNotification('Please select a player first', 'warning');
            return;
        }
        
        const reason = prompt('Enter kick reason (optional):');
        let command = `admincheat KickPlayer "${this.selectedPlayer.name}"`;
        
        if (reason) {
            command += ` "${reason}"`;
        }
        
        if (window.app) {
            window.app.executeCommand(command);
        }
        
        Components.showNotification(`Kicked ${this.selectedPlayer.name}`, 'success');
    },
    
    banPlayer() {
        if (!this.selectedPlayer) {
            Components.showNotification('Please select a player first', 'warning');
            return;
        }
        
        const reason = prompt('Enter ban reason (optional):');
        let command = `admincheat BanPlayer "${this.selectedPlayer.name}"`;
        
        if (reason) {
            command += ` "${reason}"`;
        }
        
        if (window.app) {
            window.app.executeCommand(command);
        }
        
        Components.showNotification(`Banned ${this.selectedPlayer.name}`, 'success');
    },
    
    cloneGear() {
        const sourceId = document.getElementById('source-player')?.value;
        const targetId = document.getElementById('target-player')?.value;
        
        if (!sourceId || !targetId) {
            Components.showNotification('Please select both source and target players', 'warning');
            return;
        }
        
        if (sourceId === targetId) {
            Components.showNotification('Source and target players must be different', 'warning');
            return;
        }
        
        const sourcePlayer = this.players.find(p => p.id == sourceId);
        const targetPlayer = this.players.find(p => p.id == targetId);
        
        if (!sourcePlayer || !targetPlayer) {
            Components.showNotification('Player not found', 'error');
            return;
        }
        
        // Generate gear cloning commands
        const commands = [];
        
        // Clear target player's inventory first
        commands.push(`admincheat DestroyAll "PrimalItem" "${targetPlayer.name}"`);
        
        // Give each item from source to target
        sourcePlayer.gear.forEach(item => {
            const itemId = this.getItemId(item);
            if (itemId) {
                commands.push(`admincheat GiveItem "${itemId}" 1 1 0 "${targetPlayer.name}"`);
            }
        });
        
        // Execute commands
        if (window.app) {
            commands.forEach(command => {
                window.app.executeCommand(command);
            });
        }
        
        Components.showNotification(`Cloned gear from ${sourcePlayer.name} to ${targetPlayer.name}`, 'success');
    },
    
    getItemId(itemName) {
        // Convert display name to item ID
        const itemMap = {
            'Tek Rifle': 'PrimalItem_WeaponTekRifle_C',
            'Tek Armor': 'PrimalItemArmor_TekShirt_C',
            'Element': 'PrimalItem_Consumable_Element_C',
            'Bow': 'PrimalItem_WeaponBow_C',
            'Hide Armor': 'PrimalItemArmor_HideShirt_C',
            'Spear': 'PrimalItem_WeaponSpear_C',
            'Cryopod': 'PrimalItem_WeaponCryoGun_C',
            'Kibble': 'PrimalItem_Consumable_Kibble_Base_C',
            'Whip': 'PrimalItem_WeaponWhip_C',
            'Tek Sword': 'PrimalItem_WeaponTekSword_C'
        };
        
        return itemMap[itemName] || null;
    },
    
    refresh() {
        this.loadSampleData();
        this.renderPlayersList();
        this.updatePlayerActions();
    }
};

window.Players = Players;
export default Players; 