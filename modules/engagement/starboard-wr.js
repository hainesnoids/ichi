const fetch = require("node-fetch");
const { EmbedBuilder } = require('discord.js');

module.exports = {
    "data": {
        name: "starboard",
        description: "starboard handler for weather ranch"
    },
    async execute(client) {
        const config = {
            channel_id: "1396922709312667758",
            guild_id: "901963652649848892",
            emoji: "⭐",
            minAmount: 4
        }
        function init() {
             client.guilds.cache.forEach(async (guild) => {
                if (guild.id !== config.guild_id) return
                const channels = guild.channels.cache.filter(channel => channel.type === 0);
                for (const channel of channels.values()) {
                    try {
                        const messages = channel.messages.fetch({ limit: 100 });
                        messages.forEach(message => {
                            message.reactions.cache.forEach(async reaction => {
                                if (reaction.emoji.name === config.emoji) {
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
                                            .setDescription(message.content === "" ? `[${message.attachments.toJSON().length} attachment${message.attachments.toJSON().length !== 1 ? 's' : ''}]` : message.content)
                                            .setFooter({ iconURL: await message.author.avatarURL({extension: 'png'}), text: message.author.username })
                                            .setTimestamp();
                                        if (message.attachments.toJSON().length >= 1) {
                                            embed.setImage(await message.attachments.toJSON()[0].url);
                                        }

                                        // Send the embed to the starboard channel
                                        starboardChannel.send({ content: `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`, embeds: [embed] });
                                    }
                                }
                            });
                        });
                    } catch (e) {
                        // do jack shit
                    }
                }
            });
        };
        init()
        client.on('messageReactionAdd', async (reaction, user) => {
            if (reaction.message.guildId !== config.guild_id) return
            if (reaction.emoji.name === config.emoji) {
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
                        .setDescription(message.content === "" ? `[${message.attachments.toJSON().length} attachment${message.attachments.toJSON().length !== 1 ? 's' : ''}]` : message.content)
                        .setFooter({ iconURL: await message.author.avatarURL({extension: 'png'}), text: message.author.username })
                        .setTimestamp();
                    if (message.attachments.toJSON().length >= 1) {
                        embed.setImage(await message.attachments.toJSON()[0].url);
                    }
                    existingStarredMessage.edit({embeds: [embed]})
                    return
                };

                if (reaction.count >= config.minAmount) {
                    const embed = new EmbedBuilder()
                        .setColor('#FFD700')
                        .setTitle(reaction.count + ' ' + config.emoji)
                        .setDescription(message.content === "" ? `[${message.attachments.toJSON().length} attachment${message.attachments.toJSON().length !== 1 ? 's' : ''}]` : message.content)
                        .setFooter({ iconURL: await message.author.avatarURL({extension: 'png'}), text: message.author.username })
                        .setTimestamp();
                    if (message.attachments.toJSON().length >= 1) {
                        embed.setImage(await message.attachments.toJSON()[0].url);
                    }

                    // Send the embed to the starboard channel
                    starboardChannel.send({ content: `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`, embeds: [embed] });
                }
            }
        })
        client.on('messageReactionRemove', async (reaction, user) => {
            if (reaction.message.guildId !== config.guild_id) return
            if (reaction.emoji.name === config.emoji) {
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
                        .setDescription(message.content === "" ? `[${message.attachments.toJSON().length} attachment${message.attachments.toJSON().length !== 1 ? 's' : ''}]` : message.content)
                        .setFooter({ iconURL: await message.author.avatarURL({extension: 'png'}), text: message.author.username })
                        .setTimestamp();
                    if (message.attachments.toJSON().length >= 1) {
                        embed.setImage(await message.attachments.toJSON()[0].url);
                    }
                    existingStarredMessage.edit({embeds: [embed]})
                    return
                };
            }
        })
    }
}
