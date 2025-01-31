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

- Task management button route to task manager (super quick) (done)
- 404 page (done)
- Logging out user if jwt token is invalid **(done but is bare minimum and still kinda buggy. In particular, there are still scenarios where the cookies are not deleted.)**
  - First need to set up global login state (use React Context).
  - If we are implementing with a global axios interceptor, we need to make it so that 403 is only thrown in a few specific cases:
    - JWT token is invalid (does not check out (see the point on double checking decoded jwt token))
    - User tries to access something they do not have permission for (see point right below)
- Access management -> so non-admin user should not be able to access users page by typing '/users' (done)
- Double checking the decoded jwt token with the database (username) and the request (ip and browser type) (done)
- I don't think I need AuthError, so if don't need can just remove at this stage. (done)
- Dev user should not be able to access routes meant for admin using Postman. (done)
- Password field should hide the input
- Disabled users (what is the behaviour?)
- If got time
  - Change text of account status button to be enabled/disabled instead of "STATUS" (done)
  - Finish up create user
    - Need a way to store the fields that the user entered, the groups list and the account status (use Immer?) (done)
    - Need the group list to be interactive (done)
    - Fix the API body on both frontend and backend (doing)
    - Username should not be case sensitive: backend
    - Duplicate username: backend
    - Password constraint: frontend and backend
  - Username display on top right in header (done on ST laptop I think)
  - Update user
  - Profile button
- If super got time
  - Change create user to use a transaction instead of two separate database queries.

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

test git is working on my local
