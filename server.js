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

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/PresDB', { useNewUrlParser: true });

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

var userRoutes = require('./api/routes/userRoutes');
userRoutes(app);

var presentationRoutes = require('./api/routes/presentationRoutes');
presentationRoutes(app);

app.listen(port);

console.log('Pres api started on ' + port);
