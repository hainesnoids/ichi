module.exports = {
	"data": {
        name: '8ball',
        description: "Ask the magic 8-ball a question.",
        integration_types: [0, 1],
        contexts: [0, 1, 2],
        options: [
            {
                "name": "query",
                "description": "Your question",
                "type": 3,
                "required": true,
                "choices": []
            },
        ],
    },
	async execute(interaction) {
		const answers = [
            "It is certain",
            "Reply hazy, try again",
            "Don’t count on it",
            "It is decidedly so",
            "Ask again later",
            "My reply is no",
            "Without a doubt",
            "Better not tell you now",
            "My sources say no",
            "Yes definitely",
            "Cannot predict now",
            "Outlook not so good",
            "You may rely on it",
            "Concentrate and ask again",
            "Very doubtful",
            "As I see it, yes",
            "Most likely",
            "Outlook good",
            "Yes",
            "Signs point to yes",
            "Hell nah",
            "Why would you ask that",
            "Reply misty, try again"
        ]
        //await interaction.reply({ content: `> ${interaction.options.get("query").value}\n${answers[Math.floor(Math.random() * answers.length)]}` })
        const reply = answers[Math.floor(Math.random() * answers.length)];
        await interaction.reply({ content: reply })
        console.log("\x1b[33m└\x1b[0m",interaction.options.get("query").value)
	},
};