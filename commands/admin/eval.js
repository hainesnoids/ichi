const { ownerId } = require('../../config.json');

module.exports = {
	"data": {
        name: 'eval',
        description: "Run a command.",
        integration_types: [0, 1],
        contexts: [0, 1, 2],
        options: [
            {
                "name": "command",
                "description": "The command to run.",
                "type": 3,
                "required": true,
                "choices": []
            },
        ],
    },
	async execute(interaction) {
        if (interaction.user.id != ownerId) {
            await interaction.reply({ content: "only hainesnoids can run this command.", flags: MessageFlags.Ephemeral });
        } else {
            const fn = eval(interaction.options.get("command").value);
            await interaction.reply({ content: fn == "" ? "..no response from the command." : fn })
        }
	},
};