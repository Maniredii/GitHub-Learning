# Implementation Plan

## Overview

This implementation plan breaks down the GitQuest game into discrete, actionable coding tasks. Each task builds incrementally on previous work, starting with core infrastructure and progressing through the simulated Git engine, quest system, and user-facing features.

---

## Tasks

- [x] 1. Set up project structure and development environment
  - Initialize Node.js backend with Express and TypeScript configuration
  - Initialize React frontend with TypeScript and Vite/Create React App
  - Configure ESLint, Prettier, and Git hooks for code quality
  - Set up environment variable management (.env files)
  - Create basic folder structure: `/backend`, `/frontend`, `/shared`
  - _Requirements: 14.3, 14.4_

- [x] 2. Implement database schema and connection
  - Set up PostgreSQL database connection with connection pooling
  - Create database migration system (using Knex.js or TypeORM)
  - Define User table schema (id, username, email, password_hash, created_at, updated_at)
  - Define UserProgress table schema (user_id, xp, level, current_chapter, current_quest)
  - Define Achievement table schema (id, name, description, badge_icon)
  - Define UserAchievement junction table (user_id, achievement_id, earned_at)
  - Define QuestCompletion table schema (user_id, quest_id, completed_at, xp_earned)
  - Run initial migrations to create tables
  - _Requirements: 1.4, 1.5, 4.3, 6.2_

- [x] 3. Build authentication system
  - [x] 3.1 Implement user registration endpoint
    - Create POST /api/auth/register endpoint
    - Hash passwords using bcrypt
    - Validate email format and password strength
    - Initialize new users with "Apprentice Coder" rank and 0 XP
    - Return JWT token on successful registration
    - _Requirements: 1.2_

  - [x] 3.2 Implement user login endpoint
    - Create POST /api/auth/login endpoint
    - Verify credentials against database
    - Generate and return JWT token with user ID and username
    - _Requirements: 1.3_

  - [x] 3.3 Create authentication middleware
    - Implement JWT verification middleware for protected routes
    - Extract user information from token and attach to request object
    - Handle token expiration and invalid tokens
    - _Requirements: 1.3_

  - [x] 3.4 Write authentication tests
    - Test successful registration flow
    - Test duplicate email rejection
    - Test login with valid/invalid credentials
    - Test JWT token generation and verification
    - _Requirements: 1.2, 1.3_

- [x] 4. Implement Simulated Git Engine core
  - [x] 4.1 Create Git object models
    - Define Commit class (hash, message, author, timestamp, parent, tree)
    - Define Tree class (file structure snapshot)
    - Define Blob class (file content)
    - Define Branch class (name, commit_hash)
    - Define Repository class (working_directory, staging_area, commits, branches, HEAD)
    - _Requirements: 3.1_

  - [x] 4.2 Implement working directory and staging operations
    - Implement `git add <file>` - move files from working directory to staging area
    - Implement `git add .` - stage all modified files
    - Implement `git status` - show working directory and staging area state
    - Implement file modification tracking in working directory
    - _Requirements: 3.2_

  - [x] 4.3 Implement commit functionality
    - Implement `git commit -m "<message>"` - create commit from staged changes
    - Generate unique commit hashes (SHA-1 simulation or UUID)
    - Link commits to parent commits
    - Update HEAD pointer to new commit
    - Clear staging area after commit
    - _Requirements: 3.3_

  - [x] 4.4 Implement history and log operations
    - Implement `git log` - display commit history from HEAD
    - Implement `git log --oneline` - condensed commit history
    - Format output to match real Git log appearance
    - _Requirements: 3.4_

  - [x] 4.5 Write unit tests for Git engine core
    - Test commit creation and hash generation
    - Test staging and unstaging operations
    - Test commit history traversal
    - Test working directory state management
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 5. Implement branching and merging in Git engine
  - [x] 5.1 Implement branch operations
    - Implement `git branch` - list all branches
    - Implement `git branch <name>` - create new branch at current commit
    - Implement `git checkout <branch>` - switch to different branch
    - Implement `git checkout -b <name>` - create and switch to new branch
    - Update HEAD to point to current branch
    - _Requirements: 3.5, 3.7_
  - [x] 5.2 Implement merge functionality
    - Implement `git merge <branch>` - merge specified branch into current branch
    - Detect fast-forward merge scenarios
    - Create merge commits with two parents
    - Detect merge conflicts when same file modified in both branches
    - Generate conflict markers (<<<<<<, ======, >>>>>>) in conflicted files
    - _Requirements: 3.6_
  - [x] 5.3 Implement reset and checkout for files
    - Implement `git reset HEAD <file>` - unstage file
    - Implement `git reset --hard <commit>` - reset to specific commit
    - Implement `git checkout -- <file>` - discard working directory changes
    - _Requirements: 3.8_
  - [x] 5.4 Write tests for branching and merging
    - Test branch creation and switching
    - Test fast-forward merges
    - Test three-way merges
    - Test conflict detection
    - Test reset operations
    - _Requirements: 3.5, 3.6, 3.7, 3.8_

