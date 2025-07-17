const { AttachmentBuilder, MessageFlags } = require('discord.js');
const { createCanvas, loadImage, registerFont } = require('canvas');

module.exports = {
	"data": {
        name: 'Quote this (epheminal)',
        integration_types: [0, 1],
        contexts: [0, 1, 2],
        type: 3,
        options: [],
    },
	async execute(interaction, client) {
        // text wrapping
        function getLines(ctx, text, maxWidth) {
            var words = text.trim().replaceAll("\n"," ").split(" ");
            var lines = [];
            var currentLine = "";

            for (var i = 0; i < words.length; i++) {
                var word = words[i];
                var width = ctx.measureText(currentLine + " " + word).width;
                if (width <= maxWidth) {
                    currentLine += " " + word;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
            lines.push(currentLine.trim());
            return lines;
        }

        // regex shit
        async function fixMarkdown(message) {
            const regex = /<@([0-9]+)>/g;
            const matches = [...message.matchAll(regex)];

            const fetchPromises = matches.map(async (match) => {
                const userId = match[1];
                try {
                    const user = await client.users.fetch(userId);
                    return { username: user.username, id: userId, index: match.index, length: match[0].length };
                } catch (err) {
                    return null;
                }
            });

            const results = await Promise.all(fetchPromises);

            let updatedMessage = message;
            results.forEach(result => {
                if (result) {
                    updatedMessage = updatedMessage.replaceAll("<@" + result.id + ">", "@" + result.username);
                }
            });

            return updatedMessage;
        }

        // necessary values
        const target = await interaction.options.data[0].message;
        const message = await fixMarkdown(target.content);
        const user = target.author;

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
        await interaction.reply({ files: [new AttachmentBuilder(stream)] , flags: MessageFlags.Ephemeral});
	},
};