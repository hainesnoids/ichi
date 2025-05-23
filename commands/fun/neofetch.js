const { exec } = require("child_process");

module.exports = {
	"data": {
        name: 'neofetch',
        description: "Get the running system's information",
        integration_types: [0, 1],
        contexts: [0, 1, 2],
        options: [],
    },
	async execute(interaction) {
		const neofetch = await exec("neofetch|sed 's/\x1B\[[0-9;\?]*[a-zA-Z]//g'", async (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                return;
            }

            const fetchContent = stdout.slice(1,-1).replaceAll("\\n", "\n").split("\n");
            var parsed = "";
            try {
                //channel.send(interaction.options.get("message").value);
                for (let idx = 0; idx < 17; idx++) {
                    const itm = fetchContent[idx];
                    const itm2 = fetchContent[idx + 17];
                    parsed += `${itm.padEnd(35," ") + itm2}\n`;
                }
                await interaction.reply(`\`\`\`\n${parsed}\n\`\`\``);
            } catch (err) {
                console.log(err);
                await interaction.reply({ content: "Insufficient Permissions.", flags: MessageFlags.Ephemeral });
            }
        });
	},
};