- [x] 6. Implement remote repository simulation
  - [x] 6.1 Create remote repository model
    - Define RemoteRepository class (name, url, commits, branches)
    - Implement remote repository storage in memory or database
    - Create mapping between local and remote branches
    - _Requirements: 9.1, 9.2_
  - [x] 6.2 Implement remote operations
    - Implement `git remote add <name> <url>` - register remote repository
    - Implement `git remote -v` - list configured remotes
    - Implement `git clone <url>` - create local copy of remote repository
    - Implement `git push <remote> <branch>` - upload commits to remote
    - Implement `git pull <remote> <branch>` - download and merge remote changes
    - Implement `git fetch <remote>` - download without merging
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  - [x] 6.3 Implement pull request simulation
    - Create fork operation that duplicates a remote repository
    - Implement pull request submission (store as database record)
    - Simulate pull request review and merge workflow
    - _Requirements: 9.5_
  - [x] 6.4 Write tests for remote operations
    - Test remote registration
    - Test clone operation
    - Test push and pull operations
    - Test fork and pull request workflow
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 7. Build Git command parser and executor
  - Create command parser that tokenizes Git command strings
  - Map command strings to Git engine methods
  - Implement command validation and error handling
  - Generate user-friendly error messages with hints (e.g., "Did you mean git commit?")
  - Create command execution API endpoint POST /api/git/execute
  - Return command output, repository state, and any errors
  - _Requirements: 2.2, 2.4, 11.4_

- [x] 8. Create quest content management system
  - [x] 8.1 Define quest data structure
    - Create Quest schema (id, chapter_id, title, narrative, objective, hints, validation_criteria)
    - Create Chapter schema (id, title, description, order, unlock_requirements)
    - Seed database with quest content from curriculum mapping
    - _Requirements: 4.1, 4.2_
  - [x] 8.2 Implement quest API endpoints
    - Create GET /api/quests - list all quests with lock status
    - Create GET /api/quests/:id - get specific quest details
    - Create GET /api/chapters - list all chapters
    - Create GET /api/chapters/:id/quests - get quests for a chapter
    - _Requirements: 4.1, 4.6_
  - [x] 8.3 Implement quest validation logic
    - Create validation functions that check if quest objectives are met
    - Compare expected repository state with actual state
    - Return success/failure with specific feedback
    - _Requirements: 4.3_
  - [x] 8.4 Write tests for quest system
    - Test quest retrieval and filtering
    - Test quest validation logic
    - Test unlock requirements
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 9. Implement XP and leveling system
  - Create XP calculation logic based on quest difficulty
  - Implement level-up thresholds (e.g., level 2 at 100 XP, level 3 at 250 XP)
  - Create POST /api/progress/complete-quest endpoint
  - Award XP and check for level-up on quest completion
  - Update user's current chapter and quest progress
  - Return updated XP, level, and any level-up notifications
  - _Requirements: 4.3, 4.4, 1.5_

