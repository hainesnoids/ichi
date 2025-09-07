const { PermissionsBitField } = require('discord.js');

async function formatTime(abbreviatedTime) {
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
        name: "slowmode",
        description: "change a channel's slowmode"
    },
    async execute(params, client, message) {
        const channel = message.channel;
        const user = message.member;
        const paramsFormatted = params.split(' ');
        const permissions = await user.permissionsIn(channel);
        if (permissions.has(PermissionsBitField.Flags["ManageChannels"])) {
            const { slowmodeValue, verbalTime } = await formatTime(paramsFormatted[0]);
            await channel.setRateLimitPerUser(slowmodeValue,`${message.member.user.username} set the slowmode to ${slowmodeValue} seconds.`)
            if (slowmodeValue <= 0) {
                await channel.send({ content: `Turned off slowmode.` });
            } else {
                await channel.send({ content: `Set the slowmode to ${verbalTime}.` });
            }
        } else {
            message.delete();
            const replyMsg = await channel.send({ content: `<@${user.id}>, you do not have the required \`Manage Channels\` permission to run this command!` });
            setTimeout(() => {replyMsg.delete()}, 5000)
        }
    }
}
