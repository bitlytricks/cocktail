const jsonfile = require("jsonfile");

const CONFIG = jsonfile.readFileSync("config.json");
const rezepte = jsonfile.readFileSync("data/rezepte.json");
const zutaten = jsonfile.readFileSync("data/zutaten.json");

const webapp = require('express')();

webapp.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});


webapp.get('/', function (req, res) {
  res.sendFile(__dirname + "/pages/index.html");
});

webapp.get('/service', function (req, res) {
  res.sendFile(__dirname + "/pages/service.html");
});

webapp.get('/prime/:svName', function (req, res) {
  const primeSvName = req.params["svName"];

  let command = ">";
  for (let i = 1; i <= 16; i++) {
    let svName = "sv"
    if (i < 10) {
      svName += "0";
    }
    svName += i;

    command += svName;
    command += "=";
    command += svName === primeSvName ? "5000" : "0000";
    if (i < 16) {
      command += ";"
    }
  }
  command += "<";
  res.send(command);
});

webapp.get('/rezept/:rezeptId', function (req, res) {
  function getMLforRezept(rezept, sv) {
    for (zutatName in rezept.zutaten) {
      let zutat = zutaten[zutatName];
      if (zutat.ventil instanceof Array && zutat.ventil.find(function(v){return v === sv}) || zutat.ventil === sv) {
        return Math.floor(rezept.zutaten[zutatName] / zutat.mlPerSecond * 1000);
      }
    }
    return 0;
  }
  function buildCommand(selectedRezept) {
    let command = ">";
    for (let i = 1; i <= 16; i++) {
      let svName = "sv"
      if (i < 10) {
        svName += "0";
      }
      svName += i;

      command += svName;
      command += "=";
      command += ("0000" + Math.min(9999,getMLforRezept(selectedRezept, svName))).slice(-4) ;
      if (i < 16) {
        command += ";"
      }
    }
    command += "<";
    return command;
  }
  const rezeptId = parseInt(req.params["rezeptId"]);
  const selectedRezept = rezepte[rezeptId];

  if (selectedRezept === undefined) {
    res.sendStatus(404);
    return;
  }

  let command = buildCommand(selectedRezept);
  res.send(command);
  if (ENABLE_SERIAL) {
    port.write(command);
  }
});

if (CONFIG.serial.enabled) {

  const SerialPort = require('serialport');
  const Ready = SerialPort.parsers.Ready;
  const port = new SerialPort(CONFIG.serial.port, { baudRate: 19200 });
  const parser = port.pipe(new Ready({ delimiter: 'ready' }));

  parser.on('ready', () => {
    console.log('the ready byte sequence has been received');
  })

  parser.on('data', (data) => {
    console.log(data.toString())
  }
  );
}
