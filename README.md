# CPRG PHASE 2

Fixings Phase 1 based on Ashlyn's Feedback: 

- SSL Safety: Implemented file existence checks for certificates to prevent unhandled server crashes during startup.
- Helmet Consolidation: Merged CSP directives into a single Helmet initialization for better middleware efficiency.
- CSP Hardening: Removed 'unsafe-inline' from stylesheets to mitigate XSS risks. 
- Static Asset Caching: Configured express.static with setHeaders to enforce a 24-hour cache policy for CSS files, aligning code with project documentation.
--------------------------------------------

Phase 2: Authentication & Authorization

Part A: Secure Registration
Password Hashing: We implemented bcryptjs to hash passwords before storage. This ensures that even if the server data is compromised, raw passwords are never exposed.

Salt Rounds: We used a cost factor of 10 to balance security (making it slow for hackers to guess) and performance (making it fast for users).

Input Validation: The system checks for existing users to prevent duplicate account creation.