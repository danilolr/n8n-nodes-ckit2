# @chatbot-kit/n8n-nodes-ckit2

`@chatbot-kit/n8n-nodes-ckit2` is the new major line of Chatbot Kit community nodes for n8n.

This repository is being prepared as a clean base for the next version of the integration. The initial package structure is in place, but the production node implementation is still under development.

## Installation

Follow the [n8n community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

## Status

Current status:

- Package scaffold created
- Initial node placeholder registered
- Final resources, operations, credentials, and compatibility details still being defined

## Local Testing

Use two terminals during development.

Terminal 1:

```bash
npm run dev
```

This command:

- builds the node
- prepares a clean development package in `.n8n-dev-package`
- starts TypeScript watch mode

Terminal 2:

```bash
npm run dev:n8n
```

This command:

- prepares the clean development package again
- starts a dedicated local `n8n` runner using the same user folder at `.n8n-node-cli`

### Testing after changes

If you changed TypeScript files in the node:

1. keep `npm run dev` running
2. run `npm run dev:prepare`
3. restart `npm run dev:n8n`

You usually do not need to restart `npm run dev` unless you changed development scripts, package metadata, or the local development setup itself.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Build community nodes](https://docs.n8n.io/integrations/community-nodes/build-community-nodes/)
