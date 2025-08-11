# ARK Admin Toolkit: Omega Control Suite

A powerful, futuristic desktop application for managing ARK Survival Evolved servers with advanced admin tools, dino spawning, map controls, and more.

## 🚀 Features

### 🧬 Dino Spawner
- **Advanced Species Selection**: Search and filter through all ARK creatures
- **Custom Stats Configuration**: Adjust health, stamina, oxygen, food, weight, melee, and speed
- **Color Region Control**: Customize each color region with color picker
- **Mass Spawn**: Spawn multiple dinos at once
- **Saddle Integration**: Automatically include saddles with spawns

### 🎁 Item Spawner
- **Comprehensive Item Database**: All ARK items with search functionality
- **Category Filtering**: Weapons, armor, tools, resources, structures
- **Quality Control**: Adjust item quality from 1-1000
- **Blueprint Support**: Toggle blueprint mode for items
- **Quick Kits**: Pre-configured PvP, breeder, builder, and explorer kits

### 🧍‍♂️ Terminals & Mannequins
- **Dual Mode Support**: Switch between Mannequin and Player Terminal
- **Skin Customization**: Ghost, Skeleton, Tek, Scuba, Hazmat skins
- **Pose/Emote System**: Wave, dance, sit, sleep, point animations
- **Armor Sets**: Hide, Chitin, Flak, Riot, Tek armor options
- **Gear Presets**: Pre-loaded equipment configurations

### 🗺️ Map Tools
- **Interactive Canvas Map**: Click-to-teleport functionality
- **Multiple Modes**: Teleport, spawn, and pin placement modes
- **Saved Locations**: Save and manage custom map locations
- **Day/Night Control**: Real-time time of day adjustment
- **Weather System**: Clear, rain, storm, fog weather controls
- **Heatmap Overlay**: Dino density visualization

### 📚 Command Library
- **Complete Admin Commands**: All ARK admin commands with descriptions
- **Category Organization**: Utility, dino, PvP, map, player, server categories
- **Search Functionality**: Find commands by name, syntax, or description
- **Command Builder**: Create custom commands with parameters
- **One-Click Execution**: Execute commands directly from the interface

### 🧠 Macro System
- **Command Sequencing**: Chain multiple commands with delays
- **Save/Load Macros**: Persistent macro storage
- **Quick Presets**: Wipe server, PvP event, breeding event, creative mode
- **Visual Builder**: Drag-and-drop command arrangement
- **Batch Execution**: Run complex command sequences automatically

### 👥 Player Management
- **Online Player List**: Real-time player monitoring
- **Player Actions**: Teleport, bring, kick, ban players
- **Gear Cloner**: Copy equipment between players
- **Tribe Management**: Tribe power level visualization

### 🖥️ Server Monitor
- **Resource Monitoring**: CPU, memory, network usage
- **Server Controls**: Save world, restart, shutdown
- **Performance Charts**: Real-time resource graphs
- **Server Logs**: Live log monitoring and filtering

### 🎬 Cinema Mode
- **UI Toggle**: Hide interface for clean recording
- **Free Camera**: Unrestricted camera movement
- **Auto Pilot**: Automated camera path generation
- **Creative Tools**: Instant build, structure cleaner, base preview

## 🛠️ Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Windows 10/11 (for .exe build)

### Development Setup
```bash
# Clone the repository
git clone <repository-url>
cd ark-admin-master

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Create executable
npm run dist
```

### Electron Build
The application is configured to build as a Windows executable using Electron Builder.

```bash
# Install Electron globally (optional)
npm install -g electron

# Build executable
npm run dist
```

## 📁 Project Structure

