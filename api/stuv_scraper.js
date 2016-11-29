var request = require("request");


function getStuvPlans(course) {
    return new Promise(function(resolve, reject) {
        request("http://stuv-mosbach.de/survival/api.php?action=getLectures&course=" + course, function(error, response, body) {
            if(error) {
                console.log(error);
                reject(error);
            }
            resolve(JSON.parse(body));
        });
    });
}

function filterDate(date) {
    return function(plans) {
        var dateStr = date.getDate() + "."+ (date.getMonth() + 1) + "." + date.getFullYear();
        return plans.filter(function(elem) {
            return elem.start_date === dateStr;
        });
    };
}

function renderStuvPlansConsole(plans) {
    plans.forEach(function(element) {
        console.log("-------------------------------");
        console.log(element.ID, element.name, "\n" + element.start_time, element.start_date, "\n" + (element.lecturer === "" ? "-" : element.lecturer), element.location);
    });
    console.log("-------------------------------");
}

function renderStuvPlansMessage(plans) {
    var messageText = "";
    plans.forEach(function(element) {
        messageText += "-------------------------------\n";
        messageText += element.name + "\n" + element.start_time + " - " + element.end_time + "\n";
        messageText += (element.lecturer === "" ? "-" : element.lecturer) + " " + element.location + "\n";
    });
    messageText += "-------------------------------\n";
    return messageText;
}

getStuvPlans("inf16a").then(filterDate(new Date())).then(renderStuvPlansMessage).then(console.log);