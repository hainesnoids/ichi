module.exports = {
	"data": {
        name: 'match',
        description: "See how compatible two users are.",
        integration_types: [0, 1],
        contexts: [0, 1, 2],
        options: [
            {
                "name": "user1",
                "description": "First user",
                "type": 6,
                "required": true,
                "choices": []
            },
            {
                "name": "user2",
                "description": "Second user, defaults to you if left blank.",
                "type": 6,
                "required": false,
                "choices": []
            },
        ],
    },
	async execute(interaction) {
        const compatibility = Math.round(Math.random() * 100);
        const target1 = interaction.options.get("user1").user;
        const target2 = interaction.options.get("user2").user || interaction.user;
        const reply = `<@${target1.id}> and <@${target2.id}> are ${compatibility}% compatible.`;
        await interaction.reply({ content: reply });
	},
};