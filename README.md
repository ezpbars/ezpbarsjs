# ezpbarsjs

ezpbars is a service which generates accurate progress bars for remote activities using 
actual runtime data across runs.

## Prerequisites

This project requires NodeJS (version 8 or later) and NPM. [Node](http://nodejs.org/) and [NPM](https://npmjs.org/) are really easy to install. To make sure you have them available on your machine, try running the following command.

```bash
$ npm -v && node -v
8.19.3
v18.12.0
```

## Table of contents

- [ezpbarsjs](#ezpbarsjs)
  - [Prerequisites](#prerequisites)
  - [Table of contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Serving the app](#serving-the-app)
    - [Running the tests](#running-the-tests)
    - [Building a distribution version](#building-a-distribution-version)
  - [API](#api)
    - [Spinner](#spinner)
    - [LinearOverallProgressBar](#linearoverallprogressbar)
    - [StandardProgressDisplay](#standardprogressdisplay)
  - [Contributing](#contributing)
  - [Credits](#credits)
  - [Built With](#built-with)
  - [Versioning](#versioning)


## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

## Installation

BEFORE YOU INSTALL: please read the prerequisites

Start with cloning this repo on your local machine:

```sh
$ git clone https://github.com/ORG/PROJECT.git
$ cd PROJECT
```

To install and set up the library, run:

```bash
$ npm install -S myLib
```

Or if you prefer using Yarn:

```sh
$ yarn add --dev myLib
```

## Usage

### Serving the app

```sh
$ npm start
```

### Running tests

```sh
$ npm test
```

### Building a distribution version

```sh
$ npm run build
```
This task will create a distribution version of the project inside your local `build/` folder

## API

### waitForCompletion

waits for the given trace to complete, sending progress information to the given
progress bar. typically, the progress bar would react to the changes by updating
the UI, such as by literally drawing a progress bar, or just using a spinner, or
some combination based on context

after this is done, you can get the result of the request from your backend

```js
import { waitForCompletion, StandardProgressDisplay } from 'ezpbars';

const pbar = new StandardProgressDisplay();
document.body.appendChild(pbar.element);
const response = await fetch(
  'https://ezpbars.com/api/1/examples/job?duration=5&stdev=1',
  {method: 'POST'}
)
/** @type {{uid: str, sub: str, pbar_name: str}} */
const data = await response.json();
const getResult = async () => {
  const response = await fetch(`https://ezpbars.com/api/1/examples/job/${data.uid}`)
  const result = await response.json();
  if (result.status === 'complete') {
    return result.data;
  }
  return null;
}
const pollResult = async () => (await getResult()) !== null;
await waitForCompletion({sub: data.sub, pbarName: data.pbar_name, uid: data.uid, pbar, pollResult});
console.log(await getResult());
```

[Learn More](src/index.ts#L232)

#### Arguments

 - `pbarName` - the name of the progress bar to wait for completion of
 - `uid` - the uid of the trace to watch
 - `sub` - the identifier for the account the progress bar belongs to
 - `pbar` - the [progress bar](src/ProgressBar.ts#L4) that's being rendered. For
   example, a [StandardProgressDisplay](src/StandardProgressDisplay.ts#L8)
   (defaults to `null`)
 - `domain` - the domain to make the websocket connection to (defaults to
   `ezpbars.com`)
 - `ssl` - indicates the scheme to use for the websocket connection where true
   is wss and false is ws (defaults to `true`)
 - `pollResult` - checks if your backend is finished processing the trace; used
   as a fallback if ezpbars is not available. typically, this is implemented
   using a fetch to your backend, in the same way that you would normally get the
   result after this library notifies you that the result is ready


### Spinner

shows a basic spinner
*requires* [spinner.css](src/spinner.css)

```js
document.getElementByTagName('body').appendChild(
  (() => {
    const spinner = new Spinner();
    return spinner.element;
  })()
);
```

[Learn More](src/Spinner.ts#L6)

### LinearOverallProgressBar

shows a basic linear progress bar for the overall progress

```js
document.getElementByTagName('body').appendChild(
  (() => {
    const progressBar = new LinearOverallProgressBar();
    return progressBar.element;
  })()
);
```

[Learn More](src/LinearOverallProgressBar.ts#L7)

### StandardProgressDisplay

shows a standard progress display in which a linear progress bar is shown while
there is positive time remaining and a spinner is shown otherwise
*requires* [spinner.css](src/spinner.css)

```js
document.getElementByTagName('body').appendChild(
  (() => {
    const pbar = new StandardProgressDisplay();
    return pbar.element;
  })()
);
```

[Learn More](src/TwoPartProgressBar.ts#L9)

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

1.  Fork it!
2.  Create your feature branch: `git checkout -b my-new-feature`
3.  Add your changes: `git add .`
4.  Commit your changes: `git commit -am 'Add some feature'`
5.  Push to the branch: `git push origin my-new-feature`
6.  Submit a pull request :sunglasses:

## Credits

-   Amanda Moore
-   Timothy Moore

## Built With

* [Jest](https://jestjs.io/) - for testing
* [Babel](https://babeljs.io/) - for transpiling
* [TypeScript](https://www.typescriptlang.org/) - for type checking

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).
