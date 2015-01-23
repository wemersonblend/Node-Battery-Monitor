var nodeBattery = require("node-battery");
var exec = require('child_process').exec;
var schedule = require('node-schedule');

// Generating log file
var winston = require('winston');
var logger = new (winston.Logger)({
	transports: [
		new winston.transports.File({ 
			filename: '/var/log/node_battery_monitor.log' ,
			json: true,
			maxsize: 5000000
		}),
		new (winston.transports.Console)({
			colorize: true,
			prettyPrint : true
		})

	] 
});


var isCharging = false;



logger.info('Node Battery Monitor - Starting');

var rule = new schedule.RecurrenceRule();
rule.second = 1;
var j = schedule.scheduleJob(rule, function(){

	inspectBattery();
	
});

function inspectBattery() {
	nodeBattery.isCharging(function(data){
		var isCharging = data[0];

		logger.info('Node Battery Monitor - Is Charging: ', !!isCharging);

		nodeBattery.percentages(function(data){
			var percent = data[0];

			logger.info('Node Battery Monitor - Percent ', percent + '%');

			if (percent <= 12 && !isCharging) {
				sleep();
			}if (percent <= 15 && !isCharging) {
				alert(percent);
			} if (percent > 90 && isCharging) { 
				charged(percent);
			} else {
				logger.info('Node Battery Monitor - Nothing to Do');
			}
		});
	});
}

function alert(percent) {
	var msg = 'bash -c "notify-send \'Node Battery Monitor\' \'Battery is Down!'+percent+'%\'"';

	exec(msg, function (error, stdout, stderr) {
		logger.info(msg);
	});
}

function charged(percent) {
	var msg = 'bash -c "notify-send \'Node Battery Monitor\' \'Battery is Charged '+percent+'%\'"';

	exec(msg, function (error, stdout, stderr) {
		logger.info(msg);
	});
}

function sleep() {
	logger.info('Node Battery Monitor - Sleeping');
	exec('sudo bash -c "sleep 1s; pm-suspend"', function (error, stdout, stderr) {
		logger.info('Node Battery Monitor - Sleeped! ');
	});
}

inspectBattery();

