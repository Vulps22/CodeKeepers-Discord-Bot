require("dotenv").config();
const { REST, Routes } = require("discord.js");
const fs = require("node:fs");

// Function to deploy commands
async function deployGuildCommands() {


    const TOKEN = process.env.BOT_TOKEN; // Use the secret from db as token
    const CLIENT_ID = process.env.CLIENT_ID // Use client from db as client id
    const GUILD_ID = process.env.GUILD_ID // Assume guild_id is also stored in config

    const commands = [];
    const commandFiles = fs
        .readdirSync("commands/mod")
        .filter((file) => file.endsWith(".js"));

    // Load each command and prepare for deployment
    for (const file of commandFiles) {
        const command = require(`./commands/mod/${file}`);
        if (!command.data) continue;
        commands.push(command.data.toJSON());
    }

    const rest = new REST({ version: "10" }).setToken(TOKEN);

    // Deploy the commands to the specified guild
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);
        const data = await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands }
        );
        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error("Failed to deploy commands:", error);
    }
}

deployGuildCommands().catch(console.error);
