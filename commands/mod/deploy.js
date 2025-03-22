const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { exec } = require("child_process");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deploy')
        .setDescription('Update the command list on Discord'),

    /**
     * 
     * @param {import("discord.js").Interaction} interaction 
     */
    async execute(interaction) {

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        exec('node deploy-commands-global.js && node deploy-commands-mod.js', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing deployCommands.js: ${error.message}`);
                return interaction.editReply('Failed to deploy commands.');
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return interaction.editReply('Failed to deploy commands.');
            }
            console.log(`stdout: ${stdout}`);
            interaction.editReply('Commands deployed successfully.');
        });

    },
};
