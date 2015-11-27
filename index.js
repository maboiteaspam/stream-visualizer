
var multimeter = require('multimeter');
var through2 = require('through2')
var pad = require('node-string-pad');

module.exports = function StreamMeter (w) {

  var multi = multimeter(process);

  var that = this;
  var jobs = {};
  var minStartLine = 0;
  var linesConsumed = 0;
  var size = 1000;
  var width = w || 90;
  var colors = ['blue', 'yellow', 'cyan'];
  colors = colors.concat(colors).concat(colors)

  this.start = function (s) {
    size = s || size;
    multi.on('^C', function () {
      that.end()
      process.exit(); // yeah, this is bad.
    });
    multi.charm.reset();
    multi.charm.cursor(false);
    multi.write('Progress:\n\n');
    linesConsumed++; linesConsumed++;
    minStartLine++; minStartLine++;
  };

  this.end = function (len) {
    multi.charm.cursor(true);
    multi.write(Array(len || linesConsumed || 1).join('\n')).destroy();
    jobs = {}
  };

  var createBar = function (jobName, name, lineStart){
    linesConsumed++;
    var k = Object.keys(jobs).indexOf(jobName)*3 +Object.keys(jobs).indexOf(jobName)*1;
    return multi(0, 1 + k + lineStart+minStartLine, {
      width : width,
      before: pad(name, 30)+' [',
      solid : {
        text : '|',
        foreground : 'white',
        background : colors.shift()
      },
      empty : { text : ' ' }
    });
  };

  this.add = function (name, barName, dir) {
    if (!jobs[name]) {
      jobs[name] = {
        jobSent: 0,
        jobProcessing: 0,
        jobPushed: 0,
        bars: { },
        values: { },
        name: name
      };
    }
    if (!jobs[name].bars[barName]) {
      jobs[name].bars[barName] = createBar(name, name+' '+barName, Object.keys(jobs[name].bars).length)
      jobs[name].bars[barName].direction = dir || 'l2r';
      jobs[name].values[barName] = 0;
      linesConsumed++;
    }
    return jobs[name];
  };

  this.removeBar = function (job, name) {
    var index = multi.bars.indexOf(job.bars[name]);
    if (index>-1) multi.bars.splice(index, 1);
    if (index>-1) delete job.bars[name];
    return index>-1;
  };

  this.removeJob = function (job) {
    Object.keys(job.bars).forEach(function(name){
      that.removeBar(job, name)
    })
    if (jobs[job.name]) {
      delete jobs[job.name];
    }
  };

  this.tickJob = function (job, name, isStartingProcess) {
    var bar = job.bars[name];
    if (bar) {

      if (name!=='processing') job.values[name]++;
      if (isStartingProcess===true) job.values['processing']++;
      else if (isStartingProcess===false) job.values['processing']--;
      // else // ignore

      if (bar.direction==='r2l') {
        var label = pad(''+(size-job.values[name]), 6);
        bar.percent(100-(job.values[name]/size*100), label);
      } else {
        var label = pad(''+job.values[name], 6);
        bar.percent(job.values[name]/size*100, label);
      }
    }
  };

  this.addJobBar = function (jobName, barName, isStartingProcess, direction){
    var job = this.add(jobName, barName, direction);
    var stream = through2.obj(function (chunk, enc, cb) {
      that.tickJob(job, barName, isStartingProcess)
      cb(null, chunk)
    }, function (cb) {
      cb()
      that.removeBar(job, barName);
      if (!Object.keys(job.bars).length) that.removeJob(job);
      if (!Object.keys(jobs).length) that.end();
    });
    stream.resume()
    return stream;
  };




  this.jobSent = function (name){
    return this.addJobBar(name, 'sent', true);
  };

  this.jobProcessing = function (name){
    return this.addJobBar(name, 'processing');
  };

  this.jobPushed = function (name, isJobEnder){
    return this.addJobBar(name, 'pushed', !isJobEnder);
  };

  this.jobRemains = function (name, isJobEnder){
    return this.addJobBar(name, 'remains', !isJobEnder, 'r2l');
  };


};