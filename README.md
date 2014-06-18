d3 technology radar
=====

Thoughtworks make a nice technology radar (http://www.thoughtworks.com/radar/), which is their view of all the interesting tech out there and its level of adoption.

Whilst thoughtworks are pretty clued up, their tech is not all appopriate for me, and I obviously have other tech I'm looking into that they are not.

So, I wanted a way to dynamically track it all, adding bits over time as needed.

I'd used d3 before so it seemed like a good choice. Using the force based layout seemed right, as i wanted the nodes to automatically distribute across a segment of the radar.

I had to revisit trigonometry lessons to get it all working, sin, cos and lovely radians.

So it works quite nicely. If you want to set this up for yourself, the backend is running on node, the database is couchDB. You can get free couchDb hosting at iris (iriscouch.com/). Just update the URLs in app.js once you have your database.

Documentation
=====

Download, look at the source and work it out :-)

