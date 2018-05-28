'use strict';

const stats = require('stats-lite');
const pidusage = require('pidusage');
const pidtree = require('pidtree');

function getAverages(values) {
  return {
    mean: stats.mean(values),
    median: stats.median(values),
    stdev: stats.stdev(values),
    max: Math.max(...values),
    min: Math.min(...values)
  };
}

function Profiler(ppid, period) {
  const snapshots = {};

  let ending = false;

  let interval = null;
  let start = null;
  let end = null;

  async function read() {
    if (!start || end) return;

    try {
      const procl = await pidtree(ppid, {root: true});
      const statistics = await pidusage(procl);

      const frame = Date.now() - start;
      snapshots[frame] = Object.values(statistics);
    } catch (err) {
      console.log(err);
    }
  }

  async function watch() {
    if (start || end) return;
    start = Date.now();
    await read();
    interval = setInterval(read, period);
  }

  async function unwatch() {
    if (!start || end || ending) return;
    ending = true;
    clearInterval(interval);
    await read();
    end = Date.now();
    interval = null;
  }

  async function report(from, to) {
    const frames = Object.keys(snapshots);

    const samples = {};
    frames.forEach(frame => {
      samples[frame] = {
        cpu: snapshots[frame].reduce((acc, cur) => acc + cur.cpu, 0),
        memory: snapshots[frame].reduce((acc, cur) => acc + cur.memory, 0),
        processes: snapshots[frame]
      };
    });

    const usage = {
      cpu: getAverages(frames.map(frame => samples[frame].cpu)),
      memory: getAverages(frames.map(frame => samples[frame].memory))
    };

    const report = {
      times: {
        sampling: {
          start,
          end
        },
        execution: {
          start: from || start,
          end: to || end
        }
      },
      stats: {
        cpu: usage.cpu,
        memory: usage.memory
      },
      samples: {
        period,
        count: frames.length,
        list: samples
      }
    };
    return report;
  }

  return {
    watch,
    unwatch,
    report
  };
}

module.exports = Profiler;
