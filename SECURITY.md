# Security Review & Best Practices

This document outlines the security measures implemented in this project and best practices for maintaining security.

## Security Measures Implemented

### 1. XSS (Cross-Site Scripting) Prevention

- **Input Sanitization**: All user inputs are sanitized using the `SecurityUtils` class before being displayed or stored.
- **Safe DOM Manipulation**: User-generated content is inserted using `textContent` instead of `innerHTML` where possible.
- **HTML Escaping**: The `SecurityUtils.escapeHtml()` function escapes all HTML special characters (`<`, `>`, `&`, `"`, `'`).

### 2. Content Security Policy (CSP)

A Content Security Policy header has been added to `index.html` to help prevent XSS attacks by restricting which resources can be loaded and executed.

**Current CSP Policy:**
```
default-src 'self';
script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data:;
connect-src 'self' https://api.emailjs.com;
```

**Note:** The `'unsafe-inline'` directive is used for scripts and styles. For production, consider:
- Moving inline scripts to external files
- Using nonces or hashes for inline scripts/styles
- Further restricting the CSP policy

### 3. Input Validation

- **Length Limits**: All user inputs have maximum length limits enforced:
  - Name: 50 characters
  - Email: 200 characters
  - Feedback message: 2000 characters
- **Type Checking**: Inputs are validated to ensure they are strings before processing.
- **Required Field Validation**: Required form fields are validated before submission.

### 4. EmailJS Configuration

- **Public Keys**: EmailJS public keys are safe to expose in client-side code. They are:
  - Rate-limited by EmailJS
  - Restricted to your configured service
  - Cannot be used to access your account or other services
- **Documentation**: Keys are clearly documented as public keys in the code.

### 5. Data Privacy

- **Local Storage Only**: All user data is stored locally in the browser using `localStorage`.
- **No Server-Side Storage**: No personal information is sent to external servers (except EmailJS for feedback).
- **Optional Data Collection**: Name input is optional and clearly marked as such.

## Security Best Practices for Contributors

### When Adding New Features

1. **Always Sanitize User Input**: Use `SecurityUtils.sanitizeInput()` for any user-provided data.
2. **Use Safe DOM Methods**: Prefer `textContent` over `innerHTML` for user-generated content.
3. **Validate Input Length**: Set appropriate maximum lengths for all inputs.
4. **Test for XSS**: Test inputs with HTML/JavaScript payloads like `<script>alert('XSS')</script>`.

### Code Review Checklist

- [ ] All user inputs are sanitized before use
- [ ] No `innerHTML` with user data (use `textContent` or sanitize first)
- [ ] Input lengths are validated
- [ ] Error messages don't expose sensitive information
- [ ] No hardcoded secrets or private keys
- [ ] External resources use HTTPS

## Additional Security Measures

### Rate Limiting

- **Feedback Form**: Client-side rate limiting implemented
  - Maximum 5 submissions per hour per user
  - Tracks attempts in localStorage with automatic cleanup
  - User-friendly error messages with time remaining
  - Prevents abuse and spam submissions

### Content Security Policy Improvements

- **Removed 'unsafe-inline' for scripts**: All inline event handlers (onclick) have been removed
- **Event Listeners**: All JavaScript event handlers now use proper event listeners instead of inline handlers
- **Style CSP**: 'unsafe-inline' still required for styles due to inline style attributes in HTML (can be improved by moving to CSS classes)

## Known Limitations

1. **CSP 'unsafe-inline' for styles**: Still required due to inline style attributes in HTML. Can be improved by:
   - Moving inline styles to CSS classes
   - Using CSS custom properties
   - Removing inline style attributes
2. **Client-Side Rate Limiting**: Rate limiting is client-side only (localStorage). Determined users can bypass by clearing localStorage. For production, consider server-side rate limiting.
3. **Local Storage**: Data stored in localStorage can be accessed by any script on the same origin.

## Reporting Security Issues

If you discover a security vulnerability, please email: charlottelf@protonmail.com

**Do not** open a public GitHub issue for security vulnerabilities.

## References

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [EmailJS Security Documentation](https://www.emailjs.com/docs/security/)

