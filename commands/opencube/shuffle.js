const fetch = require("node-fetch");
const { openCubeInstance } = require("../../config.json");
const { ownerId } = require('../../config.json');

module.exports = {
    "data": {
        name: 'shuffle',
        integration_types: [0, 1],
        contexts: [0, 1, 2],
        description: "Shuffle an OpenCube Playlist",
        options: [],
    },
    async execute(interaction) {
        // check privelages
        if (interaction.user.id != ownerId) {
            await interaction.reply({ content: "only hainesnoids can run this command.", flags: MessageFlags.Ephemeral });
        } else {
            const data = fetch(`http://${openCubeInstance}/api/shuffle`)
            .then((data) => {return data.json()});
            await interaction.reply("Done.");
        }
    },
}