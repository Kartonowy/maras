import { ApplicationCommandOptionType, CacheType, ChatInputCommandInteraction } from "discord.js";
import Command, { Option } from "../command.js"
import parseDate from "../../utils/date.js";
import { db } from "../../utils/db.js";

export default new Command("add", "Adds match", ApplicationCommandOptionType.Subcommand, [
  new Option("player_one_id", "Osu ID of player one", true, ApplicationCommandOptionType.String),
  new Option("player_two_id", "Osu ID of player two", true, ApplicationCommandOptionType.String),
  new Option("date", "Date of scheduled match in YYYY-MM-DD hh:mm format", true, ApplicationCommandOptionType.String),
], async (interaction: ChatInputCommandInteraction<CacheType>) => {

  const date: string = interaction.options.data.find((e) => e.name === "date")!?.value!.toString();
  // Matches YYYY-MM-DD hh:mm
  const date_regex = /^\d\d\d\d-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01]) (00|[0-9]|1[0-9]|2[0-3]):([0-9]|[0-5][0-9])$/;

  if (date.match(date_regex)) {

    const parsed: any = parseDate(date)
    if (isNaN(parsed)) {
      interaction.reply("Invalid Date")
    }


    interaction.reply("Match (notyet) added to database!")
  } else {
    interaction.reply("Invalid date format, please try again and use 'YYYY-MM-DD hh-mm'")
  }

});