module.exports = function(app) {

    var firebaseController = require('../controllers/firebaseController');

    app.route('sessions/:sessionCode/subscribe')
        .post(firebaseController.subscribe_to_session);

    app.route('sessions/:sessionCode/unsubscribe')
        .post(firebaseController.unsubscribe_from_session);

};
