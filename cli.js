#!/usr/bin/env node
/* eslint-disable promise/prefer-await-to-then */
'use strict';

const si = require('systeminformation');

const chalk = require('chalk');
const meow = require('meow');
const logSymbols = require('log-symbols');
const updateNotifier = require('update-notifier');

const Table = require('easy-table');

const impact = require('.');

const cli = meow(
  `
  Usage
    $ impact <script>

  Options
    --raw                      Show the report as raw object instead of using
                               the GUI.
    --interval <number>        The sampling rate in milliseconds.

  Examples
    $ impact "console.log('Hello World')"
    $ impact --interval=5 "console.log('Hello World')"
`,
  {
    flags: {
      raw: {type: 'boolean'},
      interval: {type: 'number'},
    },
  }
);

Promise.resolve()
  .then(() => {
    updateNotifier({pkg: cli.pkg}).notify();
  })
  .then(() => {
    if (cli.input.length !== 1) {
      cli.showHelp(0);
    }
    return impact(cli.input[0], cli.flags.interval);
  })
  .then(async report => {
    if (cli.flags.raw) {
      return JSON.stringify(report, null, 2);
    }

    // SO INFO - BEGIN
    const osInfo = await si.osInfo();

    const soT = new Table();
    soT.cell('Distro', `${osInfo.distro}`);
    soT.cell('Release', `${osInfo.release}`);
    soT.cell('Release', `${osInfo.release}`);
    soT.cell('Platform', `${osInfo.platform}`);
    soT.cell('Arch', `${osInfo.arch}`);
    soT.newRow();
    // SO INFO - END

    // CPU INFO - BEGIN
    const osCpu = await si.cpu();

    const cpuT = new Table();
    cpuT.cell('CPU', `${osCpu.manufacturer}`);
    cpuT.cell('Brand', `${osCpu.brand}`);
    cpuT.cell('Clock', `${osCpu.speed} GHz`);
    cpuT.cell('Cores', `${osCpu.cores}`);
    cpuT.newRow();
    // CPU INFO - BEGIN

    // MEM INFO - BEGIN
    const osMemLayout = await si.memLayout();

    const memT = new Table();
    osMemLayout.forEach(mem => {
      memT.cell('Memory', `${mem.manufacturer}`);
      memT.cell('Type', `${mem.type}`);
      memT.cell('Size', `${(mem.size / 1e6).toFixed(3)} MB`);
      memT.cell('Clock', `${mem.clockSpeed} MHz`);
      memT.newRow();
    });
    // MEM INFO - BEGIN

    // CPU TABLE - BEGIN
    const [cpu] = [report.stats.cpu];
    const ctAvarageStr = chalk.keyword('orangered')('avarage');
    const ctStdevStr = chalk.yellow('σ');
    const ctAvarageVal = chalk.keyword('orangered')(cpu.mean.toFixed(2));
    const ctStdevVal = chalk.yellow(cpu.stdev.toFixed(2));
    const ctMinStr = chalk.cyan('min');
    const ctMaxStr = chalk.red('max');
    const ctMinVal = chalk.cyan(cpu.min.toFixed(2));
    const ctMaxVal = chalk.red(cpu.max.toFixed(2));

    const cuseT = new Table();
    cuseT.cell(
      `CPU Usage (${ctAvarageStr} ± ${ctStdevStr})`,
      `${ctAvarageVal} % ± ${ctStdevVal} %`
    );
    cuseT.cell(
      `CPU Usage Range (${ctMinStr} … ${ctMaxStr})`,
      `${ctMinVal} % … ${ctMaxVal} %`
    );
    cuseT.newRow();
    // CPU TABLE - END

    // RAM TABLE - BEGIN
    const [ram] = [report.stats.memory];
    const rtAvarageStr = chalk.keyword('olivedrab')('avarage');
    const rtStdevStr = chalk.yellow('σ');
    const rtAvarageVal = chalk.keyword('olivedrab')(
      (ram.mean / 1e6).toFixed(3)
    );
    const rtStdevVal = chalk.yellow((ram.stdev / 1e6).toFixed(3));
    const rtMinStr = chalk.cyan('min');
    const rtMaxStr = chalk.red('max');
    const rtMinVal = chalk.cyan((ram.min / 1e6).toFixed(3));
    const rtMaxVal = chalk.red((ram.max / 1e6).toFixed(3));

    const museT = new Table();
    museT.cell(
      `RAM Usage (${rtAvarageStr} ± ${rtStdevStr})`,
      `${rtAvarageVal} MB ± ${rtStdevVal} MB`
    );
    museT.cell(
      `RAM Usage Range (${rtMinStr} … ${rtMaxStr})`,
      `${rtMinVal} MB … ${rtMaxVal} MB`
    );
    museT.newRow();
    // RAM TABLE - END

    // SAMPLES INFO TABLE - BEGIN
    const [times] = [report.times];
    const [samples] = [report.samples];
    const stVal = chalk.magenta(samples.count);
    const stRealStr = chalk.keyword('deeppink')('real');
    const stTargetStr = chalk.blue('target');
    const stTargetFrequencyVal = chalk.blue((1000 / samples.period).toFixed(3));
    const stRealFrequencyVal = chalk.keyword('deeppink')(
      (
        1000 /
        ((times.execution.end - times.execution.start) / samples.count)
      ).toFixed(3)
    );
    const stTargetPeriodVal = chalk.blue((samples.period / 1000).toFixed(3));
    const stRealPeriodVal = chalk.keyword('deeppink')(
      (
        (times.execution.end - times.execution.start) /
        samples.count /
        1000
      ).toFixed(3)
    );

    const tt = new Table();
    tt.cell(
      'Execution time',
      `${chalk.cyan(
        ((times.execution.end - times.execution.start) / 1000).toFixed(3)
      )} s`
    );
    tt.cell(
      'Sampling time',
      `${chalk.cyan(
        (times.sampling.end - times.sampling.start) / (1000).toFixed(3)
      )} s`
    );
    tt.cell('Samples', `${stVal} samples`);
    tt.newRow();
    const st = new Table();
    st.cell(
      `Frequency (${stRealStr} ∴ ${stTargetStr})`,
      `${stRealFrequencyVal} sample/s ∴ ${stTargetFrequencyVal} sample/s`
    );
    st.cell(
      `Period (${stRealStr} ∴ ${stTargetStr})`,
      `${stRealPeriodVal} s/sample ∴ ${stTargetPeriodVal} s/sample`
    );
    st.newRow();
    // SAMPLES INFO TABLE - END

    // SAMPLES - BEGIN
    const frames = Object.keys(samples.list);

    const samT = new Table();
    frames.forEach(frame => {
      const tfInstantVal = chalk.cyan((frame / 1000).toFixed(3));
      const tfCPUVal = chalk.keyword('orangered')(
        samples.list[frame].cpu.toFixed(2)
      );
      const tfRAMVal = chalk.keyword('olivedrab')(
        (samples.list[frame].memory / 1e6).toFixed(3)
      );
      const tfPIDSVal = samples.list[frame].processes
        .map(proc => chalk.gray(proc.pid))
        .sort();

      samT.cell('Instant', `${tfInstantVal} s`);
      samT.cell('CPU Usage', `${tfCPUVal} %`);
      samT.cell('RAM Usage', `${tfRAMVal} MB`);
      samT.cell('PIDS', `${tfPIDSVal}`);
      samT.newRow();
    });
    // SAMPLES - END

    return (
      `\n` +
      `► ${chalk.bold('SYSTEM REPORT')}\n\n` +
      `${soT}\n` +
      `${cpuT}\n` +
      `${memT}\n` +
      `► ${chalk.bold('USAGE STATISTICS')}\n\n` +
      `${cuseT}\n` +
      `${museT}\n` +
      `► ${chalk.bold('SAMPLING STATISTICS')}\n\n` +
      `${tt}\n` +
      `${st}\n` +
      `► ${chalk.bold('SAMPLES')}\n\n` +
      `${samT}`
    );
  })
  .then(console.log)
  .catch(err => {
    console.error(`\n${logSymbols.error} ${err.stack}`);
    process.exit(1);
  });
