import { Message } from "discord.js";
import { ChannelTable } from "../../models/holdem";

export const command = ["stand", "leave"];

export const description = "Leave the current game.";

export async function handler ({ discord }) {
  const message = discord.message as Message;
  if (message.channel.type === "dm") {
    message.reply("This command can only be run from a channel on a server.");
    return;
  }

  const table = await ChannelTable.findByChannelId(message.channel.id);
  if (!table) {
    message.reply("There is no active Hold'em game in this channel.");
    return;
  }

  message.reply("Are you sure you want to leave the game? (y/n)")
  try {
    const collected = await message.channel.awaitMessages(
      response => {
        if (response.author.id !== message.author.id) return false;
        return ["yes", "y", "no", "n"].includes(response.content.toLowerCase());
      },
      { max: 1, time: 20000, errors: ["time"] }
    );
    if (!["yes", "y"].includes(collected.first()!.content.toLowerCase())) return;
    table.standUp(message.author.id);
    await Promise.all([table.saveToDb(), table.render()]);
  } catch (err) {
    message.reply("No confirmation received. You are still playing!");
  }
}