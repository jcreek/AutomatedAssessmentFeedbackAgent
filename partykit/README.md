## 🎈 PartyKit Tool Usage Broadcaster

Welcome to the PartyKit Tool Usage Broadcaster

This PartyKit project provides a websocket server for broadcasting tool usage events in real time to your SvelteKit frontend.

## How it works
- The server receives websocket messages (tool usage events) from your backend (e.g., ai.ts)
- It broadcasts each message to all connected clients (e.g., your Svelte frontend)

## Usage
- Your websocket URL will be:
  ```
  wss://<your-partykit-project>.partykit.dev/party/tool-usage-server
  ```
  Replace `<your-partykit-project>` with your deployment name.

- Connect to this URL from both your backend (to send events) and frontend (to receive/display events).

## Developing locally

To start a local development server:

```bash
npm run dev
```

## Deploying

To deploy your PartyKit project:

```bash
npm run deploy
```

This will deploy your project to PartyKit Cloud. You will get a URL you can use to connect to your server.

Refer to our docs for more information: https://github.com/partykit/partykit/blob/main/README.md. For more help, reach out to us on [Discord](https://discord.gg/g5uqHQJc3z), [GitHub](https://github.com/partykit/partykit), or [Twitter](https://twitter.com/partykit_io).
