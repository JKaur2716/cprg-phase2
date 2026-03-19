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

---------------------------------------------------------

# Phase 2: Security Integration & Debugging Update

After building the core authentication engine, we performed a security audit and integration pass to connect the frontend and backend securely.

### 1. Fix: Gatekeeper Middleware Application
During testing, we discovered the `/profile` and `/dashboard` routes were still accessible without a login. 
- The Issue: The middleware was written but not "applied" to the route definitions. 
- The Fix: we updated the route signatures to include `authenticateJWT` and `authorizeRoles`. Now, the server intercepts every request, checks for a valid "ID card" (token) in the cookies, and rejects anyone without the correct permissions.

### 2. Fix: CSP Header Violations (Helmet)
Implementing `helmet` initially broke the UI by blocking external fonts and internal dashboard scripts.
- The Fix: We modified the Content Security Policy (CSP) to whitelist trusted Google Font domains and enabled `'unsafe-inline'` for local script execution. This restored the "Lexend" font and allowed our dashboard logic to run safely.

### 3. Dynamic Dashboard Integration
We replaced the static "Hello, Humann" placeholder with a dynamic greeting system to prove the backend connection.
- Implementation: Using a `fetch` request to the secured `/profile` endpoint, the frontend now retrieves the logged-in user’s name from the JWT cookie and updates the greeting in real-time (e.g., "Hello, Jaspreet!!!!").

### 4. Session Management (Logout)
- Implementation: We added a secure `/logout` route that clears the HttpOnly JWT cookie. This ensures user sessions are properly destroyed and verified that the security middleware rejects access immediately after a user signs out.

-------------------------------------------------------------

# Phase 2: Final Summary & Project Status

### The "Full Loop" Verification
To wrap up Phase 2, we successfully verified the entire secure data cycle:
1. The Handshake: The browser sends a POST request to `/login` with credentials.
2. The Verification: The server hashes the incoming password and compares it to our "Mock Database."
3. The Secure Pass: Once verified, the server issues a JWT inside a `HttpOnly` cookie.
4. The Protection: Our middleware (`authenticateJWT`) catches every request to the dashboard. If the cookie is missing or invalid, the user is blocked.
5. The Personalization: Once the "Gatekeeper" lets us in, our frontend `fetch` call retrieves the identity and updates the UI dynamically.

### Reflection: Lessons Learned
As beginners, this phase taught us that security is about layers. We learned that:
- Middleware is powerful: It acts as a single point of truth for security logic.
- CSP is strict for a reason: While debugging the "Helmet" violations was challenging, it taught us how browsers actually protect users from malicious scripts.
- Statelessness: Using JWTs allows our server to stay fast because it doesn't have to "remember" every session in a heavy database; it just trusts the "Digital ID Card" it signed.

### Final Verification Steps (For Demo)
To demonstrate the working prototype, we follow these steps:
1. Start the secure server (`node server.js`).
2. Register the user via the terminal (`curl` POST to `/register`).
3. Access the Login UI at `https://localhost:3000/login.html`.
4. Login to trigger the redirect and dynamic greeting.
5. Verify the `/logout` route clears the session and protects the data once again.

------------------------------------------------------------

### Phase 2 Reflection Checkpoints

### Part A: Authentication Reasoning**
We chose "Local Authentication" with Bcrypt hashing because it gives us total control over our user data and security. By using a cost factor of 10, we balanced the need for strong protection against brute-force attacks with a fast user experience. We also included a Google SSO entry point to align with modern usability standards, recognizing that many users prefer not to manage multiple passwords.

### Part B: Access Control Trade-offs
We structured our system using "Role-Based Access Control (RBAC)" with two levels: 'User' and 'Admin'. This keeps the system simple but secure. The main challenge was ensuring the middleware didn't create a "clunky" experience; we resolved this by using a central `authenticateJWT` guard that automatically checks permissions before the page even loads.

### Part C: Token Strategy & Security
We chose "HttpOnly Cookies" for token storage because they are invisible to JavaScript, effectively neutralizing "XSS (Cross-Site Scripting)" attacks that target `localStorage`. To balance security and usability, we implemented a "60-minute expiry" combined with a "Token Refresh system", ensuring users aren't constantly interrupted while working.

### Part D: Risk Mitigation**
To protect our users, we implemented:
- CSRF Protection: Using `SameSite: Strict` on cookies.
- Account Enumeration Defense: Using generic "Invalid username or password" messages so hackers can't "guess" which usernames exist.
- Brute Force Defense: Adding Rate Limiting to the login route.
- Session Fixation: We ensure that every login issues a brand new JWT, effectively "clearing" any old session state.

### Part E: Testing Strategy
We tested the system by simulating "Unauthorized" access attempts (trying to visit `/dashboard` without a cookie) and verified that the server correctly returned a "401 error". We also verified that "User" roles were successfully blocked from "Admin" routes with a "403 Forbidden" status.

# Phase 2: Final Summary" section:

Google SSO Placeholder: We implemented an /auth/google route and a corresponding UI button to demonstrate readiness for third-party integration, fulfilling the requirement for multi-provider authentication.

Session Continuity (Token Refresh): We developed a /refresh-token endpoint that allows the application to issue a new JWT before the 60-minute window closes, preventing user frustration without compromising security.

UI-Backend Synchronization: We successfully migrated the Google SSO styling to styles.css to maintain a clean separation of concerns, ensuring the HTML remains readable and focused on logic.