const fetch = require("node-fetch");
const { EmbedBuilder } = require('discord.js');

module.exports = {
    "data": {
        name: "starboard",
        description: "starboard handler for the fanblog server"
    },
    async execute(client) {
        const config = {
            channel_id: "1380213569253019728",
            emoji: "⭐",
            minAmount: 1
        }
        console.log("yo wsp");
        client.on('messageReactionAdd', async (reaction, user) => {
            console.log("hi");
            console.log(reaction.emoji);
            if (reaction.emoji.name === config.emoji) {
                const message = reaction.message;

                const starboardChannel = client.channels.cache.get(config.channel_id);
                const starboardMessages = await starboardChannel.messages.fetch();
                const existingStarredMessage = starboardMessages.find(starredMessage =>
                    starredMessage.embeds.length > 0 &&
                    starredMessage.embeds[0].title === `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`
                );

                if (existingStarredMessage) return;

                if (reaction.count >= config.minAmount) {
                    const embed = new EmbedBuilder()
                        .setColor('#FFD700') // Gold color for the starboard
                        .setTitle(`https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`)
                        .setAuthor(message.author.username, message.author.displayAvatarURL())
                        .setDescription(message.content)
                        .setTimestamp();

                    // Send the embed to the starboard channel
                    starboardChannel.send({ embeds: [embed] });
                }
            }
        })
    }
}