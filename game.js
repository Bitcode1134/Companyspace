var Game = (function() {
    'use strict';

    var instance = {};
    instance.lastUpdateTime = 0;

    instance.intervals = {};

    instance.update_frame = function(time) {
        Game.update(time - Game.lastUpdateTime);
        Game.lastUpdateTime = time;

        // This ensures that we wait for the browser to "catch up" to drawing and other events
        window.requestAnimationFrame(Game.update_frame);
    };

    instance.update = function(delta) {
        for (var name in this.intervals) {
            var data = this.intervals[name];
            data.e += delta;
            if (data.e > data.d) {
                data.c(this, data.e / 1000);
                data.e = 0;
            }
        }
    };

    instance.createInterval = function(name, callback, delay) {
        this.intervals[name] = {c: callback, d: delay, e: 0}
    };

    instance.deleteInterval = function(name) {
        delete this.intervals[name];
    };

    instance.fastUpdate = function(self, delta) {
        refresh();
        refreshWonderBars();
        checkRedCost();
    };

    instance.slowUpdate = function(self, delta) {
        refreshStats();
        autosave();

        self.updateTime(delta);

        self.achievements.update(delta);
    };

    instance.updateTime = function(delta) {
        secondsTotal += delta;
        secondsSession += delta;

        $('#timeTotal').text(this.formatTime(secondsTotal));
        $('#timeSession').text(this.formatTime(secondsSession));
    };

    instance.save = function(data) {
        this.achievements.save(data);
    };

    instance.load = function(data) {
        this.achievements.load(data);
    };

    instance.loadDelay = function (self, delta) {
        if (pageLoaded === true) {
            document.getElementById("loadScreen").className = "hidden";
            document.getElementById("game").className = "container";
            loadVal = 0;

            self.deleteInterval("Loading");

            // Initialize first
            self.achievements.initialize();

            // Now load
            load('local');

            // Then start the main loops
            self.createInterval("Fast Update", self.fastUpdate, 100);
            self.createInterval("Slow Update", self.slowUpdate, 1000);

            // Do this in a setInterval so it gets called even when the window is inactive
            window.setInterval(function(){ refreshPerSec(); gainResources(); },100);
        }
    };

    instance.formatTime = function(seconds) {
        var date = new Date(null);
        date.setSeconds(seconds);
        return date.toISOString().substr(11, 8);
    };

    instance.start = function() {
        this.createInterval("Loading", this.loadDelay, 1000);

        this.update_frame(0);
        console.debug("Starting Game");
    };

    return instance;
}());

Game.start();