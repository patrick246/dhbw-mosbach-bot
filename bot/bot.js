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
 }, 100);
 */

var mockCourses = ["BK13A", "BK13B", "BK13C", "BK14A", "BK14B", "BK14C", "BK15A", "BK15B", "BK16A", "BK16B", "BSTUF13", "BSTUF14", "BSTUF15", "BSTUF16", "BW-FS13A", "BW-FS13B", "BW-FS14", "BW-FS15", "BW-FS16", "BW-PM13A", "BW-PM13B", "BW-PM13C", "BW-PM14A", "BW-PM14B", "BW-PM14C", "BW-PM14C1", "BW-PM14C2", "BW-PM15A", "BW-PM15B", "BW-PM15C", "BW-PM15D", "BW-PM16A", "BW-PM16B", "BW-PM16C", "BW-PM16D", "ET13A", "ET13B", "ET14A", "ET14B", "ET15A", "ET15B", "ET16A", "ET16B", "HD-BS13", "HD13A", "HD13B", "HD13C", "HD13E", "HD13F", "HD13G", "HD14A", "HD14B", "HD14C", "HD14D", "HD14E", "HD14F", "HD15A", "HD15B", "HD15C", "HD15D", "HD15E", "HD15F", "HD16A", "HD16B", "HD16C", "HD16D", "HD16E", "HD16F", "HH13", "HH14", "HH15", "HH16", "HT13", "HT14", "HT15", "HT16", "IN13A", "IN13B", "IN13C", "IN14A", "IN14B", "IN14C", "IN15A", "IN15B", "IN15C", "IN16A", "IN16B", "IN16C", "INF13A", "INF13B", "INF14A", "INF14B", "INF15A", "INF15B", "INF16A", "INF16B", "IPB13", "IPB14", "IPB15", "IPB16", "IPB17S", "IPE13", "MB-KE13A", "MB-KE13B", "MB-KE13C", "MB-KE13D", "MB-KE14A", "MB-KE14B", "MB-KE14C", "MB-KE14D", "MB-KE15A", "MB-KE15B", "MB-KE15C", "MB-KE15D", "MB-KE16A", "MB-KE16B", "MB-KE16C", "MB-KE16D", "MB-KT13", "MB-KT14", "MB-KT15", "MB-KT16", "MB-VE13", "MB-VE14", "MB-VE15", "MB-VE16", "MB-VT13", "MB-VT14", "MB-VT15", "MB-VT16", "MT-EM13", "MT-EM14", "MT-EM15", "MT13A", "MT13B", "MT14A", "MT14B", "MT15A", "MT15B", "MT16A", "MT16B", "ON13A", "ON13B", "ON14A", "ON14B", "ON15A", "ON15B", "ON16A", "ON16B", "WI13R", "WI13S", "WI13T", "WI13U", "WI14R", "WI14S", "WI14T", "WI14U", "WI15R", "WI15S", "WI15T", "WI15U", "WI16A", "WI16B", "WI16C", "WIW-IPL13", "WIW-IPL14", "WIW-IPL15", "WIW-IPL16", "WIW-ITP13", "WIW-ITP14", "WIW-ITP15", "WIW-ITP16", "WIW-ITV13", "WIW-ITV14", "WIW-ITV15", "WIW-ITV16"];


/*
 available states:
 - selectCourseType
 - selectCourse
 */

function userString(msg) {
    return JSON.stringify(msg.from.id == msg.chat.id ? msg.from : {from: msg.from, chat: msg.chat});
}

function logMsg(msg) {
    var from = userString(msg);
    console.log(msg.message.text, from)
}

function logOutMsg(msg, text) {
    console.log('>', {id: msg.chat.id}, text);
}

function getCourseTypes() {
    var courseTypes = [];
    mockCourses.forEach((val) => {
        var res = val.match(/[^0-9]*/)[0];
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
    var inlineData = [];
    var rowCnt = 4;
    var tmp = [];
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
    var uid = msg.chat.id;
    var inlineData = [];
    var rowCnt = 3;
    var tmp = [];
    var courses = getCoursesByType(type);
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

function publish(data) { //expects data in form of {'courseName': "stringToPublish", ...}
    Object.keys(data).forEach(key => {
        var val = data[key];

    });
}


bot.command('start', (msg) => {
    //console.log('start', msg.from, msg.chat);
    //logMsg(msg); //commented out because will already get logged in courseTypeSelection
    dataService.registerUser(msg);
    var m = 'Willkommen! Ich bin der DHBW Mosbach Vorlesungsplan-Bot. Ich sende dir jeden Morgen den aktuellen Vorlesungsplan zu.';
    msg.reply(m);
    logOutMsg(msg, m);
    courseTypeSelection(msg);
});

bot.command('stop', (msg) => {
    logMsg(msg);
    dataService.setEnabled(msg.chat.id, false);
    var m = 'Ich sende nun nicht mehr jeden Tag den neuen Vorlesungsplan';
    logOutMsg(msg, m);
    msg.reply(m);
});

bot.command('changeclass', courseTypeSelection); //call method with parameter msg

bot.command('getplan', msg => {
    logMsg(msg);
    var course = dataService.getCourse(msg.chat.id);
    var day = new Date(); //ToDo: maybe custom date handling (let user pick date from inline calendar)
    day.setHours(day.getHours() + 6); //if it's after 18:00, get next day
    api.getPlan(course, day)
        .then((data) => {
            var m = '<pre>' + data + '</pre>';
            logOutMsg(msg, m);
            msg.replyWithHTML(m);
        });
});

bot.action(/.+/, (msg) => {
    var answer = msg.match[0];
    var uid = msg.chat.id;
    var curState = dataService.getMetaData(uid, "state");

    if (curState == "selectCourseType") {
        courseSelection(msg, answer);
    }
    else if (curState == "selectCourse") {
        msg.replyWithHTML("Danke! Ich werde nun den Kurs <b>" + answer + "</b> benutzen.")
        dataService.setCourse(uid, answer);
        dataService.setMetaData(uid, "state", undefined);
    }
    console.log('[' + answer + ']', curState ? "" : "IGNORED", userString(msg));
});


bot.startPolling();


module.exports = {
    publish
}