- [-] 10. Build achievement system
  - [x] 10.1 Seed achievement definitions
    - Create achievement records in database ("First Blood", "Branch Master", etc.)
    - Define trigger conditions for each achievement
    - _Requirements: 6.1_
  - [x] 10.2 Implement achievement checking logic
    - Create achievement checker that evaluates conditions after each action
    - Check for "First Blood" on first commit
    - Check for "Branch Master" on first successful merge
    - Check for "Conflict Resolver" on first conflict resolution
    - Check for "Collaborator" on first pull request
    - Check for "Time Lord" on first rebase
    - _Requirements: 6.1, 6.2_
  - [x] 10.3 Create achievement API endpoints
    - Create POST /api/achievements/check - evaluate and award achievements
    - Create GET /api/achievements/user - get user's earned achievements
    - Return achievement data with badge icons and timestamps
    - _Requirements: 6.2, 6.3_
  - [x] 10.4 Write tests for achievement system
    - Test achievement trigger conditions
    - Test achievement awarding
    - Test duplicate achievement prevention
    - _Requirements: 6.1, 6.2_

- [x] 11. Implement boss battle system
  - [x] 11.1 Create boss battle scenarios
    - Define "The Corrupted Timeline" scenario with specific repository state
    - Define "The Convergence Conflict" scenario with pre-configured merge conflict
    - Store boss battle configurations in database or JSON files
    - _Requirements: 7.1, 7.2, 7.3_
  - [x] 11.2 Implement boss battle validation
    - Create validation logic for "Corrupted Timeline" (check if correct commit restored)
    - Create validation logic for "Convergence Conflict" (check if conflict properly resolved)
    - Award bonus XP on successful completion
    - Provide specific failure feedback
    - _Requirements: 7.4, 7.5_
  - [x] 11.3 Create boss battle API endpoints
    - Create GET /api/boss-battles/:id - get boss battle details and initial state
    - Create POST /api/boss-battles/:id/validate - check if boss battle completed
    - _Requirements: 7.1, 7.4_
  - [x] 11.4 Write tests for boss battles
    - Test boss battle initialization
    - Test victory conditions
    - Test failure conditions and feedback
    - _Requirements: 7.2, 7.3, 7.4, 7.5_

- [x] 12. Build frontend terminal component
  - [x] 12.1 Integrate xterm.js terminal emulator
    - Install and configure xterm.js library
    - Create TerminalComponent with xterm.js instance
    - Style terminal with game theme (colors, fonts)
    - _Requirements: 2.1_
  - [x] 12.2 Implement command input and execution
    - Capture user input from terminal
    - Send commands to backend API via POST /api/git/execute
    - Display command output in terminal
    - Handle loading states during command execution
    - _Requirements: 2.2, 2.3_
  - [x] 12.3 Add terminal features
    - Implement command history with up/down arrow navigation
    - Implement tab completion for common Git commands
    - Add terminal clear functionality
    - Display error messages with game-themed styling
    - _Requirements: 2.4, 2.5_
  - [x] 12.4 Write tests for terminal component
    - Test command input capture
    - Test command history navigation
    - Test output rendering
    - _Requirements: 2.1, 2.2, 2.5_

