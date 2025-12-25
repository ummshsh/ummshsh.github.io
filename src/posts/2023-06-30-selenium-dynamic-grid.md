---

title: "How to run C# tests using Selenium dynamic grid inside GitLab"
tags: c# autotests selenium GitLab tutorial en
---
Here is how you can start C# tests in GitLab environment using Selenium [Dynamic Grid](https://github.com/SeleniumHQ/docker-selenium#dynamic-grid) feature. 
<!--more-->

# Gitlab yml
It all starts with `gitlab-ci.yml` since we want to run tests in GitLab.
This `yml` starts Docker compose on every commit. That is it.

Here is the `gitlab-ci.yml`:
```yml
image: docker:latest

variables:
  OBJECTS_DIRECTORY: 'obj'
  NUGET_PACKAGES_DIRECTORY: '.nuget'
  SOURCE_CODE_PATH: '*/*/'

services:
  - docker:dind

test:
  services:
    - docker:dind
  stage: test
  before_script:
    - echo "Before script"
    - docker-compose up -d --build
  script:
    - echo "Script"
    - docker-compose exec -w /solution tests dotnet restore SeleniumExample.sln
    - docker-compose exec -w /solution tests dotnet build SeleniumExample.sln --no-restore
    - docker-compose exec -w /solution tests dotnet test Tests/Tests.csproj --settings Tests/grid.runsettings --logger "console;verbosity=detailed"
  allow_failure: false
  after_script:
    - echo "After script"
    - docker-compose down
  rules:
    - when: always
```

# Docker compose
However, all magic happens in `docker-compose.yml`.  

```yml
version: "3"

services:
  selenium-hub:
    image: selenium/hub:4.5.0
    container_name: selenium-hub
    environment:
      - SE_NODE_MAX_SESSIONS=10
    ports:
      - "4442:4442"
      - "4443:4443"
      - "4444:4444"

  node-docker:
    image: selenium/node-docker:4.5.0
    container_name: selenium-node
    volumes:
      - ./assets:/opt/selenium/assets
      - ./config.toml:/opt/bin/config.toml
      - /var/run/docker.sock:/var/run/docker.sock
    depends_on:
      - selenium-hub
    environment:
      - SE_EVENT_BUS_HOST=selenium-hub
      - SE_EVENT_BUS_PUBLISH_PORT=4442
      - SE_EVENT_BUS_SUBSCRIBE_PORT=4443
      - SE_NODE_GRID_URL=http://localhost:4444/

  tests:
    image: mcr.microsoft.com/dotnet/sdk:6.0
    container_name: tests
    depends_on:
      - selenium-hub
      - node-docker
    volumes:
      - .:/solution
    tty: true
```
This compose file starts several containers:
1. `selenium-hub` - Selenium hub, comes with UI.
2. `selenium-node` - this one just spawns new docker containers based on our tests requirements
3. `tests` - container that used just to run tests inside docker network. I found that it is easier to create dummy container, map whole folder inside of it and use it for execution. `tty: true` - here is just a hack so that container won't be killed before tests started there(normally containers are killed if they have nothing to do).

# Settings files
In `grid.runsettings` - this is where you would specify test related parameters that may depend on environment where tests are running:
```xml
<?xml version="1.0" encoding="utf-8"?>
<RunSettings>
  <TestRunParameters>
    <Parameter name="driver" value="grid" />
    <Parameter name="grid_url" value="http://selenium-hub:4444/" />
  </TestRunParameters>
</RunSettings>
```

<br>
Then we have `config.toml`. This file is just determines mapping between browser and which container should be created by `selenium-node`. Later hub will run tests on contaners specified here.
```batch
[docker]
# Configs have a mapping between the Docker image to use and the capabilities that need to be matched to
# start a container with the given image.
configs = [
    "selenium/standalone-firefox:4.9.1-20230508", '{"browserName": "firefox"}',
    "selenium/standalone-chrome:4.9.1-20230508", '{"browserName": "chrome"}',
    "selenium/standalone-edge:4.9.1-20230508", '{"browserName": "MicrosoftEdge"}'
]

# URL for connecting to the docker daemon
# Most simple approach, leave it as http://127.0.0.1:2375, and mount /var/run/docker.sock.
# 127.0.0.1 is used because internally the container uses socat when /var/run/docker.sock is mounted 
# If var/run/docker.sock is not mounted: 
# Windows: make sure Docker Desktop exposes the daemon via tcp, and use http://host.docker.internal:2375.
# macOS: install socat and run the following command, socat -4 TCP-LISTEN:2375,fork UNIX-CONNECT:/var/run/docker.sock,
# then use http://host.docker.internal:2375.
# Linux: varies from machine to machine, please mount /var/run/docker.sock. If this does not work, please create an issue.
url = "http://127.0.0.1:2375"
# Docker image used for video recording
video-image = "selenium/video:ffmpeg-4.3.1-20230508"

# Uncomment the following section if you are running the node on a separate VM
# Fill out the placeholders with appropriate values
#[server]
#host = <ip-from-node-machine>
#port = <port-from-node-machine>
```  

And done!

# Local envirionment test execution
During development on your local machine you don't need to run all of those containers(but you can!) and you can run tests from CLI or from IDE of choice, for this you just need 2 things:  
1. Make sure you have `testsettings` for your local development  
2. Make sure that your test automation framework can distinguish by those `testsettings` whether it runs locally or in CI environment and use version or driver that you need(`ChromeDriver` for local runs vs `RemoteWebDriver` for runs in Grid in CI).  


`runsettings` for you local runs can look like this:
```xml
<?xml version="1.0" encoding="utf-8"?>
<RunSettings>
  <TestRunParameters>
    <Parameter name="driver" value="chrome" />
    <Parameter name="grid_url" value="" />
  </TestRunParameters>
</RunSettings>
```

# Playwright
This also possibe to setup this using Playwright(it also uses Selenium Grid), but talking from expirience some of the browser container versions don't play nice with some Playwright versions, so you have to mix and match to make tests run.

# Links
[Dynamic Gird](https://github.com/SeleniumHQ/docker-selenium#dynamic-grid) GitHub Selenium docs
[This article](https://bamtests.medium.com/selenium-grid-4-getting-started-with-the-dynamic-grid-f77b6bf109b3) helped a lot, I've just adapted this to work in GitLab.
