// ARK Admin Toolkit: Omega Control Suite - Commands Library

const Commands = {
    commands: [],
    filteredCommands: [],
    selectedCommand: null,
    
    async init() {
        this.commands = DataManager.get('commands');
        this.filteredCommands = [...this.commands];
        this.setupEventListeners();
        this.renderCommandsList();
    },
    
    setupEventListeners() {
        // Category filters
        document.querySelectorAll('.command-categories .category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterByCategory(e.target.dataset.category);
                if (window.app) window.app.visualFeedback(btn);
                if (window.app) window.app.playSound('click');
            });
            btn.setAttribute('tabindex', '0');
            btn.setAttribute('aria-label', `Filter by ${btn.textContent}`);
        });
        
        // Command search
        const searchInput = document.getElementById('command-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchCommands(e.target.value);
                if (window.app) window.app.visualFeedback(searchInput);
                if (window.app) window.app.playSound('click');
            });
            searchInput.setAttribute('aria-label', 'Search commands');
        }
        
        // Custom command execution
        const executeBtn = document.getElementById('execute-command');
        if (executeBtn) {
            executeBtn.addEventListener('click', () => {
                this.executeCustomCommand();
                if (window.app) window.app.visualFeedback(executeBtn);
                if (window.app) window.app.playSound('click');
            });
            executeBtn.setAttribute('tabindex', '0');
            executeBtn.setAttribute('aria-label', 'Execute custom command');
            executeBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    executeBtn.click();
                }
            });
        }
    },
    
    filterByCategory(category) {
        // Update active category button
        document.querySelectorAll('.command-categories .category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`)?.classList.add('active');
        
        // Filter commands
        if (category === 'all') {
            this.filteredCommands = [...this.commands];
        } else {
            this.filteredCommands = this.commands.filter(cmd => cmd.category === category);
        }
        
        this.renderCommandsList();
    },
    
    searchCommands(searchTerm) {
        if (!searchTerm.trim()) {
            this.filteredCommands = [...this.commands];
        } else {
            const term = searchTerm.toLowerCase();
            this.filteredCommands = this.commands.filter(cmd => 
                cmd.name.toLowerCase().includes(term) ||
                cmd.syntax.toLowerCase().includes(term) ||
                cmd.description.toLowerCase().includes(term)
            );
        }
        
        this.renderCommandsList();
    },
    
    renderCommandsList() {
        const container = document.getElementById('commands-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (this.filteredCommands.length === 0) {
            container.innerHTML = '<div class="empty-state">No commands found</div>';
            return;
        }
        
        this.filteredCommands.forEach(command => {
            const commandElement = document.createElement('div');
            commandElement.className = 'command-entry';
            commandElement.setAttribute('tabindex', '0');
            commandElement.setAttribute('role', 'button');
            commandElement.setAttribute('aria-label', `Select command: ${command.name}`);
            commandElement.innerHTML = `
                <div class="command-name">${command.name}</div>
                <div class="command-category">${command.category}</div>
            `;
            
            commandElement.addEventListener('click', () => {
                this.selectCommand(command);
                if (window.app) window.app.visualFeedback(commandElement);
                if (window.app) window.app.playSound('click');
            });
            commandElement.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    commandElement.click();
                }
            });
            
            container.appendChild(commandElement);
        });
    },
    
    selectCommand(command) {
        this.selectedCommand = command;
        this.renderCommandDetails();
    },
    
    renderCommandDetails() {
        const container = document.getElementById('command-details');
        if (!container || !this.selectedCommand) return;
        
        const cmd = this.selectedCommand;
        
        container.innerHTML = `
            <div class="command-detail-header">
                <h4>${cmd.name}</h4>
                <span class="command-category-badge">${cmd.category}</span>
            </div>
            <div class="command-detail-content">
                <div class="detail-section">
                    <label>Syntax:</label>
                    <div class="command-syntax">
                        <code>${cmd.syntax}</code>
                        <button class="copy-btn" id="copy-command-btn">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
                <div class="detail-section">
                    <label>Description:</label>
                    <p>${cmd.description}</p>
                </div>
                <div class="command-actions">
                    <button class="btn-primary" id="execute-command-btn">
                        <i class="fas fa-play"></i> Execute
                    </button>
                    <button class="btn-secondary" id="copy-command-btn-2">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                </div>
            </div>
        `;
        // Add feedback and sound to detail buttons
        document.getElementById('copy-command-btn')?.addEventListener('click', () => {
            this.copyCommand(cmd.syntax);
            if (window.app) window.app.visualFeedback(document.getElementById('copy-command-btn'));
            if (window.app) window.app.playSound('click');
        });
        document.getElementById('copy-command-btn-2')?.addEventListener('click', () => {
            this.copyCommand(cmd.syntax);
            if (window.app) window.app.visualFeedback(document.getElementById('copy-command-btn-2'));
            if (window.app) window.app.playSound('click');
        });
        document.getElementById('execute-command-btn')?.addEventListener('click', () => {
            this.executeCommand(cmd.syntax);
            if (window.app) window.app.visualFeedback(document.getElementById('execute-command-btn'));
            if (window.app) window.app.playSound('click');
        });
    },
    
    copyCommand(syntax) {
        navigator.clipboard.writeText(syntax).then(() => {
            Components.showNotification('Command copied to clipboard', 'success');
            if (window.app) window.app.playSound('success');
        }).catch(() => {
            Components.showNotification('Failed to copy command', 'error');
            if (window.app) window.app.playSound('error');
        });
    },
    
    executeCommand(syntax) {
        if (window.app) {
            window.app.executeCommand(syntax);
        }
        Components.showNotification('Command executed', 'success');
        if (window.app) window.app.playSound('success');
    },
    
    executeCustomCommand() {
        const command = document.getElementById('custom-command')?.value;
        const params = document.getElementById('command-params')?.value;
        
        if (!command) {
            Components.showNotification('Please enter a command', 'warning');
            if (window.app) window.app.playSound('error');
            return;
        }
        
        let fullCommand = command;
        if (params) {
            fullCommand += ` ${params}`;
        }
        
        this.executeCommand(fullCommand);
        
        // Clear inputs
        document.getElementById('custom-command').value = '';
        document.getElementById('command-params').value = '';
    },
    
    refresh() {
        this.commands = DataManager.get('commands');
        this.filteredCommands = [...this.commands];
        this.renderCommandsList();
        this.renderCommandDetails();
    }
};

window.Commands = Commands;
export default Commands; 