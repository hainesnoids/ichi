const { EmbedBuilder } = require('discord.js');

module.exports = {
	"data": {
        name: 'about',
        description: "About Ichi",
        integration_types: [0, 1],
        contexts: [0, 1, 2],
        options: [],
    },
	async execute(interaction) {
		const embed = new EmbedBuilder()
            .setColor(0x96BF10)
            .setTitle("About Ichi")
            .setThumbnail("https://cdn.discordapp.com/avatars/1361447067247054950/0a3a600821788995145955cbd43c8c15.png?size=512")
            //.setAuthor({ name: 'About Ichi' })
            .setDescription("Ichi is the general-purpose Discord bot developed by Hainesnoids.")
            .addFields([
                { name: 'What can I do?', value: "View the status of my OpenCube instance, Control my room's LEDs, and other stuff that gets added in the future.", inline: false },
                { name: 'Is my backend spaghetti code?', value: "was", inline: false },
                { name: 'Am I open source', value: "[Yes](<https://github.com/nodysey/ichi>)", inline: false },
            ])
            .setFooter({ text: "© 2025 Hainesnoids. Licensed under GPL-3.0." })
            //.setTimestamp()
        await interaction.reply({ embeds: [embed] })
	},
};