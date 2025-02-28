# Assignment 4 notes

### Docker

- Container engine
- Run the application container on.
- Kubernetes is built on container engines and it actually manages the container engine.
- Container engine operation
  - Base is Linux
  - Container CANNOT run Windows OS
  - Container engine CAN run on Windows OS
  - Container engine CAN run on Linux
  - Runs like a hypervisor, but does not require the whole OS thats why the container size is small.
- Smaller container size -> faster to spin up -> easier to scale out.
- There are other container engines, Kubernetes manages many container engines.
- Container will have a daemon, it will take instruction from the user (all the Docker commands)
- Local repository
  - Stores container image
- We are trying to create this container image from our source code
- Process
  - Docker build
    - Source code same level as Docker file, talk to the Docker daemon
      - The first line of the Docker file is always the base image.
        - Read the requirements !!!!!!
        - Load the dockerfile into the docker daemon. The daemon will first check if the base image is here. It then checks with the image in the local repository to check if the node version is the same. If no, check the cache, if still no, contact internet (dockerhub registry). It will then download the node version into the cache.
      - App install instructions
        - npm install, etc
        - there is a file called dockerignore. It contains all the files you want to exclude when you copy it into the image.
      - Start application command
        - The command to start the application
    - At the end of the creation of the image, the image will be published into the local repository,
    - Can name the image, by default take the github name
  - Docker run
    - There are many parameters -> explore them.
    - Name the container. Load in the image into the container.
    - Container name known as a port to Kubernetes and container managers.
- Only containerize the API, not the database.
  - The container has its own set of IP addresses.
  - We cannot use localhost in our dotenv files. It is like docker internal whatever (need to go find)
  - Key value pair is always equated with a equal sign, NO SPACING INVOLVED otherwise docker build will fail.
- That is pretty much the process, but there are other things to note like naming practices
- Test on writing dockerfile.

### environment

- Air gap means no internet connection.
- Dev environment inside the air gap, staging/production environment on site in camps.
- Developing inside an air gap

  1. Prepare dev environment
     - We have docker in all the environments. Each one has its own local repository.
     - Projects will have a GitLab server, essentially a Git repo.
     - Prepare docker image (the base image), and the application library
     - Docker pull of node version (node 18). This command pulls node 18 into the local repository as a container image. We need to do this. Register an account to access docker hub registry. (Dont use st engineering email, use personal email).
     - Docker save node 18.The container image will be saved as a `tar` file (or a tar ball). Essentially a compressed file on the desktop.
     - For the application library, its basically all our node modules.
       - We need to copy package.json from the dev environment (use pen and paper write lol, cannot copy out one)
       - In the package.json, we need to set alldependencies: true
         - This will download all the dependencies that a npm package is based on.
       - Then we need to run `npm install`. This will reference the package.json file and pull all the node modules down.
       - Run `npm pack`. This will create a `gzip` file that contains the whole library. There is a structure to the `tgz` file, when we unzip it it goes by package level. Under the package level we have a name which is defined in package.json (the project name). Under the name we have the node modules folder (refer to the diagram). It will also have package.json file. Note the structure.
     - Physically bring the DVD with the image and load it into the dev environment.
     - Delivery
     - Fingerprint (SHA256) for the node18.tar and 3api.tgz. This fingerprint validates the integrity of the file and is in essence the password to these files. We need to send it per company policy.
     - Compress file with password
     - Burn DVD, physically bring DVD into the dev environment. Then do the reverse order
       - Extract DVD content
       - Reverse security order validation (uncompress with password, check for the same SHA256 checksum).
       - If the project has money all the content go into this JFrog thing. It has access write control.
         - Push the node 18 base image into the docker in the dev env.
       - If no money
         - Docker load node 18. Our docker node 18 image is now in the dev docker registry.
         - Copy \*.tgz to shared folder. This completes the preparation of our dev environment
  1. Dev test in dev environment

     - Docker build. Get a Docker file (it should be in the source code, this is the build script).
       - Verify the base image. If it is correct, load into the cache.
       - `npm install 3api.tgz`. What it does is in the container image it expands the folder.
       - Copy source code package.json file to local.
       - Compare the package.json files (refer to diagram). If they are the same good, if not the same, exit the whole docker file, it means the build failed.
         - It means that some libraries changed so the build wont work anymore.
         - Clean up the environment. When you run npm install it will create a `node_modules` folder. How this folder is created is dependent on the project name. Take note of the folder structure (refer to diagram).
           - We need to copy everything in /node_modules/node_modules/\* into /node_modules/
         - Create a non-system user (need to prove with documentation why this user is a non-system user during the presentation).
         - Use the right base image. Our assignment requires our size to be less than 200MB.
         - Image considerations include
           - Security.
           - Size.
           - Keep all the images we have downloaded when choosing one. Define a table that shows the decision process for the base image.
           - Explore the difference between odd number and even number base image version for node.
         - The non-system user should not have home folder. It can allow a hacker to access the docker container in runtime. A container is supposed to be immutable, but with this vulnerability it can change in runtime.
     - Docker run
       - Do delivery, the same mechanism as in A.
       - Docker save 3api, giving us our 3api.tar file. We also need our .env file so we don't hardcode our source code.

  1. Delivery in staging/production env
     - Then reverse the order in staging/production env.
       - Docker load (no more JFrog artifactory). This will be done by site engineer.
       - Docker run
         - Site engineer will have his own parameters he needs to update in the .env file. So in essence our .env file will be overwritten. Our password needs to be kept in a password vault with a certificate pointing to it.
