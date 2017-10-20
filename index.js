const jsonfile = require("jsonfile");

const CONFIG = jsonfile.readFileSync("config.json");
const rezepte = jsonfile.readFileSync("data/rezepte.json");
rezepte.forEach(rezept => {
  var sum = 0;
  for (zutat in rezept.zutaten) {
    sum += rezept.zutaten[zutat];
  }
  rezept.factor = rezept.oneServing / sum;
})
const zutaten = jsonfile.readFileSync("data/zutaten.json");

const webapp = require('express')();

webapp.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});


webapp.get('/', function (req, res) {
  res.sendFile(__dirname + "/pages/index.html");
});

webapp.get('/img/UI.jpg', function (req, res) {
  res.sendFile(__dirname + "/pages/img/UI.jpg");
});

webapp.get('/img/mixing.jpg', function (req, res) {
  res.sendFile(__dirname + "/pages/img/mixing.jpg");
});

webapp.get('/img/countdown.gif', function (req, res) {
  res.sendFile(__dirname + "/pages/img/countdown.gif");
});

webapp.get('/img/done.jpg', function (req, res) {
  res.sendFile(__dirname + "/pages/img/done.jpg");
});

webapp.get('/service', function (req, res) {
  res.sendFile(__dirname + "/pages/service.html");
});

webapp.get('/open/:svName/:duration', function (req, res) {
  const svNames = req.params["svName"].split(",");
  const duration = req.params["duration"];

  let command = ">";
  for (let i = 1; i <= 16; i++) {
    let svName = "sv"
    if (i < 10) {
      svName += "0";
    }
    svName += i;

    command += svName;
    command += "=";
    if (svNames.find((name) => (name === svName))) {
      command += ("0000" + duration).slice(-4);
    }
    else {
      command += "0000";
    }
    if (i < 16) {
      command += ";"
    }
  }
  command += "<";
  if (CONFIG.serial.enabled) {
    port.write(command);
  }
  else {
    console.log(command);
  }
  res.send(command);
});

webapp.get('/rezept/:rezeptId', function (req, res) {
  function getMLforRezept(rezept, sv) {
    for (zutatName in rezept.zutaten) {
      let zutat = zutaten[zutatName];
      if (zutat.ventil instanceof Array && zutat.ventil.find(function(v){return v === sv}) || zutat.ventil === sv) {
        return Math.floor(rezept.zutaten[zutatName] / zutat.mlPerSecond * 1000 * rezept.factor);
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
  else {
    console.log(selectedRezept.name);
  }

  let command = buildCommand(selectedRezept);
  res.send(command);
  if (CONFIG.serial.enabled) {
    port.write(command);
  }
  else {
    console.log(command);
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
