const fetch = require("node-fetch");
const { EmbedBuilder } = require('discord.js');

module.exports = {
    "data": {
        name: "starboard",
        description: "starboard handler for the fanblog server"
    },
    async execute(client) {
        const config = {
            channel_id: "1379626504064995409",
            guild_id: "1347981302636478464",
            emoji: "⭐",
            minAmount: 4
        }
        client.on('messageReactionAdd', async (reaction, user) => {
            if (reaction.emoji.name === config.emoji && reaction.message.guildId === config.guild_id) {
                const message = reaction.message;

                const starboardChannel = client.channels.cache.get(config.channel_id);
                const starboardMessages = await starboardChannel.messages.fetch();
                const existingStarredMessage = starboardMessages.find(starredMessage =>
                    starredMessage.embeds.length > 0 &&
                    starredMessage.content === `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`
                );

                if (existingStarredMessage) {
                    // edit the star count
                    const embed = new EmbedBuilder()
                        .setColor('#FFD700')
                        .setTitle(reaction.count + ' ' + config.emoji)
                        .setDescription(message.content)
                        .setFooter({ iconURL: message.author.avatarURL({extension: 'png'}), text: message.author.username })
                        .setTimestamp();
                    existingStarredMessage.edit({embeds: [embed]})
                    return
                };

                if (reaction.count >= config.minAmount) {
                    const embed = new EmbedBuilder()
                        .setColor('#FFD700')
                        .setTitle(reaction.count + ' ' + config.emoji)
                        .setDescription(message.content)
                        .setFooter({ iconURL: message.author.avatarURL({extension: 'png'}), text: message.author.username })
                        .setTimestamp();

                    // Send the embed to the starboard channel
                    starboardChannel.send({ content: `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`, embeds: [embed] });
                }
            }
        })
        client.on('messageReactionRemove', async (reaction, user) => {
            if (reaction.emoji.name === config.emoji && reaction.message.guildId === config.guild_id) {
                const message = reaction.message;

                const starboardChannel = client.channels.cache.get(config.channel_id);
                const starboardMessages = await starboardChannel.messages.fetch();
                const existingStarredMessage = starboardMessages.find(starredMessage =>
                    starredMessage.embeds.length > 0 &&
                    starredMessage.content === `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`
                );

                if (existingStarredMessage) {
                    if (reaction.count < config.minAmount) {
                        existingStarredMessage.delete();
                        return
                    }
                    // edit the star count
                    const embed = new EmbedBuilder()
                        .setColor('#FFD700')
                        .setTitle(reaction.count + ' ' + config.emoji)
                        .setDescription(message.content)
                        .setFooter({ iconURL: message.author.avatarURL({extension: 'png'}), text: message.author.username })
                        .setTimestamp();
                    existingStarredMessage.edit({embeds: [embed]})
                    return
                };
            }
        })
    }
}