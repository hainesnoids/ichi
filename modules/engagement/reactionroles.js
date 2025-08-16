module.exports = {
    "data": {
        name: "reactionroles",
        description: "Reaction Roles"
    },
    async execute(client) {
        const config = {
            roles: [
                {
                    role_id: '1400196045421674576',
                    message_id: '1400585095659917443',
                    emoji: '❤️'
                },
                {
                    role_id: '1400196045421674576',
                    message_id: '1400585095659917443',
                    emoji: '♂️'
                },
                {
                    role_id: '1400196045421674576',
                    message_id: '1400585095659917443',
                    emoji: '🟨'
                },
                {
                    role_id: '1400196045421674576',
                    message_id: '1400585095659917443',
                    emoji: '♀️'
                },
                {
                    role_id: '1400196045421674576',
                    message_id: '1400585095659917443',
                    emoji: '✅'
                },
                {
                    role_id: '1400196045421674576',
                    message_id: '1400585095659917443',
                    emoji: '❔'
                }
            ],
        }
        async function init() {
            for (const object in config.roles) {
                let targetMessage;
                for (const guild of client.guilds.cache.values()) {
                    for (const channel of await guild.channels.cache.filter(channel => channel.type === 0).toJSON()) {
                        try {
                            const message = await channel.messages.fetch(object.message_id).toJSON();
                            if (!message) return;
                            targetMessage = message;
                        } catch (error) {
                            if (error.code !== 10008) {
                                // no message, do jack shit
                            }
                        }
                    }
                    if (targetMessage) break;
                }
                if (targetMessage) {
                    //console.log(targetMessage);
                    //targetMessage.react(object.emoji);
                }
            }
        }
        init()
        client.on('messageReactionAdd', async (reaction, user) => {
            const reactObject = config.roles.find((element) => reaction.message.id === element.message_id && reaction.emoji.name === element.emoji);
            if (!reactObject) return;
            if (user.id === client.user.id) return;
            await reaction.message.react(reactObject.emoji);
            const guild = await client.guilds.fetch(reaction.message.guildId);
            const guildMember = await guild.members.fetch(user.id);
            const role = await guild.roles.fetch(reactObject.role_id);
            await guildMember.roles.add(role, 'Reaction Role');
        })
        client.on('messageReactionRemove', async (reaction, user) => {
            const reactObject = config.roles.find((element) => reaction.message.id === element.message_id && reaction.emoji.name === element.emoji);
            if (!reactObject) return;
            const guild = await client.guilds.fetch(reaction.message.guildId);
            const guildMember = await guild.members.fetch(user.id);
            const role = await guild.roles.fetch(reactObject.role_id);
            await guildMember.roles.remove(role, 'Reaction Role');
        })
    }
}
