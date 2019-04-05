'use strict';
 
var Service;
var Characteristic;
 
module.exports = function (homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-blinds-rf", "BlindsRF", BlindsRFAccessory);
};
 
function BlindsRFAccessory(log, config) {
	// global vars
	this.log = log;
 
	// configuration vars
	this.name = config["name"];
	this.upRawcode = config["up_rawcode"];
	this.downRawcode = config["down_rawcode"];
	this.stopRawcode = config["stop_rawcode"];
	this.motionTime = config["motion_time"];
 
	// state vars
	this.interval = null;
	this.timeout = null;
	this.lastPosition = 0; // last known position of the blinds, down by default
    this.currentPositionState = 2; // stopped by default
    this.currentTargetPosition = 0; // down by default
 
	// register the service and provide the functions
	this.service = new Service.WindowCovering(this.name);
 
	// the current position (0-100%)
	this.service
        .getCharacteristic(Characteristic.CurrentPosition)
    	.on('get', this.getCurrentPosition.bind(this));
 
	// the position state
	// 0 = DECREASING; 1 = INCREASING; 2 = STOPPED;
	this.service
        .getCharacteristic(Characteristic.PositionState)
    	.on('get', this.getPositionState.bind(this));
 
	// the target position (0-100%)
	this.service
        .getCharacteristic(Characteristic.TargetPosition)
    	.on('get', this.getTargetPosition.bind(this))
    	.on('set', this.setTargetPosition.bind(this));
}
 
BlindsRFAccessory.prototype.getCurrentPosition = function(callback) {
    this.log("Requested CurrentPosition: %s", this.lastPosition);
	callback(null, this.lastPosition);
}
 
BlindsRFAccessory.prototype.getPositionState = function(callback) {
    this.log("Requested PositionState: %s", this.currentPositionState);
	callback(null, this.currentPositionState);
}
 
BlindsRFAccessory.prototype.getTargetPosition = function(callback) {
    this.log("Requested TargetPosition: %s", this.currentTargetPosition);
	callback(null, this.currentTargetPosition);
}
 
BlindsRFAccessory.prototype.setTargetPosition = function(pos, callback) {
	this.log("Set TargetPosition: %s", pos);
    this.currentTargetPosition = pos;
	if (this.currentTargetPosition == this.lastPosition)
	{
  	if (this.interval != null) clearInterval(this.interval);
  	if (this.timeout != null) clearTimeout(this.timeout);
      this.log("Already here");
  	callback(null);
  	return;
    }
	const moveUp = (this.currentTargetPosition >= this.lastPosition);
	this.log((moveUp ? "Moving up" : "Moving down"));
 
	this.service
        .setCharacteristic(Characteristic.PositionState, (moveUp ? 1 : 0));
 
	this.rfTransmit((moveUp ? this.upRawcode : this.downRawcode), function() {
        this.log("Success moving %s", (moveUp ? "up (to "+pos+")" : "down (to "+pos+")"))
    	this.service
            .setCharacteristic(Characteristic.CurrentPosition, pos);
    	this.service
            .setCharacteristic(Characteristic.PositionState, 2);
 
	}.bind(this));
 
	var localThis = this;
	if (this.interval != null) clearInterval(this.interval);
	if (this.timeout != null) clearTimeout(this.timeout);
	this.interval = setInterval(function(){
      localThis.lastPosition += (moveUp ? 1 : -1);
      //localThis.log("last Position %s, current target position %s", localThis.lastPosition, localThis.currentTargetPosition)
 
  	if (localThis.lastPosition == localThis.currentTargetPosition) {
    	if (localThis.currentTargetPosition != 0 && localThis.currentTargetPosition != 100) {
      	localThis.rfTransmit(localThis.stopRawcode, function() {
              localThis.log("Success stop moving %s", (moveUp ? "up (to "+pos+")" : "down (to "+pos+")"))
              localThis.service
                  .setCharacteristic(Characteristic.CurrentPosition, pos);
                  localThis.service
                  .setCharacteristic(Characteristic.PositionState, 2);
                  localThis.lastPosition = pos;
 
 
                }.bind(localThis));
    	}
        clearInterval(localThis.interval);
  	}
	}, parseInt(this.motionTime) / 100);
	if (this.currentTargetPosition == 0 || this.currentTargetPosition == 100) {
  	this.timeout = setTimeout(function() {
    	localThis.rfTransmit(localThis.stopRawcode, function() {
            localThis.log("Success stop adjusting moving %s", (moveUp ? "up (to "+pos+")" : "down (to "+pos+")"))
              }.bind(localThis));
  	}, parseInt(this.motionTime))
	}
	callback(null);
}
 
BlindsRFAccessory.prototype.rfTransmit = function(rawcode, callback) {
	pilight = "pilight-send -p raw -c ";
	cmd = pilight.concat("\"", rawcode, "\"");
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      return;
    } 
    if (tout) {
      clearTimeout(tout);
      callback(error);
    }
  });
},
 
BlindsRFAccessory.prototype.getServices = function() {
  return [this.service];
}

