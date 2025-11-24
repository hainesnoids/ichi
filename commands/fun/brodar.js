module.exports = {
	"data": {
        name: 'brodar',
        description: "Are you a brony?",
        integration_types: [0, 1],
        contexts: [0, 1, 2],
        options: [
            {
                "name": "target",
                "description": "How likely is this person a brony?",
                "type": 6,
                "required": false,
                "choices": []
            },
        ],
    },
	async execute(interaction) {
        const gayness = Math.round(Math.random() * 100);
        let target;
        try {
            target = interaction.options.get("target").user;
        } catch {
            target = interaction.user;
        }
        const reply = `I'm ${gayness}% certain <@${target.id}> is a brony.`;
        await interaction.reply({ content: reply });
	},
};