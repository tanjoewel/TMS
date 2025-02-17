# Material UI - Vite.js example

## How to use

Download the example [or clone the repo](https://github.com/mui/material-ui):

<!-- #default-branch-switch -->

```bash
curl https://codeload.github.com/mui/material-ui/tar.gz/master | tar -xz --strip=2 material-ui-master/examples/material-ui-vite
cd material-ui-vite
```

Install it and run:

```bash
npm install
npm run dev
```

or:

<!-- #default-branch-switch -->

[![Edit on StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/mui/material-ui/tree/master/examples/material-ui-vite)

[![Edit on CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/sandbox/github/mui/material-ui/tree/master/examples/material-ui-vite)

## The idea behind the example

This example uses [Vite.js](https://github.com/vitejs/vite).
It includes `@mui/material` and its peer dependencies, including [Emotion](https://emotion.sh/docs/introduction), the default style engine in Material UI v6.

## What's next?

<!-- #default-branch-switch -->

You now have a working example project.
You can head back to the documentation and continue by browsing the [templates](https://mui.com/material-ui/getting-started/templates/) section.

# Notes

### Entry point

The entry point to this project is defined in [index.html](./index.html), under the `<script>` tag in the `<body>` section.

### Todos

- Finish up create user

  - After creating a user, should we re-render the component to reflect the new user?

- Update user

  - Refresh component when API call is successful?

- Profile page (done)
- Doing an unauthorized action does not log you out, it just does not let you perform those actions (this is fine I think)
- Snackbar for being logged out due to expired jwt token. (idk if this one in particular is done, but the snackbar context is done)
- New constraints (Done, keeping this here for notes)
  - All admins can disable any account including their own, except HC admin accounts.
  - All admins can remove any account from admin group, including their own, except for HC admin account.
  - The way to distinguish is to have one username reserved the hardcoded admin account. Then the admin checkbox for that should be disabled.
  - Not sure about behaviour for hardcoded PL and hardcoded PM.
- Disabled users (done)
  - Simply put, disabled users should not be able to log in. We should also add that as a check in /auth/verify
  - Protect backend routes from disabled users.
- Protect backend from making changes to hardcoded admin. (done)
- If super got time
  - Test and make sure that multiple instances work (works, kinda)
    - In particular, removing one person's admin rights by updating should make it so that on another tab they cannot access the user management tab anymore.
    - This kind of works, but it requires a refresh which I am not sure is good enough.
    - Fixed it, the main issue is that I had an authenticateToken middleware on logout, which would make sense but if the sole purpose is to remove cookies and for when users are no longer authenticated, it does not make much sense. So after removing, it seems to work as intended.
  - Change create user to use a transaction instead of two separate database queries.
  - Frontend input sanitization? Basically involves doing .trim().toLowerCase where applicable (password field dont to toLowerCase obv)
  - Move hardcoded admin to .env file? Not only does it protect from others being able to see the name in the code directly, but it also means we can deploy with different names easily.

### Implementation plan for authentication (some stuff might be wrong, but this is what I think is correct)

- Use protected routes to protect frontend, then backend is jwt verification
- Frontend
  - The main threat here is directly altering the URL to gain access to pages they should not have access to. For example, a user with no admin permissions types `/users` into the URL to access the user management page.
    - The other threat is calling backend APIs they should not be calling. For example, a user with no admin permissions calling the Create User API. This should be handled by both the backend defense below and restricting access to pages they should not have access to.
  - So we mainly need to prevent access to pages they should not have access to. To handle this, we use Protected Routes.
    - Protected routes is a component that acts as a wrapper for other routes. The logic in this component will run before accessing the other routes.
    - We use a useEffect to check if the user is authenticated or not.
      - I am not quite sure what dependencies we should put in the useEffect.
      - To check if the user is authenticated, we can call an API to the backend. I think this API does not need to actually do anything, as all we need to do is run the middleware.
      - Then if they are not authenticated, then what?
        - We can log them out and redirect to login. This should only happen when they try to access pages directly through the URL.
        - A better approach might be to redirect them to another page, but keep them logged in so they can use the back button. But that can be a stretch goal for now. Or is this easier actually.
          - To do this we just need to navigate in the protected route logic?
      - And if they are authenticated? We can just return the component. They intend to go to.
- Backend
  - The main threat to the backend is unauthorized access to controller logic through API requests (frontend or Postman).
  - To mitigate this, we implement a `authenticateToken` middleware to check that the request comes with a valid JWT token.
    - If the token does not exist at all, error and return 403.
    - Additionally, to prevent token spoofing, we decode the JWT token to get the username, ip address and browser type that was used to log in. Then, we cross-check the ip address and browser type of the request, and check if the username exists in the database. If the token was spoofed, the ip address and/or browser type will be different.
      - This also prevents users from logging in on the frontend as a user with less permissions, copying the token and using Postman to directly access the backend will cause the browser type to be different (although I think the IP will still be the same).

### End of assignment 1 notes

- I have some snackbars and console.log()s that just directly show the user the error messages from the backend. This could be a security issue as an uncaught exception in the backend could result in certain messages being sent (such as the error message directly from the sql database which would help the hacker do sql injection).
- Monolithic vs microservices
  - TL;DR a monolithic service is built as a single unit while microservices is a collection of smaller, independently deployable services.
  - There is no right or wrong, but in general microservices are easier to scale.
- Features needed for login
  - Login API (frontend and backend)
  - User table set up in database
  - Password hashing and matching
  - Creating JWT token and setting of cookie
- Features needed for IAM
  - Retrieving cookies and verifying JWT token
  - User table set up in database
  - User groups table set up in database
  - Users page
  - Get all users API (frontend and backend)
  - Get all distinct API groups (frontend and backend)
  - Create user API (frontend and backend)
  - Create group API (frontend and backend)
    - Password hashing
  - Update user API (frontend and backend)
  - Admin authentication (frontend and backend)
  - Username and password validation (frontend and backend)
- Features needed for user profile
  - Retrieving cookies and verifying JWT token
  - Profile page
  - User table set up in database
  - Get profile API (frontend and backend)
  - Update profile API (frontend and backend)

Add feature so that unauthorized redirect to login

- Detect no rights -> refresh screen

### Code review notes

- No need to check that the user exists in the database first before checking groups
- Be aware of oversplitting of routes. For this project it seemed natural to split the routes into users, groups, and profile. This is not wrong, but it over splitting of routes can lead to a few issues
  - Ownership
  - Git merge conflicts

### Assignment 2

- Start using transactions here. Almost every query should be in a transaction.
- Rnumber can be above 9999. Need to change the table.
- The acronym and Rnumber for an application is readonly after creation. The rest can be editable.
- Use our own service for the sending of email.
  - Use Ethereal for email testing (although i don't mind spamming my personal gmail for this)
- Description box must be big enough so that we don't need to scroll up and down
  - At least 5 lines must fit.
- For RBAC, we can create a general middleware (re-use the checkAdmin middleware, but make it more general) and pass in an array of roles. To do this we need to have a set of roles defined somewhere.
- For any dates - just store it as text and then use JS's datetime object for ease of conversion between readability and storage.
- How do we link the task, plan and applications? The flow is like

  1. Click on an application in the base task management page ("/tasks") (might need to change this URL because I want to use /task for task APIs). This brings you to the kanban board. The plan that the task is under is based on the color coding, so we don't need a list of plans.
  1. Click on a task, which brings up the view task page. So the final URL is something like ("/app/:appAcronym/task/:taskID")?
  1. Basically, to render that page we

     1. Get all tasks related to the app
     1. Get all plans related to the app
     1. Get the association between the tasks and the plans.

- Allowed task state transitions (these and nothing else)

  1. OPEN -> TODO
  1. TODO -> DOING
  1. DOING -> TODO
  1. DOING -> DONE
  1. DONE -> CLOSED
  1. DONE -> DOING

- List of APIs needed

  1.  Update task (done)
  1.  Update app (done)
  1.  Release task (OPEN -> TODO) (done)
  1.  Seek approval (DONE -> CLOSED)(send email here)
  1.  Demote from DOING to TODO (done)
  1.  Approve task (DOING -> DONE) (done)
  1.  Reject task (DONE -> DOING) (done)
  1.  Work on task (TODO -> DOING) (done)
  1.  Reassign task to different sprint plan (part of update task?)

- Any user can view any task.
- User can only edit a task if they have permissions based on the app group permissions (which is checked backend)
- If their permissions are revoked, the page refreshes and becomes read-only
