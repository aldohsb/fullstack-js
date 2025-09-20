/**
 * Task Manager - Core task management functionality
 * Handles CRUD operations, validation, and business logic
 */

class ZenTaskManager {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.observers = [];
        this.settings = {};
        
        // Initialize
        this.init();
    }

    /**
     * Initialize the task manager
     */
    init() {
        this.loadTasks();
        this.loadSettings();
    }

    /**
     * Load tasks from storage
     */
    loadTasks() {
        try {
            this.tasks = zenStorage.getTasks();
            this.notifyObservers('tasksLoaded', this.tasks);
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.tasks = [];
        }
    }

    /**
     * Load settings from storage
     */
    loadSettings() {
        this.settings = zenStorage.getSettings();
    }

    /**
     * Create a new task
     * @param {string} text - Task text
     * @param {string} priority - Task priority (low, medium, high)
     * @returns {Object|null} Created task object or null if error
     */
    createTask(text, priority = 'medium') {
        // Validate input
        const validatedText = this.validateTaskText(text);
        if (!validatedText) {
            this.notifyObservers('error', 'Task text is required and must be valid');
            return null;
        }

        const validatedPriority = this.validatePriority(priority);

        // Create task object
        const task = {
            id: this.generateId(),
            text: validatedText,
            priority: validatedPriority,
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completedAt: null
        };

        // Add to memory array
        this.tasks.push(task);

        // Save to storage
        const saved = zenStorage.addTask(task);
        if (!saved) {
            // Remove from memory if storage failed
            this.tasks = this.tasks.filter(t => t.id !== task.id);
            this.notifyObservers('error', 'Failed to save task');
            return null;
        }

        // Notify observers
        this.notifyObservers('taskCreated', task);
        this.notifyObservers('tasksUpdated', this.getFilteredTasks());

        return task;
    }

    /**
     * Update an existing task
     * @param {string} taskId - Task ID
     * @param {Object} updates - Updates object
     * @returns {boolean} Success status
     */
    updateTask(taskId, updates) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) {
            this.notifyObservers('error', 'Task not found');
            return false;
        }

        const currentTask = this.tasks[taskIndex];
        const updatedTask = {
            ...currentTask,
            ...updates,
            id: taskId, // Ensure ID doesn't change
            updatedAt: new Date().toISOString()
        };

        // Validate updates
        if (updates.text !== undefined) {
            const validatedText = this.validateTaskText(updates.text);
            if (!validatedText) {
                this.notifyObservers('error', 'Invalid task text');
                return false;
            }
            updatedTask.text = validatedText;
        }

        if (updates.priority !== undefined) {
            updatedTask.priority = this.validatePriority(updates.priority);
        }

        // Handle completion status change
        if (updates.completed !== undefined && updates.completed !== currentTask.completed) {
            updatedTask.completedAt = updates.completed ? new Date().toISOString() : null;
        }

        // Update in memory
        this.tasks[taskIndex] = updatedTask;

        // Save to storage
        const saved = zenStorage.updateTask(taskId, updatedTask);
        if (!saved) {
            // Revert memory changes if storage failed
            this.tasks[taskIndex] = currentTask;
            this.notifyObservers('error', 'Failed to update task');
            return false;
        }

        // Notify observers
        this.notifyObservers('taskUpdated', updatedTask);
        this.notifyObservers('tasksUpdated', this.getFilteredTasks());

        return true;
    }

    /**
     * Delete a task
     * @param {string} taskId - Task ID
     * @returns {boolean} Success status
     */
    deleteTask(taskId) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) {
            this.notifyObservers('error', 'Task not found');
            return false;
        }

        const deletedTask = this.tasks[taskIndex];

        // Remove from memory
        this.tasks = this.tasks.filter(task => task.id !== taskId);

        // Remove from storage
        const deleted = zenStorage.deleteTask(taskId);
        if (!deleted) {
            // Restore to memory if storage failed
            this.tasks.splice(taskIndex, 0, deletedTask);
            this.notifyObservers('error', 'Failed to delete task');
            return false;
        }

        // Notify observers
        this.notifyObservers('taskDeleted', deletedTask);
        this.notifyObservers('tasksUpdated', this.getFilteredTasks());

        return true;
    }

    /**
     * Toggle task completion status
     * @param {string} taskId - Task ID
     * @returns {boolean} Success status
     */
    toggleTask(taskId) {
        const task = this.getTaskById(taskId);
        if (!task) {
            return false;
        }

        return this.updateTask(taskId, { completed: !task.completed });
    }

    /**
     * Get task by ID
     * @param {string} taskId - Task ID
     * @returns {Object|null} Task object or null
     */
    getTaskById(taskId) {
        return this.tasks.find(task => task.id === taskId) || null;
    }

    /**
     * Get all tasks
     * @returns {Array} Array of all tasks
     */
    getAllTasks() {
        return [...this.tasks];
    }

    /**
     * Get filtered tasks based on current filter
     * @returns {Array} Array of filtered tasks
     */
    getFilteredTasks() {
        return this.filterTasks(this.currentFilter);
    }

    /**
     * Filter tasks by criteria
     * @param {string} filterType - Filter type
     * @returns {Array} Filtered tasks
     */
    filterTasks(filterType) {
        let filteredTasks = [...this.tasks];

        switch (filterType) {
            case 'active':
                filteredTasks = filteredTasks.filter(task => !task.completed);
                break;
            case 'completed':
                filteredTasks = filteredTasks.filter(task => task.completed);
                break;
            case 'high':
                filteredTasks = filteredTasks.filter(task => task.priority === 'high' && !task.completed);
                break;
            case 'medium':
                filteredTasks = filteredTasks.filter(task => task.priority === 'medium' && !task.completed);
                break;
            case 'low':
                filteredTasks = filteredTasks.filter(task => task.priority === 'low' && !task.completed);
                break;
            case 'all':
            default:
                // Return all tasks
                break;
        }

        // Sort tasks if auto-sort is enabled
        if (this.settings.autoSort) {
            filteredTasks = this.sortTasks(filteredTasks);
        }

        return filteredTasks;
    }

    /**
     * Set current filter
     * @param {string} filterType - Filter type
     */
    setFilter(filterType) {
        this.currentFilter = filterType;
        this.notifyObservers('filterChanged', filterType);
        this.notifyObservers('tasksUpdated', this.getFilteredTasks());
    }

    /**
     * Sort tasks by priority and creation date
     * @param {Array} tasks - Tasks to sort
     * @returns {Array} Sorted tasks
     */
    sortTasks(tasks) {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        
        return tasks.sort((a, b) => {
            // First sort by completion status (incomplete first)
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }

            // Then sort by priority (high to low)
            if (a.priority !== b.priority) {
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }

            // Finally sort by creation date (newest first)
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }

    /**
     * Get task statistics
     * @returns {Object} Task statistics
     */
    getStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const active = total - completed;
        
        const byPriority = {
            high: this.tasks.filter(task => task.priority === 'high' && !task.completed).length,
            medium: this.tasks.filter(task => task.priority === 'medium' && !task.completed).length,
            low: this.tasks.filter(task => task.priority === 'low' && !task.completed).length
        };

        return {
            total,
            completed,
            active,
            byPriority,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }

    /**
     * Clear all completed tasks
     * @returns {number} Number of tasks cleared
     */
    clearCompleted() {
        const completedTasks = this.tasks.filter(task => task.completed);
        const clearedCount = completedTasks.length;

        completedTasks.forEach(task => {
            this.deleteTask(task.id);
        });

        if (clearedCount > 0) {
            this.notifyObservers('completedCleared', clearedCount);
        }

        return clearedCount;
    }

    /**
     * Validate task text
     * @param {string} text - Text to validate
     * @returns {string|null} Validated text or null if invalid
     */
    validateTaskText(text) {
        if (typeof text !== 'string') {
            return null;
        }

        const trimmed = text.trim();
        if (trimmed.length === 0 || trimmed.length > 500) {
            return null;
        }

        // Remove excessive whitespace
        return trimmed.replace(/\s+/g, ' ');
    }

    /**
     * Validate priority
     * @param {string} priority - Priority to validate
     * @returns {string} Valid priority
     */
    validatePriority(priority) {
        const validPriorities = ['low', 'medium', 'high'];
        return validPriorities.includes(priority) ? priority : 'medium';
    }

    /**
     * Generate unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Add observer for task manager events
     * @param {Function} observer - Observer function
     */
    addObserver(observer) {
        if (typeof observer === 'function') {
            this.observers.push(observer);
        }
    }

    /**
     * Remove observer
     * @param {Function} observer - Observer function to remove
     */
    removeObserver(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    /**
     * Notify all observers of an event
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    notifyObservers(event, data) {
        this.observers.forEach(observer => {
            try {
                observer(event, data);
            } catch (error) {
                console.error('Observer error:', error);
            }
        });
    }

    /**
     * Refresh tasks from storage
     */
    refresh() {
        this.loadTasks();
        this.loadSettings();
    }
}

// Create global instance
const zenTaskManager = new ZenTaskManager();

// Make it globally available
window.zenTaskManager = zenTaskManager;