const { Events } = require("discord.js");

module.exports = {
    name: Events.ClientReady,
    once: true,
    /**
     * 
     * @param {import("discord.js").Client} client 
     */
    async execute(client) {
        console.log(`Logged in as ${client.user.tag}`);
    }
};