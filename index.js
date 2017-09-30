var rezept1 = {
  name: "Name",
  description: "Beschreibung",
  img: "rezept1.png",
  zutaten: {
    COLA: 350,
    RUM: 40,
    ZITRONE: 10
  }
};

var zutaten = {
COLA: {
  name: "Coca Cola",
  ventil: "sv01",
  mlPerSecond: "35"
},
RUM: {
  name: "Havanna",
  ventil: "sv02",
  mlPerSecond: "20"
},
ZITRONE: {
  name: "Zitronensaft",
  ventil: "sv03",
  mlPerSecond: "10"
}
}
var rezepte = [
  rezept1
];



const express = require('express')
const app = express()

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.get('/rezept/1', function (req, res) {

  function getMLforRezept(rezept, sv) {
    for (zutatName in rezept.zutaten) {
      var zutat = zutaten[zutatName];
      if (zutat.ventil === sv) {
        return rezept.zutaten[zutatName] / zutat.mlPerSecond * 1000;
      }
    }
    return 0;
  }

  var selectedRezept = rezepte[0];

  var command = ">";
  for (var i=1; i<=16; i++) {
    var svName = "sv"
    if (i < 10) {
      svName+="0";
    }
    svName+=i;

    command+=svName;
    command+="=";
    command+=getMLforRezept(selectedRezept, svName);
    if (i < 16) {
      command+=";"
    }
  }
  command += "<";
  res.send(command);
  port.write(command);
})

app.get('/rezept/2', function (req, res) {
  res.send('Ich bin eine Null!');
  port.write("0");
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

const SerialPort = require('serialport');
const Ready = SerialPort.parsers.Ready;
const port = new SerialPort('COM3', {baudRate:19200});
const parser = port.pipe(new Ready({ delimiter: 'ready' }));
let state = false;
parser.on('ready', () => {
  console.log('the ready byte sequence has been received');
})
parser.on('data', (data) => {
  console.log(data.toString())}
); // all data after READY is received 

function toggle() {
  state=!state;
  port.write(state?"1":"0");
}