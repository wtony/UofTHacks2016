// define functions
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function resetLcd(panic_state) {
	switch(panic_state) {
	case NORMAL:
		myLcd.setColor(0,255,0);
		writeLcd('You seem fine.', '');
		break;
	case FALL:
		myLcd.setColor(255,255,0);
		writeLcd('FALL?!?!!!!', 'Alert sent');
		break;
        case STROKE:
                myLcd.setColor(255,255,0);
                writeLcd('STROKE?!?!!!!', 'Alerted. Cooling.');
                break;
	case LOWTEMP:
                myLcd.setColor(255,255,0);
                writeLcd('COLD?!?!!!!', 'Heating.');
		break;
	case HIGHTEMP:
		myLcd.setColor(255,255,0);
                writeLcd('HOT?!?!!!!', 'Cooling.');
		break;
        case OTHER:
                myLcd.setColor(255,255,0);
                writeLcd('OTHER?!?!!!!', 'Alert sent');
                break;

	}
}

function writeLcd(line1, line2) {
	myLcd.clear();
	myLcd.write(line1);
	myLcd.setCursor(1,0);
	myLcd.write(line2);
}
// define panic state
const NORMAL = 0, FALL = 1, STROKE = 2, LOWTEMP = 3, HIGHTEMP = 4,  OTHER = 5;
const FALL_THRESHOLD = 2.8;
var panic_state = NORMAL;

// START
var digitalAccelerometer = require('jsupm_mma7660');
var http = require('http');
var groveSensor = require('jsupm_grove');
var LCD = require('jsupm_i2clcd');
var myLcd = new LCD.Jhd1313m1 (0, 0x3E, 0x62);
var cbutton = new groveSensor.GroveButton(4);
var pbutton = new groveSensor.GroveButton(8);
var temp = new groveSensor.GroveTemp(0);


// Instantiate an MMA7660 on I2C bus 0
var myDigitalAccelerometer = new digitalAccelerometer.MMA7660(
					digitalAccelerometer.MMA7660_I2C_BUS, 
					digitalAccelerometer.MMA7660_DEFAULT_I2C_ADDR);

// place device in standby mode so we can write registers
myDigitalAccelerometer.setModeStandby();

// enable 64 samples per second
myDigitalAccelerometer.setSampleRate(digitalAccelerometer.MMA7660.AUTOSLEEP_64);

// place device into active mode
myDigitalAccelerometer.setModeActive();

var x, y, z;
x = digitalAccelerometer.new_intp();
y = digitalAccelerometer.new_intp();
z = digitalAccelerometer.new_intp();

var ax, ay, az;
ax = digitalAccelerometer.new_floatp();
ay = digitalAccelerometer.new_floatp();
az = digitalAccelerometer.new_floatp();

var outputStr;

var myInterval = setInterval(function()
{
	resetLcd(panic_state);
	// panic button data
	if (pbutton.value()) {
		sleep(500);
		myLcd.setColor(255,0,0);
		for (i=5; i>0; i--) {
			writeLcd('Panic!!!', 'Press if fall ' + i);
                        for (j=0;j<10;j++) {
                                if (pbutton.value()) {
                                        panic_state = FALL;
					http.get("http://192.168.43.110:3000/action/fall");
					break;
                                } else if (cbutton.value())	return;
                                sleep(100);
                        }
			if (panic_state != NORMAL) break;
                }
		if (panic_state != NORMAL) return;
                for (i=5; i>0; i--) {
                        writeLcd('Panic!!!', 'Press if stroke' + i);
                        for (j=0;j<10;j++) {
                                if (pbutton.value()) {
                                        panic_state = STROKE;
					http.get("http://192.168.43.110:3000/action/stroke");
                                        break;
                                } else if (cbutton.value())	return;
                                sleep(100);
                        }
			if (panic_state != NORMAL) break;

                }
		if (panic_state != NORMAL) return;
		for (i=5; i>0; i--) {
                        writeLcd('Panic!!!', 'Press if other' + i);
                        for (j=0;j<10;j++) {
                                if (pbutton.value()) {
                                        panic_state = OTHER;
					http.get("http://192.168.43.110:3000/action/other");
                                        break;
                                } else if (cbutton.value())	return;
                                sleep(100);
                        }
			if (panic_state != NORMAL) break;

		} 

	}
	console.log(temp.value());
	if (temp.value() < 24) {
		panic_state = LOWTEMP;
		http.get("http://192.168.43.110:3000/action/cold");
	} else if (temp.value() > 33) {
		panic_state = HIGHTEMP;
		http.get("http://192.168.43.110:3000/action/hot");
	}

	if (panic_state != NORMAL)
		if (!cbutton.value()) return;
		else panic_state = NORMAL;

	// accelerometer data
	myDigitalAccelerometer.getRawValues(x, y, z);
	outputStr = "Raw values: x = " + digitalAccelerometer.intp_value(x) +
	" y = " + digitalAccelerometer.intp_value(y) +
	" z = " + digitalAccelerometer.intp_value(z);
	console.log(outputStr);

	myDigitalAccelerometer.getAcceleration(ax, ay, az);
	outputStr = "Acceleration: x = " 
		+ roundNum(digitalAccelerometer.floatp_value(ax), 6)
		+ "g y = " + roundNum(digitalAccelerometer.floatp_value(ay), 6) 
		+ "g z = " + roundNum(digitalAccelerometer.floatp_value(az), 6) + "g";
	//console.log(outputStr);
	axf = roundNum(digitalAccelerometer.floatp_value(ax), 6);
	ayf = roundNum(digitalAccelerometer.floatp_value(ay), 6);
        azf = roundNum(digitalAccelerometer.floatp_value(az), 6);


	mag = Math.pow(axf, 2) + Math.pow(ayf, 2) + Math.pow(azf, 2);
	if (mag > FALL_THRESHOLD) {
		console.log("Stroke detected");
		myLcd.setColor(255, 0, 0);
		cancelled = false;
		for (i=5; i>0; i--) {
			myLcd.clear();
			myLcd.write('Stroke detected');
			myLcd.setCursor(1,0);
			myLcd.write('Cancel alert ' + i);
			for (j=0;j<10;j++) {
				if (cbutton.value()) {
					cancelled = true;
					break;
				}
				sleep(100);
			}
			if (cancelled)
				break;
			
		}
		if (!cancelled) {
			panic_state = STROKE;
			http.get("http://192.168.43.110:3000/action/stroke");
		}
	}
}, 100);


// round off output to match C example, which has 6 decimal places
function roundNum(num, decimalPlaces)
{
	var extraNum = (1 / (Math.pow(10, decimalPlaces) * 1000));
	return (Math.round((num + extraNum) 
		* (Math.pow(10, decimalPlaces))) / Math.pow(10, decimalPlaces));
}

// When exiting: clear interval and print message
process.on('SIGINT', function()
{
	clearInterval(myInterval);

	// clean up memory
	digitalAccelerometer.delete_intp(x);
	digitalAccelerometer.delete_intp(y);
	digitalAccelerometer.delete_intp(z);

	digitalAccelerometer.delete_floatp(ax);
	digitalAccelerometer.delete_floatp(ay);
	digitalAccelerometer.delete_floatp(az);

	myDigitalAccelerometer.setModeStandby();

	console.log("Exiting...");
	process.exit(0);
});

module.exports = myInterval;
