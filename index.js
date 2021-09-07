const Slackbot = require("slackbots");
const axios = require("axios");
const dotenv = require("dotenv");
const sharp = require('sharp');
dotenv.config()

const bot = new Slackbot({
    token: `${process.env.BOT_TOKEN}`,
    name: 'demobotapp'
})

bot.on('start', () => {
    const params = {
        icon_emoji: ':robot_face:'
    }

    bot.postMessageToChannel(
        'test',
        'Test message onstartup',
        params
    );
})

bot.on('error', (err) => {
    console.log(err);
})

bot.on('message', (data) => {
    console.log(data);
    if(data.type !== 'message') {
        return;
    }
    if(data.files){
        console.log("data files detected----------",data.user)
        data.files.forEach(file => {
            if(file.filetype == "png"){
                console.log("png files detected---------------------------")
                console.log("conversion started-------------------------")
                sharp(file.url_private).webp().toBuffer().then(img => {
                    console.log("conversion finished---------------------");
                    bot.postMessageToChannel(
                    'test',
                    `:zap: this works`,
                    img,
                );
                })
                .catch(err => console.log(err));
            }
        })
    }
    handleMessage(data.text);
})
//  test code
function handleMessage(message) {
    if(message.includes(' inspire me')) {
        // inspireMe()
        bot.postMessageToChannel(
            'test',
            `:zap: this works`,
        );
    } else if(message.includes(' random joke')) {
        console.log("joked")
    } else if(message.includes(' help')) {
        console.log("helped")
    }
}
