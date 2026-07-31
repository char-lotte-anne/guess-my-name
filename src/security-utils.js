/**
 * Input sanitisation and client-side rate limiting.
 *
 * Client-side only: it stops accidental misuse and reflected-XSS via rendered
 * user input, but anything enforced here can be bypassed by talking to the API
 * directly. The serverless function is where real limits belong.
 */

/**
 * Security utility functions for input sanitization and rate limiting
 * Prevents XSS attacks by escaping HTML special characters
 */
const SecurityUtils = {
    /**
     * Escapes HTML special characters to prevent XSS attacks
     * @param {string} text - The text to escape
     * @returns {string} - Escaped text safe for HTML insertion
     */
    escapeHtml(text) {
        if (typeof text !== 'string') {
            return String(text);
        }
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    },
    
    /**
     * Sanitizes user input by trimming and escaping
     * @param {string} input - User input to sanitize
     * @param {number} maxLength - Maximum allowed length (default: 100)
     * @returns {string} - Sanitized input
     */
    sanitizeInput(input, maxLength = 100) {
        if (typeof input !== 'string') {
            return '';
        }
        return this.escapeHtml(input.trim().substring(0, maxLength));
    },
    
    /**
     * Rate limiting utility for preventing abuse
     * Tracks submissions in localStorage with a time window
     * @param {string} key - Storage key for rate limiting
     * @param {number} maxAttempts - Maximum attempts allowed (default: 5)
     * @param {number} windowMs - Time window in milliseconds (default: 1 hour)
     * @returns {Object} - { allowed: boolean, remaining: number, resetAt: number }
     */
    checkRateLimit(key, maxAttempts = 5, windowMs = 60 * 60 * 1000) {
        try {
            const now = Date.now();
            const stored = localStorage.getItem(key);
            let attempts = [];
            
            if (stored) {
                try {
                    attempts = JSON.parse(stored);
                } catch {
                    attempts = [];
                }
            }
            
            // Filter out attempts outside the time window
            attempts = attempts.filter(timestamp => (now - timestamp) < windowMs);
            
            if (attempts.length >= maxAttempts) {
                const oldestAttempt = Math.min(...attempts);
                const resetAt = oldestAttempt + windowMs;
                return {
                    allowed: false,
                    remaining: 0,
                    resetAt: resetAt,
                    retryAfter: Math.ceil((resetAt - now) / 1000) // seconds
                };
            }
            
            // Record this attempt
            attempts.push(now);
            localStorage.setItem(key, JSON.stringify(attempts));
            
            return {
                allowed: true,
                remaining: maxAttempts - attempts.length,
                resetAt: null
            };
        } catch (error) {
            console.error('Rate limit check error:', error);
            // On error, allow the request (fail open)
            return { allowed: true, remaining: maxAttempts, resetAt: null };
        }
    },
    
    /**
     * Formats time remaining for rate limit reset
     * @param {number} seconds - Seconds until reset
     * @returns {string} - Human-readable time string
     */
    formatTimeRemaining(seconds) {
        if (seconds < 60) {
            return `${seconds} second${seconds !== 1 ? 's' : ''}`;
        } else if (seconds < 3600) {
            const minutes = Math.ceil(seconds / 60);
            return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        } else {
            const hours = Math.ceil(seconds / 3600);
            return `${hours} hour${hours !== 1 ? 's' : ''}`;
        }
    }
};
