# 🧘 Zen Tasker - Japanese Zen Garden To-Do List

A beautiful, mindful task management application inspired by Japanese zen gardens. Built with vanilla HTML, CSS, and JavaScript using modern ES2025 syntax and modular programming patterns.

## ✨ Features

### Core Functionality

- ✅ **CRUD Operations** - Create, read, update, delete tasks
- 🎯 **Priority System** - Low, Medium, High priority levels
- 🔍 **Advanced Filtering** - Filter by status, priority, date
- 💾 **LocalStorage** - Persistent data storage with fallback
- 🎨 **Zen Theme** - Japanese-inspired design with pastel green colors

### User Experience

- 🌸 **Beautiful Animations** - Smooth, zen-like transitions
- 📱 **Responsive Design** - Works on all device sizes
- ⌨️ **Keyboard Shortcuts** - Power user friendly
- 🎉 **Completion Celebrations** - Particle effects for completed tasks
- 🔊 **Toast Notifications** - Gentle feedback messages

### Advanced Features

- 🧠 **Smart Filters** - Auto-generated based on usage patterns
- 🔎 **Fuzzy Search** - Intelligent text matching
- 📊 **Statistics Dashboard** - Task completion insights
- 🎛️ **Customizable Settings** - Personalize your experience
- 💾 **Import/Export** - Backup and restore your tasks

## 🏗️ Architecture

### Modular Design

The application follows modern JavaScript module patterns with clear separation of concerns:

```
zen-tasker/
├── index.html          # Main HTML structure
├── css/
│   ├── styles.css      # Base styles and layout
│   └── zen-theme.css   # Zen garden theme styling
├── js/
│   ├── storage.js      # LocalStorage management
│   ├── taskManager.js  # Task CRUD operations
│   ├── filters.js      # Filtering and search system
│   ├── zenAnimations.js# Animation orchestration
│   └── app.js          # Main application controller
└── README.md           # This file
```

### Design Patterns Used

- **Observer Pattern** - Reactive updates between modules
- **Module Pattern** - Encapsulated, reusable components
- **MVC Architecture** - Clear separation of data, view, and logic
- **Factory Pattern** - Dynamic task and filter creation
- **Strategy Pattern** - Pluggable filtering strategies

## 🚀 Getting Started

### Prerequisites

- Modern web browser with ES2025 support
- Local web server (optional, for development)

### Installation

1. **Clone or download** the project files

```bash
# Create project structure
mkdir zen-tasker
cd zen-tasker

# Create folders
mkdir -p assets/images assets/fonts
mkdir -p js css

# Copy all files to appropriate directories
```

2. **File Structure Setup**

```bash
# Create all necessary files
touch index.html
touch css/styles.css
touch css/zen-theme.css
touch js/app.js
touch js/taskManager.js
touch js/storage.js
touch js/filters.js
touch js/zenAnimations.js
touch README.md
```

3. **Open in Browser**

```bash
# Simply open index.html in your browser
# Or use a local server:
python -m http.server 8000
# Then visit: http://localhost:8000
```

## 🎮 Usage

### Basic Operations

#### Adding Tasks

- Type your task in the input field
- Select priority level (Low/Medium/High)
- Press Enter or click "Add Task" button
- Use keyboard shortcuts: Ctrl+1 (Low), Ctrl+2 (Medium), Ctrl+3 (High)

#### Managing Tasks

- **Complete**: Click the circular checkbox
- **Edit**: Double-click the task text or click edit button
- **Delete**: Click the delete button and confirm
- **Filter**: Use filter buttons to show specific task groups

#### Keyboard Shortcuts

- `/` - Focus on task input
- `Cmd/Ctrl + K` - Quick focus on input
- `Cmd/Ctrl + 1-3` - Switch between filters
- `Escape` - Clear focus
- `Enter` - Submit task or save edit
- `Escape` - Cancel edit

### Advanced Features

#### Smart Filters

The app automatically suggests filters based on your usage:

