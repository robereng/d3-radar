var AWS = require("aws-sdk");

// Set region for future requests.
AWS.config.region = 'us-east-1';
AWS.config.accessKeyId = 'YOUR ACCESS KEY';
AWS.config.secretAccessKey = 'YOUR SECRET';

var docClient = new AWS.DynamoDB.DocumentClient();

console.log("Querying for all nodes");

docClient.scan({
        TableName : "radar-nodes",
        Limit : 50
    }, function(err, data) {
        if (err) { console.log(err); return; }

        for (var ii in data.Items) {
            ii = data.Items[ii];
            console.log(ii.name);
            console.log(ii.description);
        }
});