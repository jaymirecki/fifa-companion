var saveObject;
var numTeams = 8;
var numPlayers = 18;
var numFixtures = 5;

function loadFifaContent() {
    showHeader();
    var auth = new MAuth(function() {
        auth.login(function(user) {
            var path =  window.location.pathname.split("/");
            var gameId = path[path.length - 1]
            var getString = baseUrl + "save?u=" + user._id + "&s=" + gameId;
            var request = new XMLHttpRequest();
            request.open("GET", getString);
            request.onreadystatechange = function() {
                if (request.readyState != 4)
                    return;
                var result = JSON.parse(request.responseText);
                if (!result.success) {
                    fifaError(result.error);
                    return;
                }
                saveObject = result;
                saveObject.date = new Date(new Date(saveObject.date).setUTCHours(0,0,0,0));
                insertSaveInfo(user._id);
            };
            request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            request.send();
        });
    });
}

function showHeader() {
    var header =
        "<div id='fifaPlayHeaderInfo'>\
            <p id='saveInfo'>[Save Name], [Game]</p>\
            <p id='managerInfo'>[Manager Name]</p>\
            <p id='gameDate'>[1/1/2019]</p>\
            <button type='button' id='saveGameButton'>Save Game</button>\
        </div>";


    var spacer = "<div class='fifaPlayBarSpacer'></div>";
    var teams = 
        "<div id='fifaPlayBars'>\
        <div id='fifaPlayTeamBar' class='fifaPlayBar'>\
            <div class='fifaPlayTabSelected'>[Team 1], [League 1]</div>\
            <div class='fifaPlayTab'>[Team 2], [League 2]</div>\
            <div class='fifaPlayTabEnd'></div>\
        </div>";
    var competitions =
        "<div id='fifaPlayCompBar' class='fifaPlayBar'>\
            <div class='fifaPlayTab'>[Competition 1]</div>\
            <div class='fifaPlayTab'>[Competition 2]</div>\
            <div class='fifaPlayTabSelected'>[Competition 3]</div>\
            <div class='fifaPlayTabEnd'></div>\
        </div>";
    var divisions =
        "<div id='fifaPlayDivBar' class='fifaPlayBar'>\
            <div class='fifaPlayTab'>[Division 1]</div>\
            <div class='fifaPlayTabSelected'>[Division 2]</div>\
            <div class='fifaPlayTabEnd'></div>\
        </div>";

    var playContent = "<div id='fifaPlayContent'></div>";

    htmlText = header + teams + spacer + competitions + divisions + playContent+ "</div>" ;
    $("#fifaContent").html(htmlText);
    showDashboard();
}

function showDashboard() {
    var roster = 
        "<p id='teamAvg'>Team Rating: [70]</p>\
        <table class='fifaTable' id='fifaPlayRoster' onclick='showFullRoster()'>\
            <tr class='fifaTable'><th>Position</th><th>Name</th></tr>";
    for (let i = 0; i < 18; i++)
        roster = roster + 
            "<tr class='fifaTable'><td>[POS]</td><td>[Player Name]</td></tr>";
    roster = roster + "</table>";

    var table = 
        "<table class='fifaTable' id='fifaPlayTable'>\
            <tr class='fifaTable'><th colspand='2'>Table</th><th>GP</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>PTS</th></tr>";
    for (let i = 0; i < numTeams; i++)
        table = table + 
            "<tr class='fifaTable'><td>[POS]</td><td>[TEAM NAME]</td><td>[34]</td><td>[34]</td><td>[0]</td><td>[0]</td><td>[34]</td><td>[0]</td><td>[102]</td></tr>";
    table = table + "</table><br>";

    var power = 
        "<table class='fifaTable' id='fifaPlayPower'>\
            <tr class='fifaTable'><th></th><th></th><th>PTS</th><th>STR</th><th>SCR</th><th>MOV</th></tr>";
    for (let i = 0; i < numTeams; i++)
        power = power + 
            "<tr class='fifaTable'><td>[POS]</td><td>[TEAM NAME]</td><td>[15]</td><td>[85]</td><td>[1275]</td><td>[+0]</td></tr>";
    power = power + "</table>";

    var compFixtures = 
        "<table class='fifaTable' id='fifaPlayCompFixtures'><tr class='fifaTable'><th colspan='4'>Competition Fixtures</th></tr>";
    for (let i = 0; i < 5; i++)
        compFixtures = compFixtures + 
            "<tr class='fifaTable'><td>[DATE]</td><td>[TEAM 1]</td><td>vs.</td><td>[TEAM 2]</td></tr>";
    compFixtures = compFixtures + "</table><br>";

    var teamFixtures = 
        "<table class='fifaTable' id='fifaPlayTeamFixtures'><tr class='fifaTable'><th colspan='4'>Team Fixtures</th></tr>";
    for (let i = 0; i < 5; i++)
        teamFixtures = teamFixtures + 
            "<tr class='fifaTable'><td>[DATE]</td><td>[TEAM 1]</td><td>vs.</td><td>[TEAM 2]</td></tr>";
    teamFixtures = teamFixtures + "</table><br><button type='button' id='addFixturesButton'>Add Fixtures</button>";

    var htmlText = "<table><tr><td>" + roster + "</td><td>" + table + power + "</td><td>" + compFixtures + teamFixtures + "</td></tr></table>";
    $("#fifaPlayContent").html(htmlText);
    // showPlayer();
}

