<p align="center">
  <a href="https://github.com/simonepri/sympact">
    <img src="https://github.com/simonepri/sympact/raw/master/media/sympact.png" alt="sympact" width="150"/>
  </a>
</p>
<p align="center">
  <!-- CI - TravisCI -->
  <a href="https://travis-ci.org/simonepri/sympact">
    <img src="https://img.shields.io/travis/simonepri/sympact/master.svg?label=MacOS%20%26%20Linux" alt="Mac/Linux Build Status" />
  </a>
  <!-- CI - AppVeyor -->
  <a href="https://ci.appveyor.com/project/simonepri/sympact">
    <img src="https://img.shields.io/appveyor/ci/simonepri/sympact/master.svg?label=Windows" alt="Windows Build status" />
  </a>
  <!-- Coverage - Codecov -->
  <a href="https://codecov.io/gh/simonepri/sympact">
    <img src="https://img.shields.io/codecov/c/github/simonepri/sympact/master.svg" alt="Codecov Coverage report" />
  </a>
  <!-- DM - Snyk -->
  <a href="https://snyk.io/test/github/simonepri/sympact?targetFile=package.json">
    <img src="https://snyk.io/test/github/simonepri/sympact/badge.svg?targetFile=package.json" alt="Known Vulnerabilities" />
  </a>
  <!-- DM - David -->
  <a href="https://david-dm.org/simonepri/sympact">
    <img src="https://david-dm.org/simonepri/sympact/status.svg" alt="Dependency Status" />
  </a>

  <br/>

  <!-- Code Style - XO-Prettier -->
  <a href="https://github.com/xojs/xo">
    <img src="https://img.shields.io/badge/code_style-XO+Prettier-5ed9c7.svg" alt="XO Code Style used" />
  </a>
  <!-- Test Runner - AVA -->
  <a href="https://github.com/avajs/ava">
    <img src="https://img.shields.io/badge/test_runner-AVA-fb3170.svg" alt="AVA Test Runner used" />
  </a>
  <!-- Test Coverage - Istanbul -->
  <a href="https://github.com/istanbuljs/nyc">
    <img src="https://img.shields.io/badge/test_coverage-NYC-fec606.svg" alt="Istanbul Test Coverage used" />
  </a>
  <!-- Init - ni -->
  <a href="https://github.com/simonepri/ni">
    <img src="https://img.shields.io/badge/initialized_with-ni-e74c3c.svg" alt="NI Scaffolding System used" />
  </a>
  <!-- Release - np -->
  <a href="https://github.com/sindresorhus/np">
    <img src="https://img.shields.io/badge/released_with-np-6c8784.svg" alt="NP Release System used" />
  </a>

  <br/>

  <!-- Version - npm -->
  <a href="https://www.npmjs.com/package/sympact">
    <img src="https://img.shields.io/npm/v/sympact.svg" alt="Latest version on npm" />
  </a>
  <!-- License - MIT -->
  <a href="https://github.com/simonepri/sympact/tree/master/license">
    <img src="https://img.shields.io/github/license/simonepri/sympact.svg" alt="Project license" />
  </a>
</p>
<p align="center">
  🔥 An easy way to calculate the 'impact' of running a task in Node.JS
  <br/>

  <sub>
    Coded with ❤️ by <a href="#authors">Simone Primarosa</a>.
  </sub>
</p>

## Synopsis

Runs a script and profiles its execution time, CPU usage, and memory usage
returning an average of all results.

Do you believe that this is *useful*?
Has it *saved you time*?
Or maybe you simply *like it*?  
If so, [show your appreciation with a Star ⭐️][start].

## How it works

sympact spawns a separate process and runs your script in an isolated
node process and then collects statistics about the system's resource used by
your script.

The data are collected using [pidusage][gh:pidusage] in combination with
[pidtree][gh:pidtree].  
**The main difference between other projects is that sympact will also
profile threads spawned by your script.**

Finally a report of the samples taken is computed and returned to you.

## Install

```bash
npm install --save sympact
```

## Usage

```js
const impact = require('sympact');

const report = await impact(`
  let r = 2;
  let c = 10e7;
  while (c--) r = Math.pow(r, r);
  return r;
`, 125); // 125 ms of sampling rate

console.log(report.times.execution.end - report.times.execution.start);
// => 2700 ms
console.log(report.stats.cpu.mean);
// => 90.45 % on my machine
console.log(report.stats.memory.mean);
// => 27903317.33 bytes on my machine
```

