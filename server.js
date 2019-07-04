var express = require('express');
var app = express();
var validator = require('validator');

var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fifa';
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var db = MongoClient.connect(mongoUri, function(error, databaseConnection) {
	db = databaseConnection;
});
var ObjectID = require('mongodb').ObjectID;

app.use(express.static(__dirname + '/public'));

function cors(response) {
    response.header("Access-Control-Allow-Origin", "*");
    return response;
}

function objectWithoutKeys(object, keys) {
    var returnObject = new Object();
    for (var k in object) {
        if (keys.indexOf(k) == -1)
            returnObject[k] = object[k];
    }
    return returnObject;
}

function addOrUpdate(collection, query, doc, callback) {
    db.collection(collection, function (error, coll) {
        if (error) {
            callback(error);
            return;
        }
        coll.update(query, doc, { upsert: true }, function(error, results) {
            if (error) {
                callback(error);
                return;
            }
            callback(false, collection, query, doc, results);
        });
    });
}

function search(collection, query, callback) {
    db.collection(collection, function(error, coll) {
        if (error) {
            callback(error);
            return;
        }
        coll.find(query).toArray(function(error, results) {
            if (error) {
                callback(error);
                return;
            }
            callback(false, collection, query, results);
        });
    });
}

function sendSaves(request, response) {
    if (request.query.u)
        var userId = request.query.u;
    else {
        response.send({ error: "Need to specify a user." });
        return;
    }
    var collection = userId + " - saves";
    var query = {};
    search(collection, query, function(error, coll, query, results) {
        if (error)
            response.send({ error: error });
        else
            response.send(results);
    });
}

function sendGame(request, response) {
    if (!request.query.game) {
        response.send(games);
        return;
    }

    if (games[request.query.game])
        response.send(games[request.query.game]);
    else
        response.send({ error: "Could not find game " + request.query.game });
}

function sendLeague(request, response) {
    if (!request.query.league || !request.query.game) {
        response.send(leagues);
        return;
    }

    var index = request.query.league + request.query.game;

    if (leagues[index]) {
        response.send(leagues[index]);
        return;
    }
    response.send({ error: "Could not find league " + request.query.league + "in game " + request.query.game });
}

function save(request, response) {
    if (request.body.u && request.body.s) {
        var newSave = JSON.parse(request.body.s);
        newSave.doc = new Date(newSave.doc);
        var user = request.body.u;
        var query = { name: newSave.name };
        // callback(false, collection, query, doc, results);

        addOrUpdate(user + " - saves", query, newSave, function(error, coll, query, doc, results) {
            if (error)
                response.send(error);
            else
                search(user + " - saves", query, function(error, collection, query, results) {
                    response.send({success: true, save: results[0] });
                });
        });
    }
    else
        response.send({ success: false, error: "Need a user and save" });
}

function getSave(request, response) {
    if (request.query.u && request.query.s) {
        var user = request.query.u;
        var saveId = request.query.s;
        var query = { _id: ObjectID(saveId) };
        search(user + " - saves", query, function(error, coll, query, results) {
            if (error)
                response.send({ success: false, error: error });
            else if (results.length < 0)
                response.send({ success: false, error: "could not find the request save" });
            else {
                results[0].success = true
                response.send(results[0]);
            }
        });
    }
    else
        response.send({ success: false, error: "Need a user and save" });
}

function deleteSave(request, response) {
    if (request.body.u && request.body.s) {
        var user = request.body.u;
        var saveId = request.body.s;
        var query = { _id: ObjectID(saveId) };

        db.collection(user + " - saves", function(error, coll) {
            if (error) {
                response.send({ success: false, error: error });
                return;
            }
            coll.deleteOne(query, function(error) {
                response.send({ success: true });
            });
        });
    }
    else
        response.send({ success: false, error: "Need a user and save" });
}



/******************************************************************************/
/******************************** GET REQUESTS ********************************/
/******************************************************************************/
app.get("/saves", function(request, response) {
    response = cors(response);
    sendSaves(request, response);
});

app.post("/delete", function(request, response) {
    response = cors(response);
    deleteSave(request, response);
})

app.post("/save", function(request, response) {
    response = cors(response);
    save(request, response);
});
app.get("/save", function(request, response) {
    response = cors(response);
    getSave(request, response);
})

app.get('/new_game', function(request, response) {
    response.sendFile(__dirname + '/public/newGame.html');
});

app.get('/setup', function(request, response) {
    response = cors(response);
    response.send(games);
});

app.get('/play', function(request, response) {
    response = cors(response);
    response.sendFile(__dirname + '/public/choose_save.html');
});

app.get('/play/*', function(request, response) {
    response.sendFile(__dirname + '/public/play.html');
});

app.get('/league', function(request, response) {
    response = cors(response);
    sendLeague(request, response);
});

app.get('/', function(request, response) {
    response.sendFile(__dirname + '/public/index.html');
});

app.listen(process.env.PORT || 8888);



/******************************************************************************/
/********************************* TEMPLATES **********************************/
/******************************************************************************/
var games = new Object();
// games["FIFA 18"] = { leagues: ['MLS'] };

var leagues = new Object();
var mlsEast = ['Atlanta United', 'Chicago Fire', 'Columbus Crew SC', 'D.C. United', 'Impact Montreal', 'New England', 'New York City FC', 'NY Red Bulls', 'Orlando City', 'Philadelphia', 'Toronto FC'];
var mlsWest = ['Colorado Rapids', 'FC Dallas', 'Houston Dynamo', 'LAFC', 'LA Galaxy', 'Minnesota United', 'Portland Timbers', 'Real Salt Lake', 'Seattle Sounders', 'SJ Earthquakes', 'Sporting KC', 'Whitecaps FC'];
var mlsfifa19 = { 
    name: "MLS", 
    seasonStart: new Date(2018, 1, 1), 
    seasonEnd: new Date(2018, 12, 31), 
    teams: mlsEast.concat(mlsWest), 
    competitions: {
        MLS: { name: 'MLS', divisions: {
                "Eastern Conference": { name: "Eastern Conference", teams: mlsEast }, 
                "Western Conference": { name: "Western Conference", teams: mlsWest }
            }
        }, 
        "U.S. Open Cup": { name: 'U.S. Open Cup', divisions: {
                "U.S. Open Cup": { name: "U.S. Open Cup", teams: mlsEast.concat(mlsWest) }
            }
        }
    }
};
var mlsfifa18 = { name: 'MLS', seasonEnd: new Date(), teams: ['Atlanta United', 'Chicago Fire', 'Colorado Rapids', 'Columbus Crew SC', 'D.C. United', 'FC Dallas', 'Houston Dynamo', 'Impact Montreal', 'LA Galaxy', 'Minnesota United', 'New England', 'New York City FC', 'NY Red Bulls', 'Orlando City', 'Philadelphia', 'Portland Timbers', 'Real Salt Lake', 'Seattle Sounders', 'SJ Earthquakes', 'Sporting KC', 'Toronto FC', 'Whitecaps FC'], competitions: ['MLS', 'U.S. Open Cup'] };

games["FIFA 19"] = { leagues: { MLS: mlsfifa19 } };