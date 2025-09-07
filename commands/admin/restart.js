const { exec } = require("child_process");
const { ownerId } = require('../../config.json');
const { MessageFlags } = require('discord.js');

module.exports = {
	"data": {
        name: 'restart',
        description: "Restart Ichi.",
        integration_types: [0, 1],
        contexts: [0, 1, 2]
    },
	async execute(interaction) {
        if (interaction.user.id !== ownerId) {
            await interaction.reply({ content: "only hainesnoids can run this command.", flags: MessageFlags.Ephemeral });
        } else {
            await interaction.reply({ content: "someone got my reboot card" });
            await exec("pm2 restart ichi");
        }
	}
}