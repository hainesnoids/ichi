module.exports = {
    "data": {
        name: "logs",
        description: "Logging for Hainesnoids+"
    },
    async execute(client) {
        const config = {
            'guild_id': '509114317564805140',
            'channels': [
                {
                    'id': '1426960191005524119', // #member-logs
                    'events': [
                        'guildMemberAdd',
                        'guildMemberRemove',
                        'guildBanAdd',
                        'guildBanRemove',
                        'guildMemberWarn',
                        'guildMemberTimeout',
                        'guildMemberKick'
                    ]
                },
                {
                    'id': '1426960492886360084', // #message-logs
                    'events': [
                        'messageDelete',
                        'messageDeleteBulk',
                        'messageReactionAdd',
                        'messageReactionRemove',
                        'messageReactionRemoveAll',
                        'messageReactionRemoveEmoji',
                        'threadDelete'
                    ]
                },
                {
                    'id': '1426960530286968914', // #voice-logs
                    'events': [
                        'voiceStateUpdate'
                    ]
                },
                {
                    'id': '1426961814482063370', // #audit-logs
                    'events': [
                        'applicationCommandPermissionsUpdate',
                        'autoModerationRuleCreate',
                        'autoModerationRuleDelete',
                        'autoModerationRuleUpdate',
                        'channelCreate',
                        'channelDelete',
                        'channelUpdate',
                        'emojiCreate',
                        'emojiDelete',
                        'emojiUpdate',
                        'guildUpdate',
                        'roleCreate',
                        'roleDelete',
                        'roleUpdate',
                        'stickerCreate',
                        'stickerDelete',
                        'stickerUpdate',
                        'webhooksUpdate'
                    ]
                }
            ]
        }
        for (const logChannel of config.channels) {
            for (const event of logChannel.events) {
                
            }
        }
    }
}
