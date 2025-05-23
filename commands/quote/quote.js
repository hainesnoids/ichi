const { AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage, registerFont } = require('canvas');

module.exports = {
	"data": {
        name: 'quote',
        integration_types: [0, 1],
        contexts: [0, 1, 2],
        type: 3,
        options: [],
    },
	async execute(interaction) {
        // text wrapping
        function getLines(ctx, text, maxWidth) {
            var words = text.trim().split(" ");
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

        // necessary values
        const target = await interaction.options.data[0].message;
        const message = target.content;
        const user = target.author;

        // make image
        const canvas = createCanvas(1200, 630);
        registerFont("./commands/quote/Inter.ttf", { family: "Inter" });
        registerFont("./commands/quote/Inter_ital.ttf", { family: "Inter Italic" });

        // get canvas context
        const ctx = canvas.getContext("2d");

        // add user image
        const avatarUrl = user.displayAvatarURL({extension: 'png'}) || user.avatarURL({extension: 'png'});
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

        const textLines = await getLines(ctx, message, canvas.width / 2)
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