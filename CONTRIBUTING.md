# Contributing Guidelines
Thank you for considering spending your time contributing to the Splunk 3D Graph Network Topology Visualization. :rocket:

Whether you're interested in bug-hunting, documentation, or creating entirely new features, this document will help and guide you through the process.

## Issues & Bug Reports
If you're seeing some unexpected behavior with this project, please create an [issue](https://github.com/splunk/splunk-3D-graph-network-topology-viz/issues) on GitHub selecting the opportune template and providing requested information.

## Pull Requests
We :heart:  to see your fixes via pull requests!

To create a pull request:
* [Fork](https://guides.github.com/activities/forking/) the project
* Create a branch per issue / new feature
* Add your changes to the branch
* Thoroughly test your changes
* Open a [pull request](https://github.com/splunk/splunk-3D-graph-network-topology-viz/pulls)

:point_right: **Address an issue per branch** :point_left:

## Release the App

1. **Manually** trigger the GitHub action [Bumpversion](https://github.com/splunk/splunk-3D-graph-network-topology-viz/actions/workflows/bumpversion.yml) to bump the app version according to [Semantic Versioning](http://semver.org/):
    * Browse to _Actions / Bump Version / Run Workflow_ and type either `major`, `minor` or `patch` in the **Bump part** field.

    > **NOTE** This action is available to all users with `Write` role at least.

2. Update the `CHANGELOG` file following [guidelines](https://github.com/splunk/splunk-3D-graph-network-topology-viz/blob/main/CONTRIBUTING.md#changelog).

3. Push to `master`.

A CI/CD workflow will perform the following checks before automatically creating a new release.

* **Build**: Creates app package
* **Sanity Check**: Validates version consistency between the `CHANGELOG` file and the app. They must match.

### Changelog
A `CHANGELOG.md` file is used to document changes between versions. The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## Development Environment
The recommended local development environment is based on Docker. After the setup, the local Splunk Web will be available on http://localhost:8000 with Splunk Machine Learning Toolkit (MLTK) and the Python for Scientific Computing for Linux installed.

### Prerequisites
* Docker

### Setup
Create a `.env` file in the root of the repository. Don't worry, it is part of `.gitignore`.

`cp .env.sample .env`

Enter your Splunkbase Username and Password there to install dependencies such as the Splunk MLTK via URL.

To setup your development environment, run

`make setup`

This will:

* Install App dependencies
* Configure them in your local environment
* Run docker-compose up to start the local environment

## Tests
To execute tests locally, run

`make tests`
