/**
 * Interactive map selection: world, continent and US state pickers.
 *
 * The maps are inline SVGs whose element ids are lowercase ISO-3166 alpha-2
 * codes, so a country code doubles as a selector. Several continents need
 * special handling (Russia spans two, North America is grouped), which is why
 * there are separate loaders rather than one generic one.
 */

Object.assign(NameGuessingQuiz.prototype, {

    createMap() {
        const mapContainer = document.getElementById('mapContainer');
        if (!mapContainer) {
          console.error("Map container not found!");
          return;
        }
      
         mapContainer.style.display = 'block';
         mapContainer.innerHTML = '<div id="continueContainer"></div>';
      
        fetch('us.svg')
          .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.text();
          })
          .then(svgText => {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            const svgElement = svgDoc.documentElement;
      
            svgElement.classList.add('us-map');
            svgElement.style.width = '100%';
            svgElement.style.height = 'auto';
            svgElement.style.maxWidth = '800px';
            svgElement.style.display = 'block';
            svgElement.style.margin = '0 auto';
      
            svgElement.querySelectorAll('path').forEach(path => {
               path.classList.add('state-path');
               
               // Add golden styling
               path.style.fill = 'rgba(255, 215, 0, 0.1)';
               path.style.stroke = '#FFD700';
               path.style.strokeWidth = '1.5';
               path.style.cursor = 'pointer';
               path.style.transition = 'all 0.3s ease';
               
               // Add hover effects
               path.addEventListener('mouseenter', () => {
                 path.style.fill = 'rgba(255, 215, 0, 0.4)';
                 path.style.stroke = '#FFFFFF';
                 path.style.strokeWidth = '2.5';
                 path.style.filter = 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))';
                 // Removed scale transform
               });
               
               path.addEventListener('mouseleave', () => {
                 if (!path.classList.contains('selected')) {
                   path.style.fill = 'rgba(255, 215, 0, 0.1)';
                   path.style.stroke = '#FFD700';
                   path.style.strokeWidth = '1.5';
                   path.style.filter = 'none';
                   // Removed scale transform
                 }
               });
               
               path.addEventListener('click', () => {
                 svgElement.querySelectorAll('.state-path').forEach(p => {
                   p.classList.remove('selected');
                   p.style.fill = 'rgba(255, 215, 0, 0.1)';
                   p.style.stroke = '#FFD700';
                   p.style.strokeWidth = '1.5';
                   p.style.filter = 'none';
                   // Removed scale transform
                 });
                 
                 path.classList.add('selected');
                 path.style.fill = 'rgba(255, 215, 0, 0.7)';
                 path.style.stroke = '#FFA500';
                 path.style.strokeWidth = '3';
                 path.style.filter = 'drop-shadow(0 0 20px rgba(255, 215, 0, 1))';
                 
                 const stateId = path.id || path.getAttribute('name');
                 
                 // Store the selected state
                 this.selectedState = stateId;
                 
                 // Show continue button using existing system
                 this.showMapContinueButton();
               });
             });
      
            mapContainer.appendChild(svgElement);
          })
          .catch(err => console.error("Error loading map:", err));
       },


    createWorldMap() {
        const mapContainer = document.getElementById('mapContainer');
        if (!mapContainer) {
          console.error("Map container not found!");
          return;
        }
      
        mapContainer.style.display = 'block';
        mapContainer.innerHTML = '<div id="continueContainer"></div>';
        
        // Initialize selected countries array
        this.selectedCountries = [];
      
        fetch('../assets/world-map/world-map.svg')
          .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            return response.text();
          })
          .then(svgText => {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            const svgElement = svgDoc.documentElement;
      
            svgElement.classList.add('world-map');
            svgElement.style.width = '100%';
            svgElement.style.height = 'auto';
            svgElement.style.maxWidth = '1000px';
            svgElement.style.display = 'block';
            svgElement.style.margin = '0 auto';
      
            svgElement.querySelectorAll('path').forEach(path => {
               path.classList.add('country-path');
               
               // Add golden styling
               path.style.fill = 'rgba(255, 215, 0, 0.1)';
               path.style.stroke = '#FFD700';
               path.style.strokeWidth = '1';
               path.style.cursor = 'pointer';
               path.style.transition = 'all 0.3s ease';
               
               // Add hover effects
               path.addEventListener('mouseenter', () => {
                 if (!path.classList.contains('selected')) {
                   path.style.fill = 'rgba(255, 215, 0, 0.4)';
                   path.style.stroke = '#FFFFFF';
                   path.style.strokeWidth = '2';
                   path.style.filter = 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.6))';
                 }
               });
               
               path.addEventListener('mouseleave', () => {
                 if (!path.classList.contains('selected')) {
                   path.style.fill = 'rgba(255, 215, 0, 0.1)';
                   path.style.stroke = '#FFD700';
                   path.style.strokeWidth = '1';
                   path.style.filter = 'none';
                 }
               });
               
               path.addEventListener('click', () => {
                 const countryId = path.id || path.getAttribute('name') || path.getAttribute('data-name');
                 
                 if (path.classList.contains('selected')) {
                   // Deselect country
                   path.classList.remove('selected');
                   path.style.fill = 'rgba(255, 215, 0, 0.1)';
                   path.style.stroke = '#FFD700';
                   path.style.strokeWidth = '1';
                   path.style.filter = 'none';
                   
                   // Remove from selected countries
                   this.selectedCountries = this.selectedCountries.filter(c => c !== countryId);
                 } else {
                   // Select country
                   path.classList.add('selected');
                   path.style.fill = 'rgba(255, 215, 0, 0.7)';
                   path.style.stroke = '#FFA500';
                   path.style.strokeWidth = '2.5';
                   path.style.filter = 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))';
                   
                   // Add to selected countries
                   this.selectedCountries.push(countryId);
                 }
                 
                 // Show continue button if any countries are selected
                 if (this.selectedCountries.length > 0) {
                   this.showWorldMapContinueButton();
                 } else {
                   this.hideWorldMapContinueButton();
                 }
               });
             });
      
            mapContainer.appendChild(svgElement);
          })
          .catch(err => {
            console.error("Error loading world map:", err);
            // Show user-friendly error message
            const mapContainer = document.getElementById('mapContainer');
            if (mapContainer) {
              mapContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #FFD700;">
                  <h3>🗺️ World Map Loading Error</h3>
                  <p>Unable to load the world map. Please refresh the page and try again.</p>
                  <p style="font-size: 0.9em; color: #ccc;">Error: ${err.message}</p>
                </div>
              `;
            }
          });
       },


    showWorldMapContinueButton() {
        const continueContainer = document.getElementById('continueContainer');
        if (continueContainer && !continueContainer.querySelector('.slider-continue-btn')) {
            // Use the same continue button system as sliders
            const continueBtn = document.createElement('button');
            continueBtn.className = 'slider-continue-btn';
            continueBtn.textContent = `Continue (${this.selectedCountries.length} selected)`;
            continueBtn.addEventListener('click', () => {
                this.selectAnswer(this.selectedCountries);
            });
            continueContainer.appendChild(continueBtn);
        } else if (continueContainer && continueContainer.querySelector('.slider-continue-btn')) {
            // Update existing button text
            const existingBtn = continueContainer.querySelector('.slider-continue-btn');
            existingBtn.textContent = `Continue (${this.selectedCountries.length} selected)`;
        }
    },


    hideWorldMapContinueButton() {
        const continueContainer = document.getElementById('continueContainer');
        if (continueContainer) {
            const existingBtn = continueContainer.querySelector('.slider-continue-btn');
            if (existingBtn) {
                existingBtn.remove();
            }
        }
    },


    createContinentSelection() {
        const mapContainer = document.getElementById('mapContainer');
        if (!mapContainer) {
            console.error("Map container not found!");
            return;
        }
      
        mapContainer.style.display = 'block';
        mapContainer.innerHTML = '<div id="continueContainer"></div>';
        
        // Initialize selected continents array
        this.selectedContinents = [];
        this.continentSelectedCountries = {}; // Track which countries are selected per continent
        
        // Create skip button
        this.createSkipButton(mapContainer, () => {
            this.selectAnswer([]); // Skip continent selection
        });
        
        // Load world map for continent selection
        this.createWorldMapForContinentSelection();
    },

    
    getContinentFromCountry(countryId) {
        if (!countryId) return null;
        
        // Normalize country ID (lowercase to match SVG IDs)
        const normalizedId = countryId.toString().toLowerCase().trim();
        
        // Map country codes to continents
        for (const [continent, countries] of Object.entries(this.continentToCountries)) {
            // Check both exact match and if any country code is contained in the ID
            if (countries.includes(normalizedId) || 
                countries.some(code => normalizedId.includes(code) || code.includes(normalizedId))) {
                return continent;
            }
        }
        return null;
    },

    
    createWorldMapForContinentSelection() {
        const mapContainer = document.getElementById('mapContainer');
        if (!mapContainer) {
            return;
        }
        
        // Don't add extra styling - let it match state map container styling
        mapContainer.style.display = 'block';
        mapContainer.innerHTML = '<div id="continueContainer"></div>';
        
        fetch('../assets/world-map/world-map.svg')
          .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            return response.text();
          })
          .then(svgText => {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            const svgElement = svgDoc.documentElement;
      
            svgElement.classList.add('us-map', 'world-map-continent-selector'); // Use same class as state map + identifier
            svgElement.style.width = '100%';
            svgElement.style.height = 'auto';
            svgElement.style.maxWidth = '800px';
            svgElement.style.display = 'block';
            svgElement.style.margin = '0 auto';
      
            // Track which paths belong to which continents
            const continentPaths = {};
            Object.keys(this.continentToCountries).forEach(continent => {
                continentPaths[continent] = [];
            });
            
            // Track hover state to prevent flickering when moving between countries in same continent
            const continentHoverCount = {};
            Object.keys(this.continentToCountries).forEach(continent => {
                continentHoverCount[continent] = 0;
            });
      
            // First pass: collect all paths and their continents
            // Handle both direct path IDs and paths inside groups with country IDs
            const allPaths = [];
            const pathToContinent = new Map();
            
            // Get all groups with country IDs
            svgElement.querySelectorAll('g[id]').forEach(group => {
                const groupId = group.id.toUpperCase().trim();
                if (groupId && !groupId.startsWith('_')) {
                    const continent = this.getContinentFromCountry(groupId);
                    if (continent) {
                        // All paths in this group belong to this continent
                        group.querySelectorAll('path').forEach(path => {
                            allPaths.push(path);
                            pathToContinent.set(path, continent);
                        });
                    }
                }
            });
            
            // Get all paths with direct IDs (not in groups we already processed)
            svgElement.querySelectorAll('path[id]').forEach(path => {
                // Skip if already processed (in a group)
                if (!pathToContinent.has(path)) {
                    allPaths.push(path);
                    
                    let countryId = path.id;
                    
                    // Normalize country ID (uppercase, trim, remove any prefixes)
                    if (countryId) {
                        countryId = countryId.toString().toUpperCase().trim();
                        // Remove underscore prefix if present (e.g., "_somaliland" -> "SOMALILAND")
                        if (countryId.startsWith('_')) {
                            countryId = countryId.substring(1);
                        }
                    }
                    
                    const continent = countryId ? this.getContinentFromCountry(countryId) : null;
                    if (continent) {
                        pathToContinent.set(path, continent);
                    }
                }
            });
            
            // Remove attributes from all paths
            allPaths.forEach(path => {
               path.removeAttribute('fill');
               path.removeAttribute('stroke');
               path.removeAttribute('stroke-width');
               path.removeAttribute('fill-opacity');
               path.removeAttribute('stroke-opacity');
            });
            
            // Second pass: apply styling and event listeners
            allPaths.forEach(path => {
               const continent = pathToContinent.get(path);
               
               // Match state map styling exactly - use same approach as state map
               path.classList.add('state-path');
               
               // Apply exact same styling as state map (matching createMap function)
               // Don't use !important - let CSS handle it, but set inline styles
               path.style.fill = 'rgba(255, 215, 0, 0.1)';
               path.style.stroke = '#FFD700';
               path.style.strokeWidth = '1.5';
               path.style.cursor = continent ? 'pointer' : 'default';
               path.style.transition = 'all 0.3s ease';
               path.style.pointerEvents = 'auto'; // Ensure paths are clickable
               
               if (continent) {
                   path.dataset.continent = continent;
                   continentPaths[continent].push(path);
                   
                   // Add hover effects - highlight all countries in the continent (matching state map hover)
                   path.addEventListener('mouseenter', (e) => {
                     e.stopPropagation();
                     const hoverContinent = path.dataset.continent;
                     if (!this.selectedContinents.includes(hoverContinent)) {
                       // Increment hover count for this continent
                       continentHoverCount[hoverContinent]++;
                       
                       // Only highlight if this is the first country in the continent being hovered
                       if (continentHoverCount[hoverContinent] === 1) {
                         // Highlight all countries in this continent on hover
                         continentPaths[hoverContinent].forEach(p => {
                           if (!p.classList.contains('continent-selected')) {
                             // Use setProperty to ensure styles override CSS
                             p.style.setProperty('fill', 'rgba(255, 215, 0, 0.4)', 'important');
                             p.style.setProperty('stroke', '#FFFFFF', 'important');
                             p.style.setProperty('stroke-width', '2.5', 'important');
                             p.style.setProperty('filter', 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))', 'important');
                             p.style.setProperty('transform', 'scale(1.02)', 'important');
                           }
                         });
                       }
                     }
                   });
                   
                   path.addEventListener('mouseleave', (e) => {
                     e.stopPropagation();
                     const hoverContinent = path.dataset.continent;
                     if (!this.selectedContinents.includes(hoverContinent)) {
                       // Decrement hover count for this continent
                       continentHoverCount[hoverContinent] = Math.max(0, continentHoverCount[hoverContinent] - 1);
                       
                       // Only reset if no countries in this continent are being hovered
                       if (continentHoverCount[hoverContinent] === 0) {
                         // Reset all countries in this continent on mouse leave
                         continentPaths[hoverContinent].forEach(p => {
                           if (!p.classList.contains('continent-selected')) {
                             p.style.setProperty('fill', 'rgba(255, 215, 0, 0.1)', 'important');
                             p.style.setProperty('stroke', '#FFD700', 'important');
                             p.style.setProperty('stroke-width', '1.5', 'important');
                             p.style.setProperty('filter', 'none', 'important');
                             p.style.setProperty('transform', 'scale(1)', 'important');
                           }
                         });
                       }
                     }
                   });
                   
                   path.addEventListener('click', (e) => {
                     e.stopPropagation();
                     const clickedContinent = path.dataset.continent;
                     
                     if (this.selectedContinents.includes(clickedContinent)) {
                       // Deselect continent - unhighlight all countries in that continent
                       this.selectedContinents = this.selectedContinents.filter(c => c !== clickedContinent);
                       continentPaths[clickedContinent].forEach(p => {
                         p.classList.remove('continent-selected');
                         p.style.fill = 'rgba(255, 215, 0, 0.1)';
                         p.style.stroke = '#FFD700';
                         p.style.strokeWidth = '1.5';
                         p.style.filter = 'none';
                         // Removed scale transform
                       });
                     } else {
                       // Select continent - highlight all countries in that continent (matching state map selected style)
                       this.selectedContinents.push(clickedContinent);
                       continentPaths[clickedContinent].forEach(p => {
                         p.classList.add('continent-selected');
                         p.style.fill = 'rgba(255, 215, 0, 0.7)';
                         p.style.stroke = '#FFA500';
                         p.style.strokeWidth = '3';
                         p.style.filter = 'drop-shadow(0 0 20px rgba(255, 215, 0, 1))';
                       });
                     }
                     
                     // Show continue button if any continents are selected
                     if (this.selectedContinents.length > 0) {
                       this.showContinentSelectionContinueButton();
                     } else {
                       this.hideContinentSelectionContinueButton();
                     }
                   });
               }
             });
      
            mapContainer.appendChild(svgElement);
          })
          .catch(err => {
            console.error("Error loading world map:", err);
            const mapContainer = document.getElementById('mapContainer');
            if (mapContainer) {
              mapContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #FFD700;">
                  <h3>🗺️ World Map Loading Error</h3>
                  <p>Unable to load the world map. Please refresh the page and try again.</p>
                  <p style="font-size: 0.9em; color: #ccc;">Error: ${err.message}</p>
                </div>
              `;
            }
          });
    },

    
    showContinentSelectionContinueButton() {
        const continueContainer = document.getElementById('continueContainer');
        if (!continueContainer) return;
        
        let existingBtn = continueContainer.querySelector('.continent-selection-continue-btn');
        if (!existingBtn) {
            const continueBtn = document.createElement('button');
            continueBtn.className = 'slider-continue-btn continent-selection-continue-btn';
            continueBtn.textContent = `Continue (${this.selectedContinents.length} continent${this.selectedContinents.length > 1 ? 's' : ''} selected)`;
            continueBtn.addEventListener('click', () => {
                this.showIndividualContinentQuestions();
            });
            continueContainer.appendChild(continueBtn);
        } else {
            existingBtn.textContent = `Continue (${this.selectedContinents.length} continent${this.selectedContinents.length > 1 ? 's' : ''} selected)`;
        }
    },

    
    hideContinentSelectionContinueButton() {
        const continueContainer = document.getElementById('continueContainer');
        if (continueContainer) {
            const existingBtn = continueContainer.querySelector('.continent-selection-continue-btn');
            if (existingBtn) {
                existingBtn.remove();
            }
        }
    },

    
    showIndividualContinentQuestions() {
        // Store continent selection
        this.answers.cultural_background = this.selectedContinents;
        
        // Show first continent question
        if (this.selectedContinents.length > 0) {
            this.currentContinentIndex = 0;
            this.showContinentCountryQuestion(this.selectedContinents[0]);
        } else {
            // No continents selected, move to next question
            this.hideMap();
            document.getElementById('characterThinking').style.display = 'block';
            setTimeout(() => {
                this.currentQuestion++;
                if (this.currentQuestion < this.questions.length) {
                    this.showQuestion();
                    history.pushState({page: 'quiz', question: this.currentQuestion}, '', `#quiz-${this.currentQuestion}`);
                } else {
                    this.makeGuess();
                }
                document.getElementById('characterThinking').style.display = 'none';
            }, 800);
        }
    },

    
    showContinentCountryQuestion(continent) {
        const mapContainer = document.getElementById('mapContainer');
        if (!mapContainer) {
            console.error('Map container not found!');
            return;
        }
        
        mapContainer.style.display = 'block';
        mapContainer.innerHTML = '<div id="continueContainer" style="display: block; visibility: visible;"></div>';
        
        // Update question text
        const questionText = document.getElementById('questionText');
        if (questionText) {
            questionText.textContent = `🗺️ Which countries in ${this.getContinentDisplayName(continent)} does your family come from?`;
        }
        
        // Initialize selected countries for this continent
        this.selectedCountries = [];
        
        // Create skip button
        this.createSkipButton(mapContainer, () => {
            this.handleContinentCountrySkip(continent);
        });
        
        // Show continue button immediately (allows skipping by clicking continue with no selection)
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
            this.showContinentCountryContinueButton(continent);
        }, 0);
        
        // Load the continent map
        this.loadContinentMapForSelection(continent);
    },

    
    handleContinentCountrySkip(continent) {
        // Store empty array for this continent
        if (!this.answers.country_selections) {
            this.answers.country_selections = {};
        }
        this.answers.country_selections[continent] = [];
        
        // Move to next continent or next question
        this.currentContinentIndex++;
        if (this.currentContinentIndex < this.selectedContinents.length) {
            this.showContinentCountryQuestion(this.selectedContinents[this.currentContinentIndex]);
        } else {
            // All continents processed, move to next quiz question
            this.hideMap();
            document.getElementById('characterThinking').style.display = 'block';
            setTimeout(() => {
                this.currentQuestion++;
                if (this.currentQuestion < this.questions.length) {
                    this.showQuestion();
                    history.pushState({page: 'quiz', question: this.currentQuestion}, '', `#quiz-${this.currentQuestion}`);
                } else {
                    this.makeGuess();
                }
                document.getElementById('characterThinking').style.display = 'none';
            }, 800);
        }
    },

    
    loadContinentMapForSelection(continent) {
        const continentMapFiles = {
            'north-america': '../assets/north-america.svg',
            'central-america': '../assets/central-america.svg',
            'south-america': '../assets/south-america.svg',
            'europe': '../assets/europe.svg',
            'africa': '../assets/africa.svg',
            'asia': '../assets/asia.svg',
            'oceania': '../assets/Blank_Map_Oceania.svg'
        };

        const mapFile = continentMapFiles[continent];
        if (!mapFile) {
            console.error(`No map file found for continent: ${continent}`);
            return;
        }
        
        const mapContainer = document.getElementById('mapContainer');
        const continentMapDiv = document.createElement('div');
        continentMapDiv.className = 'continent-map-container';
        continentMapDiv.dataset.continent = continent; // Add data-continent attribute for CSS targeting
        continentMapDiv.style.width = '100%';
        continentMapDiv.style.maxWidth = '800px';
        continentMapDiv.style.margin = '0 auto';
        
        // All continent maps are now SVG files
        fetch(mapFile)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                return response.text();
            })
            .then(svgText => {
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
                let svgElement = svgDoc.documentElement;

                // Check for parsing errors
                if (!svgElement || svgElement.nodeName === 'parsererror') {
                    throw new Error('Failed to parse SVG file');
                }

                // Some SVGs have a wrapper element, get the actual SVG if needed
                if (svgElement.nodeName !== 'svg') {
                    svgElement = svgElement.querySelector('svg') || svgElement;
                }

                // Verify we have a valid SVG element
                if (!svgElement || typeof svgElement.classList === 'undefined') {
                    throw new Error('Invalid SVG element structure');
                }

                svgElement.classList.add('continent-map-svg');
                if (svgElement.dataset) {
                    svgElement.dataset.continent = continent; // Add data-continent attribute for CSS targeting
                } else {
                    svgElement.setAttribute('data-continent', continent);
                }
                // Let CSS handle sizing - remove inline styles that override CSS
                // Only set essential attributes
                svgElement.style.display = 'block';
                svgElement.style.margin = '0 auto';

                // Special handling for North America - group US states and Canadian provinces
                if (continent === 'north-america') {
                    this.loadNorthAmericaMapGrouped(svgElement, continent, continentMapDiv, mapContainer);
                } else {
                    // Regular country selection for other continents
                    this.loadContinentMapRegular(svgElement, continent, continentMapDiv, mapContainer);
                }
            })
            .catch(err => {
                console.error(`Error loading ${continent} map:`, err);
                continentMapDiv.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #FFD700;">
                        <h3>🗺️ Map Loading Error</h3>
                        <p>Unable to load the ${this.getContinentDisplayName(continent)} map.</p>
                    </div>
                `;
                mapContainer.insertBefore(continentMapDiv, mapContainer.querySelector('#continueContainer'));
            });
    },

    
    loadNorthAmericaMapGrouped(svgElement, continent, continentMapDiv, mapContainer) {
        // US state codes (50 states + DC)
        const usStates = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 
                         'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 
                         'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 
                         'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 
                         'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'];
        
        // Canadian province/territory codes
        const canadaProvinces = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];
        
        // Group paths by country
        const usPaths = [];
        const canadaPaths = [];
        const otherPaths = [];
        
        // Process both paths and circles (Mexico is a circle)
        const allElements = [...svgElement.querySelectorAll('path'), ...svgElement.querySelectorAll('circle')];
        allElements.forEach(path => {
            const pathId = (path.id || path.getAttribute('name') || path.getAttribute('class') || '').toUpperCase();
            
            // Remove any existing attributes
            path.removeAttribute('fill');
            path.removeAttribute('stroke');
            path.removeAttribute('stroke-width');
            
            path.classList.add('state-path');
            path.style.fill = 'rgba(255, 215, 0, 0.1)';
            path.style.stroke = '#FFD700';
            path.style.strokeWidth = '1.5';
            path.style.setProperty('vector-effect', 'non-scaling-stroke', 'important');
            path.style.cursor = 'pointer';
            path.style.transition = 'all 0.3s ease';
            
            if (usStates.includes(pathId)) {
                usPaths.push(path);
                path.dataset.country = 'US';
            } else if (canadaProvinces.includes(pathId)) {
                canadaPaths.push(path);
                path.dataset.country = 'CA';
            } else {
                otherPaths.push(path);
                const countryId = pathId || path.getAttribute('name') || path.getAttribute('data-name');
                path.dataset.country = countryId; // Use path ID as country code for other countries
            }
        });
        
        // Track hover state - use Set to track which paths are currently hovered
        const countryHoveredPaths = { US: new Set(), CA: new Set() };
        otherPaths.forEach(p => {
            countryHoveredPaths[p.dataset.country] = new Set();
        });
        
        // Add event listeners to all paths
        const allPaths = [...usPaths, ...canadaPaths, ...otherPaths];
        allPaths.forEach(path => {
            const country = path.dataset.country;
            const countryPaths = country === 'US' ? usPaths : (country === 'CA' ? canadaPaths : [path]);
            
            path.addEventListener('mouseenter', (e) => {
                e.stopPropagation();
                const wasEmpty = countryHoveredPaths[country].size === 0;
                countryHoveredPaths[country].add(path);
                
                // Only apply hover effect when first path in country is hovered
                if (wasEmpty) {
                    countryPaths.forEach(p => {
                        if (!p.classList.contains('selected')) {
                            p.style.setProperty('fill', 'rgba(255, 215, 0, 0.4)', 'important');
                            p.style.setProperty('stroke', '#FFFFFF', 'important');
                            p.style.setProperty('stroke-width', '2.5', 'important');
                            p.style.setProperty('filter', 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))', 'important');
                            p.style.setProperty('transform', 'scale(1.02)', 'important');
                        }
                    });
                }
            });
            
            path.addEventListener('mouseleave', (e) => {
                e.stopPropagation();
                countryHoveredPaths[country].delete(path);
                
                // Only remove hover effect when last path in country is left
                if (countryHoveredPaths[country].size === 0) {
                    countryPaths.forEach(p => {
                        if (!p.classList.contains('selected')) {
                            p.style.setProperty('fill', 'rgba(255, 215, 0, 0.1)', 'important');
                            p.style.setProperty('stroke', '#FFD700', 'important');
                            p.style.setProperty('stroke-width', '1.5', 'important');
                            p.style.setProperty('filter', 'none', 'important');
                            p.style.setProperty('transform', 'scale(1)', 'important');
                        }
                    });
                }
            });
            
            path.addEventListener('click', (e) => {
                e.stopPropagation();
                const country = path.dataset.country;
                const countryPaths = country === 'US' ? usPaths : (country === 'CA' ? canadaPaths : [path]);
                
                if (path.classList.contains('selected')) {
                    // Deselect all paths in this country
                    countryPaths.forEach(p => {
                        p.classList.remove('selected');
                        p.style.fill = 'rgba(255, 215, 0, 0.1)';
                        p.style.stroke = '#FFD700';
                        p.style.strokeWidth = '1.5';
                        p.style.filter = 'none';
                        // Removed scale transform
                    });
                    this.selectedCountries = this.selectedCountries.filter(c => c !== country);
                } else {
                    // Select all paths in this country
                    countryPaths.forEach(p => {
                        p.classList.add('selected');
                        p.style.fill = 'rgba(255, 215, 0, 0.7)';
                        p.style.stroke = '#FFA500';
                        p.style.strokeWidth = '3';
                        p.style.filter = 'drop-shadow(0 0 20px rgba(255, 215, 0, 1))';
                    });
                    if (!this.selectedCountries.includes(country)) {
                        this.selectedCountries.push(country);
                    }
                }
                
                this.showContinentCountryContinueButton(continent);
            });
        });
        
        continentMapDiv.appendChild(svgElement);
        mapContainer.insertBefore(continentMapDiv, mapContainer.querySelector('#continueContainer'));
    },

    
    loadContinentMapRegular(svgElement, continent, continentMapDiv, mapContainer) {
        // Make SVG background transparent
        svgElement.style.background = 'transparent';
        svgElement.removeAttribute('fill');
        svgElement.removeAttribute('style');
        
        // Remove any background rectangles that might exist
        svgElement.querySelectorAll('rect').forEach(rect => {
            rect.remove();
        });
        
        // Remove fills from all groups
        svgElement.querySelectorAll('g').forEach(group => {
            group.removeAttribute('fill');
            group.removeAttribute('style');
        });
        
        // Collect all paths including those in groups (like some maps might have)
        const allPaths = [];
        const processedPaths = new Set();
        
        // Get paths in groups first
        svgElement.querySelectorAll('g[id]').forEach(group => {
            group.querySelectorAll('path').forEach(path => {
                if (!processedPaths.has(path)) {
                    allPaths.push(path);
                    processedPaths.add(path);
                }
            });
        });
        
        // Get direct paths (not in groups we already processed)
        svgElement.querySelectorAll('path').forEach(path => {
            if (!processedPaths.has(path)) {
                allPaths.push(path);
                processedPaths.add(path);
            }
        });
        
        // Apply golden styling like state map
        allPaths.forEach(path => {
            // FIRST: Remove ALL existing styling attributes and classes
            path.removeAttribute('fill');
            path.removeAttribute('stroke');
            path.removeAttribute('stroke-width');
            path.removeAttribute('fill-opacity');
            path.removeAttribute('stroke-opacity');
            path.removeAttribute('class');
            path.removeAttribute('style');
            
            // Clear any inline styles
            path.style.cssText = '';
            
            // Add our class
            path.classList.add('country-path');
            
            // THEN: Apply golden styling like state map - use setProperty to ensure it sticks
            path.style.setProperty('fill', 'rgba(255, 215, 0, 0.1)', 'important');
            path.style.setProperty('stroke', '#FFD700', 'important');
            path.style.setProperty('stroke-width', '1.5', 'important');
            path.style.setProperty('vector-effect', 'non-scaling-stroke', 'important');
            path.style.cursor = 'pointer';
            path.style.transition = 'all 0.3s ease';
            
            // Add hover effects - use setProperty with !important to override CSS
            path.addEventListener('mouseenter', () => {
                if (!path.classList.contains('selected')) {
                    path.style.setProperty('fill', 'rgba(255, 215, 0, 0.4)', 'important');
                    path.style.setProperty('stroke', '#FFFFFF', 'important');
                    path.style.setProperty('stroke-width', '2.5', 'important');
                    path.style.setProperty('filter', 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))', 'important');
                    // Removed scale transform
                }
            });
            
            path.addEventListener('mouseleave', () => {
                if (!path.classList.contains('selected')) {
                    path.style.setProperty('fill', 'rgba(255, 215, 0, 0.1)', 'important');
                    path.style.setProperty('stroke', '#FFD700', 'important');
                    path.style.setProperty('stroke-width', '1.5', 'important');
                    path.style.setProperty('filter', 'none', 'important');
                    // Removed scale transform
                }
            });
            
            path.addEventListener('click', () => {
                // Try multiple ways to get country ID (case-insensitive)
                let countryId = path.id || 
                               path.getAttribute('name') || 
                               path.getAttribute('data-name') ||
                               path.getAttribute('data-id');
                
                // Normalize country ID (uppercase, trim)
                if (countryId) {
                    countryId = countryId.toString().toUpperCase().trim();
                }
                
                if (path.classList.contains('selected')) {
                    // Deselect country
                    path.classList.remove('selected');
                    path.style.setProperty('fill', 'rgba(255, 215, 0, 0.1)', 'important');
                    path.style.setProperty('stroke', '#FFD700', 'important');
                    path.style.setProperty('stroke-width', '1.5', 'important');
                    path.style.setProperty('filter', 'none', 'important');
                    // Removed scale transform
                    
                    this.selectedCountries = this.selectedCountries.filter(c => c !== countryId);
                } else {
                    // Select country
                    path.classList.add('selected');
                    path.style.setProperty('fill', 'rgba(255, 215, 0, 0.7)', 'important');
                    path.style.setProperty('stroke', '#FFA500', 'important');
                    path.style.setProperty('stroke-width', '3', 'important');
                    path.style.setProperty('filter', 'drop-shadow(0 0 20px rgba(255, 215, 0, 1))', 'important');
                    
                    this.selectedCountries.push(countryId);
                }
                
                // Show continue button
                this.showContinentCountryContinueButton(continent);
            });
        });

        continentMapDiv.appendChild(svgElement);
        mapContainer.insertBefore(continentMapDiv, mapContainer.querySelector('#continueContainer'));
    },

    
    loadEuropeWithRussia(europeSvgElement, continent, continentMapDiv, mapContainer) {
        // First, set up the Europe map
        europeSvgElement.classList.add('continent-map-svg');
        europeSvgElement.style.width = '100%';
        europeSvgElement.style.height = 'auto';
        europeSvgElement.style.maxWidth = '100%';
        europeSvgElement.style.display = 'block';
        europeSvgElement.style.margin = '0 auto';
        europeSvgElement.style.overflow = 'visible';
        
        // Create a container for both maps
        const mapsWrapper = document.createElement('div');
        mapsWrapper.style.display = 'flex';
        mapsWrapper.style.flexDirection = 'column';
        mapsWrapper.style.gap = '20px';
        mapsWrapper.style.width = '100%';
        mapsWrapper.style.alignItems = 'center';
        
        // Add Europe map to wrapper
        mapsWrapper.appendChild(europeSvgElement);
        
        // Load Russia map
        fetch('../assets/ru-03/ru-03.svg')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                return response.text();
            })
            .then(svgText => {
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
                const russiaSvgElement = svgDoc.documentElement;
                
                russiaSvgElement.classList.add('continent-map-svg');
                russiaSvgElement.style.width = '100%';
                russiaSvgElement.style.height = 'auto';
                russiaSvgElement.style.maxWidth = '100%';
                russiaSvgElement.style.display = 'block';
                russiaSvgElement.style.margin = '0 auto';
                russiaSvgElement.style.overflow = 'visible';
                
                // Process both maps together - collect all paths including those in groups
                const allPaths = [];
                const processedPaths = new Set();
                
                // Process Europe map paths (including those in groups)
                europeSvgElement.querySelectorAll('g[id]').forEach(group => {
                    group.querySelectorAll('path').forEach(path => {
                        if (!processedPaths.has(path)) {
                            allPaths.push(path);
                            processedPaths.add(path);
                        }
                    });
                });
                europeSvgElement.querySelectorAll('path').forEach(path => {
                    if (!processedPaths.has(path)) {
                        allPaths.push(path);
                        processedPaths.add(path);
                    }
                });
                
                // Process Russia map paths (including those in groups)
                russiaSvgElement.querySelectorAll('g[id]').forEach(group => {
                    group.querySelectorAll('path').forEach(path => {
                        if (!processedPaths.has(path)) {
                            allPaths.push(path);
                            processedPaths.add(path);
                        }
                    });
                });
                russiaSvgElement.querySelectorAll('path').forEach(path => {
                    if (!processedPaths.has(path)) {
                        allPaths.push(path);
                        processedPaths.add(path);
                    }
                });
                
                // Apply styling and event listeners to all paths
                allPaths.forEach(path => {
                    path.classList.add('country-path');
                    
                    // Remove any existing attributes
                    path.removeAttribute('fill');
                    path.removeAttribute('stroke');
                    path.removeAttribute('stroke-width');
                    
                    // Golden styling like state map - use setProperty to ensure it sticks
                    path.style.setProperty('fill', 'rgba(255, 215, 0, 0.1)', 'important');
                    path.style.setProperty('stroke', '#FFD700', 'important');
                    path.style.setProperty('stroke-width', '1.5', 'important');
                    path.style.cursor = 'pointer';
                    path.style.transition = 'all 0.3s ease';
                    
                    // Add hover effects - use setProperty with !important to override CSS
                    path.addEventListener('mouseenter', () => {
                        if (!path.classList.contains('selected')) {
                            path.style.setProperty('fill', 'rgba(255, 215, 0, 0.4)', 'important');
                            path.style.setProperty('stroke', '#FFFFFF', 'important');
                            path.style.setProperty('stroke-width', '2.5', 'important');
                            path.style.setProperty('filter', 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))', 'important');
                            // Removed scale transform
                        }
                    });
                    
                    path.addEventListener('mouseleave', () => {
                        if (!path.classList.contains('selected')) {
                            path.style.setProperty('fill', 'rgba(255, 215, 0, 0.1)', 'important');
                            path.style.setProperty('stroke', '#FFD700', 'important');
                            path.style.setProperty('stroke-width', '1.5', 'important');
                            path.style.setProperty('filter', 'none', 'important');
                            // Removed scale transform
                        }
                    });
                    
                    path.addEventListener('click', () => {
                        // Try multiple ways to get country ID (case-insensitive)
                        let countryId = path.id || 
                                       path.getAttribute('name') || 
                                       path.getAttribute('data-name') ||
                                       path.getAttribute('data-id');
                        
                        // Normalize country ID (uppercase, trim)
                        if (countryId) {
                            countryId = countryId.toString().toUpperCase().trim();
                        }
                        
                        if (path.classList.contains('selected')) {
                            // Deselect country
                            path.classList.remove('selected');
                            path.style.setProperty('fill', 'rgba(255, 215, 0, 0.1)', 'important');
                            path.style.setProperty('stroke', '#FFD700', 'important');
                            path.style.setProperty('stroke-width', '1.5', 'important');
                            path.style.setProperty('filter', 'none', 'important');
                            // Removed scale transform
                            
                            this.selectedCountries = this.selectedCountries.filter(c => c !== countryId);
                        } else {
                            // Select country
                            path.classList.add('selected');
                            path.style.setProperty('fill', 'rgba(255, 215, 0, 0.7)', 'important');
                            path.style.setProperty('stroke', '#FFA500', 'important');
                            path.style.setProperty('stroke-width', '3', 'important');
                            path.style.setProperty('filter', 'drop-shadow(0 0 20px rgba(255, 215, 0, 1))', 'important');
                            
                            this.selectedCountries.push(countryId);
                        }
                        
                        // Show continue button
                        this.showContinentCountryContinueButton(continent);
                    });
                });
                
                // Add Russia map to wrapper
                mapsWrapper.appendChild(russiaSvgElement);
                
                // Add wrapper to container
                continentMapDiv.appendChild(mapsWrapper);
                mapContainer.insertBefore(continentMapDiv, mapContainer.querySelector('#continueContainer'));
            })
            .catch(err => {
                console.error('Error loading Russia map:', err);
                // If Russia map fails to load, just show Europe map
                continentMapDiv.appendChild(europeSvgElement);
                mapContainer.insertBefore(continentMapDiv, mapContainer.querySelector('#continueContainer'));
            });
    },

    
    showContinentCountryContinueButton(continent) {
        const continueContainer = document.getElementById('continueContainer');
        if (!continueContainer) {
            console.error('Continue container not found in showContinentCountryContinueButton!');
            // Try to create it if it doesn't exist
            const mapContainer = document.getElementById('mapContainer');
            if (mapContainer) {
                const newContainer = document.createElement('div');
                newContainer.id = 'continueContainer';
                newContainer.style.display = 'block';
                newContainer.style.visibility = 'visible';
                mapContainer.appendChild(newContainer);
                return this.showContinentCountryContinueButton(continent); // Retry
            }
            return;
        }
        
        // Ensure container is visible
        continueContainer.style.display = 'block';
        continueContainer.style.visibility = 'visible';
        
        let existingBtn = continueContainer.querySelector('.continent-country-continue-btn');
        
        if (!existingBtn) {
            const continueBtn = document.createElement('button');
            continueBtn.className = 'slider-continue-btn continent-country-continue-btn';
            continueBtn.textContent = this.selectedCountries.length > 0 
                ? `Continue (${this.selectedCountries.length} selected)` 
                : 'Continue';
            continueBtn.style.display = 'block'; // Ensure button is visible
            continueBtn.style.visibility = 'visible';
            continueBtn.style.position = 'relative'; // Ensure it's in normal flow
            continueBtn.style.zIndex = '1000'; // Ensure it's on top
            continueBtn.addEventListener('click', () => {
                // Store selected countries for this continent
                if (!this.answers.country_selections) {
                    this.answers.country_selections = {};
                }
                this.answers.country_selections[continent] = Array.isArray(this.selectedCountries) ? this.selectedCountries : [];
                
                // Move to next continent or next question
                this.currentContinentIndex++;
                if (this.currentContinentIndex < this.selectedContinents.length) {
                    this.showContinentCountryQuestion(this.selectedContinents[this.currentContinentIndex]);
                } else {
                    // All continents processed, move to next quiz question
                    this.hideMap();
                    document.getElementById('characterThinking').style.display = 'block';
                    setTimeout(() => {
                        this.currentQuestion++;
                        if (this.currentQuestion < this.questions.length) {
                            this.showQuestion();
                            history.pushState({page: 'quiz', question: this.currentQuestion}, '', `#quiz-${this.currentQuestion}`);
                        } else {
                            this.makeGuess();
                        }
                        document.getElementById('characterThinking').style.display = 'none';
                    }, 800);
                }
            });
            continueContainer.appendChild(continueBtn);
        } else {
            existingBtn.textContent = this.selectedCountries.length > 0 
                ? `Continue (${this.selectedCountries.length} selected)` 
                : 'Continue';
            existingBtn.style.display = 'block'; // Ensure button is visible
            existingBtn.style.visibility = 'visible';
        }
    },


    toggleContinent(continentId, buttonElement) {
        if (this.selectedContinents.includes(continentId)) {
            // Deselect continent
            this.selectedContinents = this.selectedContinents.filter(c => c !== continentId);
            buttonElement.classList.remove('selected');
        } else {
            // Select continent
            this.selectedContinents.push(continentId);
            buttonElement.classList.add('selected');
        }
        
        // Show continue button if any continents are selected
        if (this.selectedContinents.length > 0) {
            this.showContinentContinueButton();
        } else {
            this.hideContinentContinueButton();
        }
    },


    showContinentContinueButton() {
        const continueContainer = document.getElementById('continueContainer');
        if (continueContainer && !continueContainer.querySelector('.slider-continue-btn')) {
            const continueBtn = document.createElement('button');
            continueBtn.className = 'slider-continue-btn';
            continueBtn.textContent = `Continue to Country Selection (${this.selectedContinents.length} selected)`;
            continueBtn.addEventListener('click', () => {
                this.showCountryMapsForContinents();
            });
            continueContainer.appendChild(continueBtn);
        } else if (continueContainer && continueContainer.querySelector('.slider-continue-btn')) {
            const existingBtn = continueContainer.querySelector('.slider-continue-btn');
            existingBtn.textContent = `Continue to Country Selection (${this.selectedContinents.length} selected)`;
        }
    },


    hideContinentContinueButton() {
        const continueContainer = document.getElementById('continueContainer');
        if (continueContainer) {
            const existingBtn = continueContainer.querySelector('.slider-continue-btn');
            if (existingBtn) {
                existingBtn.remove();
            }
        }
    },


    showCountryMapsForContinents() {
        const mapContainer = document.getElementById('mapContainer');
        if (!mapContainer) {
            console.error("Map container not found!");
            return;
        }

        // Clear the container and show country maps for each selected continent
        mapContainer.innerHTML = '<div id="continueContainer"></div>';
        
        // Initialize selected countries as an array of objects with continent and countries
        this.selectedCountries = this.selectedContinents.map(continent => ({
            continent: continent,
            countries: []
        }));
        
        // Show continue button immediately (allows skipping by clicking continue with no selection)
        this.showCountryMapsContinueButton();
        
        // Create a container for all country maps
        const countryMapsContainer = document.createElement('div');
        countryMapsContainer.className = 'country-maps-container';
        
        // Show country maps for each selected continent
        this.selectedContinents.forEach((continent, index) => {
            const continentMapDiv = document.createElement('div');
            continentMapDiv.className = 'continent-map-section';
            continentMapDiv.innerHTML = `
                <h3 class="continent-map-title">Select countries in ${this.getContinentDisplayName(continent)}</h3>
                <div class="continent-map-${continent}" data-continent="${continent}"></div>
            `;
            countryMapsContainer.appendChild(continentMapDiv);
        });
        
        mapContainer.appendChild(countryMapsContainer);
        
        // Load country maps for each continent
        this.selectedContinents.forEach(continent => {
            this.loadContinentMap(continent);
        });
    },


    getContinentDisplayName(continentId) {
        const names = {
            'north-america': 'North America',
            'central-america': 'Central America',
            'south-america': 'South America', 
            'europe': 'Europe',
            'africa': 'Africa',
            'asia': 'Asia',
            'oceania': 'Oceania'
        };
        return names[continentId] || continentId;
    },


    loadContinentMap(continent) {
        const continentMapDiv = document.querySelector(`.continent-map-${continent}`);
        if (!continentMapDiv) {
            console.error(`Continent map div not found for ${continent}`);
            return;
        }

        // Map continent IDs to their SVG file names
        const continentMapFiles = {
            'north-america': '../assets/north-america.svg',
            'central-america': '../assets/central-america.svg',
            'south-america': '../assets/south-america.svg',
            'europe': '../assets/europe.svg',
            'africa': '../assets/africa.svg',
            'asia': '../assets/asia.svg',
            'oceania': '../assets/Blank_Map_Oceania.svg'
        };

        const mapFile = continentMapFiles[continent];
        if (!mapFile) {
            console.error(`No map file found for continent: ${continent}`);
            return;
        }

        // Handle PNG files differently
        if (mapFile.endsWith('.png')) {
            const img = document.createElement('img');
            img.src = mapFile;
            img.className = 'continent-map-image';
            img.style.width = '100%';
            img.style.height = 'auto';
            img.style.maxWidth = '100%';
            img.style.display = 'block';
            img.style.margin = '0 auto';
            img.style.overflow = 'visible';
            continentMapDiv.appendChild(img);
            return;
        }

        // Handle SVG files
        fetch(mapFile)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                return response.text();
            })
            .then(svgText => {
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
                const svgElement = svgDoc.documentElement;

                svgElement.classList.add('continent-map-svg');
                svgElement.style.width = '100%';
                svgElement.style.height = 'auto';
                svgElement.style.maxWidth = '100%';
                svgElement.style.display = 'block';
                svgElement.style.margin = '0 auto';
                svgElement.style.overflow = 'visible';

                // Apply country selection styling to paths
                svgElement.querySelectorAll('path').forEach(path => {
                    path.classList.add('country-path');
                    
                    // Add golden styling similar to state map
                    path.style.fill = 'rgba(255, 255, 255, 0.08)';
                    path.style.stroke = '#FFD700';
                    path.style.strokeWidth = '1.5';
                    path.style.cursor = 'pointer';
                    path.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                    path.style.filter = 'drop-shadow(0 0 3px rgba(255, 215, 0, 0.2))';
                    
                    // Add hover effects
                    path.addEventListener('mouseenter', () => {
                        if (!path.classList.contains('selected')) {
                            path.style.fill = 'rgba(255, 215, 0, 0.4)';
                            path.style.stroke = '#FFFFFF';
                            path.style.strokeWidth = '2.5';
                            path.style.filter = 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))';
                            // Removed scale transform
                        }
                    });
                    
                    path.addEventListener('mouseleave', () => {
                        if (!path.classList.contains('selected')) {
                            path.style.fill = 'rgba(255, 255, 255, 0.08)';
                            path.style.stroke = '#FFD700';
                            path.style.strokeWidth = '1.5';
                            path.style.filter = 'drop-shadow(0 0 3px rgba(255, 215, 0, 0.2))';
                            // Removed scale transform
                        }
                    });
                    
                    path.addEventListener('click', () => {
                        const countryId = path.id || path.getAttribute('name') || path.getAttribute('data-name');
                        
                        // Find the continent data for this map
                        const continentData = this.selectedCountries.find(c => c.continent === continent);
                        if (!continentData) {
                            console.error(`Continent data not found for ${continent}`);
                            return;
                        }
                        
                        if (path.classList.contains('selected')) {
                            // Deselect country
                            path.classList.remove('selected');
                            path.style.fill = 'rgba(255, 255, 255, 0.08)';
                            path.style.stroke = '#FFD700';
                            path.style.strokeWidth = '1.5';
                            path.style.filter = 'drop-shadow(0 0 3px rgba(255, 215, 0, 0.2))';
                            
                            // Remove from selected countries for this continent
                            continentData.countries = continentData.countries.filter(c => c !== countryId);
                        } else {
                            // Select country
                            path.classList.add('selected');
                            path.style.fill = 'rgba(255, 215, 0, 0.7)';
                            path.style.stroke = '#FFA500';
                            path.style.strokeWidth = '3';
                            path.style.filter = 'drop-shadow(0 0 20px rgba(255, 215, 0, 1))';
                            path.style.animation = 'statePulse 2s ease-in-out infinite';
                            // Add to selected countries for this continent
                            if (!continentData.countries.includes(countryId)) {
                                continentData.countries.push(countryId);
                            }
                        }
                        
                        // Update continue button text (button should always be visible)
                        this.showCountryMapsContinueButton();
                    });
                });

                continentMapDiv.appendChild(svgElement);
            })
            .catch(err => {
                console.error(`Error loading ${continent} map:`, err);
                continentMapDiv.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #FFD700;">
                        <h3>🗺️ Map Loading Error</h3>
                        <p>Unable to load the ${this.getContinentDisplayName(continent)} map.</p>
                    </div>
                `;
            });
    },


    showCountryMapsContinueButton() {
        const continueContainer = document.getElementById('continueContainer');
        if (!continueContainer) {
            console.error('Continue container not found!');
            return;
        }
        
        // Calculate total selected countries across all continents
        let totalSelected = 0;
        if (Array.isArray(this.selectedCountries) && this.selectedCountries.length > 0) {
            // Check if it's the new format (array of objects) or old format (flat array)
            if (typeof this.selectedCountries[0] === 'object' && this.selectedCountries[0].continent) {
                // New format: array of objects with continent and countries
                this.selectedCountries.forEach(continentData => {
                    if (continentData.countries) {
                        totalSelected += continentData.countries.length;
                    }
                });
            } else {
                // Old format: flat array of country IDs
                totalSelected = this.selectedCountries.length;
            }
        }
        
        const buttonText = totalSelected > 0 
            ? `Continue (${totalSelected} countries selected)` 
            : 'Continue';
        
        let continueBtn = continueContainer.querySelector('.slider-continue-btn');
        if (!continueBtn) {
            continueBtn = document.createElement('button');
            continueBtn.className = 'slider-continue-btn';
            continueBtn.textContent = buttonText;
            continueBtn.style.display = 'block'; // Ensure button is visible
            continueBtn.style.visibility = 'visible';
            continueBtn.addEventListener('click', () => {
                // Store country selections for all continents
                if (!this.answers.country_selections) {
                    this.answers.country_selections = {};
                }
                
                // Store selections per continent
                if (Array.isArray(this.selectedCountries) && this.selectedCountries.length > 0) {
                    if (typeof this.selectedCountries[0] === 'object' && this.selectedCountries[0].continent) {
                        // New format: array of objects
                        this.selectedCountries.forEach(continentData => {
                            this.answers.country_selections[continentData.continent] = continentData.countries || [];
                        });
                    } else {
                        // Old format: flat array - store for all selected continents
                        this.selectedContinents.forEach(continent => {
                            this.answers.country_selections[continent] = [...this.selectedCountries];
                        });
                    }
                } else {
                    // No countries selected - store empty arrays
                    this.selectedContinents.forEach(continent => {
                        this.answers.country_selections[continent] = [];
                    });
                }
                
                // Move to next quiz question
                this.hideMap();
                document.getElementById('characterThinking').style.display = 'block';
                setTimeout(() => {
                    this.currentQuestion++;
                    if (this.currentQuestion < this.questions.length) {
                        this.showQuestion();
                        history.pushState({page: 'quiz', question: this.currentQuestion}, '', `#quiz-${this.currentQuestion}`);
                    } else {
                        this.makeGuess();
                    }
                    document.getElementById('characterThinking').style.display = 'none';
                }, 800);
            });
            continueContainer.appendChild(continueBtn);
        } else {
            continueBtn.textContent = buttonText;
            continueBtn.style.display = 'block'; // Ensure button is visible
            continueBtn.style.visibility = 'visible';
        }
    },


    hideCountryMapsContinueButton() {
        const continueContainer = document.getElementById('continueContainer');
        if (continueContainer) {
            const existingBtn = continueContainer.querySelector('.slider-continue-btn');
            if (existingBtn) {
                existingBtn.remove();
            }
        }
    },

       
    showMapContinueButton() {
        const continueContainer = document.getElementById('continueContainer');
        if (continueContainer && !continueContainer.querySelector('.slider-continue-btn')) {
            // Use the same continue button system as sliders
            const continueBtn = document.createElement('button');
            continueBtn.className = 'slider-continue-btn';
            continueBtn.textContent = 'Continue';
            continueBtn.addEventListener('click', () => {
                if (this.selectedState) {
                    this.selectAnswer(this.selectedState);
                }
            });
            continueContainer.appendChild(continueBtn);
        }
    },

    
    hideMap() {
        const mapContainer = document.getElementById('mapContainer');
        if (mapContainer) {
            mapContainer.style.display = 'none';
        }
    },

    
    createBasicMap(container) {
        
        // Create a simple list of major states
        const majorStates = [
            { code: 'CA', name: 'California' },
            { code: 'TX', name: 'Texas' },
            { code: 'FL', name: 'Florida' },
            { code: 'NY', name: 'New York' },
            { code: 'IL', name: 'Illinois' },
            { code: 'PA', name: 'Pennsylvania' },
            { code: 'OH', name: 'Ohio' },
            { code: 'GA', name: 'Georgia' },
            { code: 'NC', name: 'North Carolina' },
            { code: 'MI', name: 'Michigan' },
            { code: 'NJ', name: 'New Jersey' },
            { code: 'VA', name: 'Virginia' },
            { code: 'WA', name: 'Washington' },
            { code: 'AZ', name: 'Arizona' },
            { code: 'MA', name: 'Massachusetts' },
            { code: 'TN', name: 'Tennessee' },
            { code: 'IN', name: 'Indiana' },
            { code: 'MO', name: 'Missouri' },
            { code: 'MD', name: 'Maryland' },
            { code: 'WI', name: 'Wisconsin' }
        ];
        
        const stateList = document.createElement('div');
        stateList.className = 'state-list';
        stateList.style.cssText = `
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 15px; 
            padding: 20px; 
            background: linear-gradient(145deg, #1A0033, #4A148C);
            border-radius: 20px;
            box-shadow: 0 12px 35px rgba(138, 43, 226, 0.5);
            border: 2px solid rgba(255, 215, 0, 0.3);
            margin: 20px auto;
            max-width: 800px;
        `;
        
        majorStates.forEach(state => {
            const button = document.createElement('button');
            button.className = 'state-option';
            button.textContent = `${state.code} - ${state.name}`;
            button.style.cssText = `
                padding: 15px; 
                background: rgba(255, 215, 0, 0.1); 
                border: 2px solid #FFD700; 
                color: white; 
                border-radius: 8px; 
                cursor: pointer; 
                font-family: 'Bohemian Typewriter', monospace;
                font-size: 14px;
                font-weight: bold;
                transition: all 0.3s ease;
                min-height: 50px;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
            `;
            
            // Add hover effects
            button.addEventListener('mouseenter', () => {
                button.style.background = 'rgba(255, 215, 0, 0.3)';
                button.style.borderColor = '#FFFFFF';
                button.style.transform = 'scale(1.05)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.background = 'rgba(255, 215, 0, 0.1)';
                button.style.borderColor = '#FFD700';
                button.style.transform = 'scale(1)';
            });
            
            button.addEventListener('click', () => this.selectAnswer(state.code));
            stateList.appendChild(button);
        });
        
        container.appendChild(stateList);
        
        // Force a visual update and make sure it's visible
        stateList.style.display = 'grid';
        stateList.style.visibility = 'visible';
        stateList.style.opacity = '1';
        stateList.style.position = 'relative';
        stateList.style.zIndex = '10';
        
        // Also ensure the container is visible
        container.style.display = 'block';
        container.style.visibility = 'visible';
        container.style.opacity = '1';
    },

    
    createSimpleMap(container) {
        const mapGrid = document.createElement('div');
        mapGrid.className = 'map-grid';
        
        // All 50 US states in a simple grid format
        const states = [
            'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
            'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
            'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
            'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
            'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
        ];
        
        // Create state buttons
        states.forEach(stateCode => {
            const button = document.createElement('button');
            button.className = 'state-button';
            button.setAttribute('data-state', stateCode);
            button.textContent = stateCode;
            button.title = this.getStateName(stateCode);
            button.addEventListener('click', () => this.selectAnswer(stateCode));
            mapGrid.appendChild(button);
        });
        container.appendChild(mapGrid);
    },

    
    getStateName(code) {
        const stateNames = {
            'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
            'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
            'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
            'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
            'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
            'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
            'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
            'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
            'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
            'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
        };
        return stateNames[code] || code;
    }
});
