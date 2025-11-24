const {
    MessageFlags,
    ActionRowBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder } = require('discord.js');

function getImportantGameIndex(games) {
    const now = new Date();
    for (let i = 0; i < games.length; i++) {
        const futureDate = new Date(games[i].date);
        const timeDifference = futureDate - now;
        if (timeDifference > 0 && timeDifference <= (12 * 60 * 60 * 1000)) { // hours remain
            return i;
        } else if (timeDifference > 0) {
            return i - 1;
        }
    }
    return -1;
}

module.exports = {
	"data": {
        name: 'nba',
        description: "Browse the NBA. (Powered by ESPN)",
        integration_types: [0, 1],
        contexts: [0, 1, 2],
        options: [
            {
                name: 'game',
                description: "Get info on a particular NBA game by team. (Powered by ESPN)",
                type: 1,
                options: [
                    {
                        "name": "team",
                        "description": "The three-letter team abbreviation for a participating team in the game.",
                        "type": 3,
                        "required": true,
                        "choices": []
                    },
                ],
            },
        ],
    },
	async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();
        switch (subCommand) {
            case 'game': {
                // get the necessary data
                const team = interaction.options.get("team").value.toLowerCase();
                const teamGames = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${team}/schedule`)
                    .then(res => {return res.json()});
                const newestGame = teamGames['events'][getImportantGameIndex(teamGames.events)];
                const gameData = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${newestGame.id}`)
                    .then(res => {return res.json()});

                let away = {
                    score: gameData['header']['competitions'][0]['competitors'][0]['score'] ?? 0,
                    logo: gameData['boxscore']['teams'][1]['team']['logo'],
                    abbr: gameData['boxscore']['teams'][1]['team']['abbreviation']
                }
                let home = {
                    score: gameData['header']['competitions'][0]['competitors'][1]['score'] ?? 0,
                    logo: gameData['boxscore']['teams'][0]['team']['logo'],
                    abbr: gameData['boxscore']['teams'][0]['team']['abbreviation']
                }
                let game = {
                    statusSummary: gameData['header']['competitions'][0]['status']['type']['description'],
                    status: gameData['header']['competitions'][0]['status']['type']['detail'],
                    location: `${gameData['gameInfo']['venue']['fullName']} - ${gameData['gameInfo']['venue']['address']['city']}, ${gameData['gameInfo']['venue']['address']['state']}`,
                }

                // build the embed
                let components = [
                    new ContainerBuilder()
                        .addSectionComponents(new SectionBuilder()
                            .setThumbnailAccessory(new ThumbnailBuilder().setURL(away.logo))
                            .addTextDisplayComponents(new TextDisplayBuilder().setContent(away.abbr))
                            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${away.score}`))
                        )
                        .addSectionComponents(new SectionBuilder()
                            .setThumbnailAccessory(new ThumbnailBuilder().setURL(home.logo))
                            .addTextDisplayComponents(new TextDisplayBuilder().setContent(home.abbr))
                            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${home.score}`))
                        )
                        .addSeparatorComponents(new SeparatorBuilder())
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`**${game.statusSummary}**\n${game.status}\n${game.location}`)
                        )
                ]
                await interaction.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2,
                })
            }
        }
	},
};