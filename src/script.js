/**
 * Entry point. Everything else is defined in the quiz-*.js files loaded before
 * this one; the class and its mixins must all be in place before the
 * DOMContentLoaded handler below constructs anything.
 */

// Global function for the "Try the Crystal Ball" button
function showQuiz() {
    const quiz = window.quizInstance;
    if (quiz) {
        // Hide all sections
        document.getElementById('aboutSection').style.display = 'none';
        document.getElementById('howItWorksSection').style.display = 'none';
        document.getElementById('contactSection').style.display = 'none';
        document.getElementById('resultSection').style.display = 'none';
        document.getElementById('finalSection').style.display = 'none';
        
        // Show hero section
        document.querySelector('.hero').style.display = 'block';
        
        // Hide map when returning to hero
        quiz.hideMap();
        
        // Reset quiz state
        quiz.resetQuiz();
    }
}

// Initialize the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize mystical background
    new MysticalBackground();
    
    const quiz = new NameGuessingQuiz();
    window.quizInstance = quiz; // Make quiz instance globally available
    
    // Helper function to check ML training status (available in console)
    window.checkMLStatus = async function() {
        log.debug('🔍 Checking ML Training Status...\n');
        
        // Check localStorage training data
        const trainingData = quiz.getTrainingData();
        const successfulExamples = trainingData.filter(d => d.success === true && d.correctGuess).length;
        log.debug(`📊 Local Training Data:`);
        log.debug(`   - Total examples: ${trainingData.length}`);
        log.debug(`   - Successful examples (with correct guesses): ${successfulExamples}`);
        log.debug(`   - Need 10+ successful examples to train\n`);
        
        // Check model status
        log.debug(`🧠 Model Status:`);
        log.debug(`   - Model loaded: ${quiz.mlModel.isModelLoaded}`);
        log.debug(`   - Global model loaded: ${quiz.mlModel.globalModelLoaded}`);
        log.debug(`   - Name index size: ${Object.keys(quiz.mlModel.nameIndex).length}\n`);
        
        // Check GitHub Issues
        log.debug(`🌐 Checking GitHub Issues for training data...`);
        try {
            const response = await fetch('https://api.github.com/repos/char-lotte-anne/guess-my-name/issues?labels=training-data&state=open&per_page=5');
            if (response.ok) {
                const issues = await response.json();
                log.debug(`   - Found ${issues.length} open training-data issues`);
                if (issues.length > 0) {
                    log.debug(`   - Latest issue: #${issues[0].number} - ${issues[0].title}`);
                    log.debug(`   - View all: https://github.com/char-lotte-anne/guess-my-name/issues?q=label%3Atraining-data`);
                }
            } else {
                log.debug(`   - Could not fetch issues (status: ${response.status})`);
            }
        } catch (error) {
            log.debug(`   - Error checking issues: ${error.message}`);
        }
    };
    
    // Handle browser back button
    window.addEventListener('popstate', (event) => {
        const hash = window.location.hash;
        
        if (hash.startsWith('#quiz-')) {
            // Extract question number from hash
            const questionNum = parseInt(hash.split('-')[1]);
            if (!isNaN(questionNum) && questionNum >= 0 && questionNum < quiz.questions.length) {
                // Show quiz section and navigate to specific question
                document.querySelector('.hero').style.display = 'none';
                document.getElementById('quizSection').style.display = 'block';
                document.getElementById('resultSection').style.display = 'none';
                document.getElementById('finalSection').style.display = 'none';
                
                // Set current question and show it
                quiz.currentQuestion = questionNum;
                quiz.showQuestion();
                
                // Don't reset answers - preserve them for proper navigation
            } else {
                // Invalid question number, go to hero
                document.querySelector('.hero').style.display = 'block';
                document.getElementById('quizSection').style.display = 'none';
                document.getElementById('resultSection').style.display = 'none';
                document.getElementById('finalSection').style.display = 'none';
                
                // Hide map when leaving quiz
                quiz.hideMap();
                
                // Reset quiz state
                quiz.currentQuestion = 0;
                quiz.answers = {};
                quiz.updateProgress();
            }
        } else if (hash === '#result') {
            document.querySelector('.hero').style.display = 'none';
            document.getElementById('quizSection').style.display = 'none';
            document.getElementById('resultSection').style.display = 'block';
            document.getElementById('finalSection').style.display = 'none';
            quiz.hideMap();
        } else if (hash === '#final') {
            document.querySelector('.hero').style.display = 'none';
            document.getElementById('quizSection').style.display = 'none';
            document.getElementById('resultSection').style.display = 'none';
            document.getElementById('finalSection').style.display = 'block';
            document.getElementById('howItWorksSection').style.display = 'none';
            quiz.hideMap();
        } else if (hash === '#how-it-works') {
            document.querySelector('.hero').style.display = 'none';
            document.getElementById('aboutSection').style.display = 'none';
            document.getElementById('contactSection').style.display = 'none';
            document.getElementById('quizSection').style.display = 'none';
            document.getElementById('resultSection').style.display = 'none';
            document.getElementById('finalSection').style.display = 'none';
            document.getElementById('howItWorksSection').style.display = 'block';
            quiz.hideMap();
        } else if (hash === '#about') {
            document.querySelector('.hero').style.display = 'none';
            document.getElementById('howItWorksSection').style.display = 'none';
            document.getElementById('contactSection').style.display = 'none';
            document.getElementById('quizSection').style.display = 'none';
            document.getElementById('resultSection').style.display = 'none';
            document.getElementById('finalSection').style.display = 'none';
            document.getElementById('aboutSection').style.display = 'block';
            quiz.hideMap();
        } else if (hash === '#contact') {
            document.querySelector('.hero').style.display = 'none';
            document.getElementById('aboutSection').style.display = 'none';
            document.getElementById('howItWorksSection').style.display = 'none';
            document.getElementById('quizSection').style.display = 'none';
            document.getElementById('resultSection').style.display = 'none';
            document.getElementById('finalSection').style.display = 'none';
            document.getElementById('contactSection').style.display = 'block';
            quiz.hideMap();
        } else {
            // Default to hero section
            document.querySelector('.hero').style.display = 'block';
            document.getElementById('aboutSection').style.display = 'none';
            document.getElementById('howItWorksSection').style.display = 'none';
            document.getElementById('contactSection').style.display = 'none';
            document.getElementById('quizSection').style.display = 'none';
            document.getElementById('resultSection').style.display = 'none';
            document.getElementById('finalSection').style.display = 'none';
            
            // Hide map when on hero
            quiz.hideMap();
            
            // Reset quiz state
            quiz.currentQuestion = 0;
            quiz.answers = {};
            quiz.updateProgress();
        }
    });
    
    // ============================================
    // FEEDBACK FORM FUNCTIONALITY
    // ============================================
    
    /**
     * EmailJS Configuration
     * NOTE: These are PUBLIC keys meant for client-side use.
     * EmailJS public keys are safe to expose in client-side code.
     * They are rate-limited and can only send emails through your configured service.
     * For production, consider using environment variables or a config file.
     */
    const EMAILJS_PUBLIC_KEY = 'qZJaIaRbwRvm5WYrB';
    const EMAILJS_SERVICE_ID = 'service_2adxbmy'; 
    const EMAILJS_TEMPLATE_ID = 'template_s6ss6lg';
    
    // Initialize EmailJS
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }
    
    // Add event listeners for "back to quiz" buttons (replacing inline onclick handlers)
    document.querySelectorAll('#backToQuizBtn1, #backToQuizBtn2, #backToQuizBtn3').forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                if (typeof showQuiz === 'function') {
                    showQuiz();
                }
            });
        }
    });
    
    // Feedback modal elements
    const feedbackFloatBtn = document.getElementById('feedbackFloatBtn');
    const feedbackModal = document.getElementById('feedbackModal');
    const feedbackCloseBtn = document.getElementById('feedbackCloseBtn');
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackStatus = document.getElementById('feedbackStatus');
    const feedbackSubmitBtn = document.getElementById('feedbackSubmitBtn');
    
    // Open feedback modal
    feedbackFloatBtn.addEventListener('click', () => {
        feedbackModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    });
    
    // Close feedback modal
    function closeFeedbackModal() {
        feedbackModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Re-enable scrolling
        feedbackForm.reset();
        feedbackStatus.textContent = '';
        feedbackStatus.className = 'feedback-status';
    }
    
    feedbackCloseBtn.addEventListener('click', closeFeedbackModal);
    
    // Close modal when clicking outside of it
    feedbackModal.addEventListener('click', (e) => {
        if (e.target === feedbackModal) {
            closeFeedbackModal();
        }
    });
    
    // Handle form submission
    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Rate limiting: Allow max 5 submissions per hour per user
        const rateLimitKey = 'feedbackFormRateLimit';
        const rateLimit = SecurityUtils.checkRateLimit(rateLimitKey, 5, 60 * 60 * 1000); // 5 per hour
        
        if (!rateLimit.allowed) {
            const timeRemaining = SecurityUtils.formatTimeRemaining(rateLimit.retryAfter);
            feedbackStatus.textContent = `⏱️ Rate limit exceeded. Please try again in ${timeRemaining}.`;
            feedbackStatus.className = 'feedback-status feedback-status-warning';
            return;
        }
        
        // Get and sanitize form values to prevent XSS and injection attacks
        const nameInput = document.getElementById('feedbackName');
        const emailInput = document.getElementById('feedbackEmail');
        const typeInput = document.getElementById('feedbackType');
        const messageInput = document.getElementById('feedbackMessage');
        
        // Sanitize all inputs
        const name = nameInput ? SecurityUtils.sanitizeInput(nameInput.value, 100) || 'Anonymous' : 'Anonymous';
        const email = emailInput ? SecurityUtils.sanitizeInput(emailInput.value, 200) || 'No email provided' : 'No email provided';
        const type = typeInput ? SecurityUtils.sanitizeInput(typeInput.value, 50) : '';
        const message = messageInput ? SecurityUtils.sanitizeInput(messageInput.value, 2000) : '';
        
        // Validate required fields
        if (!type || !message) {
            feedbackStatus.textContent = '⚠️ Please fill in all required fields.';
            feedbackStatus.className = 'feedback-status feedback-status-warning';
            return;
        }
        
        // Disable submit button
        feedbackSubmitBtn.disabled = true;
        feedbackSubmitBtn.textContent = '✨ Sending... ✨';
        
        // Show loading status
        feedbackStatus.textContent = '🔮 Sending your message through the mystical realm...';
        feedbackStatus.className = 'feedback-status feedback-status-loading';
        
        // Check if EmailJS is configured
        if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
            // If EmailJS is not configured, show instructions
            feedbackStatus.textContent = '⚠️ EmailJS is not configured yet. Please check the console for setup instructions.';
            feedbackStatus.className = 'feedback-status feedback-status-warning';
            // Log sanitized feedback (safe to log since it's already sanitized)
            log.debug(`
================================================================================
FEEDBACK RECEIVED (EmailJS not configured):
================================================================================
Name: ${name}
Email: ${email}
Type: ${type}
Message: ${message.substring(0, 500)}${message.length > 500 ? '...' : ''}
--------------------------------------------------------------------------------
To enable email functionality:
1. Sign up at https://www.emailjs.com/ (free tier available)
2. Create an email service
3. Create an email template with these placeholders:
   - {{from_name}}
   - {{from_email}}
   - {{feedback_type}}
   - {{message}}
4. Replace these values in script.js:
   - EMAILJS_PUBLIC_KEY (your public key)
   - EMAILJS_SERVICE_ID (your service ID)
   - EMAILJS_TEMPLATE_ID (your template ID)
================================================================================
            `);
            
            feedbackSubmitBtn.disabled = false;
            feedbackSubmitBtn.textContent = '✨ Send Feedback ✨';
            
            return;
        }
        
        try {
            // Send email using EmailJS
            const response = await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                {
                    from_name: name,
                    from_email: email,
                    feedback_type: type,
                    message: message,
                    to_email: 'charlottelf@protonmail.com'
                }
            );
            
            log.debug('Feedback sent successfully!', response);
            
            // Show success message
            feedbackStatus.textContent = '✨ Thank you! Your feedback has been sent successfully! ✨';
            feedbackStatus.className = 'feedback-status feedback-status-success';
            
            // Reset form after 2 seconds
            setTimeout(() => {
                closeFeedbackModal();
            }, 2000);
            
        } catch (error) {
            console.error('Failed to send feedback:', error);
            
            // Show error message
            feedbackStatus.textContent = '❌ Oops! Something went wrong. Please try again or email charlottelf@protonmail.com directly.';
            feedbackStatus.className = 'feedback-status feedback-status-error';
            
            // Re-enable submit button
            feedbackSubmitBtn.disabled = false;
            feedbackSubmitBtn.textContent = '✨ Send Feedback ✨';
        }
    });
});
