const fs = require('fs');
var usrFileName = "./bot/users.json";

var users = {};

function loadUsers() {
    fs.readFile(usrFileName, (err, data) => {
        if (err) throw err;
        users = JSON.parse(data);
    });
}

function saveUsers() {
    var json = JSON.stringify(users);
    fs.writeFile(usrFileName, json, 'utf8', function (err) {
        if (err) throw err;
    })
}

function registerUser(uid) {
    var usr = {enabled: true, data: {}};
    users[uid] = usr;
    saveUsers();
}

function setEnabled(uid, val) {
    users[uid].enabled = val;
}

function getEnabled(uid) {
    return users[uid].enabled;
}

function getUser(uid) {
    return users[uid];
}

function setMetaData(uid, key, val) {
    users[uid].data[key] = val;
    saveUsers();
}

function getMetaData(uid, key) {
    return users[uid].data[key];
}

function setCourse(uid, course) {
    users[uid].course = course;
}

function getCourse(uid) {
    return users[uid].course;
}

function getCoursesToFetch() {
    var courses = [];
    Object.keys(users).forEach(key => {
        var c = users[key].course;
        if (courses.indexOf(c) === -1 && c != undefined) { //avoid duplicates
            courses.push(c);
        }
    });
    return courses;
}

function getSubscribersOfCourse(course) {
    var subs = [];
    Object.keys(users).forEach(key => {
        var usr = users[key];
        if (usr.course === course && usr.enabled == true) {
            subs.push(key);
        }
    });
    return subs;
}

module.exports = {
    loadUsers,
    registerUser,
    setEnabled,
    getEnabled,
    getUser,
    setMetaData,
    getMetaData,
    setCourse,
    getCourse,
    getCoursesToFetch,
    getSubscribersOfCourse
};