const fetch = require("node-fetch");
const { openCubeInstance } = require("../../config.json");
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');

function slider(value, min = 0, max = 100, length = 10) {
    value = Math.max(min, Math.min(max, value));

    const filledLength = Math.round(((value - min) / (max - min)) * length);
    const filledPart = '<:prog_full:1364671468608295042>'.repeat(filledLength);
    const emptyPart = '<:prog_empty:1364671865842438204>'.repeat(length - filledLength - 1);
    const dot = '<:prog_dot:1364671486434087073>';
    
    return `${filledPart}${dot}${emptyPart}`;
}

function timestamps(start, end) {
    end = end - start
    return [`${Math.floor(start / 60)}:${(Math.floor(start) % 60).toString().padStart(2,'0')}`, `-${Math.floor(end / 60)}:${(Math.floor(end) % 60).toString().padStart(2, '0')}`];
}

module.exports = {
    "data": {
        name: 'nowplaying',
        description: "Get the current song from an OpenCube Instance",
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

        const currentSong = playlist[clientData.song];
        // Get Average Color of Album Art
        const color = 0x96BF10
        // Convert Album Art to a Data URL for use in the embed
        const thumb = new AttachmentBuilder(`http://${openCubeInstance}/images/albums/${(currentSong.album)}.jpg`)
        .setName("albumArt.jpg");
        // Construct timestamps and slider
        const slide = await slider(clientData.songProgress, 0, clientData.songLength);
        const [time, timeLeft] = await timestamps(clientData.songProgress, clientData.songLength);

        // build the embed
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle("Now Playing")
            .setThumbnail(`attachment://albumArt.jpg`)
            //.setAuthor({ name: 'Now Playing' })
            .setDescription(`**${currentSong.name}**\n${currentSong.artist}\n${currentSong.album}`)
            .addFields({ name: '', value: (`**${time}** ​ ${slide} ​ ${timeLeft}`), inline: true })
            //.setTimestamp()

        interaction.reply({ embeds: [embed], files: [thumb] });
    },
}