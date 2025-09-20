/**
 * Filter System - Handle task filtering and search functionality
 * Modern ES2025 approach with advanced filtering capabilities
 */

class ZenFilterManager {
    constructor() {
        this.activeFilter = 'all';
        this.searchQuery = '';
        this.sortBy = 'priority';
        this.sortOrder = 'desc';
        this.filters = new Map();
        this.observers = [];
        
        // Initialize default filters
        this.initializeFilters();
    }

    /**
     * Initialize default filter configurations
     */
    initializeFilters() {
        // Basic filters
        this.addFilter('all', {
            name: 'All Tasks',
            icon: '📋',
            predicate: () => true,
            description: 'Show all tasks'
        });

        this.addFilter('active', {
            name: 'Active',
            icon: '⚡',
            predicate: task => !task.completed,
            description: 'Show incomplete tasks'
        });

        this.addFilter('completed', {
            name: 'Completed',
            icon: '✅',
            predicate: task => task.completed,
            description: 'Show completed tasks'
        });

        // Priority filters
        this.addFilter('high', {
            name: 'High Priority',
            icon: '🔴',
            predicate: task => task.priority === 'high' && !task.completed,
            description: 'Show high priority active tasks'
        });

        this.addFilter('medium', {
            name: 'Medium Priority',
            icon: '🟡',
            predicate: task => task.priority === 'medium' && !task.completed,
            description: 'Show medium priority active tasks'
        });

        this.addFilter('low', {
            name: 'Low Priority',
            icon: '🟢',
            predicate: task => task.priority === 'low' && !task.completed,
            description: 'Show low priority active tasks'
        });

        // Time-based filters
        this.addFilter('today', {
            name: 'Created Today',
            icon: '📅',
            predicate: task => {
                const today = new Date();
                const taskDate = new Date(task.createdAt);
                return taskDate.toDateString() === today.toDateString();
            },
            description: 'Show tasks created today'
        });

        this.addFilter('recent', {
            name: 'Recent',
            icon: '🕒',
            predicate: task => {
                const threeDaysAgo = new Date();
                threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
                return new Date(task.createdAt) >= threeDaysAgo;
            },
            description: 'Show tasks from last 3 days'
        });
    }

    /**
     * Add a custom filter
     * @param {string} id - Filter ID
     * @param {Object} config - Filter configuration
     */
    addFilter(id, config) {
        const filter = {
            id,
            name: config.name || id,
            icon: config.icon || '📝',
            predicate: config.predicate || (() => true),
            description: config.description || '',
            custom: config.custom || false
        };

        this.filters.set(id, filter);
        this.notifyObservers('filterAdded', filter);
    }

    /**
     * Remove a custom filter
     * @param {string} id - Filter ID
     * @returns {boolean} Success status
     */
    removeFilter(id) {
        const filter = this.filters.get(id);
        if (!filter || !filter.custom) {
            return false; // Can't remove built-in filters
        }

        this.filters.delete(id);
        
        // If this was the active filter, switch to 'all'
        if (this.activeFilter === id) {
            this.setActiveFilter('all');
        }

        this.notifyObservers('filterRemoved', filter);
        return true;
    }

    /**
     * Get all available filters
     * @returns {Array} Array of filter objects
     */
    getAllFilters() {
        return Array.from(this.filters.values());
    }

    /**
     * Get filter by ID
     * @param {string} id - Filter ID
     * @returns {Object|null} Filter object or null
     */
    getFilter(id) {
        return this.filters.get(id) || null;
    }

    /**
     * Set active filter
     * @param {string} filterId - Filter ID
     * @returns {boolean} Success status
     */
    setActiveFilter(filterId) {
        const filter = this.filters.get(filterId);
        if (!filter) {
            console.warn(`Filter '${filterId}' not found`);
            return false;
        }

        this.activeFilter = filterId;
        this.notifyObservers('activeFilterChanged', filter);
        return true;
    }

    /**
     * Get current active filter
     * @returns {Object} Active filter object
     */
    getActiveFilter() {
        return this.filters.get(this.activeFilter);
    }