////////////////////////////////////////////////////////////////////////////////
//                        CUSTOM SAVE CONTENT LOADING                         //
////////////////////////////////////////////////////////////////////////////////
function insertSaveInfo(user) {
    // window.onbeforeunload = function() {
    //     return "Leaving this page will result in the loss of any unsaved changes!";
    // };

    teamSelectBar(user);
    competitionSelectBar(user);
    divisionSelectBar(user);
    $("#saveInfo").html(saveObject.name + ", " + saveObject.game);
    $("#managerInfo").html(saveObject.manager);
    $("#gameDate").html(new Date(saveObject.date).toLocaleDateString("default", { timeZone: "UTC" }) + "<button type='button' onclick='advanceDate(\"" + user + "\")'>Advance Date</button>");
    $("#saveGameButton").click(function() {
        console.log(user);
        saveGame(user, saveObject, function(results) {
            console.log(results);
            openModal("<p>Game saved succesfully.</p><button type='button' onclick='closeModal(); insertSaveInfo(\"" + user + "\")'>Okay</button>")
        }, function() {
            openModal("<p>Failed to save game. Please try again.</p><button type='button' onclick='closeModal()'>Okay</button>")
        });
    });

    roster();

    table();

    power();

    fixtures(user);
}

function teamSelectBar(user) {
    var html = "";
    for (key in saveObject.team) {
        if (key == saveObject.settings.currentSelections.team)
            html = html + "<div class='fifaPlayTabSelected'>" + key + "</div>";
        else
            html = html + "<div class='fifaPlayTab'>" + key + "</div>";
    }
    html = html + "<div class='fifaPlayTabEnd'></div>";
    $("#fifaPlayTeamBar").html(html);
    $("#fifaPlayTeamBar").find(".fifaPlayTab, .fifaPlayTabSelected").click(function() {
        if (saveObject.settings.currentSelections.team != $(this).html()) {
            saveObject.settings.currentSelections.team = $(this).html();
            saveObject.settings.currentSelections.competition = 
                Object.keys(saveObject.team[saveObject.settings.currentSelections.team].league.competitions)[0];
            insertSaveInfo(user);
        }
    });
}

function competitionSelectBar(user) {
    var html = "";

    var competitions = 
        saveObject.team[saveObject.settings.currentSelections.team].league.competitions;
    for (key in competitions) {
        if (key == saveObject.settings.currentSelections.competition) {
            html = html + "<div class='fifaPlayTabSelected'>" + key + "</div>";
        }
        else
            html = html + "<div class='fifaPlayTab'>" + key + "</div>";
    }
    html = html + "<div class='fifaPlayTabEnd'></div>";
    $("#fifaPlayCompBar").html(html);
    $("#fifaPlayCompBar").find(".fifaPlayTab, .fifaPlayTabSelected").click(function() {
        if (saveObject.settings.currentSelections.competition != $(this).html()) {
            saveObject.settings.currentSelections.competition = $(this).html();
            saveObject.settings.currentSelections.division = 
                Object.keys(saveObject.team[saveObject.settings.currentSelections.team].league.competitions[saveObject.settings.currentSelections.competition].divisions)[0];
            insertSaveInfo(user);
        }
    });
}

