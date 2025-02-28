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

### A3 presentation notes

- This is only slightly out of scope, we have to deal with this eventually, but if you do an Axios call with the username and password on the frontend, it can be traced because the frontend code is on the browser.
  - The way you fix is to point the frontend towards a certificate that points towards a password vault. This approach is also not foolproof, but this is meant to showcase that there are issues.
- Microservices still cause a choke point on the database queries. It is good in
  - Async transaction (look at business flow)
    - Message queue
      - Size of queue must allow for max load backend is expecting
      - different types of queue (point to point or streaming), but in today's world its all streaming
- There are miniservices, and they are different and distinct from microservice
  - A miniservice is actually an antipattern, its when multiple places call the same service.
- Scaling up with kubernetes
  - Each kubernetes port has a treshold for various diagnostics like CPU usage that after it reaches the treshold, it will spin up another port.
  - There is some time needed to spin up the new port. The time depends on the size of the microservice
  - Scaling up is no use if you cannot scale up in time.
- When it comes to HTTP methods, there is no really any implication in choosing which method we choose except for GET. It is very possible to fetch data with POST (but you cannot create data with GET, this is kind of the only exception).
  - So in a sense POST is a superset of GET.
  - The usage of methods is a hotly debated topic that has gone on for a very long time.
  - The methods originate from when HTTP was created, it was intended for the current intended use to be the standard, but it is not necessary to strictly follow the standard.
- The workflow is to standardize how the backend handles the errors and returns it.

curl --location "http://localhost:8000/CreateTask" --header "Content-Type: application/json" --data "{\"task_app_acronym\": \"birdpark\", \"username\": \"user1\", \"password\": \"password\", \"task_name\": \"test task 4\", \"task_plan\": \"sprint 1\", \"task_description\": \"test task description 3\"}"
