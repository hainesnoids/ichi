const { AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage, registerFont } = require('canvas');
const fetch = require("node-fetch");

module.exports = {
    "data": {
        name: 'gdicon',
        description: 'Generate a GD Icon',
        integration_types: [0, 1],
        contexts: [0, 1, 2],
        options: [
            {
                "name": "type",
                "description": "Icon Type",
                "type": 3,
                "required": true,
                "choices": [
                    {
                        name: "Cube",
                        value: "icon"
                    },
                    {
                        name: "Ship",
                        value: "ship"
                    },
                    {
                        name: "Ball",
                        value: "player_ball"
                    },
                    {
                        name: "UFO",
                        value: "bird"
                    },
                    {
                        name: "Wave",
                        value: "dart"
                    },
                    {
                        name: "Robot",
                        value: "robot"
                    },
                    {
                        name: "Spider",
                        value: "spider"
                    },
                    {
                        name: "Swing",
                        value: "swing"
                    },
                ]
            },
            {
                "name": "icon",
                "description": "Icon ID",
                "type": 3,
                "required": true
            }
        ],
    },
	async execute(interaction, client) {
        const iconUtils = require('../../bin/icon.js')
        // make image
        const canvas = createCanvas(1200, 630);
        registerFont("./commands/quote/Inter.ttf", { family: "Inter" });
        registerFont("./commands/quote/Inter_ital.ttf", { family: "Inter Italic" });

        // get canvas context
        const ctx = canvas.getContext("2d");

        // add user image
        const avatarUrl = user.displayAvatarURL({extension: 'png', size: 1024}) || user.avatarURL({extension: 'png', size: 1024});
        await loadImage(avatarUrl).then((image) => {
            ctx.drawImage(image, -130, 0, 630, 630)
        });

        // add overlay
        await loadImage('./commands/quote/overlay.png').then((image) => {
            ctx.drawImage(image, 0, 0, 1200, 630)
        });

        // add quote text
        ctx.font = '48pt "Inter"';
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const fontSize = 48;
        const lineHeight = fontSize * 1.3;

        const textLines = getLines(ctx, message, canvas.width / 2)
        for (let idx = 0; idx < textLines.length; idx++) {
            const itm = textLines[idx];

            // calculate line position
            const linePosition = (canvas.height - (lineHeight * textLines.length) / 2) + lineHeight * (idx + 0.5) - (canvas.height / 2) + ((lineHeight - fontSize) / 2);

            // add text
            ctx.fillText(itm, canvas.width * .69, linePosition);
        }

        // add user text
        ctx.font = '24pt "Inter Italic"';
        ctx.fillStyle = "#a0a0a0";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const authorPosition = (canvas.height - (lineHeight * textLines.length) / 2) + lineHeight * (textLines.length) - (canvas.height / 2) + (52 / 2) + ((lineHeight - fontSize) / 2);
        ctx.fillText("- " + user.displayName, canvas.width * .69, authorPosition);

        ctx.font = '12pt "Inter Italic"';
        ctx.fillStyle = "#707070";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const authorPosition2 = (canvas.height - (lineHeight * textLines.length) / 2) + lineHeight * (textLines.length) - (canvas.height / 2) + (112 / 2) + ((lineHeight - fontSize) / 2);
        ctx.fillText("@" + user.username, canvas.width * .69, authorPosition2);

        // watermark
        ctx.font = '18pt "Inter"';
        ctx.fillStyle = "#707070";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";

        ctx.fillText("ws4k.net/ichi", 1190, 610);

        // create image stream, then send to discord
        const stream = canvas.createPNGStream();
        await interaction.reply({ files: [new AttachmentBuilder(stream)] });
	},
};