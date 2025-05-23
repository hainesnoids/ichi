const { MessageFlags } = require('discord.js');
const { ownerId } = require('../../config.json');

module.exports = {
	"data": {
        name: 'sendmedia',
        description: "Send some files.",
        integration_types: [0],
        contexts: [0, 1, 2],
        options: [
            {
                "name": "attachment",
                "description": "Message attachments",
                "type": 11,
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
            var attachment = interaction.options.get("attachment").attachment;
            try {
                channel.send({ files: [attachment] });
                await interaction.reply({ content: "Done.", flags: MessageFlags.Ephemeral });
            } catch (err) {
                await interaction.reply({ content: "Insufficient Permissions.", flags: MessageFlags.Ephemeral });
            }
        }
	},
};