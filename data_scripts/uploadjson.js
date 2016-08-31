// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
var fs = require('fs');
var uuid = require('uuid');

// Set region for future requests.
AWS.config.region = 'us-east-1';
AWS.config.accessKeyId = 'YOUR ACCESS KEY';
AWS.config.secretAccessKey = 'YOUR SECRET';

var docClient = new AWS.DynamoDB.DocumentClient();

console.log("Importing movies into DynamoDB. Please wait.");

var allNodes = JSON.parse(fs.readFileSync('nodes.json', 'utf8'));
allNodes.forEach(function(node) {
    var params = {
        TableName: "radar-nodes",
        Item: {
            "name":  node.name,
            "description": node.description,
            "stage":  node.stage,
            "type": node.type,
            "id": uuid.v4()
        }
    };

    docClient.put(params, function(err, data) {
       if (err) {
           console.error("Unable to add node", node.name, ". Error JSON:", JSON.stringify(err, null, 2));
       } else {
           console.log("PutItem succeeded:", node.name);
       }
    });
});