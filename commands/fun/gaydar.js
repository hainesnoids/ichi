module.exports = {
	"data": {
        name: 'gaydar',
        description: "How gay are you? (inspired by pridebot)",
        integration_types: [0, 1],
        contexts: [0, 1, 2],
        options: [
            {
                "name": "target",
                "description": "How gay is a user?",
                "type": 6,
                "required": false,
                "choices": []
            },
        ],
    },
	async execute(interaction) {
        const gayness = Math.round(Math.random() * 100);
        const target = interaction.options.get("target").user || interaction.user;
        const reply = `<@${target.id}> is ${gayness}% gay!`;
        await interaction.reply({ content: reply });
	},
};