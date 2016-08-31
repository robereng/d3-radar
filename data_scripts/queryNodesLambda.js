console.log('Loading event');
var AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = function(event, context) {

    console.log("Querying for all nodes");

    docClient.scan({
        TableName : "radar-nodes",
        Limit : 50
    }, function(err, data) {
        if (err) { 
            context.fail('ERROR: Dynamo failed: ' + err);
        }
        else{
            context.done(null, data.Items);
        }
    });

};