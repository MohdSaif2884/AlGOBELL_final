// Smooth scrolling for navigation (if we add navigation later)
document.addEventListener('DOMContentLoaded', function() {
    // Add any interactive functionality here

    // Example: Highlight current section on scroll
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('nav a'); // If we add navigation

    // Simple animation for projects on load
    const projects = document.querySelectorAll('.project');
    projects.forEach((project, index) => {
        project.style.opacity = '0';
        project.style.transform = 'translateY(20px)';

        setTimeout(() => {
            project.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            project.style.opacity = '1';
            project.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // Add click event to project titles to toggle details
    projects.forEach(project => {
        const title = project.querySelector('h3');
        const details = project.querySelector('ul');

        title.addEventListener('click', () => {
            if (details.style.display === 'none' || details.style.display === '') {
                details.style.display = 'block';
            } else {
                details.style.display = 'none';
            }
        });

        title.style.cursor = 'pointer';
        title.title = 'Click to toggle project details';
    });

    // Add print functionality
    const printButton = document.createElement('button');
    printButton.textContent = 'Print CV';
    printButton.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #007bff;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
    `;

    printButton.addEventListener('click', () => {
        window.print();
    });

    document.body.appendChild(printButton);

    // Add dark mode toggle
    const darkModeButton = document.createElement('button');
    darkModeButton.textContent = 'Toggle Dark Mode';
    darkModeButton.style.cssText = `
        position: fixed;
        top: 60px;
        right: 20px;
        background-color: #333;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
    `;

    darkModeButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            document.body.style.backgroundColor = '#333';
            document.body.style.color = '#f5f5f5';
            document.querySelectorAll('.container').forEach(container => {
                container.style.backgroundColor = '#444';
                container.style.color = '#f5f5f5';
            });
            document.querySelectorAll('.project').forEach(project => {
                project.style.backgroundColor = '#555';
            });
        } else {
            document.body.style.backgroundColor = '#f5f5f5';
            document.body.style.color = '#333';
            document.querySelectorAll('.container').forEach(container => {
                container.style.backgroundColor = 'white';
                container.style.color = '#333';
            });
            document.querySelectorAll('.project').forEach(project => {
                project.style.backgroundColor = '#f9f9f9';
            });
        }
    });

    document.body.appendChild(darkModeButton);
});

// Add some interactive features
function addSkillHighlighting() {
    const skillItems = document.querySelectorAll('.skill-category p');

    skillItems.forEach(item => {
        const skills = item.textContent.split(', ');
        item.innerHTML = skills.map(skill =>
            `<span class="skill-tag">${skill.trim()}</span>`
        ).join(', ');
    });

    // Add CSS for skill tags
    const style = document.createElement('style');
    style.textContent = `
        .skill-tag {
            display: inline-block;
            background-color: #e9ecef;
            color: #495057;
            padding: 2px 6px;
            margin: 2px;
            border-radius: 3px;
            font-size: 0.85em;
            transition: background-color 0.3s ease;
        }
        .skill-tag:hover {
            background-color: #007bff;
            color: white;
        }
    `;
    document.head.appendChild(style);
}

// Call the function when DOM is loaded
document.addEventListener('DOMContentLoaded', addSkillHighlighting);

// Add smooth scrolling to sections
function smoothScrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Export functions for potential use
window.CVUtils = {
    smoothScrollToSection,
    toggleProjectDetails: function(projectIndex) {
        const projects = document.querySelectorAll('.project');
        if (projects[projectIndex]) {
            const details = projects[projectIndex].querySelector('ul');
            details.style.display = details.style.display === 'none' ? 'block' : 'none';
        }
    }
};
