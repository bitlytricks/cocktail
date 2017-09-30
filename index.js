const ENABLE_SERIAL = false;
const SERIAL_PORT = "COM3"

const express = require('express');
const app = express();

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});

const jsonfile = require("jsonfile");
var rezepte = jsonfile.readFileSync("rezepte.json");
var zutaten = jsonfile.readFileSync("zutaten.json");

app.get('/rezept/:rezeptId', function (req, res) {
  const rezeptId = parseInt(req.params["rezeptId"]);
  const selectedRezept = rezepte[rezeptId];

  function getMLforRezept(rezept, sv) {
    for (zutatName in rezept.zutaten) {
      var zutat = zutaten[zutatName];
      if (zutat.ventil === sv) {
        return rezept.zutaten[zutatName] / zutat.mlPerSecond * 1000;
      }
    }
    return 0;
  }

  var command = ">";
  for (var i = 1; i <= 16; i++) {
    var svName = "sv"
    if (i < 10) {
      svName += "0";
    }
    svName += i;

    command += svName;
    command += "=";
    command += getMLforRezept(selectedRezept, svName);
    if (i < 16) {
      command += ";"
    }
  }
  command += "<";
  res.send(command);
  if (ENABLE_SERIAL) {
    port.write(command);
  }
})

if (ENABLE_SERIAL) {

  const SerialPort = require('serialport');
  const Ready = SerialPort.parsers.Ready;
  const port = new SerialPort(SERIAL_PORT, { baudRate: 19200 });
  const parser = port.pipe(new Ready({ delimiter: 'ready' }));

  parser.on('ready', () => {
    console.log('the ready byte sequence has been received');
  })

  parser.on('data', (data) => {
    console.log(data.toString())
  }
  );
}