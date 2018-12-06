module.exports.subscribe_to_session = function(admin){
    return function(req, res) {
        
        var client_token = req.body.client_token;
        var session_code = req.params.sessionCode;

        admin.messaging()
            .subscribeToTopic(client_token, session_code)
            .then(function(response){
                console.log("Successfully subscribed to topic " + topic_name);
            })
            .catch(function(error){
                console.log("Error when subscribing to topic " + topic_name + ": " + error);
            });
    }
}

module.exports.unsubscribe_from_session = function(admin){
    return function(req, res) {
        
        var client_token = req.body.client_token;
        var session_code = req.params.sessionCode;

        admin.messaging()
            .unsubscribeFromTopic(client_token, session_code)
            .then(function(response){
                console.log("Successfully unsubscribed from topic " + topic_name);
            })
            .catch(function(error){
                console.log("Error when unsubscribing from topic " + topic_name + ": " + error);
            });
    }
}
