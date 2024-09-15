import { APIEmbedField, ApplicationCommandOptionType, CacheType, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import Command from "../command.js"
import { db } from "../../utils/db.js";
import { players } from "../../utils/schema.js";
import { eq, sql } from "drizzle-orm";
import player from "./player.js";


export default new Command("list-players", "Lists players", ApplicationCommandOptionType.Subcommand, [], async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const match_query = await db.all(sql`select 
        * from players;
        `)
    const fields: APIEmbedField[] =
        match_query.map((e: any) => {
            let date = new Date(e.date * 1000);
            // uncomment if offset necessary
            // const offset = date.getTimezoneOffset()
            // date = new Date(date.getTime() - (offset * 60 * 1000))
            return {
                name: `${e.id}, ${e.name}`,
                value: `osu_ID: ${e.osu_id}, Discord: ${e.tag}`
            }
        });
    const embed = new EmbedBuilder()
        .setColor(0x2137FF)
        .setTitle("Players")
        .addFields(fields)

    interaction.reply({ embeds: [embed], ephemeral: true });
});