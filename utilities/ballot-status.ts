import axios from "axios";
import { MessageEmbed, TextChannel } from "discord.js";
import discordClient from "../discord-client";

const channelId = "772952921980796961";

export default async function () {

  const channel = (discordClient.channels.cache.get(channelId) || await discordClient.channels.fetch(channelId)) as TextChannel;

  const [chevUpdated, chevStatus] = await checkUtahStatus({
    "firstName": "Alex",
    "lastName": "Ford",
    "dob": "03-02-1987",
    "street": "1130 Topaz Rd",
    "city": "Saratoga Springs",
    "zip": "84045"
  });
  const [nikkiUpdated, nikkiStatus] = await checkUtahStatus({
    "firstName": "Alex",
    "lastName": "Ford",
    "dob": "03-02-1987",
    "street": "1130 Topaz Rd",
    "city": "Saratoga Springs",
    "zip": "84045"
  });

  const utahStatusEmbed = new MessageEmbed();
  utahStatusEmbed
    .setTitle("Utah Ballot Statuses")
    .setThumbnail("https://i.imgur.com/qcZbOpk.png")
    .setColor("#012D6A")
    .setTimestamp()
    .setDescription(`
      **Chev:** \`${chevStatus}\`
      **Nikki:** \`${nikkiStatus}\`
    `)
  channel.send(utahStatusEmbed);
  if (chevUpdated) {
    channel.send(`<@251192242834767873> your ballot status has been updated!`)
  }
  if (nikkiUpdated) {
    channel.send(`<@296828223927615488> your ballot status has been updated!`)
  }

  const [mowUpdated, mowStatus] = await checkCaliforniaStatus("325b0bvmssm10v2vobqnpe3s2i");

  const californiaStatusEmbed = new MessageEmbed();
  californiaStatusEmbed
    .setTitle("California Ballot Statuses")
    .setThumbnail("https://i.imgur.com/fdeM26A.png")
    .setColor("#D3AD68")
    .setTimestamp()
    .setDescription(`
      **masterofwind:** \`${mowStatus}\`
    `)
  channel.send(californiaStatusEmbed);
  if (mowUpdated) {
    channel.send(`<@370672964879908865> your ballot status has been updated!`)
  }
}

let AWSALB = "Y+GLxkkFrykUOZhe+/OK7Iy0C1suq0rMdOl+Z51Ubof7b7Um1I3Oqd5oxu1xaZ8t1niJRi+QxIhm9iry7MFRtv8uDjFfOctGZrrJOd+YX0i4SqjcOQI3WSUXN/Qa";
let AWSALBCORS = "Y+GLxkkFrykUOZhe+/OK7Iy0C1suq0rMdOl+Z51Ubof7b7Um1I3Oqd5oxu1xaZ8t1niJRi+QxIhm9iry7MFRtv8uDjFfOctGZrrJOd+YX0i4SqjcOQI3WSUXN/Qa";
async function checkCaliforniaStatus(sessionId) {
  const { data, headers: { "set-cookie": setCookies } } = await axios.get("https://california.ballottrax.net/api/voter/ballot-status-progress/me?language=english", {
    headers: {
      Cookie: `PHPSESSID=${sessionId}; AWSALB=${AWSALB}; AWSALBCORS=${AWSALBCORS}` 
    }
  });
  const cookies = setCookies.join("");
  AWSALB = cookies.match(/AWSALB=([^;]*);/)[1];
  AWSALBCORS = cookies.match(/AWSALBCORS=([^;]*);/)[1];
  const status = data.ballots[0].status_summary.current_status.display_description;
  const currentStatus = "Your ballot has been mailed! Your ballot is at the Post Office and is making its way to you. Look for your ballot in your mailbox soon!";
  if (status === currentStatus) {
    return [false, "Ballot not yet received."];
  }
  return [true, status];
}

async function checkUtahStatus(payload) {
  const { headers: { "set-cookie": cookies } } = await axios.post("https://votesearch.utah.gov/voter-search/public-api/my-voter-profile", payload);
  const JSESSIONID = cookies.join("").match(/JSESSIONID=([^;]*);/)[1];
  const { data: { status } } = await axios.get("https://votesearch.utah.gov/voter-search/api/ballotStatus.json/1319655", {
    headers: {
      Cookie: `JSESSIONID=${JSESSIONID};`
    }
  });
  const currentStatus = "Your county clerk mailed your ballot to you.";
  if (status === currentStatus) {
    return [false, "Ballot not yet received."];
  }
  return [true, status];
}