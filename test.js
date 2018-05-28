import test from 'ava';

import joi from 'joi';

import m from '.';

const schema = {
  integer: joi
    .number()
    .integer()
    .min(0),
  time: joi.object().keys({
    start: joi
      .number()
      .integer()
      .min(0),
    end: joi
      .number()
      .integer()
      .min(0)
  }),
  avarage: joi.object().keys({
    mean: joi.number().min(0),
    median: joi.number().min(0),
    stdev: joi.number().min(0),
    max: joi.number().min(0),
    min: joi.number().min(0)
  }),
  sample: joi.object().keys({
    cpu: joi.number().min(0),
    memory: joi
      .number()
      .integer()
      .min(0),
    processes: joi.array().items(
      joi.object().keys({
        cpu: joi.number().min(0),
        memory: joi
          .number()
          .integer()
          .min(0),
        ppid: joi
          .number()
          .integer()
          .min(0),
        pid: joi
          .number()
          .integer()
          .min(0),
        ctime: joi
          .number()
          .integer()
          .min(0),
        elapsed: joi
          .number()
          .integer()
          .min(0),
        timestamp: joi
          .number()
          .integer()
          .min(0)
      })
    )
  })
};

test('should monitor pid without childs correctly', async t => {
  const report = await m(`
    let r = 2;
    let c = 10e5;
    while (c--) r = Math.pow(r, r);
    return r;
  `);
  t.is(typeof report, 'object');
  t.is(typeof report.times, 'object');
  t.is(joi.validate(report.times.sampling, schema.time).error, null);
  t.is(joi.validate(report.times.execution, schema.time).error, null);
  t.is(typeof report.stats, 'object');
  t.is(joi.validate(report.stats.cpu, schema.avarage).error, null);
  t.is(joi.validate(report.stats.memory, schema.avarage).error, null);
  t.is(typeof report.samples, 'object');
  t.is(joi.validate(report.samples.count, schema.integer).error, null);
  t.is(joi.validate(report.samples.period, schema.integer).error, null);
  t.is(typeof report.samples.list, 'object');
  // eslint-disable-next-line guard-for-in
  for (const key in report.samples.list) {
    t.is(joi.validate(report.samples.list[key], schema.sample).error, null);
  }
});

test('should monitor pid with childs correctly', async t => {
  const report = await m(`
    const {spawn} = require('child_process');
    let childno = 10;
    let childs = [];
    for (let i = 0; i < childno; i++) {
      childs.push(spawn('node', ['-e', 'setInterval(()=>{let c=10e2;while(c--);},1000)']));
    }
    let c = 10e6;
    let m = {};
    while (c--)  m[c] = c;
    for (let i = 0; i < childno; i++) {
      childs[i].kill();
    }
  `);
  t.is(typeof report, 'object');
  t.is(typeof report.times, 'object');
  t.is(joi.validate(report.times.sampling, schema.time).error, null);
  t.is(joi.validate(report.times.execution, schema.time).error, null);
  t.is(typeof report.stats, 'object');
  t.is(joi.validate(report.stats.cpu, schema.avarage).error, null);
  t.is(joi.validate(report.stats.memory, schema.avarage).error, null);
  t.is(typeof report.samples, 'object');
  t.is(joi.validate(report.samples.count, schema.integer).error, null);
  t.is(joi.validate(report.samples.period, schema.integer).error, null);
  t.is(typeof report.samples.list, 'object');
  // eslint-disable-next-line guard-for-in
  for (const key in report.samples.list) {
    t.is(joi.validate(report.samples.list[key], schema.sample).error, null);
  }
});
