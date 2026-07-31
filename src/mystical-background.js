/**
 * Decorative floating background graphics. No application logic.
 */

// Mystical Background Graphics Manager
class MysticalBackground {
    constructor() {
        this.graphics = [
            '../assets/background-graphics/crystal_ball.png',
            '../assets/background-graphics/devil.png',
            '../assets/background-graphics/homer\'s_riddle.png',
            '../assets/background-graphics/illuminati.png',
            '../assets/background-graphics/mask.png',
            '../assets/background-graphics/medusa.png',
            '../assets/background-graphics/smoke.png',
            '../assets/background-graphics/vecteezy_cobra_36629722.svg',
            '../assets/background-graphics/vecteezy_egypt-sphinx_36659095.svg',
            '../assets/background-graphics/vecteezy_snake_36654696.svg'
        ];
        this.container = document.getElementById('mysticalBackground');
        if (!this.container) {
            console.error('Mystical background container not found!');
            return;
        }
        this.quadrants = [];
        this.activeGraphics = [];
        this.maxActive = 8;
        this.minActive = 5;
        this.initializeQuadrants();
        this.createGraphics();
        this.startAnimationCycle();
        
        // Handle window resize/zoom with debouncing
        this.resizeTimeout = null;
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 100);
        });
        
        // Also handle zoom changes (visualViewport API)
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
                clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(() => {
                    this.handleResize();
                }, 100);
            });
        }
    }
    
    handleResize() {
        // Recalculate quadrants on resize
        this.initializeQuadrants();
        
        // Update positions of all existing graphics
        const allGraphics = document.querySelectorAll('.mystical-graphic');
        allGraphics.forEach((graphic) => {
            const quadrantId = parseInt(graphic.dataset.quadrant);
            const quadrant = this.quadrants[quadrantId];
            if (quadrant) {
                // Get the stored size from the graphic or use default
                const size = graphic.dataset.size ? parseFloat(graphic.dataset.size) : (Math.random() * 40 + 80);
                
                // Recalculate position for this graphic
                const centerX = quadrant.x + (quadrant.width / 2);
                const centerY = quadrant.y + (quadrant.height / 2);
                const x = centerX - size / 2;
                const y = centerY - size / 2;
                
                graphic.style.left = `${x}px`;
                graphic.style.top = `${y}px`;
            }
        });
    }

    initializeQuadrants() {
        // Divide screen into 8 quadrants
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const quadrantWidth = screenWidth / 4;
        const quadrantHeight = screenHeight / 2;
        
        this.quadrants = [
            // Top row
            { x: 0, y: 0, width: quadrantWidth, height: quadrantHeight, id: 0 },
            { x: quadrantWidth, y: 0, width: quadrantWidth, height: quadrantHeight, id: 1 },
            { x: quadrantWidth * 2, y: 0, width: quadrantWidth, height: quadrantHeight, id: 2 },
            { x: quadrantWidth * 3, y: 0, width: quadrantWidth, height: quadrantHeight, id: 3 },
            // Bottom row
            { x: 0, y: quadrantHeight, width: quadrantWidth, height: quadrantHeight, id: 4 },
            { x: quadrantWidth, y: quadrantHeight, width: quadrantWidth, height: quadrantHeight, id: 5 },
            { x: quadrantWidth * 2, y: quadrantHeight, width: quadrantWidth, height: quadrantHeight, id: 6 },
            { x: quadrantWidth * 3, y: quadrantHeight, width: quadrantWidth, height: quadrantHeight, id: 7 }
        ];
    }

    createGraphics() {
        // Create 24 graphic containers (3 per quadrant for more density)
        for (let i = 0; i < 24; i++) {
            const graphic = document.createElement('div');
            graphic.className = 'mystical-graphic';
            graphic.dataset.quadrant = i % 8; // Distribute across 8 quadrants
            graphic.style.position = 'absolute';
            graphic.style.opacity = '0';
            this.container.appendChild(graphic);
        }
    }

    startAnimationCycle() {
        // Start gradual fade in/out cycle
        this.startGradualCycle();
    }

    startGradualCycle() {
        // Create wave effect across the screen
        this.createWaveEffect();
    }

    createWaveEffect() {
        const _allGraphics = document.querySelectorAll('.mystical-graphic');
        
        // Create wave pattern - graphics appear in waves across the screen
        setInterval(() => {
            this.startWave();
        }, 8000); // New wave every 8 seconds
        
        // Start first wave immediately
        this.startWave();
    }

    startWave() {
        const allGraphics = document.querySelectorAll('.mystical-graphic');
        
        // Group graphics by quadrant
        const graphicsByQuadrant = {};
        allGraphics.forEach(graphic => {
            const quadrant = parseInt(graphic.dataset.quadrant);
            if (!graphicsByQuadrant[quadrant]) {
                graphicsByQuadrant[quadrant] = [];
            }
            graphicsByQuadrant[quadrant].push(graphic);
        });
        
        // Select one random graphic per quadrant to avoid duplicates
        const selectedGraphics = [];
        Object.keys(graphicsByQuadrant).forEach(quadrantId => {
            const quadrantGraphics = graphicsByQuadrant[quadrantId];
            const randomGraphic = quadrantGraphics[Math.floor(Math.random() * quadrantGraphics.length)];
            selectedGraphics.push({
                graphic: randomGraphic,
                quadrant: parseInt(quadrantId)
            });
        });
        
        // Sort by quadrant for wave effect
        selectedGraphics.sort((a, b) => a.quadrant - b.quadrant);
        
        // Wave timing - each graphic appears with a delay based on its position
        selectedGraphics.forEach((item, index) => {
            const waveDelay = index * 200; // 200ms between each graphic in the wave
            
            setTimeout(() => {
                this.fadeInGraphic(item.graphic);
                
                // Fade out after a random duration
                const visibleDuration = Math.random() * 3000 + 2000; // 2-5 seconds visible
                
                setTimeout(() => {
                    this.fadeOutGraphic(item.graphic);
                }, visibleDuration);
            }, waveDelay);
        });
    }


    fadeInGraphic(graphic) {
        // Update the graphic with new properties
        const quadrantId = parseInt(graphic.dataset.quadrant);
        const quadrant = this.quadrants[quadrantId];
        this.updateGraphic(graphic, quadrant);
        
        // Fade in
        graphic.style.opacity = '0';
        graphic.style.transition = 'opacity 1.5s ease-in-out';
        setTimeout(() => {
            graphic.style.opacity = '0.7';
        }, 50);
    }

    fadeOutGraphic(graphic) {
        // Fade out
        graphic.style.transition = 'opacity 1.5s ease-in-out';
        graphic.style.opacity = '0';
    }


    updateGraphic(graphic, quadrant) {
        // Clear existing content
        graphic.innerHTML = '';
        
        // Random size between 80px and 120px (smaller to prevent overlap)
        const size = Math.random() * 40 + 80;
        graphic.style.width = `${size}px`;
        graphic.style.height = `${size}px`;
        graphic.dataset.size = size; // Store size for resize calculations
        
        // Since we only show one graphic per quadrant, we can center it
        const centerX = quadrant.x + (quadrant.width / 2);
        const centerY = quadrant.y + (quadrant.height / 2);
        const x = centerX - size / 2;
        const y = centerY - size / 2;
        
        graphic.style.left = `${x}px`;
        graphic.style.top = `${y}px`;
        
        // Random graphic from the collection (using all 10 graphics)
        const graphicSrc = this.graphics[Math.floor(Math.random() * this.graphics.length)];
        const img = document.createElement('img');
        img.src = graphicSrc;
        img.alt = 'Mystical Symbol';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        
        // Random orientation: 0 degrees, horizontal flip, vertical flip, or both
        const orientations = [
            'rotate(0deg)',           // Normal
            'scaleX(-1)',             // Horizontal flip
            'scaleY(-1)',             // Vertical flip
            'scaleX(-1) scaleY(-1)'   // Both flips
        ];
        const orientation = orientations[Math.floor(Math.random() * orientations.length)];
        img.style.transform = orientation;
        
        // Handle image load errors
        img.onerror = () => {
            console.warn('Failed to load background graphic:', graphicSrc);
            graphic.style.opacity = '0';
        };
        
        img.onload = () => {
            graphic.style.opacity = '0.7';
        };
        
        graphic.appendChild(img);
    }
}
