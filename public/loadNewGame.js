var newSave;

function loadFifaContent() {
    var auth = new MAuth(function() {
        auth.login(function(user) {
            loadScript("loadFifaCommon.js", showForm(user._id));
        });
    });
}

function showForm(user) {
    console.log(user);
    var formText = 
        "<form id='newGame' action='javascript:void(0)' onsubmit='saveGame(\"" + user + "\")'>\
            <label for='saveName'>Name your new save file:</label>\
            <input id='saveName' type='text' required>\
            <label for='gameSelect'>Choose a game:</label>\
            <select id='gameSelect' required>\
                <option value='' disabled selected>---</option>\
            </select><br>\
            <label for='leagueSelect'>Choose a league:</label>\
            <select id='leagueSelect' required disabled>\
                <option value='' disabled selected>---</option>\
            </select><br>\
            <label for='teamSelect'>Choose a team:</label>\
            <select id='teamSelect' required disabled>\
                <option value='' disabled selected>---</option>\
            </select><br>\
            For player positions please list each of their positions, separated by commas, in the order of preference.\
            <table id='players'><tr><th>Name</th>\
                    <th onclick='sort(\"position\")'>Position</th>\
                    <th>Age</th>\
                    <th>Wage</th>\
                    <th>Contract Years Remaining</th>\
                    <th>Value</th>\
                    <th>Nationality</th>\
                    <th>Overall</th>\
                    <th></th></tr>";
    for (var i = 0; i < 18; i = i + 1)
        formText = formText + playerInfo;
    formText = formText + 
        "   <tr><td colspan='9'><button onclick='addPlayer(this)'>Add Player</button></td></tr></table>\
            <button type='button' onclick='exportPlayers()'>Export Current Roster</button>\
            <button type='button' onclick='importPlayers()'>Import to Current Roster</button>\
            <textarea id='rosterJson'></textarea>\
            <input type='submit' value='New Game'>\
        </form>";
    $("#fifaContent").html(formText);
    $("select").change(user, formChange);
    $(".removePlayer").attr("disabled", true);
    // $("input").attr("required", true);
    // $("select").attr("required", true);
    showGames(user);
}

function formChange(user) {
    if ($(this).attr('id') == "gameSelect")
        showLeagues(user);
    else if ($(this).attr('id') == "leagueSelect")
        showTeams(user);
}

function showGames(user) {
    var request = new XMLHttpRequest();
    var getUrl = baseUrl + "game";
    request.open("GET", getUrl, true);
    request.onreadystatechange = function() {
        if (request.readyState != 4)
            return;
        var results = JSON.parse(request.responseText);
        if (results.error) {
            fifaError(results.error);
            return;
        }
        var games = "<option value='' disabled selected>---</option>";;
        for (key in results) {
            games = games + "<option value='" + key + "'>" + key + "</option>";
        }
        $("#gameSelect").html(games);
    }
    request.send();
}

function showLeagues(user) {
    var game = $("#gameSelect").val();
    var getUrl = baseUrl + "game?game=" + game;
    var request = new XMLHttpRequest();
    request.open("GET", getUrl, true);
    request.onreadystatechange = function() {
        if (request.readyState != 4)
            return;
        var results = JSON.parse(request.responseText);
        if (results.error) {
            fifaError(results.error);
            return;
        }
        var leagues = "<option value='' disabled selected>---</option>";
        results.leagues.forEach(function (l) {
            leagues = leagues + "<option value='" + l + "'>" + l + "</option>"; 
        });
        $("#leagueSelect").html(leagues);
        $("#leagueSelect").attr('disabled', false);
        $("#teamSelect").attr('disabled', true);
    }
    request.send();
}

function showTeams(user) {
    var game = $("#gameSelect").val();
    var league = $("#leagueSelect").val();
    var getUrl = baseUrl + "league?game=" + game + "&league=" + league;
    var request = new XMLHttpRequest();
    request.open("GET", getUrl, true);
    request.onreadystatechange = function() {
        if (request.readyState != 4)
            return;
        var results = JSON.parse(request.responseText);
        if (results.error) {
            fifaError(results.error);
            return;
        }
        var teams = "<option value='' disabled selected>---</option>";
        results.teams.forEach(function (t) {
            teams = teams + "<option value='" + t + "'>" + t + "</option>"; 
        });
        $("#teamSelect").html(teams);
        $("#teamSelect").attr('disabled', false);
    }
    request.send();
}

function useTeam(user) {

}

function addPlayer(player) {
    player.parentNode.parentNode.outerHTML =
        playerInfo
        + player.parentNode.parentNode.outerHTML;
    $(".removePlayer").attr("disabled", false);
}

function resetPlayer(player) {
    player.parentNode.parentNode.outerHTML = playerInfo;
}
function removePlayer(player) {
    if (player.parentNode.parentNode.parentNode.children.length <= 21)
        $(".removePlayer").attr("disabled", true);
    player.parentNode.parentNode.outerHTML = "";
}

