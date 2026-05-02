# Security Guide - Beginner Friendly

## Overview
This guide explains all security features implemented in your PMS project.

## 🔐 Security Features Implemented

### 1. Password Security (bcrypt)

**What it is:** Passwords are NEVER stored as plain text. They're hashed (scrambled) using bcrypt.

**How it works:**
```javascript
// When user signs up or changes password:
User enters: "myPassword123"
System stores: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"

// When user logs in:
User enters: "myPassword123"
System compares the hash → Matches? Login successful!
```

**Files:**
- `models/AdminAgentModel.js` - Auto-hashes passwords before saving
- `services/auth.service.js` - Compares passwords securely

**Why it matters:** If database is hacked, attackers can't read passwords!

---

### 2. Rate Limiting

**What it is:** Limits how many requests one person can make in a time period.

**Rules:**
- General API: 100 requests per 15 minutes
- Login: 5 attempts per 15 minutes
- User creation: 10 per hour

**Example:**
```
User tries to login with wrong password 5 times
→ Blocked for 15 minutes
→ Prevents "brute force" password guessing
```

**Files:**
- `middlewares/security.middleware.js` - Rate limit rules
- `app.js` - Applied to routes

**Why it matters:** Stop attackers from trying thousands of passwords!

---

### 3. Security Headers (Helmet)

**What it is:** Special instructions sent to browsers to be more secure.

**What it does:**
- Prevents clickjacking (hiding malicious site in iframe)
- Stops MIME sniffing attacks
- Forces secure connections
- Blocks XSS attacks

**Files:**
- `middlewares/security.middleware.js` - Helmet configuration
- `app.js` - Applied to all requests

**Why it matters:** Browsers follow these rules to protect your users!

---

### 4. MongoDB Injection Protection

**What it is:** Prevents attackers from manipulating database queries.

**Example attack (prevented):**
```javascript
// Attacker tries to send:
{
  username: { $gt: "" },  // This means "any username"
  password: { $gt: "" }   // This means "any password"
}

// Our protection:
System removes $ and . characters
→ Attack fails! ✓
```

**Files:**
- `middlewares/security.middleware.js` - Sanitization
- `app.js` - Applied to all inputs

**Why it matters:** Prevents database hacks!

---

### 5. Input Validation

**What it is:** Check if user input is valid BEFORE processing it.

**Examples:**
```javascript
// Email validation
"test@example.com" ✓ Valid
"notanemail" ✗ Invalid

// Password strength
"weak" ✗ Too short
"StrongPass123" ✓ Valid

// Username format
"john.doe" ✓ Valid
"admin<script>" ✗ Contains dangerous characters
```

**Files:**
- `validators/auth.validator.js` - Validation rules
- `routes/auth.routes.js` - Applied to routes

**Why it matters:** Garbage in = garbage out!

---

### 6. XSS Protection

**What it is:** Prevents attackers from injecting malicious scripts.

**Example attack (prevented):**
```javascript
// Attacker tries to enter:
name: "<script>stealPasswords()</script>"

// Our protection:
System removes/escapes script tags
→ Stored as safe text ✓
```

**Files:**
- `middlewares/security.middleware.js` - Input sanitization
- All inputs automatically cleaned

**Why it matters:** Prevents code injection attacks!

---

### 7. User-Based Access Control

**What it is:** Users can only see their OWN data.

**How it works:**
```javascript
// User logs in
→ Gets JWT token with user ID

// User requests data
→ System filters by their ID

// Super Admin
→ Can see all data

// Regular User
→ Can only see data they created
```

**Files:**
- `middlewares/auth.middleware.js` - Extracts user from token
- All services - Filter by user ID

**Why it matters:** Data privacy and security!

---

## 🛡️ Security Best Practices Followed

###  Password Security
- Passwords hashed with bcrypt (10 rounds)
- Never store plain text passwords
- Password excluded from queries by default
- Strong password requirements (6+ chars, mixed case, numbers)

###  Authentication
- JWT tokens with expiration (24 hours)
- Token verification on protected routes
- User fetched from database (not just token)
- Deleted users can't access system

###  Authorization
- Role-based access control (superAdmin, admin, teamLeader, executive)
- Each route checks user permissions
- Users only see their own data
- Clear error messages for unauthorized access

###  Input Security
- All inputs validated
- Dangerous characters removed
- Length limits enforced
- Type checking

###  API Security
- Rate limiting prevents abuse
- Security headers protect browsers
- MongoDB injection blocked
- XSS attacks prevented

---

## 📖 How to Use Security Features

### For Developers

#### Protect a Route
```javascript
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

// Require authentication
router.get('/profile', authenticate, getProfile);

// Require specific role
router.post('/admin', authenticate, authorize('superAdmin', 'admin'), adminAction);
```

#### Add Validation
```javascript
import { loginValidator, handleValidationErrors } from '../validators/auth.validator.js';

router.post('/login', loginValidator, handleValidationErrors, loginController);
```

#### Access User in Controller
```javascript
export const getMyData = async (req, res) => {
  // User automatically attached by middleware
  const userId = req.user._id;
  const userRole = req.user.type;
  const userHospitals = req.user.hospitalNames;
  
  // Use for filtering
  const data = await Service.getData({ userId });
};
```

### For Testing

#### Test Password Hashing
```bash
# Create user
POST /api/users
{
  "username": "test",
  "password": "Test123"
}

# Check database - password should be hashed like:
# "$2b$10$..."
```

#### Test Rate Limiting
```bash
# Try to login 6 times quickly
# 6th attempt should be rejected with 429 status
```

#### Test Validation
```bash
# Try weak password
POST /api/users
{
  "password": "123"  # Too short - should fail
}
```

---

## 🚨 Security Checklist

Before going to production, verify:

- [ ] All passwords are hashed (check database - no plain text!)
- [ ] Rate limiting is working (test login attempts)
- [ ] Input validation catches bad data
- [ ] Users can only see their own data
- [ ] JWT secret is strong and secret (in .env file)
- [ ] HTTPS is enabled in production
- [ ] Security headers are applied
- [ ] Database credentials are secure

---

## 💡 Tips for Beginners

1. **Never disable security features** - They're there for a reason!
2. **Always validate user input** - Never trust what users send
3. **Use environment variables** - Don't hardcode secrets
4. **Test security** - Try to break your own app!
5. **Keep dependencies updated** - Run `npm audit` regularly
6. **Log security events** - Know when attacks happen
7. **Educate users** - Strong passwords matter!

---

## 📚 Learn More

- **bcrypt**: https://www.npmjs.com/package/bcrypt
- **JWT**: https://jwt.io/introduction
- **Helmet**: https://helmetjs.github.io/
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/

---

## Summary

Your application now has **production-level security**:
-  Passwords encrypted
-  Brute force protection
-  Injection attack prevention
-  XSS protection
-  Input validation
-  User isolation
-  Role-based access

**All with beginner-friendly, well-commented code!**
