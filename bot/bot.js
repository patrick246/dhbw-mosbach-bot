const Telegraf = require('telegraf');
const {Extra, Markup} = require('telegraf');

const config = require('../config');
const dataService = require('./dataService');
const api = require('../api/stuv_scraper.js');

const bot = new Telegraf(config.botToken);

//get username for group command handling
bot.telegram.getMe().then((botInfo) => {
    bot.options.username = botInfo.username;
    console.log("Initialized", botInfo.username);
});

dataService.loadUsers();

//TODO: message logging
//TODO: get courses from api

/*
 setTimeout(()=>{ //dataService debug code
 console.log(dataService.getCoursesToFetch());
 console.log(dataService.getSubscribersOfCourse("INF16A"));
 }, 100);*/



let mockCourses = [];
/*
 available states:
 - selectCourseType
 - selectCourse
 */

function userString(msg) {
    return JSON.stringify(msg.from.id == msg.chat.id ? msg.from : {
        from: msg.from,
        chat: msg.chat
    });
}

function logMsg(msg) {
    const from = userString(msg);
    console.log(msg.message.text, from)
}

function logOutMsg(msg, text) {
    console.log('>', {
        id: msg.chat.id
    }, text);
}

function getCourseTypes() {
    const courseTypes = [];
    mockCourses.forEach((val) => {
        const res = val.match(/[^0-9]*/)[0];
        if (courseTypes.indexOf(res) == -1)
            courseTypes.push(res);
    });
    return courseTypes;
}

function getCoursesByType(type) {
    return mockCourses.filter((val) => val.indexOf(type) > -1);
}

function courseTypeSelection(msg) { //display the course type selection
    logMsg(msg);
    const inlineData = [];
    const rowCnt = 4;
    let tmp = [];
    getCourseTypes().forEach((val, i) => {
        if (i % rowCnt == 0) {
            tmp = [];
        }
        tmp.push(Markup.callbackButton(val, val));
        if (i % rowCnt == rowCnt - 1) {
            inlineData.push(tmp);
        }
    });
    dataService.setMetaData(msg.chat.id, "state", "selectCourseType");
    return msg.reply('Bitte wähle ein Kurstyp aus der Liste.',
        Extra.HTML().markup(Markup.inlineKeyboard(inlineData)));
}

function courseSelection(msg, type) { //display the course selection (after selecting a type)
    const uid = msg.chat.id;
    const inlineData = [];
    const rowCnt = 3;
    let tmp = [];
    const courses = getCoursesByType(type);
    courses.forEach((val, i) => {
        if (i % rowCnt == 0) {
            tmp = [];
        }
        tmp.push(Markup.callbackButton(val, val));
        if (i % rowCnt == rowCnt - 1 || i == courses.length - 1)
            inlineData.push(tmp);
    });
    dataService.setMetaData(uid, "state", "selectCourse");
    bot.telegram.sendMessage(uid, 'Nun wähle einen Kurs.',
        Extra.HTML().markup(Markup.inlineKeyboard(inlineData)));
}
/*
function publish(data) { //expects data in form of {'courseName': "stringToPublish", ...}
    Object.keys(data).forEach(key => {
        const val = data[key];

    });
}*/


bot.command('start', (msg) => {
    //console.log('start', msg.from, msg.chat);
    //logMsg(msg); //commented out because will already get logged in courseTypeSelection
    dataService.registerUser(msg);
    const m = 'Willkommen! Ich bin der DHBW Mosbach Vorlesungsplan-Bot. Ich sende dir jeden Morgen den aktuellen Vorlesungsplan zu.';
    msg.reply(m);
    logOutMsg(msg, m);
    courseTypeSelection(msg);
});

bot.command('stop', (msg) => {
    logMsg(msg);
    dataService.setEnabled(msg.chat.id, false);
    const m = 'Ich sende nun nicht mehr jeden Tag den neuen Vorlesungsplan';
    logOutMsg(msg, m);
    msg.reply(m);
});

bot.command('changeclass', courseTypeSelection); //call method with parameter msg

bot.command('getplan', msg => {
    logMsg(msg);
    const course = dataService.getCourse(msg.chat.id);
    const day = new Date(); //ToDo: maybe custom date handling (let user pick date from inline calendar)
    day.setHours(day.getHours() + 6); //if it's after 18:00, get next day
    api.getPlan(course, day)
        .then((data) => {
            const m = '<pre>' + data + '</pre>';
            logOutMsg(msg, m);
            msg.replyWithHTML(m);
        });
});

bot.action(/.+/, (msg) => {
    const answer = msg.match[0];
    const uid = msg.chat.id;
    const curState = dataService.getMetaData(uid, "state");

    if (curState == "selectCourseType") {
        courseSelection(msg, answer);
    } else if (curState == "selectCourse") {
        msg.replyWithHTML("Danke! Ich werde nun den Kurs <b>" + answer + "</b> benutzen.");
    
        dataService.setCourse(uid, answer);
        dataService.setMetaData(uid, "state", undefined);
    }
    msg.deleteMessage();
    console.log('[' + answer + ']', curState ? "" : "IGNORED", userString(msg));
});

api.getCourses().then((courses) => {
    mockCourses = courses;
    bot.startPolling();
});


module.exports = {}