- [x] 13. Build frontend code editor component




  - [x] 13.1 Integrate Monaco Editor


    - Install and configure Monaco Editor library
    - Create EditorComponent wrapper
    - Configure syntax highlighting for common languages (JavaScript, Python, Markdown)
    - _Requirements: 8.1, 8.5_

  - [x] 13.2 Connect editor to Git engine

    - Load file content from simulated repository via API
    - Send file changes back to update working directory
    - Implement save functionality
    - _Requirements: 8.2, 8.3_
  - [x] 13.3 Implement conflict resolution UI



    - Detect and highlight conflict markers in editor
    - Provide UI buttons to accept current/incoming changes
    - Validate conflict resolution before allowing merge completion
    - _Requirements: 8.4_
  - [x] 13.4 Write tests for editor component








    - Test file loading and saving
    - Test conflict marker detection
    - Test conflict resolution actions
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 14. Build Git graph visualization component




  - [x] 14.1 Integrate gitgraph-js library


    - Install and configure gitgraph-js
    - Create GitGraphComponent wrapper
    - Style graph to match game theme
    - _Requirements: 10.1_
  - [x] 14.2 Render repository state as graph


    - Fetch commit history and branch structure from API
    - Convert repository state to gitgraph-js format
    - Display commits as nodes with messages
    - Display branches as colored lines
    - Highlight current HEAD position
    - _Requirements: 10.1, 10.2, 10.3, 10.5_
  - [x] 14.3 Implement real-time graph updates


    - Update graph when new commits are created
    - Update graph when branches are created or switched
    - Animate merge operations in graph
    - _Requirements: 10.2, 10.3, 10.4_

  - [x] 14.4 Write tests for graph component



    - Test graph rendering with various repository states
    - Test graph updates on state changes
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 15. Build quest UI components
  - [ ] 15.1 Create QuestView component
    - Display quest title and narrative text
    - Display learning objective
    - Show quest completion status
    - Render terminal, editor, and graph components as needed
    - _Requirements: 4.2_
  - [ ] 15.2 Create QuestList component
    - Display list of quests for current chapter
    - Show locked/unlocked status with visual indicators
    - Display XP rewards for each quest
    - Handle quest selection and navigation
    - _Requirements: 4.5, 4.6_
  - [ ] 15.3 Implement quest validation UI
    - Add "Check Progress" button to validate quest completion
    - Display success message and XP award on completion
    - Display specific feedback on failure
    - Automatically advance to next quest on success
    - _Requirements: 4.3_
  - [ ] 15.4 Write tests for quest UI components

    - Test quest rendering
    - Test quest navigation
    - Test validation feedback display
    - _Requirements: 4.2, 4.3, 4.5_

- [ ] 16. Build progress map component
  - [ ] 16.1 Create visual map design
    - Design SVG-based map with distinct regions for each chapter
    - Create visual themes for each region (Caves, Forests, Mountains, etc.)
    - Implement locked/unlocked visual states
    - _Requirements: 5.1, 5.5_
  - [ ] 16.2 Implement map interactivity
    - Make unlocked regions clickable
    - Navigate to chapter quest list on region click
    - Highlight current chapter location
    - Display tooltips with chapter names on hover
    - _Requirements: 5.2, 5.3, 5.4_
  - [ ] 16.3 Connect map to user progress
    - Fetch user progress from API
    - Update map visual state based on completed chapters
    - Unlock new regions as chapters are completed
    - _Requirements: 5.2, 4.6_
  - [ ] 16.4 Write tests for progress map

    - Test map rendering
    - Test region unlock logic
    - Test navigation on click
    - _Requirements: 5.1, 5.2, 5.4_

- [ ] 17. Build hint system
  - [ ] 17.1 Implement hint tracking
    - Track incorrect command attempts per quest
    - Store hint progression state (which hints have been shown)
    - _Requirements: 11.1_
  - [ ] 17.2 Create hint UI components
    - Add "Show Hint" button to quest interface
    - Display progressive hints (start vague, get more specific)
    - Show hint usage count and XP penalty warning
    - _Requirements: 11.2, 11.3_
  - [ ] 17.3 Implement automatic hint triggers
    - Trigger hint offer after 3 incorrect attempts
    - Display contextual hints based on error type
    - Provide command documentation links
    - _Requirements: 11.1, 11.4, 11.5_
  - [ ]\* 17.4 Write tests for hint system
    - Test hint triggering logic
    - Test XP penalty calculation
    - Test progressive hint display
    - _Requirements: 11.1, 11.2, 11.3_

