const { exec } = require("child_process");
const { ownerId } = require('../../config.json');
const { MessageFlags } = require('discord.js');

module.exports = {
	"data": {
        name: 'kill',
        description: "Kill Ichi.",
        integration_types: [0, 1],
        contexts: [0, 1, 2],
        options: [
            {
                "name": "meathod",
                "description": "How exactly to kill Ichi.",
                "type": 3,
                "required": true,
                "choices": [
                    {
                        name: "Uncaught Exception",
                        value: "exception"
                    },
                    {
                        name: "Kill node (destructive)",
                        value: "sigkill"
                    }
                ]
            },
        ],
    },
	async execute(interaction) {
        if (interaction.user.id != ownerId) {
            await interaction.reply({ content: "only hainesnoids can run this command.", flags: MessageFlags.Ephemeral });
        } else {
            const meathod = interaction.options.get("meathod").value;
            await interaction.reply({ content: "baii :3" });
            if (meathod === "exception") {
                throw new Error("SIGKILL");
            } else if (meathod === "sigkill") {
                await exec("killall node");
            } else {
                // lol how
            }
        }
	},
};