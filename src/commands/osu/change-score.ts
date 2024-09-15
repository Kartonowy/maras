import { ApplicationCommandOptionType, CacheType, ChatInputCommandInteraction } from "discord.js";
import Command, {Option} from "../command.js"
import { db } from "../../utils/db.js";
import { matches } from "../../utils/schema.js";
import { eq, sql } from "drizzle-orm";

export default new Command("change-score", "Changes the score of a match", ApplicationCommandOptionType.Subcommand, [
    new Option("match_id", "ID of the match to add the score to.", true, ApplicationCommandOptionType.Integer),
    new Option("score", "Score of the match.", true, ApplicationCommandOptionType.String),
], async (interaction: ChatInputCommandInteraction<CacheType>) => {
    try{
        const match_id: number = Number(interaction.options.data.find((e) => e.name === "match_id")!?.value);
        const score: string = interaction.options.data.find((e) => e.name === "score")!?.value!.toString();
        const score_regex = /^\d{1,2}:\d{1,2}$/;
        console.log(score);

        if (score.match(score_regex)) {
            await db.update(matches)
                .set({ score: score })
                .where(eq(matches.id, match_id));
            interaction.reply("Score added to database!")
        } else {
            interaction.reply("Invalid score format, please use '0:0'");
        }
    
    }catch(e){
        console.log(e)
    }
});
