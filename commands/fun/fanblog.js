const fetch = require("node-fetch");
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
    "data": {
        name: 'fanblog',
        description: "Read the best webcomic out there.",
        integration_types: [0, 1],
        contexts: [0, 1, 2],
        options: [],
    },
    async execute(interaction) {
        // Fetch Page Settings
        const clientData = await fetch(`https://fanblogcomic.neocities.org/js/comic_settings.js`)
        .then((response) => response.text())
        .then((data) => {return data});

        // Filter for latest page
        const pageReg = new RegExp("const maxpg = ([0-9]+)");
        const pageNum = clientData.match(pageReg)[1];

        // build the embed
        const color = 0x96BF10
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle("Recent FanBlog Page")
            .setDescription(`Page ${pageNum} of ${pageNum}`) // page browsing will be added later but im too lazy to implement it
            .setImage(`https://fanblogcomic.neocities.org/img/comics/pg${pageNum}.png`)
            .setURL(`https://fanblogcomic.neocities.org/?pg=${pageNum}#showcomic`)
            .setTimestamp()

        interaction.reply({ embeds: [embed] });
    },
}