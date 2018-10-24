const request = require("request");
const handleRequest = function (url) {
    return new Promise(function (resolve, reject) {
        request(url, function (error, response, body) {
            if (error) {
                console.log(error);
                reject(error);
            }
            try {
                const result = JSON.parse(body);
                resolve(result);
            } catch (e) {
                console.log(body);
                console.error(e);
                reject(e);
            }
        });
    });
}


function getCourses() {
    return handleRequest("http://stuv-mosbach.de/survival/api.php?action=getCourses");
}

function getStuvPlans(course) {
    return handleRequest("http://stuv-mosbach.de/survival/api.php?action=getLectures&course=" + course);
}

function toDateArray(date) {
    return [date.getDate(), date.getMonth() + 1, date.getFullYear()];
}

function toDateString(date) {
    var dateArr = toDateArray(date)
    dateArr[0] = ("0" + dateArr[0]).slice(-2); //add leading zero
    dateArr[1] = ("0" + dateArr[1]).slice(-2);
    return dateArr.join('.');
}

function filterDate(date) {
    return function (plans) {
        const dateStr = toDateString(date);
        return plans.filter(function (elem) {
            return elem.start_date === dateStr;
        });
    };
}

function renderStuvPlansConsole(plans) {
    plans.forEach(function (element) {
        console.log("-------------------------------");
        console.log(element.ID, element.name, "\n" + element.start_time, element.start_date, "\n" + (element.lecturer === "" ? "-" : element.lecturer), element.location);
    });
    console.log("-------------------------------");
}

function renderStuvPlansMessage(date, plans) {
    const d = toDateArray(date);
    let messageText = "Plan für den " + d.join('.') + '\n';
    plans.forEach(function (element) {
        messageText += "------------------------\n";
        messageText += element.name + "\n🕒 " + element.start_time + " - " + element.end_time + "\n";
        messageText += "🎓 " + (element.lecturer === "" ? "-" : element.lecturer) + " | 🚪 " + element.location + "\n";
    });
    messageText += "------------------------\n";
    return messageText;
}

function getPlan(course, date) {
    return getStuvPlans(course)
        .then(filterDate(date))
        .then(renderStuvPlansMessage.bind(null, date)); //inject date into parameters for displaying in message
}
/*
var day = new Date();
day.setDate(25); //if it's after 18:00, get next day
day.setMonth(9);
getPlan("INF16A", day).then(console.log); //debug
getCourses().then(console.log);
*/
module.exports = {
    getPlan,
    getCourses
};