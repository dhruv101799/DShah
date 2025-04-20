// Timeline functionality
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if work experience tab exists
    const workTab = document.getElementById('work-experience');
    if (!workTab) return;
    
    // Check if we've already initialized the timeline
    if (workTab.querySelector('.timeline-container')) return;
    
    // Variables to track timeline state
    let timelineInitialized = false;
    let timelineExpanded = false;
    let lastScrollPosition = 0;
    let currentNodeIndex = 0;
    let visitedNodes = []; // Track which nodes have been visited
    
    // Store original content to restore on page refresh
    const originalContent = workTab.innerHTML;
    
    // Initialize timeline when work tab is clicked
    document.querySelector('[data-target="work-experience"]').addEventListener('click', function() {
        // Wait for tab content to be visible
        setTimeout(() => {
            if (!timelineInitialized) {
                initializeTimeline();
                timelineInitialized = true;
            }
            
            // Check if we should restore expanded state
            if (sessionStorage.getItem('timelineExpanded') === 'true' && !timelineExpanded) {
                expandTimeline();
            }
            
            // Check if we should restore visited nodes
            const savedVisitedNodes = sessionStorage.getItem('visitedNodes');
            if (savedVisitedNodes) {
                visitedNodes = JSON.parse(savedVisitedNodes);
                updateVisitedNodes();
            }
        }, 300);
    });
    
    // Initialize timeline
    function initializeTimeline() {
        const workContent = workTab.querySelector('.space-y-6');
        if (!workContent) return;
        
        // Get all work experience items
        const workItems = Array.from(workContent.querySelectorAll('.bg-white'));
        if (workItems.length === 0) return;
        
        // Create timeline container
        const timelineContainer = document.createElement('div');
        timelineContainer.className = 'timeline-container';
        
        // Create timeline track
        const timelineTrack = document.createElement('div');
        timelineTrack.className = 'timeline-track';
        
        // Create timeline progress indicator
        const timelineProgress = document.createElement('div');
        timelineProgress.className = 'timeline-progress';
        timelineTrack.appendChild(timelineProgress);
        
        // Create timeline items container
        const timelineItems = document.createElement('div');
        timelineItems.className = 'timeline-items';
        
        // Create timeline labels container
        const timelineLabels = document.createElement('div');
        timelineLabels.className = 'timeline-labels';
        timelineTrack.appendChild(timelineLabels);
        
        // Create scroll indicator
        const scrollIndicator = document.createElement('div');
        scrollIndicator.className = 'scroll-indicator';
        scrollIndicator.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="url(#blue-gradient)">
                <defs>
                    <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#3b82f6" />
                        <stop offset="50%" stop-color="#60a5fa" />
                        <stop offset="100%" stop-color="#93c5fd" />
                    </linearGradient>
                </defs>
                <path d="M12 15.713L18.01 9.70299L16.597 8.28799L12 12.888L7.40399 8.28799L5.98999 9.70199L12 15.713Z" />
            </svg>
        `;
        
        // Calculate total height needed for timeline
        const totalItems = workItems.length;
        const itemSpacing = 250; // pixels between items
        const totalHeight = (totalItems - 1) * itemSpacing;
        
        // Process each work item
        workItems.forEach((item, index) => {
            // Extract data
            const title = item.querySelector('h3').textContent;
            const company = item.querySelector('h2').textContent.split(',')[0];
            const period = item.querySelector('p').textContent.split('|')[1]?.trim() || '';
            const details = Array.from(item.querySelectorAll('li')).map(li => li.textContent);
            
            // Calculate position - space items evenly
            const position = index * itemSpacing; // pixels
            
            // Create timeline node
            const node = document.createElement('div');
            node.className = 'timeline-node';
            node.style.top = `${position}px`;
            timelineTrack.appendChild(node);
            
            // Create timeline label
            const label = document.createElement('div');
            label.className = 'timeline-label';
            label.style.top = `${position}px`;
            label.innerHTML = `
                <h4 class="font-semibold text-gray-800">${title}</h4>
                <p class="text-sm text-gray-600">${company}</p>
                <p class="text-xs text-gray-500">${period}</p>
            `;
            timelineLabels.appendChild(label);
            
            // Create timeline item
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            timelineItem.dataset.index = index;
            timelineItem.style.position = 'absolute';
            timelineItem.style.top = `${position - 8}px`; // Align with node (-8px to center with node)
            timelineItem.style.width = '100%';
            
            // Create timeline content
            const content = document.createElement('div');
            content.className = 'timeline-content';
            content.innerHTML = `
                <h3 class="text-lg font-semibold text-gray-800">${title}</h3>
                <h2 class="text-gray-600">${company}</h2>
                <p class="text-sm text-gray-500">${period}</p>
                <div class="timeline-details">
                    <ul class="mt-2 detail-list">
                        ${details.map(detail => `<li>${detail}</li>`).join('')}
                    </ul>
                </div>
            `;
            
            timelineItem.appendChild(content);
            timelineItems.appendChild(timelineItem);
        });
        
        // Set height of timeline track to match the last node position
        timelineTrack.style.height = `${totalHeight}px`;
        
        // Add scroll indicator after the first item
        timelineItems.appendChild(scrollIndicator);
        scrollIndicator.style.top = `${itemSpacing - 30}px`;
        
        // Add components to timeline container
        timelineContainer.appendChild(timelineTrack);
        timelineContainer.appendChild(timelineItems);
        
        // Replace original content with timeline
        workContent.innerHTML = '';
        workContent.appendChild(timelineContainer);
        
        // Remove any inline styles that might conflict with CSS
        workTab.style.overflowY = '';
        workTab.style.height = '';
        workTab.style.maxHeight = '';
        
        // Initialize visited nodes array
        visitedNodes = new Array(workItems.length).fill(false);
        visitedNodes[0] = true; // First node is always visited
        
        // Initialize scroll handler
        initializeScrollHandler();
        
        // Force a small scroll to trigger the scroll handler
        setTimeout(() => {
            workTab.scrollTop = 1;
            setTimeout(() => {
                updateProgressBar();
                updateVisitedNodes(); // Apply visited nodes state
            }, 100);
        }, 500);
    }
    
    // Handle scrolling to reveal timeline items
    function initializeScrollHandler() {
        const timelineContainer = workTab.querySelector('.timeline-container');
        const timelineItems = Array.from(workTab.querySelectorAll('.timeline-item'));
        const timelineNodes = Array.from(workTab.querySelectorAll('.timeline-node'));
        const timelineLabels = Array.from(workTab.querySelectorAll('.timeline-label'));
        const timelineProgress = workTab.querySelector('.timeline-progress');
        const scrollIndicator = workTab.querySelector('.scroll-indicator');
        
        if (!timelineContainer || timelineItems.length === 0) return;
        
        // Set initial state - only first item is visible
        timelineItems[0].classList.add('visited', 'current');
        timelineNodes[0].classList.add('visited', 'current');
        timelineLabels[0].classList.add('visited', 'current');
        currentNodeIndex = 0;
        
        // Position scroll indicator below the first active item
        updateScrollIndicatorPosition();
        
        // Scroll handler - only attach to the work tab
        workTab.addEventListener('scroll', handleScroll);
        
        function handleScroll() {
            // Skip if timeline is already expanded
            if (timelineExpanded) {
                updateProgressBar();
                scrollIndicator.classList.add('hidden');
                return;
            }
            
            const scrollPosition = workTab.scrollTop;
            const containerHeight = timelineContainer.offsetHeight;
            const viewportHeight = workTab.offsetHeight;
            
            // Update progress bar
            updateProgressBar();
            
            // Determine which item should be current based on scroll position
            let newCurrentIndex = -1;
            
            // Calculate which node should be active based on scroll position
            // This maps the scroll position to node indices more precisely
            const scrollRatio = scrollPosition / (workTab.scrollHeight - viewportHeight);
            const nodeCount = timelineItems.length;
            newCurrentIndex = Math.min(Math.floor(scrollRatio * nodeCount), nodeCount - 1);
            
            // Mark nodes as visited when progress bar reaches them
            for (let i = 0; i <= newCurrentIndex; i++) {
                if (!visitedNodes[i]) {
                    visitedNodes[i] = true;
                    // Save visited nodes state to session storage
                    sessionStorage.setItem('visitedNodes', JSON.stringify(visitedNodes));
                }
            }
            
            // Update visited nodes display
            updateVisitedNodes();
            
            // Only update current node if the index has changed
            if (newCurrentIndex !== currentNodeIndex && newCurrentIndex >= 0) {
                console.log('Changing current node to:', newCurrentIndex);
                
                // Remove current class from all items
                timelineItems.forEach(item => item.classList.remove('current'));
                timelineNodes.forEach(node => node.classList.remove('current'));
                timelineLabels.forEach(label => label.classList.remove('current'));
                
                // Add current class only to the current item
                timelineItems[newCurrentIndex].classList.add('current');
                timelineNodes[newCurrentIndex].classList.add('current');
                timelineLabels[newCurrentIndex].classList.add('current');
                
                // Update current index
                currentNodeIndex = newCurrentIndex;
                
                // Update scroll indicator position
                updateScrollIndicatorPosition();
            }
            
            // Check if we've scrolled to the bottom
            const isAtBottom = scrollPosition + viewportHeight >= containerHeight - 50;
            if (isAtBottom && !timelineExpanded) {
                expandTimeline();
                scrollIndicator.classList.add('hidden');
            }
            
            lastScrollPosition = scrollPosition;
        }
        
        // Function to update scroll indicator position
        function updateScrollIndicatorPosition() {
            if (!scrollIndicator) return;
            
            // Hide indicator if all items are active
            if (currentNodeIndex >= timelineItems.length - 1) {
                scrollIndicator.classList.add('hidden');
                return;
            }
            
            // Show indicator and position it below the current item
            scrollIndicator.classList.remove('hidden');
            const nextItemIndex = currentNodeIndex + 1;
            if (nextItemIndex < timelineItems.length) {
                const nextItem = timelineItems[nextItemIndex];
                if (nextItem) {
                    const nextItemTop = parseInt(nextItem.style.top, 10);
                    scrollIndicator.style.top = `${nextItemTop - 40}px`;
                }
            }
        }
    }
    
    // Update visited nodes display
    function updateVisitedNodes() {
        const timelineItems = Array.from(workTab.querySelectorAll('.timeline-item'));
        const timelineNodes = Array.from(workTab.querySelectorAll('.timeline-node'));
        const timelineLabels = Array.from(workTab.querySelectorAll('.timeline-label'));
        
        // Apply visited class to all visited nodes
        for (let i = 0; i < visitedNodes.length; i++) {
            if (visitedNodes[i]) {
                timelineItems[i].classList.add('visited');
                timelineNodes[i].classList.add('visited');
                timelineLabels[i].classList.add('visited');
            }
        }
    }
    
    // Update progress bar based on scroll position
    function updateProgressBar() {
        const timelineProgress = workTab.querySelector('.timeline-progress');
        const timelineTrack = workTab.querySelector('.timeline-track');
        
        if (!timelineProgress || !timelineTrack) return;
        
        const scrollPosition = workTab.scrollTop;
        const maxScroll = workTab.scrollHeight - workTab.offsetHeight;
        const scrollPercentage = Math.min((scrollPosition / maxScroll) * 100, 100);
        
        timelineProgress.style.height = `${scrollPercentage}%`;
        
        // Log for debugging
        console.log('Scroll position:', scrollPosition, 'Scroll percentage:', scrollPercentage);
    }
    
    // Expand timeline to show all items
    function expandTimeline() {
        const timelineContainer = workTab.querySelector('.timeline-container');
        const scrollIndicator = workTab.querySelector('.scroll-indicator');
        
        if (!timelineContainer) return;
        
        timelineContainer.classList.add('timeline-expanded');
        
        // Mark all nodes as visited
        visitedNodes.fill(true);
        sessionStorage.setItem('visitedNodes', JSON.stringify(visitedNodes));
        
        // Update visited nodes display
        updateVisitedNodes();
        
        // Hide scroll indicator when fully expanded
        if (scrollIndicator) {
            scrollIndicator.classList.add('hidden');
        }
        
        // Store expanded state in session storage
        sessionStorage.setItem('timelineExpanded', 'true');
        timelineExpanded = true;
    }
    
    // Reset timeline on page refresh
    window.addEventListener('beforeunload', function() {
        // Clear session storage to reset timeline state
        sessionStorage.removeItem('timelineExpanded');
        sessionStorage.removeItem('visitedNodes');
    });
});
