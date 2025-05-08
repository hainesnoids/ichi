const { AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
	"data": {
        name: 'hex',
        description: "View a hex code.",
        integration_types: [0, 1],
        contexts: [0, 1, 2],
        options: [
            {
                "name": "hex",
                "description": "The hex code",
                "type": 3,
                "required": true,
                "choices": []
            },
        ],
    },
	async execute(interaction) {
        // make image
        const canvas = createCanvas(100, 100);

        // get canvas context
        const ctx = canvas.getContext("2d");

        // fill with red
        ctx.fillStyle = interaction.options.get("hex").value;
        ctx.fillRect(0, 0, 100, 100);

        // create image stream, then send to discord.
        const stream = canvas.createPNGStream();
        await interaction.reply({ files: [new AttachmentBuilder(stream)] });
	},
};