import { Sender } from '@questdb/nodejs-client';
import { ChatClient } from '@twurple/chat';

import { getEmotes, getTags } from './messages.js';

const conf = 'http::addr=localhost:9000;username=admin;password=quest;';
const sender = await Sender.fromConfig(conf);

const chatClient = new ChatClient({
  channels: [
    'baso',
    'katazuri',
    'haselnuuuss',
    'primalavera',
    'lillythechilly',
    'bonjwa',
    'mahluna',
    'dieservincentg',
    'ronnyberger',
    'knirpz',
    'pietsmiet',
    'dhalucard',
    'sterzig',
  ],
  readOnly: true,
});

chatClient.onConnect(() => console.log('Client connected'));
chatClient.onMessage(async (channel, user, text, msg) => {
  const timestamp = msg.date.getTime();
  const usedEmotes = getEmotes(text, msg.emoteOffsets);
  const tags = getTags(msg.tags);

  await sender
    .table('messages')
    .symbol('channel', channel)
    .booleanColumn('is_mod', tags.isMod)
    .booleanColumn('is_sub', tags.isSub)
    .booleanColumn('is_first', tags.isFirst)
    .booleanColumn('is_turbo', tags.isTurbo)
    .stringColumn('user_name', user)
    .stringColumn('msg', text)
    .at(timestamp, 'ms');

  for (const emote of usedEmotes) {
    await sender
      .table('emotes')
      .symbol('channel', channel)
      .symbol('emote_name', emote.keyword)
      .stringColumn('emote_id', emote.id)
      .stringColumn('user_name', user)
      .intColumn('count', emote.count)
      .at(timestamp, 'ms');
  }
  await sender.flush();
});

chatClient.connect();
