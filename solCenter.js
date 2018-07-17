Game.solCenter = (function(){

    var instance = {};

    instance.dataVersion = 1;
    instance.entries = {};
    instance.tabUnlocked = false;

    instance.initialise = function(){
    	for(var id in Game.solData){
    		var data = Game.solData[id];
    		this.entries[id] = $.extend({}, data, {
				id: id,
				htmlId: 'solCtr' + id,
				unlocked: false,
				researched: false,
				displayNeedsUpdate: true,
			});
    	}
    };

    instance.update = function(delta){
    	
    };

    instance.save = function(data){
    	data.solCenter = {v: this.dataVersion, e: {}}
    	for(var id in this.entries){
    		var ent = this.entries[id]
    		data.solCenter.e[id] = {};
    		data.solCenter.e[id].unlocked = ent.unlocked;
    		data.solCenter.e[id].researched = ent.researched;
    		if(id == "nanoswarm"){
    			data.solCenter.e[id].current = ent.current;
    			data.solCenter.e[id].resource = ent.resource;
    		}
    	}
    };

    instance.load = function(data){
    	if(data.solCenter){
    		for (var id in data.solCenter.e) {
            	if (typeof this.entries[id] !== 'undefined') {
            		var ent = data.solCenter.e[id];
            		for(var prop in ent){
            			this.entries[id][prop] = ent.prop;
            			this.entries[id].displayNeedsUpdate = true;
            		}
            	}
        	}
    	}
    };

    instance.research = function(id){
    	var data = this.entries[id];
    	if(this.checkCost(data.cost)){
    		data.researched = true;
    		this.entries[id].onApply();
    		data.displayNeedsUpdate = true;
    	}
    };

    instance.calcCost = function(data, resource, power){
        return Math.floor(data.cost[resource.toString()] * Math.pow((power || 1.1),(data.current || 0)));
    };

    instance.checkCost = function(data){
        var power = 1.1;
        if(data.id == "dyson"){
            power = 1.02;
        }
    	if (typeof data === 'undefined') {return false;}
        var resourcePass = 0;
        for(var resource in data.cost){
            var res = Game.resources.getResourceData(resource);
            if(res.current >= this.calcCost(data, resource, power)){
                resourcePass += 1;
            }
        }
        if(resourcePass === Object.keys(data.cost).length){
            for(var resource in data.cost){
                var res = Game.resources.getResourceData(resource);
                res.current -= this.calcCost(data, resource, power);
            }
            return true;
        } else {
            return false;
        }
    };

    instance.switchNano = function(resource){
    	var data = this.entries.nanoswarm;
    	data.resource = resource;
    	console.log(Game.resources.entries[resource].htmlId);
    	data.displayNeedsUpdate = true;
    };

    instance.unlock = function(id){
    	this.entries[id].unlocked = true;
    	this.entries[id].displayNeedsUpdate = true;
    };

    return instance;
}());

// Sol Center Tab

function unlockPlasmaResearch(){
	if(getResource(RESOURCE.Hydrogen) >= 1500 && getResource(RESOURCE.Uranium) >= 1500 && getResource(RESOURCE.Oil) >= 15000 && getResource(RESOURCE.Wood) >= 15000){
		Game.resources.takeResource(RESOURCE.Hydrogen, 1500);
		Game.resources.takeResource(RESOURCE.Uranium, 1500);
		Game.resources.takeResource(RESOURCE.Oil, 15000);
		Game.resources.takeResource(RESOURCE.Wood, 15000);
		document.getElementById("researchPlasma").className = "hidden";
		document.getElementById("unlockPlasma").className = "";
		Game.tech.unlockTech("unlockPlasma");
		newUnlock("research");
		buttonsHidden.push("researchPlasma");
	}
}

function unlockEmcResearch(){
	if(getResource(RESOURCE.Energy) >= 75000 && getResource(RESOURCE.Plasma) >= 100){
		Game.resources.takeResource(RESOURCE.Energy, 75000);
		Game.resources.takeResource(RESOURCE.Plasma, 100);
		document.getElementById("researchEmc").className = "hidden";
		document.getElementById("unlockEmc").className = "";
		Game.tech.unlockTech("unlockEmc");
		newUnlock("research");
		buttonsHidden.push("researchEmc");
	}
}