- Most common priority tasks
- Overdue tasks (older than 7 days)
- Recently created tasks
- Custom pattern-based filters

#### Search & Filtering

- Use the search bar for fuzzy text matching
- Combine filters with search queries
- Sort by priority, date, or alphabetically
- Create custom filters for specific workflows

#### Data Management

- **Auto-save**: All changes are automatically saved to localStorage
- **Export**: Export your tasks as JSON file
- **Import**: Import tasks from backup file
- **Clear**: Reset all data with confirmation

## 🎨 Customization

### Themes

The zen theme uses CSS custom properties for easy customization:

```css
:root {
  --zen-primary: #7fb069; /* Main green color */
  --zen-secondary: #a7c957; /* Secondary green */
  --zen-accent: #f2e8cf; /* Light accent */
  --zen-sage: #dde5b6; /* Sage green */
  /* ... more variables */
}
```

### Animation Settings

Control animations through the ZenAnimations class:

```javascript
// Disable animations
zenAnimations.setAnimationEnabled(false);

// Check animation status
console.log(zenAnimations.isAnimationEnabled());
```

### Storage Configuration

Customize storage behavior:

```javascript
// Get storage statistics
const stats = zenStorage.getStorageStats();

// Export/Import data
const backup = zenStorage.exportTasks();
zenStorage.importTasks(backup);
```

## 🧪 Technical Details

### Browser Compatibility

- **Modern browsers** with ES2025 support
- **Chrome 91+**, **Firefox 89+**, **Safari 14+**
- **Mobile browsers** with touch support
- **Progressive enhancement** for older browsers

### Performance Features

- **Lazy loading** of animations
- **Debounced** search and resize events
- **Efficient DOM** updates with virtual scrolling concepts
- **Memory management** with cleanup methods

### Accessibility

- **ARIA labels** and semantic HTML
- **Keyboard navigation** support
- **Screen reader** friendly
- **Reduced motion** support for accessibility preferences
- **High contrast** compatible

### Security

- **XSS protection** with HTML escaping
- **Input validation** and sanitization
- **Safe localStorage** usage with error handling
- **No external dependencies** for better security

## 🐛 Troubleshooting

### Common Issues

#### Tasks not saving

- Check if localStorage is available in your browser
- Ensure you're not in private/incognito mode
- Check browser storage quotas

#### Animations not working

- Verify browser supports CSS animations
- Check if "reduced motion" is disabled in OS settings
- Ensure JavaScript is enabled

#### Layout issues

- Clear browser cache
- Check if CSS files are loading properly
- Verify viewport meta tag is present

### Debug Mode

Open browser console and use these commands:

```javascript
// Check app status
console.log(zenApp.state);

// View current tasks
console.log(zenTaskManager.getAllTasks());

// Check storage
console.log(zenStorage.getStorageStats());

// Test animations
zenAnimations.setAnimationEnabled(true);
```

## 🤝 Contributing

### Development Guidelines

1. Follow ES2025 syntax patterns
2. Use modular programming principles
3. Maintain zen-like simplicity
4. Add comprehensive comments
5. Test across different browsers

### Code Style

- Use `camelCase` for variables and functions
- Use `PascalCase` for classes
- Use `kebab-case` for CSS classes
- Follow JSDoc commenting style

### Adding Features

1. Create new modules in separate files
2. Use observer pattern for communication
3. Add proper error handling
4. Include accessibility considerations
5. Update documentation

## 📜 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Inspired by Japanese zen garden philosophy
- Color palette derived from natural green tones
- Typography using Noto Sans JP for authenticity
- Animation principles from Material Design

## 🌸 Philosophy

> "The mind is everything. What you think you become." - Buddha

Zen Tasker embodies the principles of mindful productivity:

- **Simplicity** over complexity
- **Focus** on what matters most
- **Balance** between doing and being
- **Mindfulness** in task management
- **Beauty** in functional design

---

_Find peace in productivity_ 🧘‍♀️
