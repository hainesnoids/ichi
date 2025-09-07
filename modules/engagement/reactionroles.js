module.exports = {
    "data": {
        name: "reactionroles",
        description: "Reaction Roles"
    },
    async execute(client) {
        const config = {
            roles: [
                { // testing
                    role_id: '1400196045421674576',
                    message_id: '1400585095659917443',
                    emoji: '❤️'
                },
                {
                    role_id: "1340781982698831874",
                    message_id: "1340771825428467845",
                    emoji: "🥕"
                },
                {
                    role_id: "1340781982698831874",
                    message_id: "1340771883037098167",
                    emoji: "🍋"
                },
                {
                    role_id: "1340781982698831874",
                    message_id: "1340771999466782741",
                    emoji: "🥬"
                },
                {
                    role_id: "1340781982698831874",
                    message_id: "1340772066068267109",
                    emoji: "🌫️"
                },
                {
                    role_id: "1340781982698831874",
                    message_id: "1340772418381152297",
                    emoji: "🚙"
                },
                {
                    role_id: "1340781982698831874",
                    message_id: "1340772481006309386",
                    emoji: "🫐"
                },
                {
                    role_id: "1340781982698831874",
                    message_id: "1340772550321377371",
                    emoji: "🌌"
                },
                {
                    role_id: "1340781982698831874",
                    message_id: "1340772634962559028",
                    emoji: "💄"
                },
                {
                    role_id: "1340781982698831874",
                    message_id: "1340779517886730322",
                    emoji: "🌸"
                },
                {
                    role_id: "1340795848669396993",
                    message_id: "1340782659172962304",
                    emoji: "📺"
                },
                {
                    role_id: "1340795848669396993",
                    message_id: "1340782889322811554",
                    emoji: "🎨"
                },
                {
                    role_id: "1340795848669396993",
                    message_id: "1340783502718799983",
                    emoji: "⌨️"
                },
                {
                    role_id: "1340795848669396993",
                    message_id: "1340782779750678660",
                    emoji: "🖥️"
                },
                {
                    role_id: "1340795848669396993",
                    message_id: "1340783003047039038",
                    emoji: "🎮"
                },
                {
                    role_id: "1414219226645794816",
                    message_id: "1404846443956797643",
                    emoji: "♂️"
                },
                {
                    role_id: "1414219226645794816",
                    message_id: "1402076618306093167",
                    emoji: "🟨"
                },
                {
                    role_id: "1414219226645794816",
                    message_id: "1404846493642395648",
                    emoji: "♀️"
                },
                {
                    role_id: "1414219226645794816",
                    message_id: "1404846529558220941",
                    emoji: "✅"
                },
                {
                    role_id: "1414219226645794816",
                    message_id: "1404846572017287349",
                    emoji: "❔"
                },
                {
                    role_id: "1414219265199837261",
                    message_id: "1414219612828074096",
                    emoji: "🔴"
                },
                {
                    role_id: "1414219265199837261",
                    message_id: "1414219672412491879",
                    emoji: "📢"
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
