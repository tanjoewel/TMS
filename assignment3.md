## Monolithic arcitecture

- A monolithic architecture (like MVC) has all the business logic in the controller. Recall that in MVC, the view is just the frontend and it calls the controller with Axios. The database is for example MySQL and we can query it with SQL queries using `mysql2` npm package.
- The database has its limitations with memory and overhead. (need to research more on this)
  - There is a hard limit to the memory of the database.
- The controller also has its limitations, in particular it can only **scale up to a physical limit**.
  - I'm not too sure what the physical limit is, I think it is the RAM and the space in the server that is running the controller logic.
  - Hence, we are kind of screwed if we want to scale up the app, because in a monolith everything is in the controller.
- The solution is to take **parts** of the controller that cannot perform (perhaps it is a complex part of the controller that does a lot of work), and turn it into a **microservice**.

## Microservices

- The annoying thing about understanding microservices is that there is no agreed upon universal definition of what it is. Instead, it is probably more appropriate to understand microservices through things like its structure, benefits and ideas.
  - <mark>In the case of this course, a microservice is some software that is containerized and accessible remotely.</mark>
  - Note that this means the piece of software that is in the container **must be modular**. In other words, the software in the container must be able to run by itself, maybe with an environment file. It should not be dependent on the rest of the application.
- According to ChatGPT, a container has:
  - Code – Your application’s source code
  - Dependencies – Libraries, runtimes (e.g., Node.js, Python, Java)
  - System Tools – Shell, networking utilities
  - Configuration – Environment variables, startup scripts
- When we containerize, we need to change the URL of the Axios requests because the container is no longer in localhost.
- When we use microservices, there is a lot more work that has to be done to ensure the frontend and backend are on the same page.

### Ways of implementing microservices

1. REST APIs
   - Stateless
   - Unidirection
   - JSON or XSM payload
1. GRPC (Google Remote Procedure Call)
   - Unidirectional or bidirectional
   - Uses [protobuf](https://protobuf.dev/) which is a lot more complex compared to JSON object
   - Runs on HTTP 2.2, which m,eans we need a proxy server to convert to HTTP 1.1 before the endpoint can use it
1. GraphQL (not recommended)
   - Query backend database like NoSQL style (not recommended for a frontend)
   - Need to send all instructions to a GraphQL server which incurs significant overhead
1. Websocket
   - Usually only used for streaming audio/video

When to use which technology is very dependent on the nature of the project. For example, an app that does not see much traffic will be more than fine with using REST API, while an app with a lot of traffic might need GRPC.

## Kubernetes containers

This is a whole subject in itself, so it gets its own section. Also, it is way too much to cover within the course, so I might move this out of this section.

But in general,

- We first need to get the image. The generation of the container image is **not done with Kubernetes**, usually Docker.
  - Note that a container image is **stateless and immutable**.
  - From the [Kubernetes website](https://kubernetes.io/docs/concepts/containers/), a container image is a ready-to-run software package containing everything needed to run an application: the code and any runtime it requires, application and system libraries, and default values for any essential settings.
- Once we have an image, we can deploy it to Kubernetes.

## Course specific

The notes in this section are parts that are more specific to the course.

- **Stick to the endpoint name, do not give it your own**.
- Documentation is standard, so follow the example given in the assignment and stick to it.
- Why we are using certain HTTP methods:
  - GET
  - POST
  - PUT
  - PATCH
  - DELETE

We also need to define our own error workflow, in particular

- Design our own error codes and document the meaning so that everyone in the team can understand them, because
- Do not have error messages -> the presence of error messages makes it easier for hackers to break into the system
  - Essentially, detailed error messages can help the hacker understand what the API is trying to do

We also need to design our own

- URL construct. This one also needs to be of a specific format (not sure what it is tbh).
- Payload structure
- Transaction

For this course, we need to show at least 2 examples, 1 using `Axios` and 1 using `curl`.

### Presentation

- What is REST API and its characteristics
- HTTP methods
- Parameters
- Body
- Security by design
