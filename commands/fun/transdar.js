module.exports = {
	"data": {
        name: 'transdar',
        description: "How trans are you? (inspired by pridebot)",
        integration_types: [0, 1],
        contexts: [0, 1, 2],
        options: [
            {
                "name": "target",
                "description": "How trans is a user?",
                "type": 6,
                "required": false,
                "choices": []
            },
        ],
    },
	async execute(interaction) {
        const gayness = Math.round(Math.random() * 100);
        const target = interaction.options.get("target").user ?? interaction.user;
        const reply = `<@${target.id}> is ${gayness}% trans!`;
        await interaction.reply({ content: reply });
	},
};