```
ark-admin-master/
├── assets/
│   ├── css/
│   │   ├── main.css          # Main styles and layout
│   │   ├── components.css    # Component-specific styles
│   │   └── animations.css    # Animations and effects
│   ├── js/
│   │   ├── main.js           # Main application logic
│   │   ├── data.js           # Data management
│   │   ├── components.js     # UI components
│   │   ├── spawner.js        # Dino spawner logic
│   │   ├── commands.js       # Command library
│   │   ├── map.js            # Map tools
│   │   ├── macros.js         # Macro system
│   │   ├── terminals.js      # Terminal/mannequin logic
│   │   ├── players.js        # Player management
│   │   ├── server.js         # Server monitoring
│   │   └── cinema.js         # Cinema mode
│   ├── fonts/                # Custom fonts
│   ├── effects/              # Visual effects
│   ├── sound/                # Audio files
│   └── icons/                # Application icons
├── data/
│   ├── commands/             # Admin command data
│   ├── creatures/            # Dino spawn data
│   ├── items/                # Item database
│   ├── terminals/            # Terminal configurations
│   ├── mannequins/           # Mannequin presets
│   └── maps/                 # Map data and locations
├── index.html                # Main HTML file
├── main.js                   # Electron main process
├── package.json              # Project configuration
└── README.md                 # This file
```

## 🎨 Design Features

### Futuristic UI
- **Cyberpunk Theme**: Dark mode with neon accents
- **Glass Morphism**: Translucent panels and blur effects
- **Neon Glows**: Blue, pink, green, red accent colors
- **Smooth Animations**: CSS transitions and keyframe animations

### Typography
- **Orbitron**: Primary headings and titles
- **Share Tech Mono**: Secondary text and labels
- **JetBrains Mono**: Code and technical content

### Responsive Design
- **Adaptive Layout**: Works on different screen sizes
- **Touch Support**: Mobile-friendly interactions
- **Keyboard Shortcuts**: Power user navigation

## 🔧 Configuration

### Server Connection
Configure your ARK server connection in the settings:
- Server IP address
- Admin password
- Connection timeout

### Custom Data
Add custom data by editing JSON files in the `/data` directory:
- `admin_commands.json`: Add custom admin commands
- `creature_spawn_data.json`: Add new creatures
- `item_ids.json`: Add custom items
- `teleport_locations.json`: Add map locations

## 🚀 Usage

### Quick Start
1. Launch the application
2. Navigate to the Dashboard tab
3. Use Quick Actions for common tasks
4. Explore different tabs for advanced features

### Keyboard Shortcuts
- `Ctrl + S`: Save settings
- `Ctrl + Q`: Quick spawn menu
- `Ctrl + T`: Teleport to cursor
- `Ctrl + G`: Toggle god mode
- `Ctrl + 1-0`: Switch between tabs

### Dino Spawning
1. Go to Dino Spawner tab
2. Search for desired species
3. Configure stats and colors
4. Set spawn options (level, distance, saddle)
5. Click "Spawn Dinosaur"

### Map Navigation
1. Open Map Tools tab
2. Select mode (teleport, spawn, pin)
3. Click on map to perform action
4. Use mouse wheel to zoom
5. Drag to pan around map

### Macro Creation
1. Navigate to Macros tab
2. Enter macro name
3. Add commands with delays
4. Save macro for later use
5. Execute with one click

## 🔒 Security

### Admin Authentication
- Secure password storage
- Session management
- Command logging
- Access control

### Data Protection
- Local data encryption
- Secure file handling
- Privacy compliance
- Audit trails

## 🐛 Troubleshooting

### Common Issues

**Application won't start**
- Check Node.js version (16+ required)
- Verify all dependencies are installed
- Check console for error messages

**Map not loading**
- Ensure canvas element exists
- Check browser console for errors
- Verify map data files are present

**Commands not executing**
- Verify server connection
- Check admin permissions
- Ensure command syntax is correct

### Performance Optimization
- Close unused tabs
- Limit concurrent operations
- Monitor resource usage
- Clear cache if needed

## 🤝 Contributing

### Development Guidelines
1. Follow existing code style
2. Add comments for complex logic
3. Test features thoroughly
4. Update documentation

### Feature Requests
- Use GitHub issues
- Provide detailed descriptions
- Include use cases
- Suggest implementation approach

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- ARK Survival Evolved community
- Electron framework
- Font Awesome icons
- Chart.js for visualizations

## 📞 Support

For support and questions:
- Create GitHub issue
- Check documentation
- Review troubleshooting guide
- Contact development team

---

**ARK Admin Toolkit: Omega Control Suite** - The ultimate admin panel for ARK Survival Evolved servers. 