## CLI

<img src="https://github.com/simonepri/sympact/raw/master/media/cli.gif" alt="sympact CLI" width="475" align="right"/>

To make it more usable a CLI is bundled with the package allowing you to nicely
display the report.

```js
  npx sympact "console.log('Hello World')"
```
<br/><br/><br/><br/><br/><br/>
<br/><br/><br/><br/><br/><br/>
<br/><br/><br/><br/><br/><br/>

## Report object

The object returned by the promise will look like this.
```js
{
  "times": {
    "sampling": {
      "start": 1521666020917,          // ms since epoch
      "end": 1521666036041             // ms since epoch
    },
    "execution": {
      "start": 1521666020958,          // ms since epoch
      "end": 1521666036006             // ms since epoch
    }
  },
  "stats": {
    "cpu": {                           // CPU usage statistics (percentage)
      "mean": 74.17368421052636,
      "median": 75.1,
      "stdev": 11.820700343128212,
      "max": 94.7,
      "min": 0.7
    },
    "memory": {                        // RAM usage statistics (bytes)
      "mean": 1080202186.1052632,
      "median": 1327509504,
      "stdev": 416083837.44653314,
      "max": 1327513600,
      "min": 23441408
    }
  },
  "samples": {                         // List of all the samples taken
    "period": 125,                     // Sampling period
    "count": 114,                      // Number of samples taken
    "list": {
      "39": {                          // Taken after 39ms after the start of the watch command
        "cpu": 0.7,                    // Sum of the usages of all the processes
        "memory": 23441408,            // Sum of the memory of all the processes
        "processes": [{                // List of processes profiled in this timeframe
          "cpu": 0.7,
          "memory": 23441408,
          "ppid": 837,
          "pid": 839,
          "ctime": 6000,
          "elapsed": 1000,
          "timestamp": 1521666020955   // ms since epoch
        }]
      },
      "205": {
        "cpu": 14.8,
        "memory": 55685120,
        "processes": [{
          "cpu": 14.8,
          "memory": 55685120,
          "ppid": 837,
          "pid": 839,
          "ctime": 15000,
          "elapsed": 2000,
          "timestamp": 1521666021122
        }]
      },

      [...]

      "15124": {
        "cpu": 81.2,
        "memory": 878133248,
        "processes": [{
          "cpu": 81.2,
          "memory": 878133248,
          "ppid": 837,
          "pid": 839,
          "ctime": 47600,
          "elapsed": 17000,
          "timestamp": 1521666036041
        }]
      }
    }
  }
}
```

## API

<a name="sympact"></a>

### sympact(code, [options]) ⇒ <code>Promise.&lt;Object&gt;</code>
Measures the impact of running a certain script on your system.
Monitors the cpu and memory usage of the whole tree of processes generated by
the script provided.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - An object containing the results.  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| code | <code>string</code> |  | The source code to test. |
| [options] | <code>Object</code> |  | Optional configurations. |
| [options.interval] | <code>number</code> | <code>125</code> | Sampling interval in milliseconds. |
| [options.cwd] | <code>string</code> | <code>&quot;caller path&quot;</code> | CWD for the script. |

## Contributing

Contributions are REALLY welcome and if you find a security flaw in this code, PLEASE [report it][new issue].  
Please check the [contributing guidelines][contributing] for more details. Thanks!

## Authors

- **Simone Primarosa** -  *Follow* me on *Github* ([:octocat:@simonepri][github:simonepri]) and on  *Twitter* ([🐦@simonepri][twitter:simoneprimarosa])

See also the list of [contributors][contributors] who participated in this project.

## License

This project is licensed under the MIT License - see the [license][license] file for details.

<!-- Links -->
[start]: https://github.com/simonepri/sympact#start-of-content
[new issue]: https://github.com/simonepri/sympact/issues/new
[contributors]: https://github.com/simonepri/sympact/contributors

[license]: https://github.com/simonepri/sympact/tree/master/license
[contributing]: https://github.com/simonepri/sympact/tree/master/.github/contributing.md

[github:simonepri]: https://github.com/simonepri
[twitter:simoneprimarosa]: http://twitter.com/intent/user?screen_name=simoneprimarosa

[gh:pidusage]: https://github.com/soyuka/pidusage
[gh:pidtree]: https://github.com/simonepri/pidtree
