import { Message } from "discord.js";

import { AgendaService } from "../services/AgendaService";

export const sendAgenda = async (message: Message, args: string[]) => {
  const agendaService = new AgendaService();
  try {
    const agendaEmbed = await agendaService.getAgenda();
    message.reply({
      embeds: agendaEmbed.map((embedBuilder) => embedBuilder.toJSON()),
    });
  } catch (error: any) {
    console.error(error);
    message.reply("Erreur: " + error.message);
  }
};

export const name = "planning";
