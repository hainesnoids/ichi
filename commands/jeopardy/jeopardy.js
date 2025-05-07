const { AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage, registerFont } = require('canvas');

module.exports = {
	"data": {
        name: 'jeopardy',
        description: 'Show a string jeopardy style!',
        integration_types: [0, 1],
        contexts: [0, 1, 2],
        options: [
            {
                "name": "message",
                "description": "The thing to say",
                "type": 3,
                "required": true,
                "choices": []
            },
        ],
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

        // make image
        const canvas = createCanvas(1920, 1080);
        registerFont("./commands/jeopardy/font.ttf", { family: "Jeopardy" });

        // get canvas context
        const ctx = canvas.getContext("2d");

        //ctx.fillStyle = "darkblue";
        //ctx.fillRect(0,0,canvas.width,canvas.height);

        // add background
        await loadImage('./commands/jeopardy/background.png').then((image) => {
            ctx.drawImage(image, 0, 0, 1920, 1080)
        });

        // add quote text
        ctx.font = '88pt "Jeopardy"';
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fontStretch = "normal";
        const fontSize = 88;
        const lineHeight = fontSize * 1.25;

        const textLines = await getLines(ctx, interaction.options.get("message").value.toUpperCase(), 1440)
        for (let idx = 0; idx < textLines.length; idx++) {
            const itm = textLines[idx];

            // calculate line position
            const linePosition = (canvas.height - (lineHeight * textLines.length) / 2) + lineHeight * (idx + 0.5) - (canvas.height / 2) + ((lineHeight - fontSize) / 2);

            // add text
            ctx.fillStyle = "black";
            ctx.fillText(itm, canvas.width * .5 + 12, linePosition + 12);
            ctx.fillStyle = "white";
            ctx.fillText(itm, canvas.width * .5, linePosition);
        }
        
        // create image stream, then send to discord
        const stream = canvas.createPNGStream();
        await interaction.reply({ files: [new AttachmentBuilder(stream)] });
	},
};
