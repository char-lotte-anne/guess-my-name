/**
 * Showing results, collecting feedback, and sharing.
 *
 * This is where a submission is assembled and sent to /api/create-issue for
 * training. Feedback is optional at every step: the quiz works fully without
 * it, and nothing is sent unless the person gives a name or says whether the
 * guess was right.
 */

Object.assign(NameGuessingQuiz.prototype, {

    displayTopGuesses(guesses) {
        log.debug(`📺 displayTopGuesses: Displaying ${guesses ? guesses.length : 0} guesses`);
        
        if (!guesses || guesses.length === 0) {
            console.error('❌ No guesses to display!');
            // Show error message or fallback
            for (let i = 1; i <= 5; i++) {
                const guessElement = document.getElementById(`guess${i}`);
                if (guessElement) {
                    guessElement.style.display = 'none';
                }
            }
            return;
        }
        
        for (let i = 0; i < 5; i++) {
            const guessElement = document.getElementById(`guess${i + 1}`);
            const nameElement = document.getElementById(`guessName${i + 1}`);
            const confidenceElement = document.getElementById(`confidence${i + 1}`);
            
            if (!guessElement || !nameElement || !confidenceElement) {
                console.error(`❌ Missing DOM elements for guess ${i + 1}`);
                continue;
            }
            
            if (i < guesses.length && guesses[i] && guesses[i].name) {
                const guess = guesses[i];
                let confidence = guess.confidence;
                
                // If confidence wasn't calculated, calculate it now
                if (confidence === undefined || confidence === null) {
                    confidence = this.calculateConfidenceForGuess(guess, i + 1, guesses);
                }
                
                // If we still don't have confidence, normalize score as fallback
                if (confidence === undefined || confidence === null) {
                    if (guess.score !== undefined && guess.score !== null) {
                        // Normalize score: find max score in all guesses to normalize against
                        const maxScore = guesses.length > 0 
                            ? Math.max(...guesses.map(g => g.score || 0))
                            : guess.score;
                        
                        if (maxScore > 0) {
                            // Normalize to 0-1, then scale to 40-95 range
                            const normalizedScore = guess.score / maxScore;
                            confidence = 40 + (normalizedScore * 55); // Range: 40-95%
                        } else {
                            confidence = 50; // Default
                        }
                        
                        // Apply rank penalty
                        confidence -= (i * 8);
                    } else {
                        // Last resort: simple rank-based confidence
                        confidence = 75 - (i * 8);
                    }
                }
                
                // Ensure confidence is in valid range
                confidence = Math.min(100, Math.max(20, Math.round(confidence)));
                
                nameElement.textContent = guess.name;
                confidenceElement.textContent = `${confidence}%`;
                guessElement.style.display = 'flex';
                log.debug(`✅ Displaying guess ${i + 1}: ${guess.name} (${confidence}%)`);
            } else {
                guessElement.style.display = 'none';
            }
        }
    },


    handleNameSubmit() {
        const realNameInput = document.getElementById('realNameInput');
        const realName = realNameInput ? realNameInput.value.trim() : '';
        
        if (realName) {
            // Sanitize the name to prevent XSS attacks
            const sanitizedName = SecurityUtils.sanitizeInput(realName, 50);
            
            // Store the sanitized name for training
            this.realName = sanitizedName;
            
            // If we have quiz answers, send training data to GitHub
            // This allows name-only submissions to contribute to global learning
            if (this.answers && Object.keys(this.answers).length > 0) {
                const trainingData = {
                    timestamp: Date.now(),
                    answers: this.answers,
                    realName: sanitizedName,
                    success: undefined // No success/failure feedback yet, just name provided
                };
                
                this.storeTrainingData(trainingData);
            }
            
            // Update the UI to show the name was submitted
            // Use textContent instead of innerHTML to prevent XSS
            const nameInputSection = document.getElementById('nameInputSection');
            if (nameInputSection) {
                nameInputSection.innerHTML = '';
                
                const prompt = document.createElement('p');
                prompt.className = 'name-input-prompt';
                prompt.textContent = `✨ Thank you! The spirits have learned from your name: `;
                
                const strong = document.createElement('strong');
                strong.textContent = sanitizedName;
                prompt.appendChild(strong);
                
                const note = document.createElement('p');
                note.className = 'name-input-note';
                note.textContent = 'This will help improve future predictions!';
                
                nameInputSection.appendChild(prompt);
                nameInputSection.appendChild(note);
            }
        }
    },


    handleCorrect() {
        // Log successful prediction for ML training
        this.logPredictionSuccess();
        
        document.getElementById('resultSection').style.display = 'none';
        document.getElementById('finalSection').style.display = 'block';
        this.hideMap();
        
        document.getElementById('finalTitle').textContent = '🔮 The spirits have spoken! 🔮';
        document.getElementById('finalMessage').textContent = '✨ My crystal ball never lies! ✨';
        document.getElementById('finalMouth').className = 'mouth happy';
        
        // Update browser history
        history.pushState({page: 'final'}, '', '#final');
    },


    handleWrong() {
        // Log failed prediction for ML training
        this.logPredictionFailure();
        
        document.getElementById('resultSection').style.display = 'none';
        document.getElementById('finalSection').style.display = 'block';
        this.hideMap();
        
        document.getElementById('finalTitle').textContent = '🌫️ The vision was unclear... 🌫️';
        document.getElementById('finalMessage').textContent = '🔮 The spirits are being mysterious today... 🔮';
        document.getElementById('finalMouth').className = 'mouth';
        
        // Update browser history
        history.pushState({page: 'final'}, '', '#final');
    },


    logPredictionSuccess() {
        // Store successful prediction data for ML training
        const trainingData = {
            timestamp: Date.now(),
            answers: this.answers,
            correctGuess: this.currentGuesses[0], // Top guess was correct
            realName: this.realName || null, // Include real name if provided
            success: true
        };
        
        this.storeTrainingData(trainingData);
    },


    logPredictionFailure() {
        // Store failed prediction data for ML training
        const trainingData = {
            timestamp: Date.now(),
            answers: this.answers,
            guesses: this.currentGuesses,
            realName: this.realName || null, // Include real name if provided
            success: false
        };
        
        this.storeTrainingData(trainingData);
    },


    storeTrainingData(data) {
        // Store training data in localStorage
        try {
            const existingData = JSON.parse(localStorage.getItem('nameGuessingTrainingData') || '[]');
            existingData.push(data);
            
            // Keep only last 1000 entries to prevent localStorage from getting too large
            if (existingData.length > 1000) {
                existingData.splice(0, existingData.length - 1000);
            }
            
            localStorage.setItem('nameGuessingTrainingData', JSON.stringify(existingData));
        } catch (error) {
            console.error('Error storing training data:', error);
        }
        
        // Also send training data to GitHub for global model training
        // This happens asynchronously and doesn't block the UI
        this.sendTrainingDataToGitHub(data).catch(error => {
            // Log error but don't break user experience if GitHub API is unavailable
            console.warn('⚠️ Could not send training data to GitHub:', error.message);
            console.warn('This is okay - your data is still stored locally for local learning.');
        });
    },

    
    /**
     * Send training data to GitHub for global model training
     * Uses a serverless function (Vercel) to authenticate with GitHub and create issues
     * 
     * Data is stored as GitHub Issues, then processed by GitHub Actions
     * Includes first names if users voluntarily provide them (for better model training)
     * Note: This data will be visible in public GitHub Issues
     */
    async sendTrainingDataToGitHub(data) {
        // Only send if user provided feedback (success or failure) or a name
        if (data.success === undefined && !data.realName) {
            return; // Skip if no meaningful feedback
        }
        
        // Create training data payload
        // Includes realName if provided (users voluntarily submit this for training)
        // Note: This data will be visible in public GitHub Issues
        const trainingData = {
            timestamp: data.timestamp || Date.now(),
            answers: data.answers,
            success: data.success,
            // Include realName if user provided it (voluntary submission for training)
            ...(data.realName ? { realName: data.realName } : {}),
            // Include correctGuess only if success is true
            ...(data.success === true && data.correctGuess ? { correctGuess: data.correctGuess } : {}),
            // Include guesses only if success is false
            ...(data.success === false && data.guesses ? { guesses: data.guesses } : {})
            // Note: Only first names are included (no last names, emails, or other identifying info)
        };
        
        // The serverless function encrypts this payload (AES-256-GCM) and builds
        // the issue itself. We deliberately do NOT construct the title or body
        // here: the old title embedded the outcome in the clear, which leaks
        // information about the person even when the body is encrypted.
        try {
            log.debug('📤 Sending training data to GitHub via serverless function...', trainingData);
            
            // Determine API endpoint - use relative path if on same domain, or absolute if on different domain
            // This works for both Vercel deployments and local development
            const apiEndpoint = '/api/create-issue';
            
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    trainingData,
                    labels: ['training-data', 'auto-generated']
                })
            });
            
            const responseData = await response.json();
            
            if (!response.ok) {
                throw new Error(responseData.message || `Server error: ${response.status} ${response.statusText}`);
            }
            
            log.debug('✅ Training data sent to GitHub successfully!', responseData.issue);
            return responseData.issue;
        } catch (error) {
            console.error('❌ Failed to send training data to GitHub:', error);
            // Re-throw to be caught by caller
            throw error;
        }
    },


    async handleShare() {
        if (!this.currentGuesses || this.currentGuesses.length === 0) {
            alert('No results to share yet!');
            return;
        }

        const shareBtn = document.getElementById('shareBtn');
        const originalText = shareBtn.textContent;
        
        try {
            // Show loading state
            shareBtn.disabled = true;
            shareBtn.textContent = '✨ Creating graphic... ✨';
            
            const topName = this.currentGuesses[0].name;
            
            // Generate the shareable graphic
            const imageBlob = await this.generateShareableGraphic(topName);
            
            // Check if we're on mobile
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            
            if (isMobile) {
                // For mobile, try to share to Instagram Story using deep link
                this.shareToInstagramStory(imageBlob);
            } else {
                // For desktop, download the image
                this.downloadImage(imageBlob, `my-name-should-have-been-${topName.toLowerCase()}.png`);
            }
            
            // Reset button
            shareBtn.disabled = false;
            shareBtn.textContent = originalText;
        } catch (error) {
            console.error('Error generating shareable graphic:', error);
            alert('Sorry, there was an error generating the shareable graphic. Please try again.');
            
            // Reset button
            shareBtn.disabled = false;
            shareBtn.textContent = originalText;
        }
    },


    async generateShareableGraphic(name) {
        // Wait for fonts to load
        await document.fonts.ready;
        
        // Get the name definition from the database
        const definition = this.enhancedNameDatabase.getNameDefinition(name);
        
        // Instagram Story dimensions: 1080x1920 (9:16 aspect ratio)
        const width = 1080;
        const height = 1920;
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Background gradient (mystical dark theme)
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(0.3, '#1a0033');
        gradient.addColorStop(0.7, '#000000');
        gradient.addColorStop(1, '#0a1a0a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add mystical glow effects
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const radius = 100 + Math.random() * 200;
            const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            glowGradient.addColorStop(0, `rgba(0, 255, 136, ${0.1 + Math.random() * 0.1})`);
            glowGradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
            ctx.fillStyle = glowGradient;
            ctx.fillRect(0, 0, width, height);
        }
        
        // Add decorative elements (stars/sparkles)
        ctx.fillStyle = '#00ff88';
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = 1 + Math.random() * 3;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Main text: "The spirits said my name should have been..."
        ctx.fillStyle = '#00ff88';
        ctx.font = 'bold 48px "Bohemian Typewriter", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const textLines = [
            'The spirits said',
            'my name should',
            'have been...'
        ];
        
        let yPos = height * 0.25;
        textLines.forEach((line, index) => {
            // Add text shadow/glow effect
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 20;
            ctx.fillText(line, width / 2, yPos);
            ctx.shadowBlur = 0;
            yPos += 80;
        });
        
        // Calculate name position (centered in the decorative border area)
        const nameY = height * 0.5;
        const borderY = nameY - 100; // Border starts 100px above name center
        const borderHeight = 200;
        
        // Add decorative border/ornament (centered around the name)
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 4;
        ctx.setLineDash([20, 10]);
        ctx.strokeRect(80, borderY, width - 160, borderHeight);
        ctx.setLineDash([]);
        
        // The name (larger, more prominent) - positioned in center of border
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 120px "Bohemian Typewriter", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add glow effect for the name
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 30;
        ctx.fillText(name.toUpperCase(), width / 2, nameY);
        ctx.shadowBlur = 0;
        
        // Decorative separator line between name and definition
        const separatorY = nameY + 140;
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(width * 0.2, separatorY);
        ctx.lineTo(width * 0.8, separatorY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Name definition (below the name)
        const definitionY = nameY + 200;
        ctx.fillStyle = '#00ff88';
        ctx.font = '36px "Bohemian Typewriter", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Split definition into lines if it's too long
        const maxWidth = width - 160;
        const words = definition.split(' ');
        let line = '';
        let lines = [];
        
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && i > 0) {
                lines.push(line.trim());
                line = words[i] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line.trim());
        
        // Draw definition lines
        let definitionStartY = definitionY;
        lines.forEach((line, index) => {
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 15;
            ctx.fillText(line, width / 2, definitionStartY + (index * 50));
            ctx.shadowBlur = 0;
        });
        
        // Footer text
        const footerY = definitionStartY + (lines.length * 50) + 80;
        ctx.fillStyle = '#00ff88';
        ctx.font = '32px "Bohemian Typewriter", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🔮 Madame Mystique\'s Crystal Ball 🔮', width / 2, footerY);
        
        // Website URL
        ctx.fillStyle = 'rgba(0, 255, 136, 0.7)';
        ctx.font = '24px "Bohemian Typewriter", monospace';
        ctx.fillText('guess-my-name-chi.vercel.app', width / 2, footerY + 50);
        
        // Convert canvas to blob
        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/png');
        });
    },


    shareToInstagramStory(imageBlob) {
        // Create a temporary URL for the image
        const imageUrl = URL.createObjectURL(imageBlob);
        
        // Create a temporary anchor element to download the image first
        // Instagram Stories requires the image to be in the user's photo library
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `my-name-should-have-been.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // After a short delay, try to open Instagram Story camera
        // The image should now be the most recent in the user's gallery
        setTimeout(() => {
            // Try Instagram Stories deep link
            const instagramUrl = 'instagram://story-camera';
            window.location.href = instagramUrl;
            
            // Fallback: if Instagram app is not installed, show instructions
            setTimeout(() => {
                alert('Image saved! Open Instagram, swipe to create a story, and select the image from your gallery.');
            }, 1000);
        }, 500);
        
        // Clean up the URL after a delay
        setTimeout(() => {
            URL.revokeObjectURL(imageUrl);
        }, 10000);
    },


    downloadImage(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 100);
        
        alert('Image downloaded! You can now share it to Instagram Story from your photos.');
    }
});
