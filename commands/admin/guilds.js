const { EmbedBuilder } = require('discord.js');
const { ownerId } = require('../../config.json');

module.exports = {
	"data": {
        name: 'guilds',
        description: "Guilds the bot is in",
        integration_types: [0, 1],
        contexts: [0, 1, 2],
        options: [],
    },
	async execute(interaction, client) {
        if (interaction.user.id != ownerId) {
            await interaction.reply({ content: "only hainesnoids can run this command.", flags: MessageFlags.Ephemeral });
        } else {
            var str = "";
            const guildList = client.guilds.cache.toJSON();
            for (let idx = 0; idx < guildList.length; idx++) {
                const g = guildList[idx];
                const botInGuild = await g.members.fetch(client.user.id);
                const joinDate = Math.floor(botInGuild.joinedTimestamp / 1000);
                str += `${g.name} (${g.id})\n${g.members.cache.size} Members\nJoined <t:${joinDate}:F>`;
                str += `\n\n`;
            }
            await interaction.reply({ content: str })
        }
	},
};