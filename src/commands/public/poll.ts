import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { infoEmbed } from '../../utils/embeds'

export const data = new SlashCommandBuilder()
  .setName('poll')
  .setDescription('Create a poll')
  .addStringOption((opt) => opt.setName('question').setDescription('Poll question').setRequired(true))
  .addStringOption((opt) => opt.setName('option1').setDescription('Option 1').setRequired(true))
  .addStringOption((opt) => opt.setName('option2').setDescription('Option 2').setRequired(true))
  .addStringOption((opt) => opt.setName('option3').setDescription('Option 3').setRequired(false))
  .addStringOption((opt) => opt.setName('option4').setDescription('Option 4').setRequired(false))

export async function execute(interaction: ChatInputCommandInteraction) {
  const question = interaction.options.getString('question', true)
  const options = [
    interaction.options.getString('option1', true),
    interaction.options.getString('option2', true),
    interaction.options.getString('option3'),
    interaction.options.getString('option4'),
  ].filter(Boolean) as string[]

  const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣']
  const optionLines = options.map((o, i) => `${emojis[i]} ${o}`).join('\n')

  const msg = await interaction.reply({
    embeds: [infoEmbed(question, optionLines)],
    fetchReply: true,
  })

  for (let i = 0; i < options.length; i++) {
    await msg.react(emojis[i])
  }
}
