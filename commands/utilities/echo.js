const { MessageFlags } = require('discord.js');
const { ownerId } = require('../../config.json');

module.exports = {
	"data": {
        name: 'echo',
        description: "Say something.",
        integration_types: [0],
        contexts: [0, 1, 2],
        options: [
            {
                "name": "message",
                "description": "The thing to say",
                "type": 3,
                "required": true,
                "choices": []
            },
        ],
    },
	async execute(interaction, client) {
		// check privelages
        if (interaction.user.id != ownerId) {
            await interaction.reply({ content: "only hainesnoids can run this command.", flags: MessageFlags.Ephemeral });
        } else {
            const channelId = interaction.channelId;
            const channel = client.channels.cache.get(channelId);
            console.log("\x1b[33m└\x1b[0m",interaction.options.get("message").value)
            try {
                channel.send(interaction.options.get("message").value);
                await interaction.reply({ content: "Done.", flags: MessageFlags.Ephemeral });
            } catch (err) {
                await interaction.reply({ content: "Insufficient Permissions.", flags: MessageFlags.Ephemeral });
            }
        }
	},
};