function divisionSelectBar(user) {
    var html = "";

    var divisions = 
        saveObject.team[saveObject.settings.currentSelections.team].league.competitions[saveObject.settings.currentSelections.competition].divisions;
    for (key in divisions) {
        if (key == saveObject.settings.currentSelections.division)
            html = html + "<div class='fifaPlayTabSelected'>" + key + "</div>";    
        else
            html = html + "<div class='fifaPlayTab'>" + key + "</div>";
    }
    html = html + "<div class='fifaPlayTabEnd'></div>";
    $("#fifaPlayDivBar").html(html);
    $("#fifaPlayDivBar").find(".fifaPlayTab, .fifaPlayTabSelected").click(function() {
        saveObject.settings.currentSelections.division = $(this).html();
        insertSaveInfo(user);
    });
}

function roster() {
    var currentRoster = saveObject.team[saveObject.settings.currentSelections.team].roster;
    currentRoster.sort(function(a, b) {
        if (a.attr.ovr > b.attr.ovr)
            return -1;
        else if (a.attr.ovr == b.attr.ovr)
            return 0;
        else
            return 1;
    });

    var teamTotal = 0;
    for (let i = 0; i < 11; i++)
        teamTotal = teamTotal + currentRoster[i].attr.ovr;
    $("#teamAvg").html("Team Rating: " + Math.round(teamTotal / 11));

    var roster = 
        "<tr><th colspan='2'>Roster</th></tr>\
        <th>Position</th><th>Name</th></tr>";
    for (let i = 0; i < 18 && i < currentRoster.length; i++)
        roster = roster + 
            "<tr class='fifaTable'><td>" + currentRoster[i].position + "</td><td>" + currentRoster[i].name + "</td></tr>";
    $("#fifaPlayRoster").html(roster);
}

function table() {
    var currentTable = saveObject.team[saveObject.settings.currentSelections.team].league.competitions[saveObject.settings.currentSelections.competition].divisions[saveObject.settings.currentSelections.division].table;
    
    currentTable.sort(function(a, b) {
        var ap = a.w * 3 + a.d;
        var bp = b.w * 3 + b.d;
        if (ap > bp)
            return -1;
        else if (bp > ap)
            return 1;
        else
            return 0;
    });
    var table = 
        "<tr><th colspan='9'>Table</th></tr>\
        <tr><th colspan='2'></th><th>GP</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>PTS</th></tr>";
    for (let i = 0; i < numTeams; i++) {
        var row = currentTable[i];
        table = table + 
            "<tr class='fifaTable'><td>" + (i + 1) + "</td><td>" + row.t + "</td><td>" + (row.w + row.l + row.d) + "</td><td>" + row.w + "</td><td>" + row.d + "</td><td>" + row.l + "</td><td>" + row.gf + "</td><td>" + row.ga + "</td><td>" + (row.w * 3 + row.d) + "</td></tr>";
    }
    $("#fifaPlayTable").html(table);
}

function power() {
    var currentPower = saveObject.team[saveObject.settings.currentSelections.team].league.competitions[saveObject.settings.currentSelections.competition].power;

    currentPower.sort(function(a, b) {
        var ap = a.w * 3 + a.d;
        var bp = b.w * 3 + b.d;
        if (ap > bp)
            return -1;
        else if (bp > ap)
            return 1;
        else
            return 0;
    });
    var power = 
        "<tr><th colspan='9'>Power Rankings</th></tr>\
        <tr><th colspan='2'></th><th>PTS</th><th>STR</th><th>SCR</th><th>MOV</th></tr>";
    for (let i = 0; i < numTeams; i++) {
        var row = currentPower[i];
        power = power + 
            "<tr class='fifaTable'><td>" + (i + 1) + "</td><td>" + row.t + "</td><td>" + row.p + "</td><td>" + row.str + "</td><td>" + row.scr + "</td><td>" + row.m + "</td></tr>";
        }
    $("#fifaPlayPower").html(power);
}

