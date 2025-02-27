## Monolithic arcitecture

- A monolithic architecture (like MVC) has all the business logic in the controller. Recall that in MVC, the view is just the frontend and it calls the controller with Axios. The database is for example MySQL and we can query it with SQL queries using `mysql2` npm package.
- The database has its limitations with memory and overhead. (need to research more on this)
  - There is a hard limit to the memory of the database.
- The controller also has its limitations, in particular it can only **scale up to a physical limit**.
  - I'm not too sure what the physical limit is, I think it is the RAM and the space in the server that is running the controller logic.
  - Hence, we are kind of screwed if we want to scale up the app, because in a monolith everything is in the controller.
- The solution is to take **parts** of the controller that cannot perform (perhaps it is a complex part of the controller that does a lot of work), and turn it into a **microservice**.

### As with everything, there are advantages and disadvantages.

[Docs](https://medium.com/swlh/scaling-monolithic-applications-3c69193f942a)

- Advantages
  - Communication costs between components is very low (since they are in the same application stack). No need for complex things like networking.
  - Code re-usability (helper classes etc which might not be good practice under CW anyway)
  - Effort: there is a lot of things that go into starting a new project (configuration, build scripting, tooling, network configuration etc.)
- Disadvantages
  - Tight coupling leading to lower fault tolerance. If a single module fails, it is possible that the system goes down due to a cascading effect.
  - **Scaling**
  - Lack of modularity, which is basically the same thing as the tight coupling actually, but it also causes another problem because
    - We cannot re-use the functionality of a module within another module.

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

### Advantages and disadvantages of microservices

- Advantages
  - Parallelism and concurrency
  - Scalability
    - This is the most important advantage. Basically since microservices are stateless, if the load on the microservice is great, we can just spin up another server and it does not need to learn any prior state to perform its task.
    - Can also leverage cloud technologies if it is deployed on the cloud

### Ways of implementing microservices

1. REST APIs
   - Stateless
   - Unidirection
   - JSON or XSM payload
1. GRPC (Google Remote Procedure Call)
   - Cross-platform high-performance remote procedure call framework.
   - From ChatGPT, here is how to set up grpc to communicate with kubernetes microservice. These steps are actually quite similar to GraphQL.
     - 1️⃣ Set Up a gRPC Server in your microservice
     - 2️⃣ Expose the gRPC Service inside Kubernetes
     - 3️⃣ Allow Another Service or External Clients to Communicate
     - 4️⃣ Use gRPC Clients to Call the Service
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

- URL construct. This one also needs to be of a specific format (HTTP method + path).
- Payload structure
- Transaction

For this course, we need to show at least 2 examples, 1 using `Axios` and 1 using `curl`.

### Presentation

- What is REST API and its characteristics
- HTTP methods
- Parameters
- Body
- Security by design

### TODO

- Figure out how `curl` works.
- Understand how `Axios` works.
- How REST APIs work
  - Basically why choose REST API over the other options
- Change all the APIs to not have any param.

### REST APIs

From the [Red Hat website](https://www.redhat.com/en/topics/api/what-is-a-rest-api) (surely Red Hat is credible right)

- An API is a set of definitions and protocols for building and integrating application software.
  - It is usually thought of as a contract between an information provider and somebody who needs the information (user).
  - In the case of a web app, the frontend is the user and the backend is the information provider. The API, then, specifies how exactly this exchange of information occurs - what does the user provide, and what does the information provider need to provide accurate information.
- REST is a set of architectural constraints (?????)
  - Criteria for an API to be considered RESTful
    - Client-server architecture
    - Stateless client-server communication -> no client information stored between get requests, each request is separate and unconnected
    - Cacheable data that streamlines client-server interaction
    - Uniform interface between components, information transferred in a standard form
      - This just seems like standard stuff tho, theres 4 subpoints on the website go look at it.
    - Server organized into hierarchies invisible to the client (????).

Security aspects can be found in this [pretty decent blog?](https://stackoverflow.blog/2021/10/06/best-practices-for-authentication-and-authorization-for-rest-apis/)

Feels kind of out of the scope though.

Scalability from [this blog post](https://apitoolkit.io/blog/rest-api-scalability/)

- What makes REST APIs scalable is their stateless design. If the load on one server becomes too high, spin up a new server and start handling requests. The new server does not need any knowledge of previous interactions.
  Also can
  - Implement caching
  - Use load balancer
  - Optimize database interactions
  - Rate limiting

### Meeting 1pm 26/02/2025

- Success codes
- Case sensitivity for parameters
- Justification for HTTP method
  - Method name to be used in the URL, so for example for **CreateTask** it should be `{{BASE_URL}}/CreateTask` (think that is what product owner wants)
  - We use POST for `CreateTask` because it is the standard for creating resources, but also we need to pass in sensitive data to the backend. We can do that by passing it into the body and secure using SSL.
  - Use JSON because it is simple and readable by both human and machine(?).
  - For `GetTaskByState`, it is a similar justification to `CreateTask`.
- What is REST API
  - REST stands for Representational State Transfer
  - `Content-Type` in the request header should be 'application/json' because we are passing in a JSON object.
- Different types of content that we can send: more common ones
  - Application/json for JSON object
  - text/plain for plain strings
  - form-data for form content

### Meeting 4pm

#### APIs

- CreateTask
  - Task description is optional
  - Only those in the group defined in App_permit_Create can CreateTask
- GetTaskbyState
  - **Application wide**, not plan wide
- PromoteTask2Done
  - Has a lot of outcomes, need to consider
    - App_permit_Doing
    - Email
      - Different cases and errors
    - Notes
    - For assignment 2 we did it all in one API call.
  - Most of us -> promote task to done, then if there is notes add it into notes history. So it is the same as the behaviour in the PromoteTask2Done API.
    - Notes is a separate API in assignment 2, but in this case we need to pass it in as a body.
  - We all agree on what the APIs actually do -> similar to assignment 2 functionality except for GetTaskbyState

#### Error codes

- Discussion about invalid HTTP method
  - GT: How to check for invalid HTTP method?
  - JW: The way Postman checks for it when we do Postman is that it first checks for the method and then checks if there are any URLs for that method. So for Postman and Axios it will come out to an invalid URL because there is no URL under the specific method that is chosen.
    - However, we don't know if cURL or Powershell handles it differently, **so this is something that we need to go and research**.
  - Conclusion: leave it there for now.
  - Kevin: URL too long, invalid character, endpoint not found.
    - Essentially they have finer granularity in the errors.
  - GT: How do we catch those errors?
  - Kevin: length can just check the length, use the URL constructor to check if it is a valid URL (if it is invalid you cannot create the object), use regex for special characters, invalid params (there is no query params where there should not be one).
    - [URL constructor](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL)
  - No invalid HTTP method for group A2. (Might include it but no idea how to check it)
  - Kevin: URL too long is not part of URL format (format is ok but URL is just too long)
  - GT: Is invalid characters part of URL format
    - Kevin: No, that is a separate check. Invalid URL format is when you pass it into the `URL()` constructor and it fails to create the object.
- Payload structure
  - Task description and task plan is optional, so there should not be error code for when they are empty.
  - Organize the error codes
    - Validation ()
- Remember <mark>**not to add any additional characters in your error codes**</mark> so that hackers cannot tell what is going on.
  - When we return the error, just return the code without a message.
- Kevin: payload too large, what do we put as status code
  - GT: Put our own custom code
- Kevin: We put both 401 and 403
  - GT: However that caan be a security flaw, because if we get 403 that means the account exists but is not authorized
  - Kevin brings up the case that was tested in assignment 1, about how to redirect the user to login page if he is not authorized. If everything is 403, how do we know if the access is gone or if the account is gone? That is the justification for having 2 different account statuses.
  - GT: Just do what is needed on error, instead of checking the code to decide behaviour
- GT: So we want to do 400 for everything?
  - Consensus is yes, we do 400 for everything
- GT: What does too large URL mean? Because the maxBodyLength in the examples show "Infinity"
  - Kevin: Not too sure, get back later
- Format: 'E' and then 4 numbers so `EXXXX`.
  - The first number tells us what it is (replaces the letters that we previously used), and then the last 3 numbers are just ascending.

### Presentation flow and idea

- Hi Chuan Wu
- The existing architecure -> MVC, and how it is monolithic
  - All the business logic is in the controller
- The disadvantage of monolithic architecture (should I briefly mention some advantages?)
  - The main disadvantage is the inability to scale.
  - Database has a hard limit to the memory, essentially the size of the disk space available in the machine hosting the database.
  - The controller also has a physical limit.
- The solution to the problem of scaling (this also serves as the motivation and introduction to microservices)
  - Take out parts of the controller that can run by itself, containerize it and deploy it somewhere else (now its typically the cloud), and then it can run independently of whatever is left in the monolithic controller.
  - The part to be containerized needs to be modular and stateless, meaning that it should be able to perform its operation despite being effectively separated from the rest of the application.
  - By doing so, we free up resources in the monolithic controller. In addition, because the containerized part is stateless, we can also parallelize its execution from the monolithic controller, which also improves overall performance of the application itself.
  - An additional benefit is that by deploying them on the cloud, we can also enjoy other benefits like utilizing their load balancing services.
- How to containerize
  - Use Docker to create a container image.
    - A container contains the source code, the runtime, system tools, system libraries and settings (environment configurations?). [Docs](https://www.docker.com/resources/what-container/)
  - Use Kubernetes to deploy.
- Ways to communicate with a container
  - Since the container is no longer with the monolithic controller, we need to change the way we communicate with it.
  - There are 4 main ways to communicate, using REST APIs, GRPC (Google Remote Procedure Call), GraphQL, and websockets.
    - For this assignment, we will be focusing on REST APIs. However, which technology we decide to use in which project depends heavily on the nature of the project.
    - (In case CW ask): First say that Jingling will be talking about it, but if he pushes or if Jingling cannot answer, there are a few reasons why we use REST APIs
      - REST APIs are stateless by design, which is good for microservices since they too are supposed to be stateless.
      - They can carry JSON payloads, which is what we will be using to deliver our data.
      - Our application is currently relatively small, so it does not make much sense to go through the trouble of setting up GRPC when REST APIs will perform just fine on our app.
  - Done, go to Jingling.
