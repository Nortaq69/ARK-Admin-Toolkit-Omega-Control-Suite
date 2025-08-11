// ARK Admin Toolkit: Omega Control Suite - Item Spawner

const Items = {
    items: [],
    filteredItems: [],
    selectedItem: null,
    quickKits: {
        pvp: ['PrimalItem_WeaponTekRifle_C', 'PrimalItemArmor_MetalShirt_C', 'PrimalItemArmor_MetalPants_C', 'PrimalItemArmor_MetalHelmet_C', 'PrimalItem_Consumable_Element_C'],
        breeder: ['PrimalItem_WeaponCryoGun_C', 'PrimalItem_Consumable_Kibble_Base_C', 'PrimalItem_WeaponWhip_C'],
        builder: ['PrimalItem_WeaponTekRifle_C', 'PrimalItem_WeaponTekSword_C', 'PrimalItem_WeaponTekGrenade_C'],
        explorer: ['PrimalItem_WeaponTekRifle_C', 'PrimalItemArmor_ScubaShirt_C', 'PrimalItemArmor_ScubaPants_C']
    },

    async init() {
        this.items = DataManager.get('items');
        this.filteredItems = [...this.items];
        this.setupEventListeners();
        this.renderItemsList();
    },

    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('item-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterItems(e.target.value);
                if (window.app) window.app.visualFeedback(searchInput);
                if (window.app) window.app.playSound('click');
            });
            searchInput.setAttribute('aria-label', 'Search items');
        }
        // Category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterByCategory(btn.dataset.category);
                if (window.app) window.app.visualFeedback(btn);
                if (window.app) window.app.playSound('click');
            });
            btn.setAttribute('tabindex', '0');
            btn.setAttribute('aria-label', `Filter by ${btn.textContent}`);
        });
        // Quantity
        const quantityInput = document.getElementById('item-quantity');
        if (quantityInput) {
            quantityInput.addEventListener('input', () => {
                if (window.app) window.app.visualFeedback(quantityInput);
                if (window.app) window.app.playSound('click');
            });
            quantityInput.setAttribute('aria-label', 'Item quantity');
        }
        // Quality
        const qualitySlider = document.getElementById('item-quality');
        const qualityValue = document.getElementById('item-quality-value');
        if (qualitySlider && qualityValue) {
            qualitySlider.addEventListener('input', (e) => {
                qualityValue.textContent = e.target.value;
                if (window.app) window.app.visualFeedback(qualitySlider);
                if (window.app) window.app.playSound('click');
            });
            qualitySlider.setAttribute('aria-label', 'Item quality');
        }
        // Blueprint/Stacker
        const blueprintCheckbox = document.getElementById('item-blueprint');
        if (blueprintCheckbox) {
            blueprintCheckbox.addEventListener('change', () => {
                if (window.app) window.app.visualFeedback(blueprintCheckbox);
                if (window.app) window.app.playSound('click');
            });
            blueprintCheckbox.setAttribute('aria-label', 'Blueprint mode');
        }
        const stackerCheckbox = document.getElementById('item-stacker');
        if (stackerCheckbox) {
            stackerCheckbox.addEventListener('change', () => {
                if (window.app) window.app.visualFeedback(stackerCheckbox);
                if (window.app) window.app.playSound('click');
            });
            stackerCheckbox.setAttribute('aria-label', 'Stacker mode');
        }
        // Spawn button
        const spawnBtn = document.getElementById('spawn-item');
        if (spawnBtn) {
            spawnBtn.addEventListener('click', () => {
                this.spawnItem();
                if (window.app) window.app.visualFeedback(spawnBtn);
                if (window.app) window.app.playSound('click');
            });
            spawnBtn.setAttribute('tabindex', '0');
            spawnBtn.setAttribute('aria-label', 'Spawn item');
            spawnBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    spawnBtn.click();
                }
            });
        }
        // Quick kits
        document.querySelectorAll('.kit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.spawnKit(btn.dataset.kit);
                if (window.app) window.app.visualFeedback(btn);
                if (window.app) window.app.playSound('click');
            });
            btn.setAttribute('tabindex', '0');
            btn.setAttribute('aria-label', `Quick kit: ${btn.textContent}`);
        });
    },

    filterItems(searchTerm) {
        this.filteredItems = this.items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        this.renderItemsList();
    },

    filterByCategory(category) {
        if (category === 'all') {
            this.filteredItems = [...this.items];
        } else {
            this.filteredItems = this.items.filter(item => item.category === category);
        }
        this.renderItemsList();
    },

    renderItemsList() {
        const list = document.getElementById('items-list');
        if (!list) return;
        list.innerHTML = '';
        if (this.filteredItems.length === 0) {
            list.innerHTML = '<div class="empty-state">No items found</div>';
            return;
        }
        this.filteredItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item-entry';
            itemDiv.setAttribute('tabindex', '0');
            itemDiv.setAttribute('role', 'button');
            itemDiv.setAttribute('aria-label', `Select item: ${item.name}`);
            itemDiv.textContent = item.name;
            itemDiv.addEventListener('click', () => {
                this.selectItem(item);
                if (window.app) window.app.visualFeedback(itemDiv);
                if (window.app) window.app.playSound('click');
            });
            itemDiv.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    itemDiv.click();
                }
            });
            list.appendChild(itemDiv);
        });
    },

    selectItem(item) {
        this.selectedItem = item;
        const selected = document.getElementById('selected-item');
        if (selected) {
            selected.innerHTML = `<span>${item.name}</span>`;
        }
    },

    spawnItem() {
        if (!this.selectedItem) {
            Components.showNotification('Please select an item first', 'warning');
            if (window.app) window.app.playSound('error');
            return;
        }
        // Validate quantity
        const quantity = parseInt(document.getElementById('item-quantity')?.value || '1', 10);
        if (isNaN(quantity) || quantity < 1 || quantity > 1000) {
            Components.showNotification('Quantity must be 1-1000', 'error');
            if (window.app) window.app.playSound('error');
            return;
        }
        // Validate quality
        const quality = parseInt(document.getElementById('item-quality')?.value || '100', 10);
        if (isNaN(quality) || quality < 1 || quality > 1000) {
            Components.showNotification('Quality must be 1-1000', 'error');
            if (window.app) window.app.playSound('error');
            return;
        }
        const isBlueprint = document.getElementById('item-blueprint')?.checked || false;
        const isStacker = document.getElementById('item-stacker')?.checked || false;
        let command = `admincheat GiveItem "${this.selectedItem.id}" ${quantity} ${quality} ${isBlueprint ? 1 : 0}`;
        if (isStacker) {
            command += ' -Stacker';
        }
        if (window.app) {
            window.app.executeCommand(command);
        }
        Components.showNotification(`Spawned ${quantity}x ${this.selectedItem.name}`, 'success');
        if (window.app) window.app.playSound('success');
    },

    spawnKit(kit) {
        const items = this.quickKits[kit];
        if (!items) {
            Components.showNotification('Kit not found', 'error');
            if (window.app) window.app.playSound('error');
            return;
        }
        const quantity = 1;
        const quality = 100;
        const isBlueprint = false;
        const isStacker = false;
        items.forEach(itemId => {
            let command = `admincheat GiveItem "${itemId}" ${quantity} ${quality} ${isBlueprint ? 1 : 0}`;
            if (isStacker) {
                command += ' -Stacker';
            }
            if (window.app) {
                window.app.executeCommand(command);
            }
        });
        Components.showNotification(`Spawned ${kit.charAt(0).toUpperCase() + kit.slice(1)} Kit`, 'success');
        if (window.app) window.app.playSound('success');
    },

    refresh() {
        this.items = DataManager.get('items');
        this.filteredItems = [...this.items];
        this.selectedItem = null;
        this.renderItemsList();
        const selected = document.getElementById('selected-item');
        if (selected) {
            selected.innerHTML = '<span>No item selected</span>';
        }
    }
};

window.Items = Items;
export default Items; 