function setSettings()
{
    localStorage.setItem('username', $("#username").val());

    var interval = Number($("#updateInterval").val());

    if (isNaN(interval) || interval <= 0)
    {
        localStorage.setItem("updateInterval", "15"); //If the interval is too low or something weird, just set it to 15 minutes.
        closeSettingsTab();
    }
    else if (Number.isSafeInteger(interval))
    {
        localStorage.setItem("updateInterval", $("#updateInterval").val());
        closeSettingsTab();
    }
    else
    {
        alert("The update interval is too large. Please set it to a (much) lower value."); //If the number is too big, give them a chance to correct it.
    }
}

function getSettings()
{
    if (localStorage)
    {
        $("#username").val(localStorage.getItem('username'));
        $("#updateInterval").val(localStorage.getItem('updateInterval'));
    }
}

function closeSettingsTab()
{
    chrome.tabs.query({currentWindow: true, active: true}, function(tab)
    {
        chrome.tabs.remove(tab[0].id);
    });
}

function init()
{
    $("#save-settings").click(function(){
        console.log("click");
        setSettings();
    });

    getSettings();
}

$(document).ready(init);