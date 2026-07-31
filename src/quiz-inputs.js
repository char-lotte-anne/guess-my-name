/**
 * Question input widgets: sliders and multi-selects.
 *
 * Multi-selects commit their value as an array via Array.from(selectedValues),
 * even when one option is chosen. Anything reading an answer downstream has to
 * cope with both shapes.
 */

Object.assign(NameGuessingQuiz.prototype, {

    createSlider(question, container) {
        // Create slider container
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'slider-container';
        
        // Create slider
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = question.min;
        slider.max = question.max;
        slider.step = question.step;
        slider.value = question.default;
        slider.className = 'slider';
        slider.id = `slider-${question.key}`;
        
        // Create value display
        const valueDisplay = document.createElement('div');
        valueDisplay.className = 'slider-value';
        valueDisplay.textContent = this.getSliderLabel(question, question.default);
        
        // Create labels container
        const labelsContainer = document.createElement('div');
        labelsContainer.className = 'slider-labels';
        
        // Use consistent absolute positioning for all sliders
        if (question.labels && question.labels.length > 0) {
            labelsContainer.style.position = 'relative';
            labelsContainer.style.minHeight = '30px';
            
            // Special handling for decade slider to align with actual years
            if (question.key === 'decade') {
                const decadeYears = [
                    { label: "🚂1900", year: 1900 },
                    { label: "🪖1930", year: 1930 },
                    { label: "🌈1960", year: 1960 },
                    { label: "🛹1990", year: 1990 },
                    { label: "📱2020", year: 2020 }
                ];
                decadeYears.forEach((item) => {
                    const labelElement = document.createElement('div');
                    labelElement.className = 'slider-label';
                    labelElement.textContent = item.label;
                    labelElement.style.position = 'absolute';
                    labelElement.style.transform = 'translateX(-50%)';
                    labelElement.style.whiteSpace = 'nowrap';
                    labelElement.style.textAlign = 'center';
                    
                    // Calculate position based on actual year values
                    const position = ((item.year - question.min) / (question.max - question.min)) * 100;
                    labelElement.style.left = `${position}%`;
                    labelElement.style.top = '0';
                    
                    labelsContainer.appendChild(labelElement);
                });
            } else {
                // Standard positioning for other sliders
                question.labels.forEach((label, index) => {
                    const labelElement = document.createElement('div');
                    labelElement.className = 'slider-label';
                    labelElement.textContent = label;
                    labelElement.style.position = 'absolute';
                    labelElement.style.transform = 'translateX(-50%)';
                    labelElement.style.whiteSpace = 'nowrap';
                    labelElement.style.textAlign = 'center';
                    
                    // Calculate position based on slider range
                    const position = (index / (question.labels.length - 1)) * 100;
                    labelElement.style.left = `${position}%`;
                    labelElement.style.top = '0';
                    
                    labelsContainer.appendChild(labelElement);
                });
            }
        }
        
        // Create continue button
        const continueBtn = document.createElement('button');
        continueBtn.className = 'slider-continue-btn';
        continueBtn.textContent = 'Continue';
        continueBtn.addEventListener('click', () => {
            const value = this.getSliderValue(question, parseInt(slider.value));
            this.selectAnswer(value);
        });
        
        // Update value display when slider changes
        slider.addEventListener('input', () => {
            valueDisplay.textContent = this.getSliderLabel(question, parseInt(slider.value));
        });
        
        // Handle slider completion
        // Remove auto-advance on slider change - only allow Continue button
        
        // Remove auto-submit timer - let users control when to submit
        
        sliderContainer.appendChild(valueDisplay);
        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(labelsContainer);
        sliderContainer.appendChild(continueBtn);
        container.appendChild(sliderContainer);
    },


    getSliderLabel(question, value) {
        if (question.key === 'length') {
            if (value <= 1.5) return '⚡ Short (2-4 letters)';
            if (value <= 2.5) return '💫 Medium (5-6 letters)';
            if (value <= 3.5) return '🌟 Long (7-9 letters)';
            return '✨ Extra Long (10+ letters)';
        } else if (question.key === 'popularity') {
            return question.labels[value - 1];
        } else if (question.key === 'family_tradition' || question.key === 'diversity_attitude') {
            // Map value (1-3) to label index
            if (value <= 1.5) return question.labels[0];
            if (value <= 2.5) return question.labels[1];
            return question.labels[2];
        }
        return value;
    },


    getSliderValue(question, value) {
        if (question.key === 'length') {
            if (value <= 1.5) return 'short';
            if (value <= 2.5) return 'medium';
            if (value <= 3.5) return 'long';
            return 'extra_long';
        } else if (question.key === 'popularity') {
            const values = ['uncommon', 'popular', 'very_popular'];
            return values[value - 1];
        }
        return value;
    },


    createMultiSelect(question, container) {
        // Create multi-select container
        const multiSelectContainer = document.createElement('div');
        multiSelectContainer.className = 'multi-select-container';
        
        // Create instruction text
        const instructionText = document.createElement('p');
        instructionText.className = 'multi-select-instruction';
        instructionText.textContent = 'Select all that apply:';
        instructionText.style.cssText = `
            color: #FFD700;
            font-size: 16px;
            margin-bottom: 15px;
            text-align: center;
            font-weight: 600;
        `;
        multiSelectContainer.appendChild(instructionText);
        
        // Create options grid
        const optionsGrid = document.createElement('div');
        optionsGrid.className = 'multi-select-grid';
        optionsGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        `;
        
        // Store selected values
        const selectedValues = new Set();
        
        // Create option buttons
        question.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'multi-select-option';
            button.textContent = option.text;
            button.dataset.value = option.value;
            button.style.cssText = `
                padding: 15px 20px;
                background: linear-gradient(145deg, #4A148C, #7B1FA2);
                border: 2px solid #FFD700;
                color: white;
                border-radius: 25px;
                cursor: pointer;
                font-family: 'Bohemian Typewriter', monospace;
                font-size: 16px;
                font-weight: bold;
                transition: all 0.3s ease;
                text-align: center;
                min-height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 15px rgba(138, 43, 226, 0.3);
            `;
            
            // Add hover effects
            button.addEventListener('mouseenter', () => {
                if (!button.classList.contains('selected')) {
                    button.style.background = 'linear-gradient(145deg, #7B1FA2, #9C27B0)';
                    button.style.borderColor = '#FFFFFF';
                    button.style.transform = 'scale(1.05)';
                    button.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.5)';
                }
            });
            
            button.addEventListener('mouseleave', () => {
                if (!button.classList.contains('selected')) {
                    button.style.background = 'linear-gradient(145deg, #4A148C, #7B1FA2)';
                    button.style.borderColor = '#FFD700';
                    button.style.transform = 'scale(1)';
                    button.style.boxShadow = '0 4px 15px rgba(138, 43, 226, 0.3)';
                }
            });
            
            // Add click handler
            button.addEventListener('click', () => {
                if (button.classList.contains('selected')) {
                    // Deselect
                    button.classList.remove('selected');
                    button.style.background = 'linear-gradient(145deg, #4A148C, #7B1FA2)';
                    button.style.borderColor = '#FFD700';
                    button.style.transform = 'scale(1)';
                    button.style.boxShadow = '0 4px 15px rgba(138, 43, 226, 0.3)';
                    button.style.filter = 'none';
                    selectedValues.delete(option.value);
                } else {
                    // Select
                    button.classList.add('selected');
                    button.style.background = 'linear-gradient(145deg, #FFD700, #FFA500)';
                    button.style.borderColor = '#FFFFFF';
                    button.style.transform = 'scale(1.05)';
                    button.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.8)';
                    button.style.filter = 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))';
                    selectedValues.add(option.value);
                }
                
                // Update continue button visibility
                this.updateMultiSelectContinueButton(continueBtn, selectedValues.size > 0);
            });
            
            optionsGrid.appendChild(button);
        });
        
        // Create continue button
        const continueBtn = document.createElement('button');
        continueBtn.className = 'multi-select-continue-btn';
        continueBtn.textContent = 'Continue';
        continueBtn.style.cssText = `
            padding: 12px 24px;
            background: linear-gradient(145deg, #1A0033, #4A148C);
            border: 2px solid #FFD700;
            color: #FFD700;
            border-radius: 25px;
            cursor: pointer;
            font-family: 'Great Warrior', sans-serif;
            font-size: 1rem;
            font-weight: normal;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            transition: all 0.3s ease;
            margin: 20px auto 0;
            display: block;
            opacity: 0.5;
            pointer-events: none;
            box-shadow: 0 6px 15px rgba(138, 43, 226, 0.4);
        `;
        
        // Initially disabled
        this.updateMultiSelectContinueButton(continueBtn, false);
        
        // Add continue button click handler
        continueBtn.addEventListener('click', () => {
            if (selectedValues.size > 0) {
                this.selectAnswer(Array.from(selectedValues));
            }
        });
        
        multiSelectContainer.appendChild(optionsGrid);
        multiSelectContainer.appendChild(continueBtn);
        container.appendChild(multiSelectContainer);
    },

    
    updateMultiSelectContinueButton(button, enabled) {
        if (enabled) {
            button.style.opacity = '1';
            button.style.pointerEvents = 'auto';
            button.style.background = 'linear-gradient(145deg, #1A0033, #4A148C)';
            button.style.borderColor = '#FFD700';
            button.style.color = '#FFD700';
            button.style.boxShadow = '0 6px 15px rgba(138, 43, 226, 0.4)';
            
            // Add hover effects
            button.addEventListener('mouseenter', () => {
                button.style.background = 'linear-gradient(145deg, #4A148C, #6A1B9A)';
                button.style.transform = 'translateY(-2px)';
                button.style.boxShadow = '0 8px 20px rgba(138, 43, 226, 0.6), 0 0 30px rgba(255, 215, 0, 0.5)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.background = 'linear-gradient(145deg, #1A0033, #4A148C)';
                button.style.transform = 'translateY(0)';
                button.style.boxShadow = '0 6px 15px rgba(138, 43, 226, 0.4)';
            });
        } else {
            button.style.opacity = '0.5';
            button.style.pointerEvents = 'none';
            button.style.background = 'linear-gradient(145deg, #0A001A, #2A0A4C)';
            button.style.borderColor = '#666';
            button.style.color = '#999';
            button.style.boxShadow = '0 2px 8px rgba(138, 43, 226, 0.1)';
            button.style.transform = 'translateY(0)';
        }
    },

    
    createSkipButton(container, skipCallback) {
        const continueContainer = document.getElementById('continueContainer');
        if (!continueContainer) {
            const newContainer = document.createElement('div');
            newContainer.id = 'continueContainer';
            container.appendChild(newContainer);
        }
        
        // Remove existing skip button if any
        const existingSkip = continueContainer.querySelector('.skip-btn');
        if (existingSkip) {
            existingSkip.remove();
        }
        
        const skipBtn = document.createElement('button');
        skipBtn.className = 'slider-continue-btn skip-btn';
        skipBtn.style.marginTop = '10px';
        skipBtn.style.background = 'linear-gradient(145deg, #4A148C, #6A1B9A)';
        skipBtn.textContent = '⏭️ Skip';
        skipBtn.addEventListener('click', skipCallback);
        
        continueContainer.appendChild(skipBtn);
    }
});
