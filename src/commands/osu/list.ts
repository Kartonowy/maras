import { ActionRowBuilder, APIEmbedField, ApplicationCommandOptionType, StringSelectMenuOptionBuilder, CacheType, ChatInputCommandInteraction, EmbedBuilder, StringSelectMenuBuilder, ComponentType } from "discord.js";
import Command from "../command.js"
import { db } from "../../utils/db.js";
import { matches, players } from "../../utils/schema.js";
import { eq, sql } from "drizzle-orm";
import player from "./player.js";
import { stages } from "../../utils/stages.js";
//https://cdn.discordapp.com/attachments/897129324656885770/1278829277630169211/house-md-gregory-house.gif?ex=66d23a13&is=66d0e893&hm=b1e494838e7ccfdfda4458ef10f03f3fbf7fbfe7809a64c7fe6f0be8879e6888&
async function getResultQuery(stage: string) {
    const query = sql`
        select 
            p1.name as 'player_one_name', 
            p2.name as 'player_two_name', 
            m.date, 
            m.score, 
            m.desc,
            m.id
        from matches m 
        join players p1 on p1.id = m.playerone_id 
        join players p2 on p2.id = m.playertwo_id
        ${stage ? sql`where m.desc = ${stage}` : sql``};
    `;


    const match_query = db.all(query);

    console.log(match_query);
    const fields: APIEmbedField[] =
        match_query.map((e: any) => {
            let date = new Date(e.date * 1000);
            // uncomment if offset necessary
            // const offset = date.getTimezoneOffset()
            // date = new Date(date.getTime() - (offset * 60 * 1000))
            let name = `${date.getHours()}:${date.getMinutes()} `;

            if (date.getDate() < 10) name += `0${date.getDate()}`;
            else name += `${date.getDate()}`;

            name += ".";

            if (date.getMonth() < 10) name += `0${date.getMonth()}`;
            else name += `${date.getMonth()}`;


            name += `.${date.getFullYear()}`;
            let score = e.score;
            let value = `${name}, <t:${(Number(date) - 2678400000) / 1000}:R>\n`; // minus 1 month bc it is 1 month ahead
            if (score != "*score not added*") {
                score.split(':');
                if (score[0] > score[2]) {
                    value += `**${e.player_one_name}** vs ${e.player_two_name}\n**${score[0]}**:${score[2]}`;
                }
                else {
                    value += `${e.player_one_name} vs **${e.player_two_name}**\n${score[0]}:**${score[2]}**`;
                }
            }
            else {
                value += `${e.player_one_name} vs ${e.player_two_name}\n${e.score}`;
            }
            return {
                name: "Match ID: " + e.id + " - " + e.desc,
                value: value,
            }
        });

    return fields;
}
export default new Command("list", "Lists matches", ApplicationCommandOptionType.Subcommand, [], async (interaction: ChatInputCommandInteraction<CacheType>) => {
    let fields = await getResultQuery("");

    const select = new StringSelectMenuBuilder()
        .setCustomId(interaction.id)
        .setPlaceholder('Select stage')
        .addOptions(
            stages.map(e => new StringSelectMenuOptionBuilder().setLabel(e.name).setValue(e.name).setDescription(e.desc))
        );

    const buttons = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(select);

    let embed = embed_creator(fields);

    function embed_creator(fields: APIEmbedField[]) {
        return new EmbedBuilder()
            .setColor(0x2137FF)
            .setTitle("All Matches")
            .addFields(fields);
    }

    const response = await interaction.reply({
        embeds: [embed],
        components: [buttons],
    })

    try {
        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 30_000,
            filter: (i) => i.user.id === interaction.user.id && i.customId === interaction.id,
        });

        collector.on('collect', async (input) => {
            try {
                // stages.find()
                let value = input.values[0];
                if (value == 'Wszystkie') {
                    fields = await getResultQuery("");
                    embed = embed_creator(fields);
                    embed.setTitle("All Matches");
                    input.update({
                        embeds: [embed],
                        components: [buttons],
                    });
                } else {
                    fields = await getResultQuery(value);
                    embed = embed_creator(fields);
                    embed.setTitle(value + " Matches");
                    input.update({
                        embeds: [embed],
                        components: [buttons],
                    });
                }
            }
            catch (e) { console.log(e) }
        });

        setTimeout(() => {
            collector.stop();
            interaction.editReply({ embeds: [embed], components: [] });
        }, 30_000);
    }
    catch (e) {
        console.log(e);
        await interaction.editReply({ embeds: [embed], components: [] });
    }

});
