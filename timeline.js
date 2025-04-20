// Updated timeline.js: arrow now appears above second card

// NOTE: Additional spacing fix for navigation tabs
const tabContainer = document.getElementById('tab-container');
if (tabContainer) {
    tabContainer.classList.add('gap-3', 'px-4'); // Increase spacing between tabs
}

document.addEventListener('DOMContentLoaded', function () {
    const workTab = document.getElementById('work-experience');
    if (!workTab) return;

    let timelineInitialized = false;
    let currentNodeIndex = 0;

    document.querySelector('[data-target="work-experience"]').addEventListener('click', function () {
        setTimeout(() => {
            if (!timelineInitialized) {
                initializeTimeline();
                timelineInitialized = true;
            }
        }, 300);
    });

    function initializeTimeline() {
        const workContent = workTab.querySelector('.space-y-6');
        if (!workContent) return;

        const workItems = Array.from(workContent.querySelectorAll('.bg-white'));
        if (workItems.length === 0) return;

        const timelineContainer = document.createElement('div');
        timelineContainer.className = 'timeline-container';

        const timelineTrack = document.createElement('div');
        timelineTrack.className = 'timeline-track';

        const timelineProgress = document.createElement('div');
        timelineProgress.className = 'timeline-progress';
        timelineTrack.appendChild(timelineProgress);

        const timelineLabels = document.createElement('div');
        timelineLabels.className = 'timeline-labels';
        timelineTrack.appendChild(timelineLabels);

        const timelineItems = document.createElement('div');
        timelineItems.className = 'timeline-items';
        timelineItems.style.display = 'flex';
        timelineItems.style.flexDirection = 'column';
        timelineItems.style.gap = '2rem';

        const itemSpacing = 200;
        const totalHeight = (workItems.length - 1) * itemSpacing;

        workItems.forEach((item, index) => {
            const title = item.querySelector('h3').textContent;
            const company = item.querySelector('h2').textContent.split(',')[0];
            const period = item.querySelector('p').textContent.split('|')[1]?.trim() || '';
            const details = Array.from(item.querySelectorAll('li')).map(li => li.textContent);

            const position = index * itemSpacing;

            const node = document.createElement('div');
            node.className = 'timeline-node';
            node.style.top = `${position}px`;
            node.dataset.index = index;
            timelineTrack.appendChild(node);

            const label = document.createElement('div');
            label.className = 'timeline-label visited';
            label.style.top = `${position}px`;
            label.innerHTML = `
                <h4 class="font-semibold text-gray-800 clickable-label" data-index="${index}">${title}</h4>
                <p class="text-sm text-gray-600">${company}</p>
                <p class="text-xs text-gray-500">${period}</p>
            `;
            timelineLabels.appendChild(label);

            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item visited clickable-card';
            timelineItem.dataset.index = index;
            timelineItem.style.position = 'relative';
            timelineItem.style.width = '100%';

            const content = document.createElement('div');
            content.className = 'timeline-content';
            content.innerHTML = `
                <h3 class="text-lg font-semibold text-gray-800 clickable-card-title" data-index="${index}">${title}</h3>
                <h2 class="text-gray-600">${company}</h2>
                <p class="text-sm text-gray-500">${period}</p>
                <div class="timeline-details">
                    <ul class="mt-2 detail-list">
                        ${details.map(detail => `<li>${detail}</li>`).join('')}
                    </ul>
                </div>
            `;

            timelineItem.appendChild(content);

            // Add prompt effects to second card only (index 1)
            if (index === 1) {
                timelineItem.classList.add('first-interaction-prompt');

                const wrapper = document.createElement('div');
                wrapper.style.display = 'flex';
                wrapper.style.flexDirection = 'column';
                wrapper.style.alignItems = 'center';
                wrapper.appendChild(createPromptArrow());
                wrapper.appendChild(timelineItem);

                timelineItems.appendChild(wrapper);
            } else {
                timelineItems.appendChild(timelineItem);
            }
        });

        timelineTrack.style.height = `${totalHeight}px`;
        timelineContainer.style.height = 'auto';

        timelineContainer.appendChild(timelineTrack);
        timelineContainer.appendChild(timelineItems);
        workContent.innerHTML = '';
        workContent.appendChild(timelineContainer);

        // Add event listeners
        workTab.addEventListener('click', (e) => {
            const node = e.target.closest('.timeline-node');
            const label = e.target.closest('.clickable-label');
            const card = e.target.closest('.clickable-card');
            const cardTitle = e.target.closest('.clickable-card-title');

            const clickedIndex = node?.dataset.index || label?.dataset.index || card?.dataset.index || cardTitle?.dataset.index;
            if (clickedIndex !== undefined) {
                removePrompt();
                setActiveNode(Number(clickedIndex));
            }
        });

        setActiveNode(0);
    }

    function createPromptArrow() {
        const arrow = document.createElement('div');
        arrow.className = 'timeline-arrow-prompt';
        arrow.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
            </svg>`;
        return arrow;
    }

    function setActiveNode(index) {
        const nodes = Array.from(workTab.querySelectorAll('.timeline-node'));
        const items = Array.from(workTab.querySelectorAll('.timeline-item'));
        const labels = Array.from(workTab.querySelectorAll('.timeline-label'));
        const progress = workTab.querySelector('.timeline-progress');

        nodes.forEach((node, i) => {
            node.classList.toggle('current', i === index);
        });
        items.forEach((item, i) => {
            item.classList.toggle('current', i === index);
            item.style.transform = i === index ? 'scale(1)' : 'scale(0.96)';
            item.style.opacity = i === index ? '1' : '0.6';
            item.style.zIndex = i === index ? '5' : '1';
        });
        labels.forEach((label, i) => {
            label.classList.toggle('current', i === index);
        });

        const topOffset = index * 200;
        progress.style.height = `${topOffset}px`;
        currentNodeIndex = index;
    }

    function removePrompt() {
        const prompt = workTab.querySelector('.first-interaction-prompt');
        if (prompt) prompt.classList.remove('first-interaction-prompt');
        const arrow = workTab.querySelector('.timeline-arrow-prompt');
        if (arrow) arrow.remove();
    }

    
    
    
    
    
    // SIDEBAR CODE
    // New code for Research tab sidebar
    const researchTab = document.getElementById('research-experience');
    const researchSidebar = document.getElementById('research-sidebar');
    const researchMainContent = document.getElementById('research-main-content');

    if (researchTab && researchSidebar) {
        const sidebarList = researchSidebar.querySelector('ul');
        let sidebarInitialized = false;

        function generateResearchSidebar() {
            if (!sidebarList) return;
            sidebarList.innerHTML = '';
            const headers = researchMainContent.querySelectorAll('h3, h2'); // Select both h3 and h2

            let currentParentListItem = null;

            headers.forEach(header => {
                const projectId = header.parentElement.id;
                if (!projectId) return;

                const listItem = document.createElement('li');
                const link = document.createElement('a');
                link.href = `#${projectId}`;
                link.textContent = header.textContent;

                if (header.tagName === 'H3') {
                    listItem.appendChild(link);
                    sidebarList.appendChild(listItem);
                    currentParentListItem = listItem; // Store the h3's li
                } else if (header.tagName === 'H2' && currentParentListItem) {
                    // If it's an h2 and we have a parent, nest it
                    let subList = currentParentListItem.querySelector('ul');
                    if (!subList) {
                        subList = document.createElement('ul');
                        currentParentListItem.appendChild(subList);
                    }
                    const subListItem = document.createElement('li');
                    subListItem.appendChild(link);
                    subList.appendChild(subListItem);
                }
            });
            sidebarInitialized = true;
            researchSidebar.classList.remove('hidden');
        }

        document.querySelector('[data-target="research-experience"]').addEventListener('click', function () {
            setTimeout(() => {
                if (!sidebarInitialized) {
                    generateResearchSidebar();
                } else {
                    researchSidebar.classList.remove('hidden');
                }
            }, 300);
        });

        researchTab.addEventListener('click', (event) => {
            const closeButton = event.target.closest('.close-btn');
            if (closeButton) {
                researchSidebar.classList.add('hidden');
                sidebarInitialized = false;
            }
        });
    }
});