function unlockDysonResearch(){
	if(getResource(RESOURCE.Energy) >= 100000 && getResource(RESOURCE.Plasma) >= 10000){
		Game.resources.takeResource(RESOURCE.Energy, 100000);
		Game.resources.takeResource(RESOURCE.Plasma, 10000);
		document.getElementById("researchDyson").className = "hidden";
		document.getElementById("unlockDyson").className = "";
		Game.tech.unlockTech("unlockDyson");
		newUnlock("research");
		buttonsHidden.push("researchDyson");
	}
}

function changeEmcAmount(event){
	if (event.button === 2) {
		emcAmount /= 10;
		
		if (emcAmount < 1) {
			emcAmount = "Max";
		}
		if(emcAmount !== emcAmount){
			emcAmount = Math.pow(10, Math.floor(Math.log10(getMaxEnergy())));
		}
		
	} else {
		emcAmount *= 10;
		if(emcAmount > getMaxEnergy()){
			emcAmount = "Max";
		}
		if(emcAmount !== emcAmount){
			emcAmount = 1;
		}
		
	}

    refreshConversionDisplay();
}

function refreshConversionDisplay() {
	var maxEnergy = Game.resources.entries.energy.capacity;
	var maxPlasma = Game.resources.entries.plasma.capacity;
	for (var i = 0; i < resources.length; i++) {
		var amountElement = $('#' + resources[i] + 'EmcAmount');
		var costElement = $('#' + resources[i] + 'EmcVal');
		var storageElement = $('#' + resources[i] + 'Conv');

		// meteorites are a special case because the conversion uses plasma
		var emcCostResource;
		var emcCostMax;
		if (resources[i] === 'meteorite') {
			emcCostResource = getResource(RESOURCE.Plasma);
			emcCostMax = maxPlasma;
		} else {
			emcCostResource = getResource(RESOURCE.Energy);
			emcCostMax = maxEnergy;
		}

		var value = window[resources[i] + 'EmcVal'];
		var current = getResource(resources[i]);
		var capacity = getStorage(resources[i]);
		var emcValue;
		if (emcAmount === 'Max') {
			emcValue = Math.floor(emcCostResource / value);
			costElement.text(Game.settings.format(Math.floor(emcValue * value)));
			amountElement.text(Game.settings.format(emcValue));
		} else {
			emcValue = value * emcAmount;
			costElement.text(Game.settings.format(emcValue));
			amountElement.text(Game.settings.format(emcAmount));
		}

		storageElement.removeClass('green');
		storageElement.removeClass('red');
		if (emcAmount > capacity || current >= capacity) {
			storageElement.addClass('green');
		} else if (emcCostMax < emcValue) {
			storageElement.addClass('red');
		}
	}

	var emcAmountBtn = $('#emcButton');
	if (emcAmount === 'Max') {
		emcAmountBtn.text('Max');
	} else {
		emcAmountBtn.text(Game.settings.format(emcAmount));
	}
}

function convertEnergy(resourceName, notification){
	var current = getResource(resourceName);
	var capacity = getStorage(resourceName);
	var emcValue = window[resourceName + "EmcVal"];
	var amount;
	if(emcAmount === "Max"){
		amount = Math.floor(Math.min(Math.floor(getResource(RESOURCE.Energy)/emcValue), capacity - current));
	}
	else{
		amount = Math.floor(Math.min(emcAmount, capacity - current));
	}
	
	var requiredEnergy = amount * emcValue;

	if(amount > 0 && getResource(RESOURCE.Energy) >= requiredEnergy){
		Game.resources.takeResource(RESOURCE.Energy, requiredEnergy);
		Game.resources.addResource(resourceName, amount);
		if(notification != false){
			Game.notifyInfo('Energy Conversion', 'Gained ' + Game.settings.format(amount) + ' ' + Game.utils.capitaliseFirst(resourceName));
		}

		refreshConversionDisplay();
	}
}

