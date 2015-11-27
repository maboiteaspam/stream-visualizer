# stream visualizer

A helper to transform stream ticks into `multimeter` bars.

## Install

    npm i maboiteaspam/stream-visualizer --save

## API

`Visualizer` is a class.

It provides methods such
- `jobSent(jobName, startsJob)`
- `jobProcessing(jobName)`
- `jobPushed(jobName, endsJob)`
- `jobRemains(jobName, endsJob)`

All those methods returns a `through2.obj` stream to pipe into yours.

- `jobName` is a string to generate and display a label.

- `jobSent` listens for jobs sent to the monitored transform.
It displays the `total count of sent` jobs.

- `jobProcessing` listens for `jobs sent` minus `jobs pushed` to determine `jobs processing`
 in the monitored transform.
It displays the `current count of processing` jobs.

- `jobPushed` listens for jobs pushed by the monitored transform,
but it can also decrease current `jobProcessing` value,
if its argument is `true`.
It displays the `total count of pushed` jobs.

- `jobRemains` same as before, but it displays in `right to left`.
It displays the `total count of remainings` jobs.

the visualizer instance then `start` listen the stream activity
and determine its status to display `multimeter` bar chart.

This is why visualizer's streams must be setup correctly in the stream.

IE: you should probably at least have `jobSent('stream')` before,
`jobsPushed('stream', false)` right after your stream.

```js
var sVisualizer = require('stream-visualizer')

var concurrency=1000;
var streamSize=5000;

var visualizer = new sVisualizer();
visualizer.start(streamSize);

var streamC = through2.obj();

var rateLimiter = require('stream-rate-limiter')
var stream = rateLimiter(concurrency, function damnSlowProcess (chunk, done) {
  setTimeout(function(){
    //console.log(chunk.some+'');
    done();
  }, 250)
});
stream.resume();


streamC
  .pipe(visualizer.jobSent('stream'))
  .pipe(stream)
  .pipe(visualizer.jobProcessing('stream'))
  .pipe(visualizer.jobsPushed('stream')) // this is not a job ender
  .pipe(visualizer.jobRemains('stream', true)) // this one is.


for (var e=0; e<streamSize;e++) {
  streamC.write({some:' data '+e})
}
streamC.end()

```

__Notes__

If you declare multiple job name,
the system will re order the display of the bars to group them
independently of their pipe connections.

## Example

see [stream-rate-limiter example](https://github.com/maboiteaspam/stream-rate-limiter)


## Read more

 - https://github.com/rvagg/through2
 - https://github.com/nodejs/readable-stream/blob/master/doc/stream.markdown#stream_event_data
 - https://github.com/substack/stream-handbook
