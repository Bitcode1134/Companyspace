var Game = (function() {
    'use strict';

    var instance = {};
    instance.lastUpdateTime = 0;

    instance.intervals = {};
    instance.uiComponents = [];

    instance.logoAnimating = false;

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
        autosave();

        self.updateTime(delta);

        self.achievements.update(delta);
        self.statistics.update(delta);

        for(var i = 0; i < self.uiComponents.length; i++) {
            self.uiComponents[i].update(delta);
        }
    };

    instance.updateTime = function(delta) {
        Game.statistics.add('sessionTime', delta);
        Game.statistics.add('timePlayed', delta);
    };

    instance.save = function(data) {
        this.achievements.save(data);
        this.statistics.save(data);
    };

    instance.load = function(data) {
        this.achievements.load(data);
        this.statistics.load(data);
    };

    instance.loadDelay = function (self, delta) {
        document.getElementById("loadScreen").className = "hidden";
        document.getElementById("game").className = "container";

        self.deleteInterval("Loading");

        // Initialize first
        self.achievements.initialize();
        self.statistics.initialize();

        for(var i = 0; i < self.uiComponents.length; i++) {
            self.uiComponents[i].initialize();
        }

        // Now load
        load('local');

        // Then start the main loops
        self.createInterval("Fast Update", self.fastUpdate, 100);
        self.createInterval("Slow Update", self.slowUpdate, 1000);

        // Do this in a setInterval so it gets called even when the window is inactive
        window.setInterval(function(){ refreshPerSec(); gainResources(); },100);
    };

    instance.loadAnimation = function(self, delta) {
        if (self.logoAnimating === true) {
            return;
        }

        var logoElement = $('#loadLogo');
        var opacity = logoElement.css('opacity');
        if(opacity >= 0.9) {
            logoElement.fadeTo(1000, .25, function() { Game.logoAnimating = false; });
            self.logoAnimating = true;
        } else if (opacity <= 0.3) {
            logoElement.fadeTo(1000, .95, function() { Game.logoAnimating = false; });
            self.logoAnimating = true;
        }
    };

    instance.formatTime = function(seconds) {
        var date = new Date(null);
        date.setSeconds(seconds);
        return date.toISOString().substr(11, 8);
    };

    instance.start = function() {
        this.createInterval("Loading Animation", this.loadAnimation, 10);
        this.createInterval("Loading", this.loadDelay, 1000);

        this.update_frame(0);
        console.debug("Starting Game");
    };

    return instance;
}());

window.onload = function(){
    Game.start();
};