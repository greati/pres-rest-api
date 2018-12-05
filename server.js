var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    mongoose = require('mongoose'),
    User = require('./api/models/userModel'),
    Presentation = require('./api/models/presentationModel'),
    Presentation = require('./api/models/presSessionModel'),
    Question = require('./api/models/questionModel');
    AlternativeAnswer = require('./api/models/alternativeAnswerModel');
    OneChoiceQuestion = require('./api/models/oneAnswerQuestionModel');
    PartSession = require('./api/models/partSessionModel');
    Answer = require('./api/models/answerModel');
    AnswerChoice = require('./api/models/answerChoiceModel');
    bodyParser = require('body-parser');

const EventEmitter = require("events");

// Start firebase admin
var admin = require('firebase-admin');

var serviceAccount = require('/home/vitorgreati/pres-ae33c-firebase-adminsdk-vy4rg-d916570045.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://pres-ae33c.firebaseio.com'
});

// firebase events config
var firebase_emitter = new EventEmitter();
var firebase_events = require('./api/events/firebaseEvents');
firebase_events(firebase_emitter, admin);

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/PresDB', { useNewUrlParser: true });

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

var userRoutes = require('./api/routes/userRoutes');
userRoutes(app);

var presentationRoutes = require('./api/routes/presentationRoutes');
presentationRoutes(app, firebase_emitter);

var firebaseRoutes = require('./api/routes/firebaseRoutes');
firebaseRoutes(app);

app.listen(port);

console.log('Pres api started on ' + port);