    /**
     * Apply filters to tasks array
     * @param {Array} tasks - Array of tasks
     * @returns {Array} Filtered and sorted tasks
     */
    applyFilters(tasks) {
        let filteredTasks = [...tasks];

        // Apply active filter
        const activeFilter = this.getActiveFilter();
        if (activeFilter && activeFilter.predicate) {
            filteredTasks = filteredTasks.filter(activeFilter.predicate);
        }

        // Apply search query
        if (this.searchQuery.trim()) {
            filteredTasks = this.applySearch(filteredTasks, this.searchQuery);
        }

        // Apply sorting
        filteredTasks = this.applySorting(filteredTasks);

        return filteredTasks;
    }

    /**
     * Apply search to tasks
     * @param {Array} tasks - Tasks to search
     * @param {string} query - Search query
     * @returns {Array} Filtered tasks
     */
    applySearch(tasks, query) {
        const searchTerms = query.toLowerCase().trim().split(/\s+/);
        
        return tasks.filter(task => {
            const searchableText = [
                task.text,
                task.priority,
                task.completed ? 'completed' : 'active',
                new Date(task.createdAt).toLocaleDateString()
            ].join(' ').toLowerCase();

            // All search terms must be found
            return searchTerms.every(term => 
                searchableText.includes(term) ||
                this.fuzzyMatch(searchableText, term)
            );
        });
    }

    /**
     * Simple fuzzy matching for better search experience
     * @param {string} text - Text to search in
     * @param {string} term - Search term
     * @returns {boolean} Match found
     */
    fuzzyMatch(text, term) {
        if (term.length < 3) return false;
        
        // Allow for one character difference
        const regex = new RegExp(term.split('').join('.*'), 'i');
        return regex.test(text);
    }

    /**
     * Apply sorting to tasks
     * @param {Array} tasks - Tasks to sort
     * @returns {Array} Sorted tasks
     */
    applySorting(tasks) {
        const sortedTasks = [...tasks];
        
        sortedTasks.sort((a, b) => {
            let result = 0;
            
            switch (this.sortBy) {
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    result = priorityOrder[b.priority] - priorityOrder[a.priority];
                    break;
                    
                case 'created':
                    result = new Date(b.createdAt) - new Date(a.createdAt);
                    break;
                    
                case 'updated':
                    result = new Date(b.updatedAt) - new Date(a.updatedAt);
                    break;
                    
                case 'alphabetical':
                    result = a.text.localeCompare(b.text);
                    break;
                    
                case 'completed':
                    result = new Date(b.completedAt || 0) - new Date(a.completedAt || 0);
                    break;
                    
                default:
                    // Default: completed tasks last, then by priority, then by creation date
                    if (a.completed !== b.completed) {
                        result = a.completed ? 1 : -1;
                    } else {
                        const priorityOrder = { high: 3, medium: 2, low: 1 };
                        result = priorityOrder[b.priority] - priorityOrder[a.priority];
                        if (result === 0) {
                            result = new Date(b.createdAt) - new Date(a.createdAt);
                        }
                    }
                    break;
            }
            
            // Apply sort order
            return this.sortOrder === 'desc' ? result : -result;
        });
        
        return sortedTasks;
    }

    /**
     * Set search query
     * @param {string} query - Search query
     */
    setSearchQuery(query) {
        this.searchQuery = query || '';
        this.notifyObservers('searchQueryChanged', this.searchQuery);
    }

    /**
     * Get current search query
     * @returns {string} Current search query
     */
    getSearchQuery() {
        return this.searchQuery;
    }

    /**
     * Set sorting configuration
     * @param {string} sortBy - Sort field
     * @param {string} sortOrder - Sort order (asc/desc)
     */
    setSorting(sortBy, sortOrder = 'desc') {
        const validSortFields = ['priority', 'created', 'updated', 'alphabetical', 'completed', 'default'];
        const validSortOrders = ['asc', 'desc'];
        
        this.sortBy = validSortFields.includes(sortBy) ? sortBy : 'default';
        this.sortOrder = validSortOrders.includes(sortOrder) ? sortOrder : 'desc';
        
        this.notifyObservers('sortingChanged', { 
            sortBy: this.sortBy, 
            sortOrder: this.sortOrder 
        });
    }

    /**
     * Get current sorting configuration
     * @returns {Object} Sorting configuration
     */
    getSorting() {
        return {
            sortBy: this.sortBy,
            sortOrder: this.sortOrder
        };
    }