- [ ] 18. Implement user profile and dashboard
  - Create ProfileView component displaying username, level, XP, and rank
  - Display earned achievement badges in grid layout
  - Show progress statistics (quests completed, chapters unlocked)
  - Create navigation to profile from main menu
  - Fetch user data from GET /api/users/profile endpoint
  - _Requirements: 1.4, 6.3_

- [ ] 19. Build authentication UI
  - [ ] 19.1 Create registration form
    - Build registration form with email, username, password fields
    - Implement client-side validation
    - Call POST /api/auth/register on submission
    - Store JWT token in localStorage on success
    - Redirect to game dashboard after registration
    - _Requirements: 1.1, 1.2_
  - [ ] 19.2 Create login form
    - Build login form with email/username and password fields
    - Call POST /api/auth/login on submission
    - Store JWT token and restore user progress
    - Redirect to last accessed quest or dashboard
    - _Requirements: 1.1, 1.3_
  - [ ] 19.3 Implement authentication state management
    - Create auth context/store for user state
    - Implement protected routes requiring authentication
    - Handle token expiration and auto-logout
    - _Requirements: 1.3_
  - [ ]\* 19.4 Write tests for authentication UI
    - Test registration form validation
    - Test login flow
    - Test protected route access
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 20. Implement freemium paywall
  - [ ] 20.1 Create content access control
    - Mark chapters 1-4 as free, 5+ as premium
    - Check user subscription status before allowing quest access
    - Display paywall modal when accessing locked premium content
    - _Requirements: 12.1, 12.2_
  - [ ] 20.2 Build payment integration
    - Integrate Stripe or PayPal payment SDK
    - Create payment form for one-time purchase option
    - Create subscription form for monthly payment option
    - Implement payment success webhook handler
    - Update user premium status in database on successful payment
    - _Requirements: 12.3, 12.4_
  - [ ] 20.3 Create paywall UI
    - Design paywall modal with pricing options
    - Display benefits of premium access
    - Show payment forms within modal
    - Unlock content immediately after successful payment
    - _Requirements: 12.2, 12.3_
  - [ ]\* 20.4 Write tests for paywall system
    - Test content access control
    - Test payment flow (using test mode)
    - Test premium status updates
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ] 21. Implement responsive design
  - [ ] 21.1 Create mobile-friendly terminal
    - Design touch-friendly terminal keyboard overlay
    - Implement common Git command shortcuts as buttons
    - Optimize terminal font size for mobile screens
    - _Requirements: 13.2_
  - [ ] 21.2 Implement responsive layouts
    - Create responsive grid layouts for quest interface
    - Stack terminal, editor, and graph vertically on mobile
    - Adjust progress map for mobile viewing
    - Test layouts at breakpoints: 320px, 768px, 1024px, 1440px
    - _Requirements: 13.1_
  - [ ] 21.3 Add accessibility features
    - Implement keyboard navigation for all interactive elements
    - Add ARIA labels to buttons, forms, and interactive components
    - Ensure color contrast meets WCAG 2.1 AA standards
    - Test with screen reader (NVDA or JAWS)
    - _Requirements: 13.3, 13.4, 13.5_
  - [ ]\* 21.4 Write accessibility tests
    - Test keyboard navigation
    - Test ARIA label presence
    - Test color contrast ratios
    - _Requirements: 13.3, 13.4, 13.5_

- [ ] 22. Implement analytics system
  - [ ] 22.1 Create analytics event tracking
    - Implement event logging for quest starts, completions, and failures
    - Track command execution events with command type and success/failure
    - Log hint usage events
    - Record time spent per quest
    - _Requirements: 15.2, 15.3_
  - [ ] 22.2 Build analytics aggregation
    - Create database queries for quest completion rates
    - Calculate average time per quest
    - Aggregate common error patterns
    - Calculate retention rates at 1, 7, and 30 days
    - _Requirements: 15.1, 15.2, 15.4_
  - [ ] 22.3 Create analytics dashboard
    - Build admin dashboard UI showing key metrics
    - Display quest completion funnel
    - Show most common errors by quest
    - Display retention cohort analysis
    - Implement date range filtering
    - _Requirements: 15.5_
  - [ ]\* 22.4 Write tests for analytics
    - Test event logging
    - Test aggregation queries
    - Test dashboard data accuracy
    - _Requirements: 15.1, 15.2, 15.3, 15.4_