function getPlayers() {
    var playerTable = document.getElementById("players");
    var playerRows = playerTable.children[0].children;
    var players = [];
    for (let i = 1; i < playerRows.length - 1; i++)
        players[i - 1] = getPlayer(playerRows[i]);
    return players;
}

function setPlayers(players) {
    var playerTable = document.getElementById("players");
    var playerRows = playerTable.children[0].children;
    for (let i = playerRows.length; i < players.length + 2; i++)
        addPlayer(document.getElementById("players").children[0].children[4].children[0].children[0]);
    var playerTable = document.getElementById("players");
    var playerRows = playerTable.children[0].children;
    for (let i = 0; i < players.length; i++) {
        setPlayer(playerRows[i + 1], players[i]);
    }
}

function getPlayer(playerRow) {
    var player = newPlayerObject();
    player.name = playerRow.children[0].children[0].value;
    player.position = $(playerRow.children[1].children[0]).val().replace(/ /g, '').toUpperCase().split(',').filter(p => positionList().indexOf(p) > -1);
    player.attr.age = getInt(playerRow.children[2].children[0].value);
    player.attr.wage = getInt(playerRow.children[3].children[0].value);
    player.attr.contract = getInt(playerRow.children[4].children[0].value);
    player.attr.value = getInt(playerRow.children[5].children[0].value);
    player.attr.nationality = playerRow.children[6].children[0].value;
    player.attr.overall = getInt(playerRow.children[7].children[0].value);
    return player;
}

function getInt(strRep) {
    var intRep = parseInt(strRep, 10);
    if (isNaN(intRep) || intRep == null)
        intRep = 0;
    return intRep;
}

function setPlayer(playerRow, player) {
    playerRow.children[0].children[0].value = player.name;
    playerRow.children[1].children[0].value = player.position;
    playerRow.children[2].children[0].value = player.attr.age;
    playerRow.children[3].children[0].value = player.attr.wage;
    playerRow.children[4].children[0].value = player.attr.contract;
    playerRow.children[5].children[0].value = player.attr.value;
    playerRow.children[6].children[0].value = player.attr.nationality;
    playerRow.children[7].children[0].value = player.attr.overall;
}

function exportPlayers() {
    $("#rosterJson").val(JSON.stringify(getPlayers()));
    return false;
}

function importPlayers() {
    var players = JSON.parse($("#rosterJson").val());
    setPlayers(players);
    return false;
}

var nationalities = 
    ['American', 'Argentinian', 'Bosnian', 'Brazilian', 'Cameroonian', 'Canadian', 'Cape Verdean', 'Congolese', 'Dutch', 'English', 'French', 'German', 'Guyanese', 'Jamaican', 'Mexican', 'Polish', 'Scottish', 'Spanish']
var playerInfo = 
    "<tr><td><input type='text' class='fifaRoster'></td>\
        <td><input type='text' class='fifaRoster'></td>\
        <td><input type='number' class='fifaRoster'></td>\
        <td><input type='number' class='fifaRoster'></td>\
        <td><input type='number' class='fifaRoster'></td>\
        <td><input type='number' class='fifaRoster'></td>\
        <td><select class='fifaRoster'><option value='' disabled selected>---</option>";
nationalities.forEach(function(n) {
    playerInfo = playerInfo + "<option value='" + n + "'>" + n + "</option>";
});
playerInfo = playerInfo + "</select></td>\
        <td><input type='number' class='fifaRoster'></td>\
        <td><button onclick='resetPlayer(this)' class='fifaRoster'>Reset</button></td>\
        <td><button class='removePlayer' onclick='removePlayer(this)' class='fifaRoster'>Remove</button></td>\
    </tr>";

function sort(field) {
    if (field == 'position') {
        var players = getPlayers();
        players.sort(function(a, b) {
            if (!a.position[0])
                return 1;
            return positionList().indexOf(a.position[0]) - positionList().indexOf(b.position[0]);
        });
        setPlayers(players);
    }
}

function saveGame(user) {
    var newSave = newSaveObject();
    newSave.name = $("#saveName").val();
    newSave.doc = new Date();
    newSave.dom = new Date();
    newSave.team = $("#teamSelect").val();
    newSave.game = $("#gameSelect").val();
    newSave.league = $("#leagueSelect").val();

    newSave.roster = getPlayers();

    var request = new XMLHttpRequest();
    var posturl = baseUrl + "save";
    var postString = "u=" + user + "&s=" + JSON.stringify(newSave);
    console.log(postString);
    request.open("POST", posturl, true);
    request.onreadystatechange = function() {
        if (request.readyState != 4)
            return;
        console.log(request.responseText);
    }
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.send(postString);
}