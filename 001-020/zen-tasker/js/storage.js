/**
 * Storage Manager - Handle localStorage operations with error handling
 * Menggunakan syntax ES2025 terbaru dengan modular approach
 */

class ZenStorage {
    constructor() {
        this.storageKey = 'zenTasker_tasks';
        this.settingsKey = 'zenTasker_settings';
        this.isStorageAvailable = this.checkStorageAvailability();
    }

    /**
     * Check if localStorage is available
     * @returns {boolean}
     */
    checkStorageAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('LocalStorage is not available. Data will not persist.');
            return false;
        }
    }

    /**
     * Get all tasks from localStorage
     * @returns {Array} Array of task objects
     */
    getTasks() {
        if (!this.isStorageAvailable) {
            return [];
        }

        try {
            const tasksJson = localStorage.getItem(this.storageKey);
            const tasks = tasksJson ? JSON.parse(tasksJson) : [];
            
            // Validate and clean data
            return tasks.filter(task => 
                task && 
                typeof task.id === 'string' && 
                typeof task.text === 'string'
            );
        } catch (error) {
            console.error('Error reading tasks from storage:', error);
            return [];
        }
    }

    /**
     * Save all tasks to localStorage
     * @param {Array} tasks - Array of task objects
     * @returns {boolean} Success status
     */
    saveTasks(tasks) {
        if (!this.isStorageAvailable) {
            return false;
        }

        try {
            // Validate tasks before saving
            const validTasks = tasks.filter(task => 
                task && 
                task.id && 
                task.text && 
                typeof task.text === 'string'
            );

            localStorage.setItem(this.storageKey, JSON.stringify(validTasks));
            return true;
        } catch (error) {
            console.error('Error saving tasks to storage:', error);
            return false;
        }
    }

    /**
     * Add a new task
     * @param {Object} task - Task object to add
     * @returns {boolean} Success status
     */
    addTask(task) {
        const tasks = this.getTasks();
        tasks.push(task);
        return this.saveTasks(tasks);
    }

    /**
     * Update an existing task
     * @param {string} taskId - ID of the task to update
     * @param {Object} updates - Object with updated properties
     * @returns {boolean} Success status
     */
    updateTask(taskId, updates) {
        const tasks = this.getTasks();
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex === -1) {
            return false;
        }

        // Merge updates with existing task
        tasks[taskIndex] = { ...tasks[taskIndex], ...updates, id: taskId };
        return this.saveTasks(tasks);
    }

    /**
     * Delete a task
     * @param {string} taskId - ID of the task to delete
     * @returns {boolean} Success status
     */
    deleteTask(taskId) {
        const tasks = this.getTasks();
        const filteredTasks = tasks.filter(task => task.id !== taskId);
        return this.saveTasks(filteredTasks);
    }

    /**
     * Get task by ID
     * @param {string} taskId - ID of the task
     * @returns {Object|null} Task object or null if not found
     */
    getTaskById(taskId) {
        const tasks = this.getTasks();
        return tasks.find(task => task.id === taskId) || null;
    }

    /**
     * Get tasks by filter criteria
     * @param {Object} criteria - Filter criteria
     * @returns {Array} Filtered tasks
     */
    getTasksByCriteria(criteria = {}) {
        const tasks = this.getTasks();
        
        return tasks.filter(task => {
            if (criteria.completed !== undefined) {
                if (task.completed !== criteria.completed) return false;
            }
            
            if (criteria.priority) {
                if (task.priority !== criteria.priority) return false;
            }
            
            if (criteria.search) {
                if (!task.text.toLowerCase().includes(criteria.search.toLowerCase())) {
                    return false;
                }
            }
            
            return true;
        });
    }

    /**
     * Get settings from localStorage
     * @returns {Object} Settings object
     */
    getSettings() {
        if (!this.isStorageAvailable) {
            return this.getDefaultSettings();
        }

        try {
            const settingsJson = localStorage.getItem(this.settingsKey);
            const settings = settingsJson ? JSON.parse(settingsJson) : {};
            
            // Merge with defaults to ensure all properties exist
            return { ...this.getDefaultSettings(), ...settings };
        } catch (error) {
            console.error('Error reading settings from storage:', error);
            return this.getDefaultSettings();
        }
    }

    /**
     * Save settings to localStorage
     * @param {Object} settings - Settings object
     * @returns {boolean} Success status
     */
    saveSettings(settings) {
        if (!this.isStorageAvailable) {
            return false;
        }

        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving settings to storage:', error);
            return false;
        }
    }

    /**
     * Get default settings
     * @returns {Object} Default settings
     */
    getDefaultSettings() {
        return {
            theme: 'zen',
            defaultPriority: 'medium',
            autoSort: true,
            showCompletedTasks: true,
            soundEnabled: false,
            animationsEnabled: true
        };
    }

    /**
     * Clear all data from storage
     * @returns {boolean} Success status
     */
    clearAll() {
        if (!this.isStorageAvailable) {
            return false;
        }

        try {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.settingsKey);
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }

    /**
     * Export tasks as JSON
     * @returns {string} JSON string of all tasks
     */
    exportTasks() {
        const tasks = this.getTasks();
        const settings = this.getSettings();
        
        const exportData = {
            tasks,
            settings,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Import tasks from JSON string
     * @param {string} jsonData - JSON string containing tasks
     * @returns {boolean} Success status
     */
    importTasks(jsonData) {
        try {
            const importData = JSON.parse(jsonData);
            
            if (!importData.tasks || !Array.isArray(importData.tasks)) {
                throw new Error('Invalid data format');
            }
            
            // Validate and save tasks
            const isTasksSaved = this.saveTasks(importData.tasks);
            
            // Save settings if available
            if (importData.settings) {
                this.saveSettings(importData.settings);
            }
            
            return isTasksSaved;
        } catch (error) {
            console.error('Error importing tasks:', error);
            return false;
        }
    }

    /**
     * Get storage statistics
     * @returns {Object} Storage statistics
     */
    getStorageStats() {
        const tasks = this.getTasks();
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const activeTasks = totalTasks - completedTasks;
        
        const priorityStats = {
            high: tasks.filter(task => task.priority === 'high').length,
            medium: tasks.filter(task => task.priority === 'medium').length,
            low: tasks.filter(task => task.priority === 'low').length
        };
        
        return {
            total: totalTasks,
            completed: completedTasks,
            active: activeTasks,
            priority: priorityStats,
            storageAvailable: this.isStorageAvailable
        };
    }
}

// Export the storage instance
const zenStorage = new ZenStorage();

// Make it globally available for other modules
window.zenStorage = zenStorage;