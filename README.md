# CPRG PHASE 2

Fixings Phase 1 based on Feedback: 

- SSL Safety: Implemented file existence checks for certificates to prevent unhandled server crashes during startup.
- Helmet Consolidation: Merged CSP directives into a single Helmet initialization for better middleware efficiency.
- CSP Hardening: Removed 'unsafe-inline' from stylesheets to mitigate XSS risks. 
- Static Asset Caching: Configured express.static with setHeaders to enforce a 24-hour cache policy for CSS files, aligning code with project documentation.
--------------------------------------------

# Phase 2: Authentication & Authorization

Part A: Designing a Secure Authentication System
Our approach to authentication prioritizes data integrity and resistance to common web vulnerabilities. We chose 'Local Authentication' combined with 'password hashing' to protect user credentials.

- Password Hashing: We implemented `bcryptjs` to hash passwords before storage. This ensures that even if the server data is compromised, raw passwords are never exposed. 
-  Salt Factor: We used a cost factor of 10 to balance security (making it computationally expensive for hackers to brute-force) and performance (ensuring a fast experience for legitimate users).
-  User Storage: Users are currently managed in a server-side array (`users[]`), which stores unique IDs, usernames, hashed passwords, and assigned roles.

---------------------------------------------

# Part C: Keeping Users Logged In Securely (JWT)

- Once a user logs in, we need a way to remember who they are without asking for their password on every single click. We chose JSON Web Tokens (JWT) to handle this.
- How Login Works: When you successfully log in, the server gives you a "digital ID card" (the JWT). This card holds your username and your role (like "admin" or "user"), so the server knows exactly what you’re allowed to see.
- Where We Store the Token: We decided to store these tokens in HttpOnly cookies rather than the browser's "localStorage."
   - If a hacker tries to run a malicious script on our page (XSS), they can easily steal things from localStorage. But with HttpOnly, the browser will hide the cookie from JavaScript, making it way harder to steal.
- Extra Layers of Protection: * Secure Flag: We made sure the token only travels over encrypted HTTPS connections.
- SameSite Strict: This tells the browser: "Only send this cookie if the request is coming directly from our website." This is our main defense against CSRF attacks, where a fake site tries to trick your browser into performing actions on our server.

--------------------------------------------------------

# Part B: Role-Based Access Control (The Gatekeeper)
- We don't want just anyone seeing private data, so we built a "Security Guard" system called Middleware.
- How it works: Whenever someone tries to visit a private page (like /profile), our authenticateJWT function stops them and asks: "Do you have a valid ID card (token) in your cookies?"
- Checking Roles: Not all users are equal. We added a second check called authorizeRoles. This ensures that even if you're logged in, you can't get into the /dashboard unless your ID card specifically says you are an Admin.
- Why this is better: It keeps our security logic in one place. Instead of writing "Are you logged in?" on every single page, we just tell the route to use our guard.

## Bug Fix: Securing the Gatekeeper
- During testing, I discovered that the /profile and /dashboard routes were still accessible even without a valid login.
- The Issue: While the authenticateJWT middleware was written, it hadn't been properly "applied" to the specific route definitions.
- The Fix: I updated the route signatures to include the middleware as a protective layer. Now, the server intercepts every request to these pages, checks for a valid cookie, and rejects anyone who isn't logged in.
- RBAC(role based access control) Enforcement: I also ensured the /dashboard specifically requires the admin role, successfully separating general user access from administrative data.