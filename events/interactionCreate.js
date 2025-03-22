const { Events, Interaction } = require("discord.js");

let logInteraction = '';

module.exports = {
  name: Events.InteractionCreate,
  /**
   * 
   * @param {Interaction} interaction 
   * @returns 
   */
  async execute(interaction) {

    if (interaction.isAutocomplete()) {
      await handleAutoComplete(interaction);
      return;
    }

    if (interaction.isChatInputCommand()) {
      if (!hasPermission(interaction)) return;
      await runCommand(interaction);
    }
  }
};

async function handleAutoComplete(interaction) {
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    if (command.autocomplete) {
      await command.autocomplete(interaction);
    }
  } catch (error) {
    console.error(`Error executing autocomplete for ${interaction.commandName}`);
    console.error(error);
  }
}
/**
 * 
 * @param {Interaction} interaction 
 * @returns 
 */
async function runCommand(interaction) {
  if (isMaintenance()) {
    interaction.reply("The bot is currently in maintenance mode. Please try again later.");
    return;
  }

  try {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    if (shouldExecute(interaction, command)){
      await command.execute(interaction);
    }
  } catch (error) {
    console.error(`Error executing ${interaction.commandName}`);
    console.error(error);
    if (!interaction.deferred) interaction.reply("Something went wrong! Please notify an admin :thinking:");
    else interaction.editReply("Something went wrong! Please notify an admin :thinking:");
  }
}

/**
 * 
 * @param {Interaction} interaction 
 * @param {*} command 
 * @returns bool - True if the command should be executed
 */
function shouldExecute(interaction, command) {
  // Check for Administrator role for commands that require it
  if (command.administrator && !interaction.member.permissions.has("Administrator")) {
    interaction.reply("You need the Administrator role to use this command.");
    return false;
  }

  return true; // If none of the conditions fail, allow the command to execute
}

function isMaintenance() {
  const maintenance_mode = global.maintenance_mode;
  return maintenance_mode;
}

/**
 * @param {Interaction} interaction 
 * @returns 
 */
function hasPermission(interaction) {
  //TODO: Implement this later if it's required (it probably is)
  return true;
  const botPermissions = interaction.guild.members.me.permissionsIn(interaction.channel);

  if (!botPermissions.has('ViewChannel')) {
    interaction.reply('I do not have permission to view this channel. I require permission to `view channel` to function correctly');
    return false;
  }

  if (!botPermissions.has('SendMessages')) {
    interaction.reply('I do not have permission to send messages in this channel. I require permission to `send messages` and `embed links` to function correctly');
    return false;
  }

  if (!botPermissions.has('EmbedLinks')) {
    interaction.reply('I do not have permission to embed links in this channel. I require permission to `send messages` and `embed links` to function correctly');
    return false;
  }

  return true;
}
