// ARK Admin Toolkit: Omega Control Suite - Macros

const Macros = {
    macros: [],
    currentMacro: {
        name: '',
        commands: []
    },
    
    async init() {
        this.setupEventListeners();
        this.loadQuickMacros();
    },
    
    setupEventListeners() {
        // Add command button
        const addCmdBtn = document.getElementById('add-command');
        if (addCmdBtn) {
            addCmdBtn.addEventListener('click', () => {
                this.addCommandToMacro();
                if (window.app) window.app.visualFeedback(addCmdBtn);
                if (window.app) window.app.playSound('click');
            });
            addCmdBtn.setAttribute('tabindex', '0');
            addCmdBtn.setAttribute('aria-label', 'Add command to macro');
            addCmdBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    addCmdBtn.click();
                }
            });
        }
        // Save macro button
        const saveBtn = document.getElementById('save-macro');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveMacro();
                if (window.app) window.app.visualFeedback(saveBtn);
                if (window.app) window.app.playSound('click');
            });
            saveBtn.setAttribute('tabindex', '0');
            saveBtn.setAttribute('aria-label', 'Save macro');
            saveBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    saveBtn.click();
                }
            });
        }
        // Load macro button
        const loadBtn = document.getElementById('load-macro');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => {
                this.loadMacro();
                if (window.app) window.app.visualFeedback(loadBtn);
                if (window.app) window.app.playSound('click');
            });
            loadBtn.setAttribute('tabindex', '0');
            loadBtn.setAttribute('aria-label', 'Load macro');
            loadBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    loadBtn.click();
                }
            });
        }
        // Quick macro buttons
        document.querySelectorAll('.quick-macro-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.executeQuickMacro(e.target.dataset.macro);
                if (window.app) window.app.visualFeedback(btn);
                if (window.app) window.app.playSound('click');
            });
            btn.setAttribute('tabindex', '0');
            btn.setAttribute('aria-label', `Run quick macro: ${btn.textContent}`);
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                }
            });
        });
        // Macro name input accessibility
        const macroNameInput = document.getElementById('macro-name');
        if (macroNameInput) {
            macroNameInput.setAttribute('aria-label', 'Macro name');
            macroNameInput.setAttribute('tabindex', '0');
            macroNameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    document.getElementById('save-macro')?.click();
                }
            });
        }
    },
    
    addCommandToMacro() {
        const command = prompt('Enter command:');
        if (!command) return;
        
        this.currentMacro.commands.push({
            command: command,
            delay: 0
        });
        
        this.renderMacroCommands();
    },
    
    renderMacroCommands() {
        const container = document.getElementById('macro-commands');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (this.currentMacro.commands.length === 0) {
            container.innerHTML = '<div class="empty-state">No commands in this macro. Click "Add Command" to start building your macro.</div>';
            return;
        }
        
        this.currentMacro.commands.forEach((cmd, index) => {
            const element = document.createElement('div');
            element.className = 'macro-command';
            element.innerHTML = `
                <div class="command-text">${cmd.command}</div>
                <div class="command-delay">
                    <input type="number" value="${cmd.delay}" min="0" max="60" aria-label="Delay for command ${index + 1}" tabindex="0">
                    <span>s delay</span>
                </div>
                <div class="remove-btn" tabindex="0" aria-label="Remove command ${index + 1}">
                    <i class="fas fa-times"></i>
                </div>
            `;
            // Delay input feedback
            const delayInput = element.querySelector('input[type="number"]');
            if (delayInput) {
                delayInput.addEventListener('input', (e) => {
                    this.updateCommandDelay(index, e.target.value);
                    if (window.app) window.app.visualFeedback(delayInput);
                    if (window.app) window.app.playSound('click');
                });
            }
            // Remove button feedback
            const removeBtn = element.querySelector('.remove-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', () => {
                    this.removeCommand(index);
                    if (window.app) window.app.visualFeedback(removeBtn);
                    if (window.app) window.app.playSound('click');
                });
                removeBtn.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        removeBtn.click();
                    }
                });
            }
            container.appendChild(element);
        });
    },
    
    updateCommandDelay(index, delay) {
        if (this.currentMacro.commands[index]) {
            this.currentMacro.commands[index].delay = parseInt(delay) || 0;
        }
    },
    
    removeCommand(index) {
        this.currentMacro.commands.splice(index, 1);
        this.renderMacroCommands();
    },
    
    saveMacro() {
        const name = document.getElementById('macro-name')?.value;
        if (!name) {
            Components.showNotification('Please enter a macro name', 'warning');
            if (window.app) window.app.playSound('error');
            return;
        }
        if (this.macros.some(m => m.name === name)) {
            Components.showNotification('A macro with this name already exists. Choose a different name.', 'error');
            if (window.app) window.app.playSound('error');
            return;
        }
        
        if (this.currentMacro.commands.length === 0) {
            Components.showNotification('Please add at least one command', 'warning');
            if (window.app) window.app.playSound('error');
            return;
        }
        
        const macro = {
            name: name,
            commands: [...this.currentMacro.commands],
            timestamp: new Date().toISOString()
        };
        
        // Check if macro with this name already exists
        const existingIndex = this.macros.findIndex(m => m.name === name);
        if (existingIndex >= 0) {
            this.macros[existingIndex] = macro;
        } else {
            this.macros.push(macro);
        }
        
        this.saveMacrosToStorage();
        this.renderSavedMacros();
        
        Components.showNotification(`Macro "${name}" saved successfully`, 'success');
        
        // Clear current macro
        this.clearCurrentMacro();
    },
    
    loadMacro() {
        if (this.macros.length === 0) {
            Components.showNotification('No saved macros found', 'info');
            return;
        }
        
        const macroNames = this.macros.map(m => m.name);
        const name = prompt('Enter macro name to load:\n\nAvailable macros:\n' + macroNames.join('\n'));
        
        if (!name) return;
        
        const macro = this.macros.find(m => m.name === name);
        if (!macro) {
            Components.showNotification(`Macro "${name}" not found`, 'error');
            return;
        }
        
        this.currentMacro = {
            name: macro.name,
            commands: [...macro.commands]
        };
        
        document.getElementById('macro-name').value = macro.name;
        this.renderMacroCommands();
        
        Components.showNotification(`Macro "${name}" loaded`, 'success');
    },
    
    clearCurrentMacro() {
        this.currentMacro = {
            name: '',
            commands: []
        };
        
        document.getElementById('macro-name').value = '';
        this.renderMacroCommands();
    },
    
    renderSavedMacros() {
        const container = document.getElementById('saved-macros');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (this.macros.length === 0) {
            container.innerHTML = '<div class="empty-state">No saved macros</div>';
            return;
        }
        
        this.macros.forEach(macro => {
            const element = document.createElement('div');
            element.className = 'saved-macro';
            element.innerHTML = `
                <div class="macro-name">${macro.name}</div>
                <div class="macro-count">${macro.commands.length} commands</div>
            `;
            
            element.addEventListener('click', () => {
                this.loadMacroByName(macro.name);
            });
            
            container.appendChild(element);
        });
    },
    
    loadMacroByName(name) {
        const macro = this.macros.find(m => m.name === name);
        if (!macro) return;
        
        this.currentMacro = {
            name: macro.name,
            commands: [...macro.commands]
        };
        
        document.getElementById('macro-name').value = macro.name;
        this.renderMacroCommands();
    },
    
    loadQuickMacros() {
        // Define quick macro presets
        this.quickMacros = {
            'wipe-server': {
                name: 'Wipe Server',
                commands: [
                    { command: 'admincheat DestroyAll "PrimalItem"', delay: 0 },
                    { command: 'admincheat DestroyAll "PrimalStructure"', delay: 1 },
                    { command: 'admincheat DestroyAll "PrimalDinoCharacter"', delay: 1 },
                    { command: 'admincheat SetTimeOfDay 12', delay: 1 },
                    { command: 'admincheat SetWeatherIntensity Rain 0', delay: 0 }
                ]
            },
            'pvp-event': {
                name: 'PvP Event',
                commands: [
                    { command: 'admincheat SetTimeOfDay 12', delay: 0 },
                    { command: 'admincheat SetWeatherIntensity Rain 0', delay: 0 },
                    { command: 'admincheat SetPlayerPos 1000 1000 300', delay: 1 },
                    { command: 'admincheat GiveItem "PrimalItem_WeaponTekRifle_C" 1 1 0', delay: 0 },
                    { command: 'admincheat GiveItem "PrimalItemArmor_TekShirt_C" 1 1 0', delay: 0 }
                ]
            },
            'breeding-event': {
                name: 'Breeding Event',
                commands: [
                    { command: 'admincheat SetTimeOfDay 12', delay: 0 },
                    { command: 'admincheat SetWeatherIntensity Rain 0', delay: 0 },
                    { command: 'admincheat SetPlayerPos 2000 2000 300', delay: 1 },
                    { command: 'admincheat GiveItem "PrimalItem_Consumable_Kibble_Base_C" 100 1 0', delay: 0 },
                    { command: 'admincheat GiveItem "PrimalItem_WeaponCryoGun_C" 1 1 0', delay: 0 }
                ]
            },
            'creative-mode': {
                name: 'Creative Mode',
                commands: [
                    { command: 'admincheat God', delay: 0 },
                    { command: 'admincheat InfiniteStats', delay: 0 },
                    { command: 'admincheat SetPlayerPos 3000 3000 300', delay: 1 },
                    { command: 'admincheat GiveItem "PrimalItem_WeaponTekRifle_C" 1 1 0', delay: 0 },
                    { command: 'admincheat GiveItem "PrimalItemArmor_TekShirt_C" 1 1 0', delay: 0 }
                ]
            }
        };
    },
    
    executeQuickMacro(macroKey) {
        const macro = this.quickMacros[macroKey];
        if (!macro) {
            Components.showNotification(`Quick macro "${macroKey}" not found`, 'error');
            return;
        }
        
        this.executeMacro(macro);
    },
    
    async executeMacro(macro) {
        if (!macro || !macro.commands || macro.commands.length === 0) {
            Components.showNotification('No commands to execute in this macro', 'warning');
            if (window.app) window.app.playSound('error');
            return;
        }
        for (let i = 0; i < macro.commands.length; i++) {
            const cmd = macro.commands[i];
            try {
                if (window.app) {
                    window.app.executeCommand(cmd.command);
                    window.app.visualFeedback(document.body); // global feedback
                    window.app.playSound('click');
                }
                Components.showNotification(`Executed: ${cmd.command}`, 'success');
            } catch (err) {
                Components.showNotification(`Failed: ${cmd.command}`, 'error');
                if (window.app) window.app.playSound('error');
            }
            // Delay if specified
            if (cmd.delay && !isNaN(cmd.delay) && cmd.delay > 0) {
                await new Promise(res => setTimeout(res, cmd.delay * 1000));
            }
        }
        Components.showNotification('Macro execution complete!', 'success');
        if (window.app) window.app.playSound('success');
    },
    
    saveMacrosToStorage() {
        localStorage.setItem('savedMacros', JSON.stringify(this.macros));
    },
    
    loadMacrosFromStorage() {
        const saved = localStorage.getItem('savedMacros');
        if (saved) {
            this.macros = JSON.parse(saved);
        }
    },
    
    loadSavedMacros(macros) {
        this.macros = macros || [];
        this.renderSavedMacros();
    },
    
    refresh() {
        this.loadMacrosFromStorage();
        this.renderSavedMacros();
    }
};

window.Macros = Macros;
export default Macros; 