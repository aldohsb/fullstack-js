/**
 * Zen Animations - Beautiful animations for the zen garden interface
 * Modern CSS animations with JavaScript orchestration
 */

class ZenAnimations {
    constructor() {
        this.animationEnabled = true;
        this.animationQueue = [];
        this.isProcessing = false;
        this.defaultDuration = 300;
        this.easings = {
            easeOutQuart: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
            easeOutBack: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
            bouncy: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        };
        
        this.init();
    }

    /**
     * Initialize animations
     */
    init() {
        this.createAnimationStyles();
        this.setupIntersectionObserver();
        this.bindEvents();
    }

    /**
     * Create dynamic animation styles
     */
    createAnimationStyles() {
        if (document.getElementById('zen-animations-style')) return;
        
        const style = document.createElement('style');
        style.id = 'zen-animations-style';
        style.textContent = `
            /* Zen Animation Classes */
            .zen-fade-in {
                animation: zenFadeIn 0.4s ease-out forwards;
            }
            
            .zen-slide-up {
                animation: zenSlideUp 0.4s ease-out forwards;
            }
            
            .zen-slide-down {
                animation: zenSlideDown 0.4s ease-out forwards;
            }
            
            .zen-slide-left {
                animation: zenSlideLeft 0.3s ease-out forwards;
            }
            
            .zen-slide-right {
                animation: zenSlideRight 0.3s ease-out forwards;
            }
            
            .zen-scale-in {
                animation: zenScaleIn 0.3s ${this.easings.easeOutBack} forwards;
            }
            
            .zen-bounce {
                animation: zenBounce 0.6s ${this.easings.bouncy} forwards;
            }
            
            .zen-ripple {
                animation: zenRipple 0.6s ease-out forwards;
            }
            
            .zen-float {
                animation: zenFloat 3s ease-in-out infinite;
            }
            
            .zen-pulse {
                animation: zenPulse 2s ease-in-out infinite;
            }
            
            .zen-shake {
                animation: zenShake 0.5s ease-in-out;
            }
            
            /* Keyframes */
            @keyframes zenFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes zenSlideUp {
                from { 
                    opacity: 0; 
                    transform: translateY(20px); 
                }
                to { 
                    opacity: 1; 
                    transform: translateY(0); 
                }
            }
            
            @keyframes zenSlideDown {
                from { 
                    opacity: 0; 
                    transform: translateY(-20px); 
                }
                to { 
                    opacity: 1; 
                    transform: translateY(0); 
                }
            }
            
            @keyframes zenSlideLeft {
                from { 
                    opacity: 0; 
                    transform: translateX(30px); 
                }
                to { 
                    opacity: 1; 
                    transform: translateX(0); 
                }
            }
            
            @keyframes zenSlideRight {
                from { 
                    opacity: 0; 
                    transform: translateX(-30px); 
                }
                to { 
                    opacity: 1; 
                    transform: translateX(0); 
                }
            }
            
            @keyframes zenScaleIn {
                from { 
                    opacity: 0; 
                    transform: scale(0.8); 
                }
                to { 
                    opacity: 1; 
                    transform: scale(1); 
                }
            }
            
            @keyframes zenBounce {
                0% { 
                    opacity: 0; 
                    transform: scale(0.3) translateY(50px); 
                }
                50% { 
                    opacity: 1; 
                    transform: scale(1.05); 
                }
                70% { transform: scale(0.9); }
                100% { 
                    opacity: 1; 
                    transform: scale(1) translateY(0); 
                }
            }
            
            @keyframes zenRipple {
                0% {
                    transform: scale(0);
                    opacity: 0.8;
                }
                100% {
                    transform: scale(2);
                    opacity: 0;
                }
            }
            
            @keyframes zenFloat {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }
            
            @keyframes zenPulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            
            @keyframes zenShake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
                20%, 40%, 60%, 80% { transform: translateX(3px); }
            }
            
            /* Task specific animations */
            .task-add-animation {
                animation: taskAdd 0.5s ${this.easings.easeOutBack} forwards;
            }
            
            .task-complete-animation {
                animation: taskComplete 0.4s ease-out forwards;
            }
            
            .task-delete-animation {
                animation: taskDelete 0.3s ease-in forwards;
            }
            
            @keyframes taskAdd {
                0% {
                    opacity: 0;
                    transform: translateY(-20px) scale(0.9);
                    filter: blur(2px);
                }
                100% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                    filter: blur(0);
                }
            }
            
            @keyframes taskComplete {
                0% { transform: scale(1); }
                25% { transform: scale(1.02); }
                50% { 
                    transform: scale(0.98); 
                    filter: brightness(1.1);
                }
                100% { 
                    transform: scale(1); 
                    filter: brightness(1);
                }
            }
            
            @keyframes taskDelete {
                0% {
                    opacity: 1;
                    transform: translateX(0) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translateX(-30px) scale(0.9);
                }
            }
            
            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                .zen-fade-in,
                .zen-slide-up,
                .zen-slide-down,
                .zen-slide-left,
                .zen-slide-right,
                .zen-scale-in,
                .zen-bounce,
                .task-add-animation,
                .task-complete-animation,
                .task-delete-animation {
                    animation: zenFadeIn 0.2s ease-out forwards !important;
                }
                
                .zen-float,
                .zen-pulse {
                    animation: none !important;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * Setup intersection observer for scroll animations
     */
    setupIntersectionObserver() {
        if (!window.IntersectionObserver) return;
        
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateOnScroll(entry.target);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '20px'
            }
        );
    }

    /**
     * Bind animation events
     */
    bindEvents() {
        // Listen for task manager events
        if (window.zenTaskManager) {
            zenTaskManager.addObserver((event, data) => {
                this.handleTaskEvent(event, data);
            });
        }
        
        // Listen for filter events
        if (window.zenFilterManager) {
            zenFilterManager.addObserver((event, data) => {
                this.handleFilterEvent(event, data);
            });
        }
    }

    /**
     * Handle task manager events with animations
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    handleTaskEvent(event, data) {
        if (!this.animationEnabled) return;
        
        switch (event) {
            case 'taskCreated':
                this.animateTaskAdd(data);
                break;
            case 'taskUpdated':
                if (data.completed !== undefined) {
                    this.animateTaskComplete(data);
                }
                break;
            case 'taskDeleted':
                this.animateTaskDelete(data);
                break;
        }
    }

    /**
     * Handle filter events with animations
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    handleFilterEvent(event, data) {
        if (!this.animationEnabled) return;
        
        switch (event) {
            case 'activeFilterChanged':
                this.animateFilterChange();
                break;
            case 'tasksUpdated':
                this.animateTaskList();
                break;
        }
    }

    /**
     * Animate task addition
     * @param {Object} task - Added task
     */
    animateTaskAdd(task) {
        // Wait for DOM update
        requestAnimationFrame(() => {
            const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
            if (taskElement) {
                taskElement.classList.add('task-add-animation');
                this.createRippleEffect(taskElement);
            }
        });
    }

    /**
     * Animate task completion
     * @param {Object} task - Completed task
     */
    animateTaskComplete(task) {
        const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
        if (taskElement) {
            taskElement.classList.add('task-complete-animation');
            
            if (task.completed) {
                // Add celebration particles
                this.createCelebrationParticles(taskElement);
            }
        }
    }

    /**
     * Animate task deletion
     * @param {Object} task - Deleted task
     */
    animateTaskDelete(task) {
        const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
        if (taskElement) {
            taskElement.classList.add('task-delete-animation');
            
            // Remove element after animation
            setTimeout(() => {
                if (taskElement.parentNode) {
                    taskElement.parentNode.removeChild(taskElement);
                }
            }, 300);
        }
    }

    /**
     * Animate filter change
     */
    animateFilterChange() {
        const tasksList = document.getElementById('tasksList');
        if (tasksList) {
            tasksList.style.opacity = '0.7';
            tasksList.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                tasksList.style.opacity = '1';
                tasksList.style.transform = 'translateY(0)';
                tasksList.style.transition = 'all 0.3s ease-out';
            }, 100);
            
            setTimeout(() => {
                tasksList.style.transition = '';
            }, 400);
        }
    }

    /**
     * Animate task list updates
     */
    animateTaskList() {
        const tasks = document.querySelectorAll('.task-item');
        tasks.forEach((task, index) => {
            task.style.animationDelay = `${index * 50}ms`;
            task.classList.add('zen-slide-up');
        });
    }

    /**
     * Create ripple effect
     * @param {HTMLElement} element - Target element
     */
    createRippleEffect(element) {
        const rect = element.getBoundingClientRect();
        const ripple = document.createElement('div');
        
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(127, 176, 105, 0.3)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'zenRipple 0.6s linear';
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.marginLeft = '-10px';
        ripple.style.marginTop = '-10px';
        ripple.style.pointerEvents = 'none';
        ripple.style.zIndex = '1000';
        
        element.style.position = 'relative';
        element.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    /**
     * Create celebration particles for completed tasks
     * @param {HTMLElement} element - Target element
     */
    createCelebrationParticles(element) {
        const colors = ['#7fb069', '#9bc85a', '#a7c957', '#dde5b6'];
        const particleCount = 8;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '1000';
            
            const angle = (i * 360) / particleCount;
            const distance = 30 + Math.random() * 20;
            const x = Math.cos(angle * Math.PI / 180) * distance;
            const y = Math.sin(angle * Math.PI / 180) * distance;
            
            particle.style.left = '50%';
            particle.style.top = '50%';
            particle.style.transform = `translate(-50%, -50%)`;
            
            element.style.position = 'relative';
            element.appendChild(particle);
            
            // Animate particle
            particle.animate([
                { 
                    transform: 'translate(-50%, -50%) scale(0)',
                    opacity: 1
                },
                { 
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1)`,
                    opacity: 1
                },
                { 
                    transform: `translate(calc(-50% + ${x * 1.5}px), calc(-50% + ${y * 1.5}px)) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: 800,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }).onfinish = () => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            };
        }
    }

    /**
     * Animate element on scroll
     * @param {HTMLElement} element - Element to animate
     */
    animateOnScroll(element) {
        if (element.classList.contains('animated')) return;
        
        element.classList.add('animated', 'zen-slide-up');
        this.observer.unobserve(element);
    }

    /**
     * Add element to scroll animation observer
     * @param {HTMLElement} element - Element to observe
     */
    observeElement(element) {
        if (this.observer && element) {
            this.observer.observe(element);
        }
    }

    /**
     * Animate toast notification
     * @param {HTMLElement} toast - Toast element
     * @param {string} message - Message text
     */
    showToast(toast, message) {
        if (!toast) return;
        
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    /**
     * Create zen loading animation
     * @param {HTMLElement} container - Container element
     */
    createLoadingAnimation(container) {
        const loader = document.createElement('div');
        loader.className = 'zen-loader';
        loader.innerHTML = `
            <div class="zen-circle-loader">
                <div class="zen-circle zen-float"></div>
                <div class="zen-stones">
                    <div class="stone stone-1"></div>
                    <div class="stone stone-2"></div>
                    <div class="stone stone-3"></div>
                </div>
            </div>
        `;
        
        container.appendChild(loader);
        return loader;
    }

    /**
     * Enable/disable animations
     * @param {boolean} enabled - Animation enabled state
     */
    setAnimationEnabled(enabled) {
        this.animationEnabled = enabled;
        
        // Add/remove animation class to body
        if (enabled) {
            document.body.classList.remove('no-animations');
        } else {
            document.body.classList.add('no-animations');
        }
    }

    /**
     * Get animation enabled state
     * @returns {boolean} Animation enabled state
     */
    isAnimationEnabled() {
        return this.animationEnabled;
    }

    /**
     * Cleanup animations and observers
     */
    cleanup() {
        if (this.observer) {
            this.observer.disconnect();
        }
        
        // Remove animation style
        const style = document.getElementById('zen-animations-style');
        if (style) {
            style.remove();
        }
    }
}

// Create global instance
const zenAnimations = new ZenAnimations();

// Make it globally available
window.zenAnimations = zenAnimations;