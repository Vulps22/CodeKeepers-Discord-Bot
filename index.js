require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');


console.log('Initialising Bot....');

process.on('uncaughtException', (err, origin) => {
    console.error(err);
    console.error(origin);
});

global.client = new Client({ intents: [GatewayIntentBits.Guilds] });
global.maintenance_mode = false;
global.client.commands = new Collection();


async function init() {
    // Load event files
    const eventsPath = path.join(__dirname, "events");
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    eventFiles.forEach(file => {

        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            global.client.on(event.name, (...args) => event.execute(...args));
        }
    });

    // Load commands
    loadCommands(client, "global");
    loadCommands(client, "mod");

    // Start the bot
    client.login(process.env.BOT_TOKEN);

    require('./api');

}

init().catch(error => {
    console.error('Failed to start the bot:', error);
});

function loadCommands(client, type) {
    const commandsPath = path.join(__dirname, `commands/${type}`);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    console.log(`Loading ${commandFiles.length} commands from ${commandsPath}...`, commandFiles);

    commandFiles.forEach(file => {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if (command.data && command.execute) {
            client.commands.set(command.data.name, command);
        } else {
            console.warn(`[WARNING] The command at ${filePath} is missing a required 'data' or 'execute' property`);
        }
    });
}