function fixtures(user) {
    var team = saveObject.settings.currentSelections.team;
    var fixtures = 
        saveObject.team[saveObject.settings.currentSelections.team].league.competitions[saveObject.settings.currentSelections.competition].fixtures.filter(f => new Date(f.date) >= saveObject.date);
    fixtures.sort(function(a, b) {
        return new Date(a.date) - new Date(b.date);
    });
    var teamFixtureList = fixtures.filter(f => f.away == team || f.home == team);

    var compFixtures = 
        "<tr class='fifaTable'><th colspan='4'>Competition Fixtures</th></tr>";
    for (let i = 0; i < fixtures.length && i < numFixtures; i++)
        compFixtures = compFixtures + 
            "<tr class='fifaTable'><td>" + new Date(fixtures[i].date).toLocaleDateString("default", { timeZone: "UTC" }) + "</td><td>" + fixtures[i].away + "</td><td>vs.</td><td>" + fixtures[i].home + "</td></tr>";
    $("#fifaPlayCompFixtures").html(compFixtures);

    var teamFixtures = 
        "<tr class='fifaTable'><th colspan='4'>Team Fixtures</th></tr>";
    for (let i = 0; i < teamFixtureList.length && i < numFixtures; i++)
        teamFixtures = teamFixtures + 
        "<tr class='fifaTable'><td>" + new Date(teamFixtureList[i].date).toLocaleDateString("default", { timeZone: "UTC" }) + "</td><td>" + teamFixtureList[i].away + "</td><td>vs.</td><td>" + teamFixtureList[i].home + "</td></tr>";
    $("#fifaPlayTeamFixtures").html(teamFixtures);

    $("#addFixturesButton").click(function() { addFixtures(user); });
}

function showPlayer(playerName, statCategory, deep) {
    var player = getPlayerFromRoster(playerName, saveObject.team[saveObject.settings.currentSelections.team].roster);
    var htmlText = 
        "<div id='fifaPlayCompetition'>\
            <label for='season'>SEASON</label>\
            <input type='radio' name='timeFrame' id='season' value='season' checked>\
            <label for='career'>CAREER</label>\
            <input type='radio' name='timeFrame' id='career' value='career'>\
        </div>\
        <table class='fifaTable'>"
    
    var headerHtml = "<tr class='fifaTable'><th>Position</th><th>Name</th>";
    var playerHtml = "</tr><tr class='fifaTable'><td>" + player.position + "</td><td>" + player.name + "</td>";
    for (key in saveObject.settings.stats) {
        if (saveObject.settings.stats[key].on) {
            headerHtml = headerHtml + "<th>" + saveObject.settings.stats[key].display + "</th>";
            playerHtml = playerHtml + "<td>" + player.season.stats[key] + "</td>";
        }
    }
    if (deep) {
        for (key in saveObject.settings.deepStats) {
            if (saveObject.settings.deepStats[key].on) {
                headerHtml = headerHtml + "<th>" + saveObject.settings.deepStats[key].display + "</th>";
                playerHtml = playerHtml + "<td>" + player.season.deepStats[key] + "</td>";
            }
        }
    }
    htmlText = htmlText + headerHtml + playerHtml + "</tr></table>\
        <button type='button' onclick='closeModal()'>Close</button>";

    openModal(htmlText);
}

function getPlayerFromRoster(playerName, roster) {
    for (let i = 0; i < roster.length; i++) {
        if (roster[i].name == playerName)
            return roster[i];
    }
}

function showFullRoster() {
    var currentRoster = saveObject.team[saveObject.settings.currentSelections.team].roster;
    
    var rosterHtml = 
        "<table class='fifaTable'><tr class='fifaTable'><th onclick='sortRosterBy(\"position\")'>Position</th><th onclick='sortRosterBy(\"name\")'>Name</th>";
    for (key in saveObject.settings.stats)
        if (saveObject.settings.stats[key].on)
            rosterHtml = 
                rosterHtml + "<th onclick='sortRosterBy(\"" + key + "\")'>" + saveObject.settings.stats[key].display + "</th>";
    rosterHtml = rosterHtml + "</tr>";

    for (key in currentRoster) {
        var player = currentRoster[key]
        rosterHtml = rosterHtml + "<tr class='fifaTable'><td>" + player.position + "</td><td>" + player.name + "</td>";
        for (key in saveObject.settings.stats)
            if (saveObject.settings.stats[key].on)
                rosterHtml = 
                    rosterHtml + "<th>" + player.season.stats[key] + "</th>";
        rosterHtml = rosterHtml + "</tr>";
    }

    rosterHtml = rosterHtml + "</table><button type='button' onclick='closeModal()'>Close</button>";
    openModal(rosterHtml);
}

function sortRosterBy(field) {
    console.log(field);
}

