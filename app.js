var nodeBattery = require('node-battery'),
  exec = require('child_process').exec,
  schedule = require('node-schedule'),
  growl = require('notify-send')

// Generating log file
var winston = require('winston')
var logger = new (winston.Logger)({
  transports: [
    new winston.transports.File({
      filename: '/tmp/node_battery_monitor.log',
      json: true,
      maxsize: 5000000
    }),
    new (winston.transports.Console)({
      colorize: true,
      prettyPrint: true
    })
  ]
})

var isCharging = false

logger.info('Node Battery Monitor - Starting')

var rule = new schedule.RecurrenceRule()
rule.second = 1
var j = schedule.scheduleJob(rule, function () {
  inspectBattery()
})

function inspectBattery () {
  nodeBattery.isCharging(function (data) {
    var isCharging = data[0]

    logger.info('Node Battery Monitor - Is Charging: ', !!isCharging)

    nodeBattery.percentages(function (data) {
      var percent = data[0]

      logger.info('Node Battery Monitor - Percent ', percent + '%')

      if (percent <= 18 && !isCharging) { sleep() }

      if (percent <= 35 && !isCharging) { alert(percent) }

      if (percent > 85 && isCharging) { charged(percent) } else { logger.info('Node Battery Monitor - Nothing to Do') }
    })
  })
}

function alert (percent) {
  var msg = 'Battery is Down! ' + percent + '%'

  growl.critical.notify('Node Battery Monitor', msg)
  logger.info(msg)
}

function charged (percent) {
  var msg = 'Battery is Charged ' + percent + '%'

  growl.normal.notify('Node Battery Monitor', msg)
  logger.info(msg)
}

function sleep () {
  logger.info('Node Battery Monitor - System is going down for sleep now')
  exec('bash -c "systemctl suspend"', function (error, stdout, stderr) {
    logger.info('Node Battery Monitor - Sleeped! ')
  })
}

inspectBattery()
