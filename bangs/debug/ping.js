const { EmbedBuilder } = require('discord.js');

module.exports = {
    "data": {
        name: "ping",
        description: "pong"
    },
    async execute(params, client, message) {
        const channel = message.channel;
        channel.send({ content: 'Pong! I\'m alive!' })
    }
}
