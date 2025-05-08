const fetch = require("node-fetch");
const { openCubeInstance } = require("../../config.json");
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
    "data": {
        name: 'upnext',
        description: "Get the next few songs from an OpenCube Instance",
        integration_types: [0, 1],
        contexts: [0, 1, 2],
        options: [],
    },
    async execute(interaction) {
        // Fetch OpenCube client data
        const clientData = await fetch(`http://${openCubeInstance}/dashboard/clientData.json`)
        .then((response) => response.json())
        .then((data) => {return data});
        // Fetch OpenCube Playlist
        const playlist = await fetch(`http://${openCubeInstance}/js/playlist.json`)
        .then((response) => response.json())
        .then((data) => {return data});

        var embedArray = [];
        var filesArray = [];

        for (let idx = 0; idx < 5; idx++) {
            const itm = playlist[idx + clientData.song + 1];
            const color = 0x96BF10
            filesArray.push(new AttachmentBuilder(`http://${openCubeInstance}/images/albums/${(itm.album)}.jpg`)
                .setName(`art-${idx}.jpg`)
            );
            
            embedArray.push(new EmbedBuilder()
                .setColor(color)
                //.setTitle("")
                .setThumbnail(`attachment://art-${idx}.jpg`)
                //.setAuthor({ name: 'Now Playing' })
                .setDescription(`**${itm.name}**\n${itm.artist}\n${itm.album}`)
                //.addFields({ name: '', value: (`**${time}** ${slide} **${timeLeft}**`), inline: true })
                //.setTimestamp()
            );
        };

        interaction.reply({ embeds: embedArray, files: filesArray });
    },
}