    /**
     * Clear all filters and search
     */
    clearAll() {
        this.setActiveFilter('all');
        this.setSearchQuery('');
        this.setSorting('default', 'desc');
        this.notifyObservers('filtersCleared');
    }

    /**
     * Get filter statistics for given tasks
     * @param {Array} tasks - All tasks
     * @returns {Object} Filter statistics
     */
    getFilterStats(tasks) {
        const stats = {};
        
        this.filters.forEach((filter, id) => {
            if (filter.predicate) {
                const filteredTasks = tasks.filter(filter.predicate);
                stats[id] = {
                    count: filteredTasks.length,
                    name: filter.name,
                    icon: filter.icon
                };
            }
        });
        
        return stats;
    }

    /**
     * Create a smart filter based on task patterns
     * @param {Array} tasks - All tasks
     * @returns {Array} Suggested smart filters
     */
    generateSmartFilters(tasks) {
        const smartFilters = [];
        
        // Find most common priority among incomplete tasks
        const activeTasks = tasks.filter(task => !task.completed);
        const priorityCount = activeTasks.reduce((acc, task) => {
            acc[task.priority] = (acc[task.priority] || 0) + 1;
            return acc;
        }, {});
        
        const mostCommonPriority = Object.entries(priorityCount)
            .sort(([,a], [,b]) => b - a)[0];
        
        if (mostCommonPriority && mostCommonPriority[1] > 1) {
            smartFilters.push({
                id: `smart_${mostCommonPriority[0]}`,
                name: `Focus on ${mostCommonPriority[0]} priority`,
                predicate: task => task.priority === mostCommonPriority[0] && !task.completed,
                icon: mostCommonPriority[0] === 'high' ? '🔴' : 
                      mostCommonPriority[0] === 'medium' ? '🟡' : '🟢'
            });
        }
        
        // Find overdue or old tasks (older than 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const oldTasks = activeTasks.filter(task => new Date(task.createdAt) < weekAgo);
        
        if (oldTasks.length > 0) {
            smartFilters.push({
                id: 'smart_old',
                name: `Review old tasks (${oldTasks.length})`,
                predicate: task => !task.completed && new Date(task.createdAt) < weekAgo,
                icon: '⏰'
            });
        }
        
        return smartFilters;
    }

    /**
     * Export filter configuration
     * @returns {Object} Filter configuration
     */
    exportConfig() {
        return {
            activeFilter: this.activeFilter,
            searchQuery: this.searchQuery,
            sortBy: this.sortBy,
            sortOrder: this.sortOrder,
            customFilters: Array.from(this.filters.values()).filter(f => f.custom)
        };
    }

    /**
     * Import filter configuration
     * @param {Object} config - Filter configuration
     */
    importConfig(config) {
        if (config.activeFilter) {
            this.setActiveFilter(config.activeFilter);
        }
        
        if (config.searchQuery !== undefined) {
            this.setSearchQuery(config.searchQuery);
        }
        
        if (config.sortBy && config.sortOrder) {
            this.setSorting(config.sortBy, config.sortOrder);
        }
        
        if (config.customFilters && Array.isArray(config.customFilters)) {
            config.customFilters.forEach(filter => {
                this.addFilter(filter.id, { ...filter, custom: true });
            });
        }
    }

    /**
     * Add observer for filter events
     * @param {Function} observer - Observer function
     */
    addObserver(observer) {
        if (typeof observer === 'function') {
            this.observers.push(observer);
        }
    }

    /**
     * Remove observer
     * @param {Function} observer - Observer function
     */
    removeObserver(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    /**
     * Notify observers of filter events
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    notifyObservers(event, data) {
        this.observers.forEach(observer => {
            try {
                observer(event, data);
            } catch (error) {
                console.error('Filter observer error:', error);
            }
        });
    }

    /**
     * Reset to default state
     */
    reset() {
        this.activeFilter = 'all';
        this.searchQuery = '';
        this.sortBy = 'default';
        this.sortOrder = 'desc';
        
        // Remove custom filters
        const customFilters = Array.from(this.filters.entries())
            .filter(([, filter]) => filter.custom)
            .map(([id]) => id);
            
        customFilters.forEach(id => this.removeFilter(id));
        
        this.notifyObservers('filterReset');
    }
}

// Create global instance
const zenFilterManager = new ZenFilterManager();

// Make it globally available
window.zenFilterManager = zenFilterManager;