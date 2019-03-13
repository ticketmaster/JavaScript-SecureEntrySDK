# Barcode JavaScript SDK

JavaScript SDK for rendering secure barcodes.

## Getting Started

### Requirements
- node.js 10+

### Install

```bash
$ npm install
```

### Building and Running

#### For local development

Run `build:prod` or `build:dev` command to build the library. Output will be in
the `dist` directory.

```bash
$ npm run build:prod
```

Run `start` command to build and launch a development server accessible at
http://localhost:9000

```bash
$ npm start
```

### Testing

Tests are run using the [Karma](http://karma-runner.github.io/latest/index.html)
test runner and a Chrome headless browser by default. This means you must have
Chrome installed on system you are running the tests on. You can run tests with
the following:

```bash
$ npm test
```

*Note: A git hook enforces `lint` and `test` scripts must succeed in order to
push to a remote. Since CI/CD unit tests have been temporarily disabled, please
do not use `--no-verify` to bypass this hook.*

To test on all browsers (Chrome, Safari), run:

```bash
$ npm run test:all
```