function convertPlasma(resourceName, notification){
	var current = getResource(resourceName);
	var capacity = getStorage(resourceName);
	var emcValue = window[resourceName + "EmcVal"];
	var amount;
	if(emcAmount === "Max"){
		amount = Math.floor(Math.min(Math.floor(getResource(RESOURCE.Plasma)/emcValue), capacity - current) - 3333); // Retains 10,000 plasma
	}
	else{
		amount = Math.floor(Math.min(emcAmount, capacity - current));
	}

	var requiredPlasma = amount*emcValue;

	if(amount > 0 && getResource(RESOURCE.Plasma) >= requiredPlasma){
		Game.resources.takeResource(RESOURCE.Plasma, requiredPlasma);
		Game.resources.addResource(resourceName, amount);
		if(notification != false){
			Game.notifyInfo('Plasma Conversion', 'Gained ' + Game.settings.format(parseFloat(amount)) + ' ' + Game.utils.capitaliseFirst(resourceName));
		}

		refreshConversionDisplay();
	}
}

$('input[type="checkbox"]').on('change', function() {
	$('input[class="autoEmc"]').not(this).prop('checked', false);
	autoResource = this.id.substring(0,this.id.indexOf("Auto"));
	if($(this).is(":checked") == false){
		autoResource = null;
	}
});

function gainAutoEmc(){
	if(autoResource == null){
		return;
	}
	emcAmount = "Max";
	if(autoResource != "meteorite"){
		convertEnergy(autoResource, false);
	} else {
		convertPlasma(autoResource, false);
	}
}

var dyson = 0; var dysonTitaniumCost = 300000; var dysonGoldCost = 100000; var dysonSiliconCost = 200000; var dysonMeteoriteCost = 1000; var dysonIceCost = 100000;

function updateDysonCost(){
	dysonTitaniumCost = Math.floor(300000 * Math.pow(1.02,dyson));
	dysonGoldCost = Math.floor(100000 * Math.pow(1.02,dyson));
	dysonSiliconCost = Math.floor(200000 * Math.pow(1.02,dyson));
	dysonMeteoriteCost = Math.floor(1000 * Math.pow(1.02,dyson));
	dysonIceCost = Math.floor(100000 * Math.pow(1.02,dyson));
}

function getDyson(){
	if (getResource(RESOURCE.Titanium) >= dysonTitaniumCost && getResource(RESOURCE.Gold) >= dysonGoldCost && getResource(RESOURCE.Silicon) >= dysonSiliconCost && getResource(RESOURCE.Meteorite) >= dysonMeteoriteCost && getResource(RESOURCE.Ice) >= dysonIceCost) {
		Game.resources.takeResource(RESOURCE.Titanium, dysonTitaniumCost);
		Game.resources.takeResource(RESOURCE.Gold, dysonGoldCost);
		Game.resources.takeResource(RESOURCE.Silicon, dysonSiliconCost);
		Game.resources.takeResource(RESOURCE.Meteorite, dysonMeteoriteCost);
		Game.resources.takeResource(RESOURCE.Ice, dysonIceCost);
		dyson += 1;

		updateDysonCost();

		return true;
	}
	else{
		return false;
	}
}

function buildDysonTo(n) {
	while (dyson < n && getDyson()){}
}

function buildRing(){
	if(dyson >= 50 && getResource(RESOURCE.RocketFuel) >= 50000){
		dyson -= 50;
		Game.resources.takeResource(RESOURCE.RocketFuel, 50000);
		ring += 1;

		updateDysonCost();
	}
}

function buildSwarm(){
	if(dyson >= 100 && getResource(RESOURCE.RocketFuel) >= 250000){
		dyson -= 100;
		Game.resources.takeResource(RESOURCE.RocketFuel, 250000);
		swarm += 1;

		updateDysonCost();
	}
}

function buildSphere(){
	if(sphere > Game.interstellar.stars.systemsConquered){
		return;
	}

	if(dyson >= 250 && getResource(RESOURCE.RocketFuel) >= 1000000){
		dyson -= 250;
		Game.resources.takeResource(RESOURCE.RocketFuel, 1000000);
		sphere += 1;

		updateDysonCost();

		if(Game.stargaze.unlocked != true){
			document.getElementById("stargazeTab").className = "";
			Game.stargaze.unlocked = true;
			newUnlock('stargaze');
		}
	}
}
