# Homestock

Homestock is a pantry and grocery management app built to solve real household frustrations, knowing what you have, what you're running low on, and what to buy next.

## Features

- **Pantry search** — quickly find items you already have on hand
- **Low-stock alerts** — get notified when something is running out
- **Grocery lists** — drag-and-drop lists, sortable by store
- **AI recipe suggestions** — Ollama-powered recipe recommendations based on your pantry contents
- **Family sharing** — share pantry and grocery data with household members

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Frontend:** Vanilla JavaScript (no framework)
- **Deployment:** Render
- **AI:** Ollama (local LLM) for recipe suggestions

## Known Issues

- The AI recipe feature depends on a locally running Ollama instance and likely does not function in the deployed Render environment, since Render doesn't have access to a local Ollama server.

## Roadmap

- Build a Retrieval-Augmented Generation (RAG) feature to improve recipe suggestions using pantry and recipe data, as a hands-on AI engineering project.

## Getting Started

```bash
git clone <repo-url>
cd homestock
npm install
```

Create a `.env` file with your MongoDB connection string and any other required environment variables.

```bash
npm start
```

The app will be available at `http://localhost:<port>`.

## Contributing

This is an independent project built and maintained by Aisha. Issues and suggestions are welcome.
