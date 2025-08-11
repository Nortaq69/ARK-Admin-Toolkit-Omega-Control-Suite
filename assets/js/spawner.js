// ARK Admin Toolkit: Omega Control Suite - Dino Spawner

const Spawner = {
    creatures: [],
    selectedCreature: null,
    colorRegions: [],
    
    async init() {
        this.creatures = DataManager.get('creatures');
        this.setupEventListeners();
        this.populateSpeciesDropdown();
        this.setupRangeSliders();
        this.setupColorRegions();
    },
    
    setupEventListeners() {
        // Species search
        const searchInput = document.getElementById('dino-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterSpecies(e.target.value);
                if (window.app) window.app.visualFeedback(searchInput);
                if (window.app) window.app.playSound('click');
            });
            searchInput.setAttribute('aria-label', 'Search dinosaur species');
        }
        
        // Species selection
        const speciesSelect = document.getElementById('dino-species');
        if (speciesSelect) {
            speciesSelect.addEventListener('change', (e) => {
                this.selectSpecies(e.target.value);
                if (window.app) window.app.visualFeedback(speciesSelect);
                if (window.app) window.app.playSound('click');
            });
            speciesSelect.setAttribute('aria-label', 'Select dinosaur species');
        }
        
        // Spawn button
        const spawnBtn = document.getElementById('spawn-dino');
        if (spawnBtn) {
            spawnBtn.addEventListener('click', () => {
                this.spawnDino();
                if (window.app) window.app.visualFeedback(spawnBtn);
                if (window.app) window.app.playSound('click');
            });
            spawnBtn.setAttribute('tabindex', '0');
            spawnBtn.setAttribute('aria-label', 'Spawn dinosaur');
            spawnBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    spawnBtn.click();
                }
            });
        }
        
        // Mass spawn toggle
        const massSpawnCheckbox = document.getElementById('mass-spawn');
        if (massSpawnCheckbox) {
            massSpawnCheckbox.addEventListener('change', (e) => {
                const quantityInput = document.getElementById('spawn-quantity');
                if (quantityInput) {
                    quantityInput.style.display = e.target.checked ? 'block' : 'none';
                }
                if (window.app) window.app.visualFeedback(massSpawnCheckbox);
                if (window.app) window.app.playSound('click');
            });
            massSpawnCheckbox.setAttribute('aria-label', 'Enable mass spawn');
        }
        
        // Stat sliders
        const sliders = document.querySelectorAll('.range-slider input[type="range"]');
        sliders.forEach(slider => {
            const valueDisplay = slider.parentElement.querySelector('.range-value');
            
            slider.addEventListener('input', (e) => {
                if (valueDisplay) {
                    valueDisplay.textContent = e.target.value;
                }
                if (window.app) window.app.visualFeedback(slider);
                if (window.app) window.app.playSound('click');
            });
            slider.setAttribute('aria-label', slider.id.replace('stat-', '').replace('-', ' '));
        });
        
        // Color pickers (after regions are rendered)
        setTimeout(() => {
            const colorInputs = document.querySelectorAll('#color-regions input[type="color"]');
            colorInputs.forEach(input => {
                input.addEventListener('input', () => {
                    if (window.app) window.app.visualFeedback(input);
                    if (window.app) window.app.playSound('click');
                });
                input.setAttribute('aria-label', `Color for ${input.dataset.region}`);
            });
        }, 100);
        
        // Quantity and distance inputs
        const quantityInput = document.getElementById('spawn-quantity');
        if (quantityInput) {
            quantityInput.addEventListener('input', () => {
                if (window.app) window.app.visualFeedback(quantityInput);
                if (window.app) window.app.playSound('click');
            });
            quantityInput.setAttribute('aria-label', 'Spawn quantity');
        }
        const distanceInput = document.getElementById('spawn-distance');
        if (distanceInput) {
            distanceInput.addEventListener('input', () => {
                if (window.app) window.app.visualFeedback(distanceInput);
                if (window.app) window.app.playSound('click');
            });
            distanceInput.setAttribute('aria-label', 'Spawn distance');
        }
    },
    
    populateSpeciesDropdown() {
        const select = document.getElementById('dino-species');
        if (!select) return;
        
        select.innerHTML = '<option value="">Select a species...</option>';
        
        this.creatures.forEach(creature => {
            const option = document.createElement('option');
            option.value = creature.name;
            option.textContent = creature.name;
            select.appendChild(option);
        });
    },
    
    filterSpecies(searchTerm) {
        const select = document.getElementById('dino-species');
        if (!select) return;
        
        const options = select.querySelectorAll('option');
        options.forEach(option => {
            if (option.value === '') return; // Keep the placeholder
            
            const matches = option.textContent.toLowerCase().includes(searchTerm.toLowerCase());
            option.style.display = matches ? 'block' : 'none';
        });
    },
    
    selectSpecies(speciesName) {
        this.selectedCreature = this.creatures.find(c => c.name === speciesName);
        this.updateColorRegions();
        this.updateSpawnButton();
    },
    
    setupRangeSliders() {
        const sliders = document.querySelectorAll('.range-slider input[type="range"]');
        sliders.forEach(slider => {
            const valueDisplay = slider.parentElement.querySelector('.range-value');
            
            slider.addEventListener('input', (e) => {
                if (valueDisplay) {
                    valueDisplay.textContent = e.target.value;
                }
            });
        });
    },
    
    setupColorRegions() {
        this.updateColorRegions();
    },
    
    updateColorRegions() {
        const container = document.getElementById('color-regions');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!this.selectedCreature) {
            container.innerHTML = '<p class="empty-state">Select a species to configure colors</p>';
            return;
        }
        
        this.selectedCreature.colorRegions.forEach((region, index) => {
            const regionElement = document.createElement('div');
            regionElement.className = 'color-region';
            regionElement.innerHTML = `
                <label>${region}</label>
                <input type="color" id="color-${index}" value="#ffffff" data-region="${region}">
            `;
            container.appendChild(regionElement);
        });
    },
    
    updateSpawnButton() {
        const spawnBtn = document.getElementById('spawn-dino');
        if (!spawnBtn) return;
        
        if (this.selectedCreature) {
            spawnBtn.disabled = false;
            spawnBtn.innerHTML = `<i class="fas fa-magic"></i> Spawn ${this.selectedCreature.name}`;
        } else {
            spawnBtn.disabled = true;
            spawnBtn.innerHTML = `<i class="fas fa-magic"></i> Spawn Dinosaur`;
        }
    },
    
    spawnDino() {
        if (!this.selectedCreature) {
            Components.showNotification('Please select a species first', 'warning');
            if (window.app) window.app.playSound('error');
            return;
        }
        
        // Validate level
        const level = parseInt(document.getElementById('dino-level')?.value || '150', 10);
        if (isNaN(level) || level < 1 || level > 450) {
            Components.showNotification('Level must be between 1 and 450', 'error');
            if (window.app) window.app.playSound('error');
            return;
        }
        
        // Validate quantity
        const massSpawn = document.getElementById('mass-spawn')?.checked || false;
        const quantity = parseInt(document.getElementById('spawn-quantity')?.value || '1', 10);
        if (massSpawn && (isNaN(quantity) || quantity < 1 || quantity > 100)) {
            Components.showNotification('Quantity must be 1-100 for mass spawn', 'error');
            if (window.app) window.app.playSound('error');
            return;
        }
        
        // Validate distance
        const distance = parseInt(document.getElementById('spawn-distance')?.value || '100', 10);
        if (isNaN(distance) || distance < 1 || distance > 1000) {
            Components.showNotification('Distance must be 1-1000', 'error');
            if (window.app) window.app.playSound('error');
            return;
        }
        
        const command = this.generateSpawnCommand();
        
        if (command) {
            // Execute the command
            if (window.app) {
                window.app.executeCommand(command);
            }
            
            Components.showNotification(`Spawned ${this.selectedCreature.name}`, 'success');
            if (window.app) window.app.playSound('success');
        }
    },
    
    generateSpawnCommand() {
        if (!this.selectedCreature) return null;
        
        const level = document.getElementById('dino-level')?.value || 150;
        const distance = document.getElementById('spawn-distance')?.value || 100;
        const massSpawn = document.getElementById('mass-spawn')?.checked || false;
        const quantity = document.getElementById('spawn-quantity')?.value || 1;
        const includeSaddle = document.getElementById('spawn-saddle')?.checked || false;
        
        let command = `admincheat SpawnDino "${this.selectedCreature.blueprint}" ${distance} 0 0 ${level}`;
        
        // Add color overrides
        const colorOverrides = this.getColorOverrides();
        if (colorOverrides.length > 0) {
            command += ` -ColorSetOverride ${colorOverrides.join(',')}`;
        }
        
        // Add saddle if requested
        if (includeSaddle) {
            command += ` -Saddle`;
        }
        
        // Handle mass spawn
        if (massSpawn && quantity > 1) {
            const commands = [];
            for (let i = 0; i < quantity; i++) {
                commands.push(command);
            }
            return commands.join('\n');
        }
        
        return command;
    },
    
    getColorOverrides() {
        const overrides = [];
        const colorInputs = document.querySelectorAll('#color-regions input[type="color"]');
        
        colorInputs.forEach((input, index) => {
            const color = input.value;
            const region = input.dataset.region;
            
            if (color && color !== '#ffffff') {
                // Convert hex to ARK color index (simplified)
                const colorIndex = this.hexToColorIndex(color);
                overrides.push(`${index}=${colorIndex}`);
            }
        });
        
        return overrides;
    },
    
    hexToColorIndex(hex) {
        // Simplified color mapping - in a real implementation, 
        // you'd have a proper mapping of hex colors to ARK color indices
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
        
        return colorMap[hex.toLowerCase()] || 6; // Default to white
    },
    
    refresh() {
        this.populateSpeciesDropdown();
        this.updateColorRegions();
        this.updateSpawnButton();
    },

    renderRecommendedCreatures() {
        const recommended = [
            "Giganotosaurus", "Rex", "Argentavis", "Wyvern", "Griffin", "Quetzal", "Therizinosaurus", "Yutyrannus", "Managarmr", "Rock Drake"
        ];
        const container = document.getElementById('recommended-creature-buttons');
        if (!container) return;
        container.innerHTML = '';
        recommended.forEach(name => {
            const creature = this.creatures.find(c => c.name === name);
            if (creature) {
                const btn = document.createElement('button');
                btn.className = 'recommended-creature-btn';
                btn.textContent = creature.name;
                btn.onclick = () => {
                    this.selectSpecies(creature.name);
                    Components.showNotification(`${creature.name} selected!`, 'info');
                };
                container.appendChild(btn);
            }
        });
    }
};

window.Spawner = Spawner;
export default Spawner; 