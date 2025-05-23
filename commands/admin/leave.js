const { Collection } = require('discord.js');
const { ownerId } = require('../../config.json');

module.exports = {
	"data": {
        name: 'leave',
        description: "Remove the bot from a guild.",
        integration_types: [0, 1],
        contexts: [0, 1, 2],
        options: [
            {
                "name": "guild",
                "description": "ID of the guild to leave",
                "type": 3,
                "required": true,
                "choices": []
            },
        ],
    },
	async execute(interaction, client) {
        if (interaction.user.id != ownerId) {
            await interaction.reply({ content: "only hainesnoids can run this command.", flags: MessageFlags.Ephemeral });
        } else {
            const guild = client.guilds.cache.get(interaction.options.get("guild").value);
            try {
                guild.leave();
            } catch (err) {
                await interaction.reply({ content: `Could not leave ${guild.name}.` })
            } finally {
                await interaction.reply({ content: `Left ${guild.name}.` });
            };
        }
	},
};