- [ ] 23. Optimize performance
  - [ ] 23.1 Implement API response caching
    - Add Redis caching layer for quest content
    - Cache user progress data with short TTL
    - Implement cache invalidation on data updates
    - _Requirements: 14.4_
  - [ ] 23.2 Optimize Git engine performance
    - Profile Git engine operations to identify bottlenecks
    - Optimize commit history traversal algorithms
    - Implement lazy loading for large repositories
    - Ensure command execution under 200ms
    - _Requirements: 14.1_
  - [ ] 23.3 Optimize frontend bundle size
    - Implement code splitting for route-based chunks
    - Lazy load Monaco Editor and gitgraph-js
    - Compress and minify production builds
    - Implement asset caching with service workers
    - _Requirements: 14.3, 14.4_
  - [ ]\* 23.4 Perform load testing
    - Use k6 or Artillery to simulate 1000 concurrent users
    - Measure API response times under load
    - Identify and fix performance bottlenecks
    - _Requirements: 14.2_

- [ ] 24. Create quest content
  - [ ] 24.1 Write Chapter 1-4 quest content (Free tier)
    - Write narrative text for Prologue: The Lost Archives
    - Write quests for Chapter 1: The Art of Chrono-Coding
    - Write quests for Chapter 2: Forging Your Tools (git config)
    - Write quests for Chapter 3: The Workshop of Time (three states)
    - Write quests for Chapter 4: The First Seal (basic workflow)
    - Define validation criteria for each quest
    - _Requirements: 4.1, 4.2_
  - [ ] 24.2 Write Chapter 5-7 quest content (Premium tier)
    - Write quests for Chapter 5: Rewinding Time (undoing changes)
    - Write quests for Chapter 6: The Great Library (remotes)
    - Write quests for Chapter 7: The Parallel Timelines (branching)
    - Include Boss Battle 1: The Corrupted Timeline
    - _Requirements: 4.1, 4.2, 7.2_
  - [ ] 24.3 Write Chapter 8-9 quest content (Premium tier)
    - Write quests for Chapter 8: The Council of Coders (collaboration)
    - Write quests for Chapter 9: The Audition (pull requests)
    - Include Boss Battle 2: The Convergence Conflict
    - _Requirements: 4.1, 4.2, 7.3_
  - [ ] 24.4 Write Epilogue quest content (Premium tier)
    - Write quests for advanced topics (rebase, stash, cherry-pick)
    - Create final challenge combining multiple concepts
    - _Requirements: 4.1, 4.2_

- [ ] 25. Deploy application
  - [ ] 25.1 Set up production infrastructure
    - Configure production PostgreSQL database (AWS RDS or similar)
    - Set up Redis instance for caching
    - Configure environment variables for production
    - Set up SSL certificates
    - _Requirements: 14.2_
  - [ ] 25.2 Deploy backend
    - Build production Docker image for backend
    - Deploy to cloud platform (AWS ECS, Heroku, or DigitalOcean)
    - Configure auto-scaling for concurrent user support
    - Set up health check endpoints
    - _Requirements: 14.2_
  - [ ] 25.3 Deploy frontend
    - Build production frontend bundle
    - Deploy to CDN (Vercel, Netlify, or CloudFront)
    - Configure custom domain
    - Set up HTTPS
    - _Requirements: 14.3_
  - [ ] 25.4 Set up monitoring
    - Configure application monitoring (Datadog, New Relic, or similar)
    - Set up error tracking (Sentry)
    - Configure uptime monitoring
    - Set up alerts for critical errors
    - _Requirements: 14.1, 14.2_
