opr.speeddial.update({ title: "Voat", url: "https://voat.co/" }); //We'll have the values we want developers to see hard-coded in to the manifest. This will update those values to the values we want to present to users.

var DEFAULT_POLL_INTERVAL = 15 * 60 * 1000;

var userId = "";
var pollInterval = DEFAULT_POLL_INTERVAL;
var apiPublicKey = ""; //Check out http://fakevout.azurewebsites.net/account/apikeys to generate one.
var serviceUri = "https://voat.co/api"; //Current API live site
//var serviceUri = "https://voat.co/api/v1"; //New API live site
//var serviceUri = "https://fakevout.azurewebsites.net/api/v1" //Test site

var timeouts = [];

//The commented-out code is for the new API that, as of this writing, is not yet implemented on the live site. It is also incomplete.
/*function getUserInfo(callback)
{
    $.ajax({
        url: serviceUri + "/u/" + userId + "/info",
        headers: {'Voat-ApiKey': apiPublicKey},
        method: "GET",
        dataType: "json"
    }).done(function (data)
    {
        if ($("#submission-points-received").text() === "-")
        {
            $("#info").css("display", ""); //Unhide the scores if the first attempt at retrieving them failed.
        }
        callback(data);
        $("#error").text("");
    }).fail(function (jqXHR, textStatus)
    {
        if ($("#submission-points-received").text() === "-")
        {
            $("#info").css("display", "none"); //Hide the scores if the first attempt at retrieving them fails. We want to keep the hyphens instead of just defaulting the empty scores to hidden because it connotes that the extension is loading something.
        }
        $("#error").text("Error " + jqXHR.status);
    });
}

function setSpeedDialInfo(data)
{
    var commentPoints = data.commentPoints.sum;
    var linkPoints = data.submissionPoints.sum;
    var badgeTotal = data.badges.length;

    $("#submission-points-received").text(linkPoints);
    $("#comment-points-received").text(commentPoints);
    $("#badge-total").text(badgeTotal); //TODO: Remember to uncomment this element in page.html.
}*/

/* Current API code below */

function getUserInfo(callback)
{
    $.ajax({
        url: serviceUri + "/userinfo",
        data: {userName: userId},
        method: "GET",
        dataType: "json"
    }).done(function (data)
    {
        $("#error").text("");
        if ($("#submission-points-received").text() === "-")
        {
            $("#info").css("display", ""); //Unhide the scores if the first attempt at retrieving them failed.
        }
        callback(data);
    }).fail(function (jqXHR, textStatus)
    {
        if ($("#submission-points-received").text() === "-")
        {
            $("#info").css("display", "none"); //Hide the scores if the first attempt at retrieving them fails. We want to keep the hyphens instead of just defaulting the empty scores to hidden because it connotes that the extension is loading something.
        }

        if (jqXHR.status === 404)
        {
            $("#info").css("display", "none");
            $("#error").text("Invalid Username");
        }
        else
        {
            $("#error").text("Error " + jqXHR.status);
        }
    });
}

function setSpeedDialInfo(data)
{
    $("#submission-points-received").text(data.LCP);
    $("#comment-points-received").text(data.CCP);
}

function clearTimeouts(timeouts)
{
    for (var x=0; x < timeouts.length; x++)
    {
        clearTimeout(timeouts[x]);
    }
}

function poll()
{
    getUserInfo(setSpeedDialInfo);
    timeouts.push(window.setTimeout(poll, pollInterval));
}

function setPollInterval(minutes)
{
    if (Number.isSafeInteger(minutes))
    {
        pollInterval = minutes * 60 * 1000;
    }
    else
    {
        pollInterval = DEFAULT_POLL_INTERVAL;
    }
}

function init()
{
    chrome.storage.sync.get(null, function(data){
        if (data.username)
        {
            userId = data.username;
        }
        else
        {
            chrome.tabs.create({url: "options.html"});
        }

        if (data.updateInterval)
        {
            setPollInterval(data.updateInterval); //This number could get wonky if data.updateInterval isn't an integer but I don't care.
        }

        $("#user-name").text("/u/" + userId);
        poll();
    });

    chrome.storage.onChanged.addListener(function(changes, namespace){
        clearTimeouts(timeouts);
        init();
    });
}

$(document).ready(init);