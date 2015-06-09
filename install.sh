# https://github.com/chovy/node-startup
echo 'Node Battery Monitor - Installing ...'

export APP_HOME="/opt/node_battery_monitor"
rm -Rf $APP_HOME
mkdir $APP_HOME

echo 'Node Battery Monitor - Copyng files ...'
cp -Rf app.js $APP_HOME/
cp -Rf package.json $APP_HOME/
cp -Rf node_battery_monitor_daemon.conf /etc/init/

cd $APP_HOME

npm -d install

echo 'complete';

exit 0;
