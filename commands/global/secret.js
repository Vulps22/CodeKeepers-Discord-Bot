const { SlashCommandBuilder, SlashCommandStringOption, SlashCommandSubcommandBuilder, Interaction, MessageFlags } = require("discord.js");
const crypto = require('crypto');
const Database = require('../../database');

//This command will generate a secret for the user to use in their Github actions.
//It requires the user to have a Github account linked to their Discord account and a URL to the github repo must be passed to the command
module.exports = {
    data: new SlashCommandBuilder()
        .setName('secret')
        .setDescription('Manage secrets for your Github repositories')
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName('generate')
            .setDescription('Generate a secret for your Github repository')
            .addStringOption(new SlashCommandStringOption()
                .setName('url')
                .setDescription('The URL of the Github repository')
                .setRequired(true)))
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName('delete')
            .setDescription('Delete a secret for your Github repository')
            .addStringOption(new SlashCommandStringOption()
                .setName('url')
                .setDescription('The URL of the Github repository')
                .setRequired(true))),
    administrator: false,
    /**
     * Generate a secret for the user to use in their Github actions.
     * Ensure the user has a Github account linked to their Discord account and a URL to the github repo must be passed to the command
     * @param {Interaction} interaction 
     */
    async execute(interaction) {

        //Get the subcommand
        const subcommand = interaction.options.getSubcommand();

        //Get the URL of the Github repository
        const url = interaction.options.getString('url');

        //make sure the URL is a valid Github URL
        if (!url.startsWith('https://') || !url.includes('github.com')) {
            return interaction.reply('The URL provided is not a valid Github URL');
        }

        urlComponents = url.split('/');

        //remove trailing / from the URL
        if (urlComponents[urlComponents.length - 1] === '') {
            urlComponents.pop();
        }

        console.log(urlComponents.length);

        //check the github URL has a username and repo in the URL (not just the base URL)
        if (urlComponents.length < 5) {
            return interaction.reply('The URL provided is not a valid Github URL');
        }

        //Check if the URL is valid by making a request to the URL and checking the response status code
        const response = await fetch(url);
        if (response.status !== 200) {
            return interaction.reply('The URL provided is not a valid Github Repository');
        }

        //extract the user's Github username from the URL
        const username = url.split('/')[3];
        console.log(username);

        //Call the appropriate function based on the subcommand
        switch (subcommand) {
            case 'generate':
                generateSecret(interaction, url, username);
                break;
            case 'delete':
                deleteSecret(interaction, url, username);
                break;
        }

    }
}


/**
 * Generate a secret for the user to use in their Github actions.
 * @param {Interaction} interaction 
 * @param {string} url 
 * @returns 
 */
async function generateSecret(interaction, url, username) {
    
    const db = new Database();
    //check the secret does not already exist in the database
    const secrets = await db.executeQuery('SELECT * FROM secrets WHERE user_id = :id AND url = :url', { ":id": interaction.user.id, ":url": url });
    console.log(secrets);
    if (secrets.length > 0) {
        return interaction.reply('A secret already exists for this repository. Use `/secret delete` to delete the existing secret');
    }

    //Check if the user has a Github account linked to their Discord account
    const isLinked = interaction.member.roles.cache.some(role => role.id === '1352382227253690540');
    console.log(isLinked);

    if (!isLinked) {
        return interaction.reply('You must link your Github account to your Discord account to use this command');
    }

    if (!await verifyUser(interaction, username)) {
        return interaction.reply('There was an error verifying your Github account: Incorrect Username');
    }
    //Generate a secret for the user to use in their Github actions by hashing the user's Discord ID and the URL of the Github repository
    const secret = crypto.createHash('sha256').update(interaction.user.id + url).digest('hex');
    console.log(secret);

    //Store the secret in the database
    
    await db.executeQuery('INSERT INTO secrets (user_id, url, secret) VALUES (:id, :url, :secret)', { ":id": interaction.user.id, ":url": url, ":secret": secret });
    console.log('Secret stored');

    interaction.reply({ content: `Your Secret is: \`${secret}\`. If you lose it or it becomes compromised you will need to use \`/secret delete\` before creating a new one.`, flags: MessageFlags.Ephemeral });
}

async function deleteSecret(interaction, url, username) {

    if(!await verifyUser(interaction, username)){
        return interaction.reply('There was an error verifying your Github account: Incorrect Username');
    }

    //Delete the secret from the database
    const db = new Database();
    await db.executeQuery('DELETE FROM secrets WHERE user_id = :id AND url = :url', { ":id": interaction.user.id, ":url": url });

    interaction.reply({content: 'Secret deleted successfully', flags: MessageFlags.Ephemeral});

}

/**
 * Verify the owner of the repo is the same as the user or create the user in the database if they don't exist
 * @param {Interaction} interaction 
 * @param {string} username 
 * @returns 
 */
async function verifyUser(interaction, username) {
    const db = new Database();
    const users = await db.executeQuery('SELECT * FROM users WHERE id = :id', { ":id": interaction.user.id });
    console.log(users);
    if (users.length == 0) {
        console.log('User not found, creating');
        //create the user on the database
        await db.executeQuery('INSERT INTO users (id, github_username) VALUES (:id, :username)', { ":id": interaction.user.id, ":username": username });
        console.log('User created');
        return true;
    }

    const user = users[0];
    console.log(user);

    if (user.github_username !== username) {
        return false;
    }

    return true;
}