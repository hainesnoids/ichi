const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes, Client, Collection, GatewayIntentBits, EmbedBuilder, AttachmentBuilder, MessageFlags } = require('discord.js');
const { token, clientId, globalLogChannel, globalUsageLogChannel, ownerId } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log("\x1b[33m!\x1b[0m " + `The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const rest = new REST({ version: '10' }).setToken(token);

try {
    console.log('Started refreshing application (/) commands.');
    rest.put(Routes.applicationCommands(clientId), { body: client.commands.toJSON().map(itm => itm.data) });
    console.log('Successfully reloaded application (/) commands.');
} catch (error) {
    console.error(error);
};

client.on('ready', rClient => {
	console.log(`Logged in as ${rClient.user.tag}!`);
    rClient.user.setPresence({ status: 'online' });
    rClient.user.setActivity({ name: 'convention tomorrow! | /about', type: 4 });
});

client.on('interactionCreate', async interaction => {
	if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {} else return;

    console.log(interaction.user.username + " \x1b[34m>\x1b[0m " + interaction.commandName);
	logCommand(interaction.user, interaction.commandName);
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction, client);
	} catch (error) {
		console.error(error);
		logError(error);
        const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle(String(error).slice(0,2000))
        //.setDescription(String(origin).slice(0,2000))
        //.setFooter({ text: "© 2025 Hainesnoids. Licensed under GPL-3.0." })
        .setTimestamp()
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ embeds: [embed], content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ embeds: [embed], content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});

// Catch exceptions to prevent a crash

process.on('uncaughtException', function(err, origin) {
    console.error("\x1b[31m✕\x1b[0m " + "\x1b[1m" + err + "\x1b[0m")
    const channelId = globalLogChannel;
    const channel = client.channels.cache.get(channelId);
    const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("Uncaught Exception!")
        //.setAuthor({ name: 'About Ichi' })
        .setDescription(String(origin).slice(0,2000))
        //.setFooter({ text: "© 2025 Hainesnoids. Licensed under GPL-3.0." })
        .setTimestamp()
    channel.send({ content: `<@${ownerId}>`, embeds: [embed] });
})

async function logError(err) {
	console.error("\x1b[31m✕\x1b[0m " + "\x1b[1m" + err + "\x1b[0m")
    const channelId = globalLogChannel;
    const channel = client.channels.cache.get(channelId);
    const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("Error!")
        //.setAuthor({ name: 'About Ichi' })
        .setDescription(String(err).slice(0,2000))
        //.setFooter({ text: "© 2025 Hainesnoids. Licensed under GPL-3.0." })
        .setTimestamp()
    channel.send({ embeds: [embed] });
}

async function logCommand(user, cmd) {
    const channelId = globalUsageLogChannel;
    const channel = client.channels.cache.get(channelId);
    const embed = new EmbedBuilder()
        .setColor(0x0069ff)
        .setTitle(cmd)
		.setFooter({ iconURL: user.avatarURL({extension: 'png'}), text: user.username })
        .setTimestamp()
    channel.send({ embeds: [embed] });
}
// Log in to Discord with your client's token
client.login(token);