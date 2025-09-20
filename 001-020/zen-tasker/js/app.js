/**
 * Zen Tasker App - Main Application Controller
 * Orchestrates all modules and handles UI interactions
 * ES2025 syntax with modern JavaScript patterns
 */

class ZenTaskerApp {
    constructor() {
        // DOM elements
        this.elements = {};
        
        // State
        this.state = {
            isLoading: false,
            currentView: 'all',
            isInitialized: false
        };
        
        // Debounce timers
        this.debounceTimers = {
            search: null,
            resize: null
        };
        
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            this.state.isLoading = true;
            this.cacheElements();
            this.bindEvents();
            this.setupObservers();
            
            // Wait for DOM to be fully ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.finishInit());
            } else {
                this.finishInit();
            }
        } catch (error) {
            console.error('Failed to initialize Zen Tasker:', error);
            this.showError('Failed to initialize application');
        }
    }

    /**
     * Finish initialization after DOM is ready
     */
    finishInit() {
        this.loadInitialData();
        this.setupKeyboardShortcuts();
        this.setupResponsiveHandling();
        this.state.isLoading = false;
        this.state.isInitialized = true;
        
        // Show initial animation
        this.animateAppLoad();
        
        console.log('🧘 Zen Tasker initialized successfully');
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            // Forms
            taskForm: document.getElementById('taskForm'),
            taskInput: document.getElementById('taskInput'),
            taskPriority: document.getElementById('taskPriority'),
            
            // Lists and containers
            tasksList: document.getElementById('tasksList'),
            emptyState: document.getElementById('emptyState'),
            
            // Filters
            filterBtns: document.querySelectorAll('.filter-btn'),
            
            // Stats
            totalTasks: document.getElementById('totalTasks'),
            completedTasks: document.getElementById('completedTasks'),
            activeTasks: document.getElementById('activeTasks'),
            
            // Toast
            toast: document.getElementById('toast'),
            
            // Containers
            zenContainer: document.querySelector('.zen-container'),
            zenGarden: document.querySelector('.zen-garden')
        };
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Task form submission
        this.elements.taskForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTaskSubmit();
        });

        // Input validation and feedback
        this.elements.taskInput?.addEventListener('input', (e) => {
            this.handleInputChange(e);
        });

        this.elements.taskInput?.addEventListener('keydown', (e) => {
            this.handleInputKeydown(e);
        });

        // Filter buttons
        this.elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilterClick(e);
            });
        });

        // Global event listeners
        window.addEventListener('resize', () => {
            this.debounce('resize', () => this.handleResize(), 250);
        });

        window.addEventListener('beforeunload', () => {
            this.handleBeforeUnload();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeydown(e);
        });

        // Prevent form submission on empty input
        this.elements.taskInput?.addEventListener('blur', () => {
            this.validateInput();
        });
    }

    /**
     * Setup observers for data changes
     */
    setupObservers() {
        // Task manager observer
        if (window.zenTaskManager) {
            zenTaskManager.addObserver((event, data) => {
                this.handleTaskManagerEvent(event, data);
            });
        }

        // Filter manager observer
        if (window.zenFilterManager) {
            zenFilterManager.addObserver((event, data) => {
                this.handleFilterManagerEvent(event, data);
            });
        }
    }

    /**
     * Load initial data and render UI
     */
    loadInitialData() {
        try {
            // Load and render tasks
            this.renderTasks();
            this.updateStats();
            this.updateEmptyState();
            
            // Set initial filter
            this.setActiveFilter('all');
            
            // Focus on input
            this.elements.taskInput?.focus();
            
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showError('Failed to load tasks');
        }
    }

    /**
     * Handle task form submission
     */
    handleTaskSubmit() {
        const text = this.elements.taskInput?.value.trim();
        const priority = this.elements.taskPriority?.value || 'medium';

        if (!text) {
            this.shakeInput();
            this.showToast('Please enter a task description', 'warning');
            return;
        }

        if (text.length > 100) {
            this.showToast('Task description is too long (max 100 characters)', 'error');
            return;
        }

        // Create task
        const task = zenTaskManager.createTask(text, priority);
        
        if (task) {
            // Clear form
            this.elements.taskInput.value = '';
            this.elements.taskPriority.value = 'medium';
            
            // Show success message
            this.showToast('Task added successfully! 🌱', 'success');
            
            // Focus back on input
            setTimeout(() => {
                this.elements.taskInput?.focus();
            }, 100);
        }
    }

    /**
     * Handle input changes with validation
     */
    handleInputChange(e) {
        const value = e.target.value;
        const isValid = value.trim().length > 0 && value.length <= 100;
        
        // Update input styling
        e.target.classList.toggle('invalid', !isValid && value.length > 0);
        
        // Show character count for long inputs
        if (value.length > 80) {
            this.showCharacterCount(value.length);
        } else {
            this.hideCharacterCount();
        }
    }

    /**
     * Handle input keydown events
     */
    handleInputKeydown(e) {
        // Quick priority shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case '1':
                    e.preventDefault();
                    this.elements.taskPriority.value = 'low';
                    break;
                case '2':
                    e.preventDefault();
                    this.elements.taskPriority.value = 'medium';
                    break;
                case '3':
                    e.preventDefault();
                    this.elements.taskPriority.value = 'high';
                    break;
            }
        }
    }

    /**
     * Handle filter button clicks
     */
    handleFilterClick(e) {
        const filterType = e.target.dataset.filter;
        if (filterType) {
            this.setActiveFilter(filterType);
        }
    }

    /**
     * Set active filter and update UI
     */
    setActiveFilter(filterType) {
        // Update filter manager
        zenFilterManager.setActiveFilter(filterType);
        
        // Update UI
        this.elements.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filterType);
        });
        
        // Update task manager filter
        zenTaskManager.setFilter(filterType);
        
        // Store current view
        this.state.currentView = filterType;
    }

    /**
     * Handle task manager events
     */
    handleTaskManagerEvent(event, data) {
        switch (event) {
            case 'tasksLoaded':
            case 'tasksUpdated':
                this.renderTasks();
                this.updateStats();
                this.updateEmptyState();
                break;
            
            case 'taskCreated':
                this.handleTaskCreated(data);
                break;
            
            case 'taskUpdated':
                this.handleTaskUpdated(data);
                break;
            
            case 'taskDeleted':
                this.handleTaskDeleted(data);
                break;
            
            case 'error':
                this.showError(data);
                break;
        }
    }

    /**
     * Handle filter manager events
     */
    handleFilterManagerEvent(event, data) {
        switch (event) {
            case 'activeFilterChanged':
                this.renderTasks();
                break;
            
            case 'searchQueryChanged':
                this.renderTasks();
                break;
        }
    }

    /**
     * Render tasks list
     */
    renderTasks() {
        if (!this.elements.tasksList) return;

        const tasks = zenTaskManager.getFilteredTasks();
        
        // Apply additional filters from filter manager
        const filteredTasks = zenFilterManager.applyFilters(tasks);
        
        // Clear current tasks
        this.elements.tasksList.innerHTML = '';
        
        // Render each task
        filteredTasks.forEach((task, index) => {
            const taskElement = this.createTaskElement(task, index);
            this.elements.tasksList.appendChild(taskElement);
            
            // Add to animation observer
            zenAnimations.observeElement(taskElement);
        });
    }

    /**
     * Create task element
     */
    createTaskElement(task, index = 0) {
        const li = document.createElement('li');
        li.className = `task-item priority-${task.priority}`;
        li.dataset.taskId = task.id;
        
        if (task.completed) {
            li.classList.add('completed');
        }
        
        li.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                 title="Toggle completion">
            </div>
            
            <div class="task-content">
                <div class="task-text">${this.escapeHtml(task.text)}</div>
                <div class="task-meta">
                    <span class="task-priority priority-${task.priority}">
                        ${task.priority}
                    </span>
                    <span class="task-time">
                        ${this.formatDate(task.createdAt)}
                    </span>
                    ${task.completed ? 
                        `<span class="task-completed-time">
                            ✅ ${this.formatDate(task.completedAt)}
                        </span>` : ''
                    }
                </div>
            </div>
            
            <div class="task-actions">
                <button class="action-btn edit-btn" 
                        title="Edit task"
                        data-task-id="${task.id}">
                    ✏️
                </button>
                <button class="action-btn delete-btn" 
                        title="Delete task"
                        data-task-id="${task.id}">
                    🗑️
                </button>
            </div>
        `;
        
        // Add event listeners
        this.bindTaskEvents(li, task);
        
        // Add entrance animation
        li.style.animationDelay = `${index * 50}ms`;
        
        return li;
    }

    /**
     * Bind events to task element
     */
    bindTaskEvents(taskElement, task) {
        const checkbox = taskElement.querySelector('.task-checkbox');
        const editBtn = taskElement.querySelector('.edit-btn');
        const deleteBtn = taskElement.querySelector('.delete-btn');
        
        // Toggle completion
        checkbox?.addEventListener('click', () => {
            zenTaskManager.toggleTask(task.id);
        });
        
        // Edit task (simple implementation)
        editBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.editTask(task);
        });
        
        // Delete task
        deleteBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteTask(task);
        });
        
        // Double click to edit
        taskElement.addEventListener('dblclick', () => {
            this.editTask(task);
        });
    }

    /**
     * Edit task inline
     */
    editTask(task) {
        const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
        if (!taskElement) return;
        
        const textElement = taskElement.querySelector('.task-text');
        const currentText = textElement.textContent;
        
        // Create input element
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'zen-input';
        input.style.width = '100%';
        
        // Replace text with input
        textElement.replaceWith(input);
        input.focus();
        input.select();
        
        const saveEdit = () => {
            const newText = input.value.trim();
            
            if (newText && newText !== currentText) {
                // Update task
                const success = zenTaskManager.updateTask(task.id, { text: newText });
                
                if (success) {
                    this.showToast('Task updated successfully! ✨', 'success');
                } else {
                    this.showToast('Failed to update task', 'error');
                    // Restore original text
                    input.replaceWith(textElement);
                }
            } else {
                // Restore original text
                const newTextElement = document.createElement('div');
                newTextElement.className = 'task-text';
                newTextElement.textContent = currentText;
                input.replaceWith(newTextElement);
            }
        };
        
        const cancelEdit = () => {
            const newTextElement = document.createElement('div');
            newTextElement.className = 'task-text';
            newTextElement.textContent = currentText;
            input.replaceWith(newTextElement);
        };
        
        // Handle save/cancel
        input.addEventListener('blur', saveEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEdit();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEdit();
            }
        });
    }

    /**
     * Delete task with confirmation
     */
    deleteTask(task) {
        if (confirm(`Are you sure you want to delete "${task.text}"?`)) {
            const success = zenTaskManager.deleteTask(task.id);
            
            if (success) {
                this.showToast('Task deleted 🗑️', 'info');
            } else {
                this.showToast('Failed to delete task', 'error');
            }
        }
    }

    /**
     * Update statistics display
     */
    updateStats() {
        const stats = zenTaskManager.getStats();
        
        if (this.elements.totalTasks) {
            this.elements.totalTasks.textContent = `${stats.total} task${stats.total !== 1 ? 's' : ''}`;
        }
        
        if (this.elements.completedTasks) {
            this.elements.completedTasks.textContent = `${stats.completed} completed`;
        }
        
        if (this.elements.activeTasks) {
            this.elements.activeTasks.textContent = `${stats.active} active`;
        }
    }

    /**
     * Update empty state visibility
     */
    updateEmptyState() {
        const tasks = zenTaskManager.getFilteredTasks();
        const isEmpty = tasks.length === 0;
        
        if (this.elements.emptyState) {
            this.elements.emptyState.style.display = isEmpty ? 'block' : 'none';
        }
        
        if (this.elements.tasksList) {
            this.elements.tasksList.style.display = isEmpty ? 'none' : 'block';
        }
    }

    /**
     * Handle task creation
     */
    handleTaskCreated(task) {
        this.showToast('Task added to your zen garden 🌱', 'success');
    }

    /**
     * Handle task update
     */
    handleTaskUpdated(task) {
        if (task.completed) {
            this.showToast('Task completed! Well done 🎉', 'success');
        }
    }

    /**
     * Handle task deletion
     */
    handleTaskDeleted(task) {
        // Animation is handled by zenAnimations
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        if (!this.elements.toast) return;
        
        // Set toast type class
        this.elements.toast.className = `toast ${type}`;
        
        zenAnimations.showToast(this.elements.toast, message);
    }

    /**
     * Show error message
     */
    showError(message) {
        this.showToast(message, 'error');
        console.error('Zen Tasker Error:', message);
    }

    /**
     * Shake input on invalid submission
     */
    shakeInput() {
        this.elements.taskInput?.classList.add('zen-shake');
        setTimeout(() => {
            this.elements.taskInput?.classList.remove('zen-shake');
        }, 500);
    }

    /**
     * Show character count
     */
    showCharacterCount(count) {
        let counter = document.querySelector('.character-counter');
        if (!counter) {
            counter = document.createElement('div');
            counter.className = 'character-counter';
            this.elements.taskInput?.parentNode.appendChild(counter);
        }
        
        counter.textContent = `${count}/100`;
        counter.classList.toggle('warning', count > 90);
        counter.classList.toggle('error', count > 100);
    }

    /**
     * Hide character count
     */
    hideCharacterCount() {
        const counter = document.querySelector('.character-counter');
        if (counter) {
            counter.remove();
        }
    }

    /**
     * Validate input
     */
    validateInput() {
        const value = this.elements.taskInput?.value || '';
        const isValid = value.trim().length > 0 && value.length <= 100;
        
        this.elements.taskInput?.classList.toggle('invalid', !isValid && value.length > 0);
        
        return isValid;
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        // Global shortcuts
        const shortcuts = {
            'cmd+k': () => this.elements.taskInput?.focus(),
            'cmd+1': () => this.setActiveFilter('all'),
            'cmd+2': () => this.setActiveFilter('active'),
            'cmd+3': () => this.setActiveFilter('completed'),
            'escape': () => this.elements.taskInput?.blur()
        };
        
        // Note: Full keyboard shortcut implementation would be more complex
        // This is a simplified version
    }

    /**
     * Handle global keydown events
     */
    handleGlobalKeydown(e) {
        // Quick focus on input with '/'
        if (e.key === '/' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            this.elements.taskInput?.focus();
        }
    }

    /**
     * Setup responsive handling
     */
    setupResponsiveHandling() {
        this.handleResize();
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Update layout if needed
        const isMobile = window.innerWidth < 768;
        document.body.classList.toggle('mobile', isMobile);
    }

    /**
     * Handle before unload
     */
    handleBeforeUnload() {
        // Save any pending changes
        // This is handled automatically by the storage system
    }

    /**
     * Animate app loading
     */
    animateAppLoad() {
        const elements = [
            this.elements.zenContainer,
            this.elements.taskForm,
            this.elements.zenGarden
        ];
        
        elements.forEach((el, index) => {
            if (el) {
                setTimeout(() => {
                    el.classList.add('zen-fade-in');
                }, index * 150);
            }
        });
    }

    /**
     * Utility: Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Utility: Format date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    }

    /**
     * Utility: Debounce function
     */
    debounce(key, func, delay) {
        clearTimeout(this.debounceTimers[key]);
        this.debounceTimers[key] = setTimeout(func, delay);
    }

    /**
     * Cleanup and destroy
     */
    destroy() {
        // Remove event listeners
        Object.values(this.debounceTimers).forEach(timer => {
            clearTimeout(timer);
        });
        
        // Cleanup animations
        zenAnimations.cleanup();
        
        console.log('🧘 Zen Tasker cleaned up');
    }
}

// Initialize app when DOM is ready
let zenApp;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        zenApp = new ZenTaskerApp();
    });
} else {
    zenApp = new ZenTaskerApp();
}

// Make app globally available for debugging
window.zenApp = zenApp;