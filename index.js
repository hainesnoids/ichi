const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes, Client, Collection, GatewayIntentBits, EmbedBuilder, AttachmentBuilder, MessageFlags } = require('discord.js');
const { token, clientId, globalLogChannel, globalUsageLogChannel, ownerId } = require('./config.json');

// Create a new client instance
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMembers
	]
});

// Instert all slash commands
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
			//console.log("Loaded Command " + command.data.name);
		} else {
			console.log("\x1b[33m!\x1b[0m " + `The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// start all Modules
async function startModules() {
	const foldersPath2 = path.join(__dirname, 'modules');
	const commandFolders2 = fs.readdirSync(foldersPath2);

	for (const folder of commandFolders2) {
		const commandsPath = path.join(foldersPath2, folder);
		const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const command = require(filePath);
			if ('data' in command && 'execute' in command) {
				console.log("Loaded Module " + command.data.name);
				command.execute(client);
			} else {
				console.log("\x1b[33m!\x1b[0m " + `The command at ${filePath} is missing a required "data" or "execute" property.`);
			}
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

function updateStatus(c) {
    c.user.setActivity({ name: 'convention tomorrow! | /about', type: 4 });
}

client.on('ready', rClient => {
	console.log(`Logged in as ${rClient.user.tag}!`);
    rClient.user.setPresence({ status: 'online' });
    updateStatus(rClient);
    setInterval(() => {updateStatus(rClient)},3600000);
});

client.once('ready', () => {
	startModules();
})

client.on('interactionCreate', async interaction => {
	if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {} else return;

    console.log(interaction.user.username + " \x1b[34m>\x1b[0m " + interaction.commandName);
	logCommand(interaction.user, interaction.commandName);
	const command = interaction.client.commands.get(interaction.commandName);

	// anti-mist filter
	const userData = await fetch(`https://discord.com/api/v10/users/${interaction.user.id}`, {
		headers: {
			"Authorization": 'Bot ' + token
		}
	}).then((response) => {return response.json()})

	if (userData.clan.identity_guild_id.toString() === "1059354045971693568") {
		await interaction.reply({ content: 'You may not use Ichi if you are a member of Mist Weather Media. Please leave the server and try again.' });
		const channel = client.channels.cache.get("1395043795946573874");
		const embed = new EmbedBuilder()
			.setColor(0xffe900)
			.setTitle("A blacklisted user tried to run a command.")
			.setDescription(`<@${interaction.user.id}> tried to run ${interaction.commandName}.`)
			.setFooter({ iconURL: interaction.user.avatarURL({extension: 'png'}), text: interaction.user.username })
			.setTimestamp()
		await channel.send({ embeds: [embed] });
		return;
	}


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
    if (err == "Error: SIGKILL") {
        // killed by running /kill, skip this check entirely
        throw new Error("SIGKILL");
    }
    console.error("\x1b[31m✕\x1b[0m " + "\x1b[1m" + err + "\x1b[0m")
    const channelId = globalLogChannel;
    const channel = client.channels.cache.get(channelId);
    const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("Uncaught Exception!")
        //.setAuthor({ name: 'About Ichi' })
        .setDescription(String(err).slice(0,2000))
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
    await channel.send({ embeds: [embed] });
}

async function logCommand(user, cmd) {
    const channelId = globalUsageLogChannel;
    const channel = client.channels.cache.get(channelId);
    const embed = new EmbedBuilder()
        .setColor(0x0069ff)
        .setTitle(cmd)
		.setFooter({ iconURL: user.avatarURL({extension: 'png'}), text: user.username })
        .setTimestamp()
    await channel.send({ embeds: [embed] });
}
// Log in to Discord with your client's token
client.login(token);