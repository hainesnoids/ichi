const { PermissionsBitField, MessageFlags } = require('discord.js');

function formatTime(abbreviatedTime) {
    let slowmodeValue, verbalTime
    // get value time as regex match groups
    const regex = /([0-9]+h)?([0-9]+m)?([0-9]+s?)?/gm;
    const quirkyTime = regex.exec(abbreviatedTime);
    let hours = quirkyTime[1] === undefined ? '0' : quirkyTime[1].replaceAll('h','')
    let minutes = quirkyTime[2] === undefined ? '0' : quirkyTime[2].replaceAll('m','')
    let seconds = quirkyTime[3] === undefined ? '0' : quirkyTime[3].replaceAll('s','')
    slowmodeValue = (Number(hours) * 3600) +
        (Number(minutes) * 60) +
        (Number(seconds))
    let verbalTimeArray = [];
    if (Number(hours) > 0) {
        verbalTimeArray.push(`${hours} hours`)
    }
    if (Number(minutes) > 0) {
        verbalTimeArray.push(`${minutes} minutes`)
    }
    if (Number(seconds) > 0) {
        verbalTimeArray.push(`${seconds} seconds`)
    }
    if (verbalTimeArray.length === 2) {
        verbalTimeArray.splice(-1, 0, "and ");
        verbalTimeArray.splice(-2, 0, " ");
    }
    if (verbalTimeArray.length === 3) {
        verbalTimeArray.splice(-1, 0, "and ");
        verbalTimeArray.splice(-2, 0, " ");
        verbalTimeArray.splice(-4, 0, ", ");
    }
    verbalTime = verbalTimeArray.join('');
    return { slowmodeValue, verbalTime }
}

module.exports = {
	"data": {
        name: 'slowmode',
        description: "Change a channel's slowmode",
        integration_types: [0],
        contexts: [0, 1, 2],
        options: [
            {
                "name": "slowmode",
                "description": "Slowmode value",
                "type": 3,
                "required": true,
                "choices": []
            },
            {
                "name": "timeout",
                "description": "How long the slowmode should last (defaults to infinity)",
                "type": 3,
                "required": false,
                "choices": []
            },
        ],
    },
	async execute(interaction) {
        const channel = interaction.channel;
        const user = interaction.member;
        const permissions = await user.permissionsIn(channel);
        if (permissions.has(PermissionsBitField.Flags["ManageChannels"])) {
            const { slowmodeValue, verbalTime } = formatTime(interaction.options.get("slowmode").value);
            const { timeoutValue, verbalTimeoutTime } = formatTime(interaction.options.get("timeout").value);
            await channel.setRateLimitPerUser(slowmodeValue,`${interaction.member.user.username} set the slowmode to ${slowmodeValue} seconds.`)
            if (slowmodeValue <= 0) {
                await interaction.reply({ content: `Turned off slowmode.` });
            } else {
                await interaction.reply({ content: `Set the slowmode to ${verbalTime}.${timeoutValue <= 0 ? '' : ` It is set to expire in ${verbalTimeoutTime}`}.` });
            }
            if (timeoutValue > 0) {
                setTimeout(async () => {
                    await channel.setRateLimitPerUser(0,`The slowmode set by ${interaction.member.user.username} has expired.`)
                    await channel.send({ content: 'The slowmode set by server moderators has expired.' })
                }, timeoutValue * 1000);
            }
        } else {
            await interaction.reply({ content: `you do not have the required \`Manage Channels\` permission to run this command!`, flags: MessageFlags.Ephemeral })
        }
	},
};