d3 technology radar
=====

Thoughtworks make a nice technology radar (http://www.thoughtworks.com/radar/), which is their view of all the interesting tech out there and its level of adoption.

Whilst thoughtworks are pretty clued up, their tech is not all appopriate for me, and I obviously have other tech I'm looking into that they are not.

So, I wanted a way to dynamically track it all, adding bits over time as needed, with the nodes automatically distributing across segments of the radar.

I'd used d3 before so it seemed like a good choice, using the force based layout. I had to revisit trigonometry to get it all working, sin, cos and lovely radians.

The backend is running on AWS Lambda, DynamoDB and API Gateway. You could easily add forms and so on to create and edit nodes. In the data_scripts folder, there are node scripts to upload data in json format to dynamoDB, and a sample file to drop into Lambda to retrieve all the items from the database.

You just need to replace the access key and secret with your own credentials.

A working demo is here:

http://d3-radar.s3-website-us-east-1.amazonaws.com/

