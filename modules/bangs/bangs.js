const { EmbedBuilder, Collection } = require('discord.js');
const path = require("node:path");
const fs = require("node:fs");

module.exports = {
    "data": {
        name: "bangs",
        description: "legacy command handler (mainly for moderation commands)"
    },
    async execute(client) {
        const config = {
            "prefix": "i!"
        }
        let commands = new Collection();
        const foldersPath = path.join(__dirname, '../../bangs');
        const commandFolders = fs.readdirSync(foldersPath);

        for (const folder of commandFolders) {
            const commandsPath = path.join(foldersPath, folder);
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);
                if ('data' in command && 'execute' in command) {
                    await commands.set(command.data.name, command);
                } else {
                    console.log("\x1b[33m!\x1b[0m " + `The bang at ${filePath} is missing a required "data" or "execute" property.`);
                }
            }
        }
        client.on('messageCreate', (message) => {
            if (message.author.bot) return;
            if (message.content.startsWith(config.prefix)) {
                const requestWithoutPrefix = message.content.replaceAll(config.prefix,'');
                const commandItems = requestWithoutPrefix.split(' ');
                const command = commandItems[0];
                const params = requestWithoutPrefix.replaceAll(command + ' ','');
                commands.get(command).execute(params /* Array of command parameters */, client /* the client who will handle the response */, message /* the message to reply to */);
            }
        });
    }
}
