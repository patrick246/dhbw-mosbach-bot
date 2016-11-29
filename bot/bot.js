const Telegraf = require('telegraf');
const { Extra, Markup } = require('telegraf');

const config = require('../config');

const bot = new Telegraf(config.botToken);

bot.command('start', (ctx) => {
    console.log('start', ctx.from);
    ctx.reply('Willkommen! Ich bin der DHBW Mosbach Vorlesungsplan-Bot. Ich sende dir jeden Morgen den aktuellen Vorlesungsplan zu.');
});

bot.command('changeCourse', (msg) => {
    //nothing
});

bot.command('inline', (ctx) => {
    return ctx.reply('<b>Coke</b> or <i>Pepsi?</i>', Extra.HTML().markup(
        Markup.inlineKeyboard([
            Markup.callbackButton('Coke', 'Coke'),
            Markup.callbackButton('Pepsi', 'Pepsi')
        ])))
});

bot.action(/.+/, (ctx) => {
    return ctx.answerCallbackQuery(`Oh, ${ctx.match[0]}! Great choise`)
})

bot.hears('hi', (ctx) => ctx.reply('Hey there!'));
bot.on('sticker', (ctx) => ctx.reply('👍'));

bot.startPolling();