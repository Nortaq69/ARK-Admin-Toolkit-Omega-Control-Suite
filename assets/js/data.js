// ARK Admin Toolkit: Omega Control Suite - Data Manager

const DataManager = {
    data: {},
    async init() {
        const types = [
            { key: 'commands', file: 'data/commands/admin_commands.json' },
            { key: 'creatures', file: 'data/creatures/creature_spawn_data.json' },
            { key: 'items', file: 'data/items/item_ids.json' },
            { key: 'terminals', file: 'data/terminals/terminal_spawns.json' },
            { key: 'mannequins', file: 'data/mannequins/mannequin_presets.json' },
            { key: 'maps', file: 'data/maps/teleport_locations.json' },
            { key: 'heatmap', file: 'data/maps/heatmap_data.json' }
        ];
        for (const type of types) {
            try {
                const res = await fetch(type.file);
                this.data[type.key] = await res.json();
            } catch (e) {
                this.data[type.key] = [];
                console.warn(`Failed to load ${type.file}`);
            }
        }
    },
    get(type) {
        return this.data[type] || [];
    }
};

window.DataManager = DataManager;
export default DataManager; 