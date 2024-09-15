import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const matches = sqliteTable("matches", {
    time: integer('date', { mode: 'timestamp', }),
    score: text("score"),
    desc: text("desc"),
    playerone_id: integer("playerone_id").notNull().references(() => players.id),
    playertwo_id: integer("playertwo_id").notNull().references(() => players.id),
    id: integer("id").primaryKey({ autoIncrement: true }),
})

export const players = sqliteTable("players", {
    osu_id: integer("osu_id").notNull(),
    name: text("name").notNull(),
    discord_tag: text("tag").notNull(),
    id: integer("id").primaryKey(),
})
