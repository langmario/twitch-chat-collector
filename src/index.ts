import { Sender } from '@questdb/nodejs-client';
import { ChatClient, ChatMessage } from '@twurple/chat';
import pino from 'pino';

import { env } from './env.js';
import { getEmotes, getTags } from './messages.js';

const logger = pino({
  level: env.PINO_LOG_LEVEL,
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

const sender = await Sender.fromConfig(env.DATABASE_URL, {
  log: (level, message) => logger[level](message),
});
logger.info('db sender connected');

const channels = env.CHANNELS.split(',').map((s) => s.trim());
logger.info(channels, 'watching channels');

const chatClient = new ChatClient({
  logger: {
    custom: () => {},
  },
  channels: channels,
  readOnly: true,
});

async function handleMessage(channel: string, user: string, text: string, msg: ChatMessage) {
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
}

chatClient.onConnect(() => logger.info('twitch chat connected'));
chatClient.onMessage(handleMessage);

async function stop() {
  try {
    chatClient.quit();
    await sender.flush();
    await sender.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);

chatClient.connect();
