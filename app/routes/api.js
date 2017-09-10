const express         = require('express'),
      admin           = require('firebase-admin'),
      mail            = require('elasticemail'),
      router          = express.Router(),
      serviceAccount  = require("../serviceAccountKey.json"),
      mailCredentials = require("../elasticemail.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pizza-besteller.firebaseio.com"
});
const db = admin.database();

let client = mail.createClient(mailCredentials);

/* GET users listing. */
router.post('/add', function(req, res, next) {
  // check for valid input
  if(!req.body.pizza && !req.body.name && !req.body.email) {
     res.json({error: "pizzawunsch zu lang"})
     return;
  } else if(req.body.pizza.length > 60) {
    res.json({error: "pizzawunsch zu lang"})
    return;
  }

  // post to database
  const uvRef = db.ref('unvalidated');
  uvRef.push({
    name: req.body.name,
    pizza: req.body.pizza,
    email: req.body.email,
    _1109: req.body._1109,
    _1809: req.body._1809,

  // post to db successfull
  }).then(function (snap) {
    const validationId = snap.key;
    const email = req.body.email;
    const name = req.body.name.split(' ')[0];

    // initiate email 
    let html = `<h1 style="font-family: monospace; margin: 0">Jo ${name}, deine Bestellung bei Rolfes\' Seminarfach Pizzabesteller ist eingegangen.</h1> <h1><a style="font-family: monospace;" href="https://malts.me/pizza/api/confirm/${validationId}">Bestellung bestätigen</a></h1>`;
    var msg = {
      from: 'me@malts.me',
      from_name: 'Malte\'s Pizzaservice',
      to: email,
      subject: 'Pizzabestellung bestätigen',
      body_html: html
    };

    //TODO: remove DEBUG:
    // console.log(validationId);
    // res.json({snap: snap, val: validationId, mail: msg});

    // send conformation email
    client.mailer.send(msg, function(err, result) {
      if (err) {
        res.send(err);
        return console.error(err);
      }
      res.json({status: "success"})
    });
  });
});

router.get('/confirm/:id', function(req, res, next) {
  const uvRef = db.ref('unvalidated');
  const valRef =  db.ref('validated'); 
  const url = 'unvalidated/' + req.params.id;
  console.log("'" + url + "'");
  uvRef.child(req.params.id).once('value', function (snapshot) {
    let data = snapshot.val();
    if (data !== null){
      uvRef.child(req.params.id).remove();
      valRef.push(data);
      res.render('validateOrder', {name: data.name.split(' ')[0]})
    } else {
      res.render('validationError');
    }
  });
});

router.get('/send/:id', function(req, res, next) {
  
});

module.exports = router;
