# stream visualizer

A helper to transform stream ticks into `multimeter` bars.

## Install

    npm i maboiteaspam/stream-visualizer --save

## API

It return a stream, and take a callback(chunk, done) as parameter.

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
  .pipe(visualizer.jobRemains('stream', true))


for (var e=0; e<streamSize;e++) {
  streamC.write({some:' data '+e})
}
streamC.end()

```

## Example

see [stream-rate-limiter example](https://github.com/maboiteaspam/stream-rate-limiter)
