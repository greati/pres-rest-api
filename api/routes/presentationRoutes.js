'use strict';

module.exports = function(app, firebase_emitter) {

    var presentationController = require('../controllers/presentationController');

    app.route('/presentations')
        .post(presentationController.new_presentation);

    app.route('/presentations/:presId')
        .put(presentationController.update_presentation)
        .get(presentationController.read_presentation)
        .delete(presentationController.delete_presentation);

    app.route('/users/:userId/presentations')
        .get(presentationController.list_presentations);

    app.route('/sessions')
        .post(presentationController.new_session);

    app.route('/presentations/:presId/sessions')
        .get(presentationController.list_sessions_pres);

    app.route('/sessions/participations')
        .post(presentationController.new_participation);

    app.route('/questions')
        .post(presentationController.new_question);

    app.route('/sessions/:sessionId/questions')
        .get(presentationController.list_questions_session);

    app.route('/sessions/:sessionId/open')
        .post(presentationController.open_session);

    app.route('/sessions/:sessionId/close')
        .post(presentationController.close_session);

    app.route('/sessions/participations/enter')
        .post(presentationController.enter_session(firebase_emitter));

    app.route('/sessions/participations/quit')
        .post(presentationController.quit_session(firebase_emitter));

    app.route('/users/:userId/participations')
        .get(presentationController.list_parts_user);
    
    app.route('/questions/:questionId/open')
        .post(presentationController.open_question(firebase_emitter));

    app.route('/questions/:questionId/close')
        .post(presentationController.close_question);

    app.route('/questions/answers')
        .post(presentationController.new_answer);

    app.route('/questions/:questionId/answers')
        .get(presentationController.list_answers);
}
