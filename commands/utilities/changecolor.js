const { WLED } = require("wled");
const convert = require("color-convert").default;
const lights = new WLED("10.0.0.226"); // URL of the WLED Object

module.exports = {
    "data": {
        name: 'changecolor',
        integration_types: [0, 1],
        contexts: [0, 1, 2],
        description: "change the color of @hainesnoids' LEDs",
        options: [
            {
                "name": "type",
                "description": "Color format to use",
                "type": 3,
                "required": true,
                "choices": [
                    {
                        name: "rgb",
                        value: "rgb"
                    },
                    {
                        name: "hex",
                        value: "hex"
                    },
                    {
                        name: "hsv",
                        value: "hsv"
                    },
                    {
                        name: "keyword",
                        value: "keyword"
                    }
                ]
            },
            {
                "name": "color",
                "description": "Color to use. CSS color selectors apply.",
                "type": 3,
                "required": true,
                "choices": []
            }
        ],
    },
    async execute(interaction) {
        const color = interaction.options.get('color').value;
        console.log(color);
        var rgbVal = [];
        if (interaction.options.get('type').value === "rgb") {
            rgbVal = color.split(", ");
        } else if (interaction.options.get('type').value === "hsv") {
            rgbVal = await convert.hsv.rgb(color.split(", "));
        } else if (interaction.options.get('type').value === "hex") {
            rgbVal = await convert.hex.rgb(color.replace("#",""));
        } else if (interaction.options.get('type').value === "keyword") {
            rgbVal = await convert.keyword.rgb(color);
        } else {
        }
        lights.setOn(true);
        lights.setColor(rgbVal);
        console.log("\x1b[33m└\x1b[0m", rgbVal);
        await interaction.reply('changed LED color (or tried to)');
    },
}