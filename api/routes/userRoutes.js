'use strict';

module.exports = function(app) {
    
    var userController = require('../controllers/userController');
    
    app.route('/users')
        .post(userController.new_user);

    app.route('/users/:userId')
        .put(userController.update_user)
        .delete(userController.delete_user)
        .get(userController.view_user);

    app.route('/users/authentication')
        .post(userController.authenticate_user);
};