////////////////////////////////////////////////////////////////////////////////
//                                 EDIT SAVES                                 //
////////////////////////////////////////////////////////////////////////////////
function addFixtures(user) {
    var divisions = 
        saveObject.team[saveObject.settings.currentSelections.team].league.competitions[saveObject.settings.currentSelections.competition].divisions
    var teams = [];
    for (key in divisions)
        teams = teams.concat(divisions[key].teams);
    teams.sort(function(a, b) {
        var a0 = a.charAt(0);
        var b0 = b.charAt(0);
        if (a0 < b0)
            return -1;
        else if (a0 > b0)
            return 1;
        else
            return 0;
    });
    var html = 
        "<button type='button' onclick='closeModal()'>Done</button>\
        <form action='javascript:void(0)' onsubmit='addThisFixture(\"" + user + "\")'>\
        <table><tr>\
        <td>Date<input type='date' value='" + saveObject.date.toISOString().substring(0, 10) + "' id='fixtureDate'>\
        <td>Away Team<br><select id='awayTeam' required>\
            <option value='' disabled selected>---</option>";
    for (let i = 0; i < teams.length; i++)
        html = html + "<option value='" + teams[i] + "'>"+ teams[i] + "</option>"
    html = html + "</select></td>\
    <td>Home Team<br><select id='homeTeam'required>\
    <option value='' disabled selected>---</option>";
    for (let i = 0; i < teams.length; i++)
        html = html + "<option value='" + teams[i] + "'>"+ teams[i] + "</option>";
    html = html + "</select></td></tr></table>\
        <input type='submit' value='Add Fixture'>\
        </form>";
    openModal(html);
}

function addThisFixture(user) {
    var newFixture = new Object();
    newFixture.date = new Date($("#fixtureDate").val());
    newFixture.away = $("#awayTeam").val();
    newFixture.home = $("#homeTeam").val();
    console.log(newFixture);
    saveObject.team[saveObject.settings.currentSelections.team].league.competitions[saveObject.settings.currentSelections.competition].fixtures.push(newFixture);
    fixtures(user);
}

////////////////////////////////////////////////////////////////////////////////
//                              TIME ADVANCEMENT                              //
////////////////////////////////////////////////////////////////////////////////
function advanceDate(user) {
    openModal("<button type='button' onclick='closeModal()'>Cancel</button>\
    <br>Please enter the date you are simming to:\
    <p id='hiddenError'></p>\
    <input type='date' id='newDate' value='" + saveObject.date.toISOString().substring(0, 10) + "'>\
    <button type='button' onclick='advanceToThisDate(\"" + user + "\")'>Advance Date</button>");
    $("#hiddenError").show();
}

function advanceToThisDate(user) {
    var newDate = new Date($("#newDate").val());
    if (newDate <= saveObject.date)
        $("#hiddenError").html("That date is invalid.");
    else
        completeFixtures(newDate, user);
}

function completeFixtures(newDate, user) {
    newDate = new Date(newDate);
    var competitions =
        saveObject.team[saveObject.settings.currentSelections.team].league.competitions;
    for (key in competitions) {
        var fixtures = competitions[key].fixtures;
        for (let i = 0; i < fixtures.length; i++) {
            var f = fixtures[i];
            if (!f.score && new Date(f.date) < newDate) {
                var html = 
                    "Please enter the score for this game:\
                    <table><tr><td colspan='3'>"+ key + "</td></tr>\
                    <tr><td>" + fixtures[i].away + "<input type='number' id='away'></td>\
                    <td>vs.</td><td>" + fixtures[i].home + "<input type='number' id='home'></td></tr></table>\
                    <button type='button' onclick='completeFixtures(\"" + newDate + "\", \"" + user + "\")'>Submit Score</button>";
                if ($("#away").val() >= 0 && $("#home").val()) {
                    f.score = { away: $("#away").val(), home: $("#home").val() };
                    $("#away, #home").val("");
                    closeModal();
                    completeFixtures(newDate);
                } else
                    openModal(html);
                return;
            }
        }
    }
    saveObject.date = newDate;
    insertSaveInfo(user);
}

function updateThisFixture() {

}

var fifaGlobalModalInputList;

function openModalFromList(input, complete) {
    if (fifaGlobalModalInputList && input < fifaGlobalModalInputList.length)
        openModal(fifaGlobalModalInputList[input]);
    else {
        closeModal();
        complete();
    }
}

function donezo() {
    console.log(saveObject);
}