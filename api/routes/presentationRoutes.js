'use strict';

module.exports = function(app) {

    var presentationController = require('../controllers/presentationController');

    app.route('/presentations')
        .post(presentationController.new_presentation);
}
