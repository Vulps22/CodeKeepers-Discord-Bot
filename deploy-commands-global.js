require("dotenv").config();
const { REST, Routes } = require("discord.js");
const fs = require("node:fs");

// Async function to load configuration from the database and deploy commands
async function deployCommands() {

    console.log("Deploying global commands...");

    const TOKEN = process.env.BOT_TOKEN  // Use secret from db as token
    const CLIENT_ID = process.env.CLIENT_ID// Use client from db as client id

    const commands = [];
    const commandJson = [];
    const commandFiles = fs
        .readdirSync("commands/global")
        .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
        const command = require(`./commands/global/${file}`);
        if (!command.data) continue;
        
        commands.push(command.data.toJSON());

        commandJson.push({
            name: command.data.name,
            description: command.data.description,
            type: 1
        });
    }

    const rest = new REST({ version: "10" }).setToken(TOKEN);

    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);
        const data = await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands }
        );
        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error("Failed to deploy commands:", error);
    }
}

deployCommands().catch(console.error);
