module.exports = function(emitter, admin) {
	
    emitter.on('quit_session', function(client_token, session_code){
        admin.messaging()
            .unsubscribeFromTopic(client_token, '/topics/'+session_code)
            .then(function(response){
                console.log("Successfully unsubscribed from topic " + session_code);
            })
            .catch(function(error){
                console.log("Error when unsubscribing from topic " + session_code + ": " + error);
            });
    });

    emitter.on('enter_session', function(client_token, session_code){
            admin.messaging()
            .subscribeToTopic(client_token, session_code)
            .then(function(response){
                console.log("Successfully subscribed to topic " + session_code + ", client " + client_token);
            })
            .catch(function(error){
                console.log("Error when subscribing to topic " + session_code + ": " + error);
            });

    });

	emitter.on('notifyTopic', function(topic_name, payload) {
		
		admin.messaging().sendToTopic(topic_name, payload)
			.then(function(response){
				console.log("Sent message to: " + topic_name + "," + response);
			})
			.catch(function(error){
				console.log("An error occurred: " + error);
			});

	});

};
