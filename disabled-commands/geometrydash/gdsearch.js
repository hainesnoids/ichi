const fetch = require("node-fetch");
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');

// a ton of this code is lifted straight out of GJSearchPage.

module.exports = {
    "data": {
        name: 'gdsearch',
        description: "Search Geometry Dash",
        integration_types: [0, 1],
        contexts: [0, 1, 2],
        options: [
            {
                "name": "type",
                "description": "Icon Type",
                "type": 3,
                "required": true,
                "choices": [
                    {
                        name: "Cube",
                        value: "icon"
                    },
                    {
                        name: "Ship",
                        value: "ship"
                    },
                    {
                        name: "Ball",
                        value: "player_ball"
                    },
                    {
                        name: "UFO",
                        value: "bird"
                    },
                    {
                        name: "Wave",
                        value: "dart"
                    },
                    {
                        name: "Robot",
                        value: "robot"
                    },
                    {
                        name: "Spider",
                        value: "spider"
                    },
                    {
                        name: "Swing",
                        value: "swing"
                    },
                ]
            },
        ],
    },
    async execute(interaction) {
        async function makeRequest(gjSearchOptions) {
            return await fetch("http://www.boomlings.com/database/getGJLevels21.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": "",
                },
                body: gjSearchOptions
            }).then((res) => res.text());
        }

        function calculateDifficulty(GJLevel) {
            const numerator = GJLevel[9];
            const isDemon = GJLevel[17] === "1" ? true : false;
            const starCount = GJLevel[18];
            const demonDiff = GJLevel[43];
            const featured = Number(GJLevel[19]);
            const epic = Number(GJLevel[42]);

            let rating;
            let stars;
            let feature;

            stars = Number(starCount) // Defaults
            // this is the old vote-count check. Due to new rating rules we can just divide the numerator by 10
            //const apparentDiff = voteCount / numerator === (1 / 0) ? -1 : voteCount / numerator;
            if (isDemon === false && starCount === 10) {stars = 9} // False-demon check
            if (isDemon === true) { // demon values
                if (demonDiff === 3) {
                    rating = 11
                } else if (demonDiff === 4) {
                    rating = 12
                } else if (demonDiff === 0) {
                    rating = 13
                } else if (demonDiff === 5) {
                    rating = 14
                } else if (demonDiff === 6) {
                    rating = 15
                } else {
                    rating = numerator / 10 + 10;
                }
            } else { // non-demon values
                rating = numerator / 10;
            }
            if (epic > 0) {
                feature = epic + 2
            } else if (featured > 0) {
                feature = 2
            } else {
                feature = -1;
            }

            // 0 = NA, 1 = Easy, 2 = Normal, 3 = Hard, 4 = Harder, 5 = Insane
            // 10 = Demon, 11 = Easy Demon, 12 = Medium Demon, 13 = Hard Demon, 14 = Insane Demon, 15 = Extreme Demon
            return {rating: rating, stars: stars, feature: feature}
        }

        function displaySearch(GJBaseSearchResult) {
            const GJSearchResult = GJBaseSearchResult.replaceAll("\n","").split("#");
            const levels = [];
            // [0] = Level Info, [1] = Creator Info, [2] = Song Info
            const baseLevelDataArray = GJSearchResult[0].split('|');
            const baseCreatorDataArray = GJSearchResult[1].split('|');
            const baseSongDataArray = GJSearchResult[2].split(':');

            // Level Info
            for (let i = 0; i < baseLevelDataArray.length; i += 1) {
                let GJLevel = {};
                const levelDataArray = baseLevelDataArray[i].split(':');
                for (let i = 0; i < levelDataArray.length; i += 2) {
                    const key = levelDataArray[i];
                    GJLevel[key] = levelDataArray[i + 1] !== undefined ? levelDataArray[i + 1] : null; // Handle case where there's no value;
                }
                GJLevel.creatorInfo = baseCreatorDataArray.find(item => item.includes(GJLevel[6])) || "-:-:-";
                GJLevel.songInfo = baseSongDataArray[i]
                levels.push(GJLevel);
            }

            // Display the results
            const resultsArray = document.getElementById("results");
            resultsArray.innerHTML = "<legend>Results</legend>";
            for (let idx = 0; idx < levels.length; idx++) {
                const itm = levels[idx];
                const rating = calculateDifficulty(itm);
                resultsArray.innerHTML += `<div>
                <span class="level-id">${itm[1]}</span>
                <h1 class="level-name">${itm[2]}</h1>
                <h2 class="level-creator">by ${itm.creatorInfo.split(":")[1]}</h2>
                <h3 class="song-info">${itm.songInfo}</h3>
                <div class="difficulty-icon feature-${rating.feature}" style="background-image: url('./img/diffIcon_${String(rating.rating).padStart(2,"0")}_btn_001.png');"></div>
                <span>${rating.stars}<img class="star" src="./img/${itm[15] <= 4 ? "star" : "moon"}.png"/></span>
            </div>
<hr>`
            }
            console.log(levels)
        }

        document.addEventListener("DOMContentLoaded", () => {
            const form = document.getElementById("GJSearchForm");
            form.addEventListener("submit", async (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                let str = "";
                formData.forEach((value, key) => {
                    str += (key + "=" + value + "&");
                });
                const GJBaseSearchResult = await makeRequest(str);
                displaySearch(GJBaseSearchResult);
            })
        });

        document.addEventListener('DOMContentLoaded', function() {
            const toggleCheckbox = document.getElementById('demonDiff');
            const toggleField = document.getElementById('diff');
            const inputFields = document.querySelectorAll('input[name="demonFilter"]');

            toggleField.addEventListener('change', function() {
                const isChecked = toggleCheckbox.checked;
                inputFields.forEach(input => {
                    input.disabled = !isChecked;
                });
            });
        });

        document.addEventListener('DOMContentLoaded', function() {
            const inputFields= document.querySelectorAll('input.clear[type="button"]');
            inputFields.forEach(function(button) {
                button.addEventListener('click', function() {
                    const parentElement = button.parentElement;
                    const inputItems = parentElement.querySelectorAll('input');

                    inputItems.forEach(function(input) {
                        input.selected = false;
                        if (input.type === 'text' || input.type === 'textarea') {
                            input.value = '';
                        } else if (input.type === 'checkbox' || input.type === 'radio') {
                            input.checked = false;
                        }
                    });
                });
            });
        });
        // Fetch OpenCube client data
        const clientData = await fetch(`http://${openCubeInstance}/dashboard/clientData.json`)
        .then((response) => response.json())
        .then((data) => {return data});
        // Fetch OpenCube Playlist
        const playlist = await fetch(`http://${openCubeInstance}/js/playlist.json`)
        .then((response) => response.json())
        .then((data) => {return data});

        const currentSong = playlist[clientData.song];
        // Get Average Color of Album Art
        const color = 0x96BF10
        // Convert Album Art to a Data URL for use in the embed
        const thumb = new AttachmentBuilder(`http://${openCubeInstance}/images/albums/${(currentSong.album)}.jpg`)
        .setName("albumArt.jpg");
        // Construct timestamps and slider
        const slide = await slider(clientData.songProgress, 0, clientData.songLength);
        const [time, timeLeft] = await timestamps(clientData.songProgress, clientData.songLength);

        // build the embed
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle("Now Playing")
            .setThumbnail(`attachment://albumArt.jpg`)
            //.setAuthor({ name: 'Now Playing' })
            .setDescription(`**${currentSong.name}**\n${currentSong.artist}\n${currentSong.album}`)
            .addFields({ name: '', value: (`**${time}** ​ ${slide} ​ ${timeLeft}`), inline: true })
            //.setTimestamp()

        interaction.reply({ embeds: [embed], files: [thumb] });
    },
}