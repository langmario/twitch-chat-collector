# Twitch Chat Collector

Collects Twitch chat messages from selected channels and stores them in QuestDB for later analysis.

## What it does

- Connects to Twitch chat using provided channels from the `CHANNELS` environment variable.
- Listens for chat messages in real time.
- Extracts message metadata and emotes.
- Writes chat messages into a QuestDB `messages` table.
- Writes emote usage into a QuestDB `emotes` table.

## Notes

- The collector uses `@twurple/chat` to read Twitch messages in read-only mode.
- Message emotes are parsed and stored separately so you can analyze emote usage per channel and user.
- QuestDB is used as the storage backend for fast time-series ingestion and querying.
