import { ColorResolvable, EmbedBuilder } from "discord.js";

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
    // the monday at 00:00 of the current week
    const startDateTime = new Date();
    startDateTime.setDate(startDateTime.getDate() - startDateTime.getDay() + 1);
    startDateTime.setHours(0, 0, 0, 0);
    // the saturnday at 23:59 in 3 weeks
    const endDateTime = new Date();
    endDateTime.setDate(endDateTime.getDate() - endDateTime.getDay() + 6);
    endDateTime.setHours(23, 59, 59, 999);
    endDateTime.setDate(endDateTime.getDate() + 21);

    try {
      const agendaData = await api.getAgenda(startDateTime, endDateTime);
      return agendaData;
    } catch (error) {
      console.error(error);
      throw new Error("Erreur lors de la récupération des données de l'agenda");
    }
  }

  private formatAgenda(data: AgendaItem[]): EmbedBuilder[] {
    data.sort((a, b) => {
      const startDateA = new Date(a.start_date);
      const startDateB = new Date(b.start_date);
      const startTimeA = new Date(a.start_date).getTime();
      const startTimeB = new Date(b.start_date).getTime();

      if (startDateA < startDateB) {
        return -1;
      } else if (startDateA > startDateB) {
        return 1;
      } else {
        return startTimeA - startTimeB;
      }
    });

    let embeds: EmbedBuilder[] = [];
    let currentEmbed: EmbedBuilder | null = null;
    let currentDate: Date | null = null;

    data.forEach((event: AgendaItem, index) => {
      const startDate = new Date(event.start_date);
      const endDate = new Date(event.end_date);
      const dateStr = `${startDate.toLocaleDateString("fr-FR")}`;
      const timeStr = `${startDate.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${endDate.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
      if (event.name.includes("Biais et équité en ia")) {
        event.name = "Cours Électifs";
        event.teacher = "Professeur inconnu";
      }
      if (event.name.includes("OPEN ESGI")) {
        event.teacher = "Professeur inconnu";
      }
      const roomNames = event.rooms
        ? event.rooms.map((room) => room.name).join(", ")
        : "Distanciel";

      if (!currentDate || !this.isSameDay(currentDate, startDate)) {
        if (currentEmbed) {
          embeds.push(currentEmbed);
        }

        const dayOfWeek = startDate.toLocaleDateString("fr-FR", {
          weekday: "long",
        });
        const color = this.getColorForDayOfWeek(dayOfWeek) as ColorResolvable;

        currentEmbed = new EmbedBuilder()
          .setTitle(`📆${dateStr} - ${dayOfWeek}`)
          .setColor(color);
        currentDate = startDate;
      }

      currentEmbed?.addFields({
        name: `${event.name}`,
        value: `🕦${timeStr}\n🔢${roomNames}\n🧑‍🏫${event.teacher}`,
        inline: true,
      });
    });

    if (currentEmbed) {
      embeds.push(currentEmbed);
    }

    return embeds;
  }
  private getColorForDayOfWeek(dayOfWeek: string): string {
    switch (dayOfWeek) {
      case "lundi":
        return "Blue";
      case "mardi":
        return "Red";
      case "mercredi":
        return "Green";
      case "jeudi":
        return "Yellow";
      case "vendredi":
        return "Purple";
      case "samedi":
        return "Orange";
      case "dimanche":
        return "Pink";
      default:
        return "Blue";
    }
  }

  private isSameDay(date1: Date, date2: Date) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  public async getAgenda(): Promise<EmbedBuilder[]> {
    const api = await this.authenticate();
    const agendaData = await this.fetchAgendaData(api);
    return this.formatAgenda(agendaData);
  }
}
