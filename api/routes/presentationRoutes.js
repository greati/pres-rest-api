'use strict';

module.exports = function(app) {

    var presentationController = require('../controllers/presentationController');

    app.route('/presentations')
        .post(presentationController.new_presentation);

    app.route('/sessions')
        .post(presentationController.new_session);

    app.route('/sessions/participations')
        .post(presentationController.new_participation);

    app.route('/questions')
        .post(presentationController.new_question);

    app.route('/questions/answers')
        .post(presentationController.new_answer);
}
