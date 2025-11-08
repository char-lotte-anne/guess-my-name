# Feedback Form Setup Guide

Your website now has a feedback form! Here's how to set it up to receive emails:

## What I Added

1. **Floating Feedback Button** - A stylish purple button in the bottom-right corner
2. **Feedback Modal** - A mystical-themed popup form
3. **EmailJS Integration** - Free email service (no backend needed!)

## How to Complete the Setup (5 minutes)

### Step 1: Sign Up for EmailJS (Free)

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click "Sign Up" and create a free account
3. The free tier includes 200 emails/month (plenty for feedback!)

### Step 2: Create an Email Service

1. After logging in, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the instructions to connect your email
5. **Copy the Service ID** (you'll need this)

### Step 3: Create an Email Template

1. Go to "Email Templates"
2. Click "Create New Template"
3. Use this template content:

**Subject:**
```
New Feedback from Madame Mystique's Crystal Ball
```

**Body:**
```html
<h2>New Feedback Received</h2>

<p><strong>From:</strong> {{from_name}}</p>
<p><strong>Email:</strong> {{from_email}}</p>
<p><strong>Type:</strong> {{feedback_type}}</p>

<h3>Message:</h3>
<p>{{message}}</p>

<hr>
<p><em>Sent from your Crystal Ball website feedback form</em></p>
```

4. Set "To Email" to: `charlottelf@protonmail.com`
5. Save the template
6. **Copy the Template ID** (you'll need this)

### Step 4: Get Your Public Key

1. Go to "Account" → "General"
2. Find your **Public Key** (looks like: `abc123XYZ`)
3. **Copy the Public Key**

### Step 5: Update Your Code

Open `/src/script.js` and find these lines (around line 4401-4403):

```javascript
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Replace with your EmailJS public key
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID'; // Replace with your EmailJS service ID
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // Replace with your EmailJS template ID
```

Replace them with your actual keys:

```javascript
const EMAILJS_PUBLIC_KEY = 'abc123XYZ'; // Your actual public key
const EMAILJS_SERVICE_ID = 'service_xyz'; // Your actual service ID
const EMAILJS_TEMPLATE_ID = 'template_abc'; // Your actual template ID
```

### Step 6: Test It!

1. Refresh your website
2. Click the "💌 Feedback" button in the bottom-right corner
3. Fill out the form and submit
4. Check your email!

## Troubleshooting

### If emails aren't sending:

1. **Check the browser console** for error messages
2. **Verify your keys** are correct (no extra spaces)
3. **Check EmailJS dashboard** for blocked emails or quota limits
4. **Test the form** - if it's not configured yet, it will log feedback to the console

### If the form shows a warning:

Before you configure EmailJS, the form will:
- Show a warning message
- Log feedback to the browser console
- Still capture the user's message (just not email it)

## Features

### What Users Can Do:
- ✅ Submit feedback, bug reports, or suggestions
- ✅ Optionally include their name and email
- ✅ Choose feedback type (General, Bug, Suggestion, Praise)
- ✅ See confirmation when feedback is sent

### What You Get:
- 📧 Emails sent directly to `charlottelf@protonmail.com`
- 📊 All feedback details (name, email, type, message)
- 🆓 Free up to 200 emails/month
- 🔒 No backend server needed

## Styling

The feedback form matches your mystical theme:
- Purple gradient buttons
- Golden borders
- Smooth animations
- Mobile responsive
- Accessible design

## Privacy Note

You may want to update your privacy policy to mention that feedback submitted through the form will be sent via email. The form makes it clear that name and email are optional.

---

Need help? Email charlottelf@protonmail.com or check the EmailJS documentation at https://www.emailjs.com/docs/

