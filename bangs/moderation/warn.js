const { EmbedBuilder } = require('discord.js');

module.exports = {
    "data": {
        name: "warn",
        description: "warn a user"
    },
    async execute(params, client, message) {
        const channel = message.channel;
        channel.send({ content: 'Pong! I\'m alive!' })
    }
}
