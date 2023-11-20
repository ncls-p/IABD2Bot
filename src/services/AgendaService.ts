import { EmbedBuilder } from "discord.js";

import config from "../config";
import { GesAPI } from "../GesApi";
import { AgendaItem } from "../interfaces/agenda";

export class AgendaService {
  private async authenticate(): Promise<GesAPI> {
    const username = config.username;
    const password = config.password;

    try {
      const api = await GesAPI.login(username, password);
      return api;
    } catch (error) {
      console.error(error);
      throw new Error("Erreur lors de l'authentification");
    }
  }

  private async fetchAgendaData(api: GesAPI): Promise<AgendaItem[]> {
    const start = new Date(2023, 10, 11);
    const end = new Date(2023, 12, 11);

    try {
      const agendaData = await api.getAgenda(start, end);
      return agendaData;
    } catch (error) {
      console.error(error);
      throw new Error("Erreur lors de la récupération des données de l'agenda");
    }
  }

  private formatAgenda(data: AgendaItem[]): EmbedBuilder[] {
    let embeds: EmbedBuilder[] = [];
    let embed = new EmbedBuilder().setTitle("Agenda").setColor("Blue");
    let fieldCount = 0;

    data.forEach((event: AgendaItem, index) => {
      let embeds: EmbedBuilder[] = [];

      if (fieldCount === 25) {
        embeds.push(embed);
        embed = new EmbedBuilder()
          .setTitle(`Agenda (suite ${embeds.length})`)
          .setColor("Blue");
        fieldCount = 0;
      }

      const startDate = new Date(event.start_date);
      const endDate = new Date(event.end_date);
      const dateStr = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
      const timeStr = `${startDate.toLocaleTimeString()} - ${endDate.toLocaleTimeString()}`;
      const roomNames = event.rooms
        ? event.rooms.map((room) => room.name).join(", ")
        : "Salle non disponible";
      const disciplineName = event.discipline.name;

      embed.addFields({
        name: `${event.name} (${disciplineName})`,
        value: `Date: ${dateStr}\nHeure: ${timeStr}\nSalle: ${roomNames}\nEnseignant: ${event.teacher}`,
        inline: false,
      });

      fieldCount++;
    });
    if (fieldCount > 0) {
      embeds.push(embed);
    }

    return embeds;
  }

  public async getAgenda(): Promise<EmbedBuilder[]> {
    const api = await this.authenticate();
    const agendaData = await this.fetchAgendaData(api);
    return this.formatAgenda(agendaData);
  }
}
