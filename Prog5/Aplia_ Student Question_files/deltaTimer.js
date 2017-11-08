/*
    Used to measure a span of time in milliseconds.

    start() to mark the start of time.
    update() to mark the end of time.  Will auto-call start if it has not been called.
    getDelta() to get the number of millis between start and last update.  Will auto-call start and update if they have not been called.
*/

function DeltaTimer()
{
    this.start = function () {
        this.startTime = new Date().getTime();
    }

    this.update = function () {
        if (typeof this.startTime == "undefined") {
            this.start();
        }
        this.endTime = new Date().getTime();
    }

    this.getDelta = function () {
        if (typeof this.endTime == "undefined") {
            this.update();
        }
        var delta = this.endTime - this.startTime;
        return delta;
    }
   
}