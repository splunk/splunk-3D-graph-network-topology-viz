# Contributing Guidelines
Thank you for considering spending your time contributing to the Splunk 3D Graph Network Topology Visualization. :rocket:

Whether you're interested in bug-hunting, documentation, or creating entirely new features, this document will help and guide you through the process.

## Issues & Bug Reports
If you're seeing some unexpected behavior with this project, please create an [issue](https://github.com/splunk/splunk-3D-graph-network-topology-viz/issues) on GitHub selecting the opportune template and providing requested information.

## Pull Requests
We :heart:  to see your fixes via pull requests!

To create a pull request:
* [Fork](https://guides.github.com/activities/forking/) the project
* Create a branch for the issue
* Make your changes on your branch
* Thoroughly test your changes
* Open a [pull request](https://github.com/splunk/splunk-3D-graph-network-topology-viz/pulls)

Remember:
* **Address an issue per branch**

## Semi-Automated Release
A [GitHub Action](https://github.com/splunk/splunk-3D-graph-network-topology-viz/actions/workflows/manual-release.yml) is provided to:
* Bump the app version
* Create a release

This action can be **manually triggered** by clicking on _Actions / Manual Release / Run Workflow_ and by providing:
* **Bump part** - Either major, minor or patch
* (Optional) **Changelog notes** - By default all commit messages beginning from the last release are included

> **NOTE** Action available to all users with `Write` role at least

## Development Environment
The recommended local development environment is based on Docker. After the setup, the local Splunk Web will be available on http://localhost:8000 with Splunk Machine Learning Toolkit (MLTK) and the Python for Scientific Computing for Linux installed.

### Prerequisites
* Docker

### Setup
Create a `.env` file in the root of the repository. Don't worry, it is part of `.gitignore`.

`cp .env.sample .env`

Enter your Splunkbase Username and Password there to install dependencies such as the Splunk MLTK via URL.

Manually download the Python for Scientific Computing for Linux from [Splunkbase](https://splunkbase.splunk.com/app/2882/release/4.2.0/download) and save the `.tgz` in `assets/apps`.
> Note that this should be done automatically but the app is too big for installation via REST by splunk-ansible.

To setup your development environment, run

`make setup`

This will:

* Install App dependencies
* Configure them in your local environment
* Run docker-compose up to start the local environment

## Tests
To execute tests locally, run

`make tests`
