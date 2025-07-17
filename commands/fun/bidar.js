module.exports = {
	"data": {
        name: 'bidar',
        description: "How bisexual are you?",
        integration_types: [0, 1],
        contexts: [0, 1, 2],
        options: [
            {
                "name": "target",
                "description": "How bisexual is a user?",
                "type": 6,
                "required": false,
                "choices": []
            },
        ],
    },
	async execute(interaction) {
        const biness = Math.round(Math.random() * 100);
        let target;
        try {
            target = interaction.options.get("target").user;
        } catch {
            target = interaction.user;
        };
        const reply = `<@${target.id}> is ${biness}% bisexual!`;
        await interaction.reply({ content: reply });
	},
};