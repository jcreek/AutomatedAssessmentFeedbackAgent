# AI-Powered Automated Assessment and Feedback Agent

> An intelligent, agentic AI system designed to significantly reduce teachers' workloads by providing instant assessment and personalized differentiated feedback and follow-on activities for student assignments.


## ⚡ Workflow At a Glance
- Upload an assignment and student response (file or text)
- Instantly receive detailed, actionable feedback and differentiated individualized follow-on tasks and a grade
- Review, delete, or clear past assessments in the history
- All actions are accessible, error-proof, and demo resilient

## 🏆 Hackathon Info

This project was developed for the [Microsoft Hack Together: AI Agents Hackathon](https://microsoft.github.io/AI_Agents_Hackathon/) (April 8–30, 2025).

- See the [Official Rules](https://microsoft.github.io/AI_Agents_Hackathon/rules/)
- Status: Hackathon prototype/MVP


## 🎯 What It Does (Key Features)
- **Automated Grading:** Instantly grades student submissions (text or file) for any assignment/task.
- **Personalized Feedback:** Actionable, contextual feedback including grade, strengths, areas for improvement, individualized activity, and teacher suggestion.
- **Assessment History:** All assessments are saved locally (browser localStorage) for later review and demo resilience.
- **History Management:** Delete individual assessments or clear all history, with confirmation dialogs for safety.
- **Navigation:** Seamless navigation between upload and results/history pages.
- **Robust Error Handling:** Friendly, actionable error messages for upload, AI, or network issues.
- **Loading Spinner:** Visual feedback while grading is in progress.
- **Accessibility:** Screen reader-friendly, keyboard-accessible, and color-contrast aware.

## ⚙️ How It Works

1. **Teacher uploads a student submission** (file or text) and assignment description.
2. **AI (Azure OpenAI)** generates instant, individualized feedback and a grade.
3. **Results and assessment history** are displayed for review, deletion, or clearing.
4. **All data is stored locally** (no backend required for history/demo).

## 🚀 Technical Stack

- **TypeScript:** Ensures reliability, maintainability, and scalability.
- **Azure OpenAI:** Provides advanced NLP capabilities for nuanced and accurate assessment.
- **Azure Cognitive Services:** Enhances semantic analysis for precise feedback generation.


## 📖 Educational Impact

- Reduces hours spent grading and marking.
- Improves quality and consistency of student feedback.
- Allows teachers more time to focus on direct student interaction and lesson planning.


## 🔮 Future Enhancements

- Integration with major Learning Management Systems (LMS) for streamlined workflow.
- Expansion of supported assignment types and subjects.
- Development of analytics dashboards for deeper insights into class performance.


## 📽️ Demonstration Video

[Coming soon: View a full demonstration of the agent in action.]


## 👥 Team
- **Josh Creek**  
  [jcreek.co.uk](https://jcreek.co.uk)


## 🛠️ Getting Started

This project uses [SvelteKit](https://kit.svelte.dev/) and [TypeScript](https://www.typescriptlang.org/) with [pnpm](https://pnpm.io/) as the package manager.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [pnpm](https://pnpm.io/installation)

### Installation & Running Locally

#### Developing

Once you've installed dependencies with `pnpm install`, start a development server:

```bash
pnpm run dev

# or start the server and open the app in a new browser tab
pnpm run dev -- --open
```

#### Building

To create a production version:

```bash
pnpm run build
```

You can preview the production build with `npm run preview`.


## 🕹️ Real-Time Events: PartyKit Setup

This project uses [PartyKit](https://partykit.io/) for real-time tool usage event streaming between the frontend and backend.

### Running PartyKit Locally

1. **Install dependencies** for PartyKit:
   ```sh
   cd partykit
   npm install
   ```
2. **Set up your `.env` file** (in the project root):
   ```env
   VITE_PARTYKIT_BASE_URL=ws://127.0.0.1:1999
   PARTYKIT_BASE_URL=ws://127.0.0.1:1999
   ```
   These variables are required for both the SvelteKit frontend and backend to connect to your local PartyKit server.
3. **Start the PartyKit dev server**:
   ```sh
   cd partykit
   npm run dev
   ```
   The server will be available at `ws://127.0.0.1:1999/party/<room>`.
4. **Start the SvelteKit frontend** (in a separate terminal):
   ```sh
   pnpm run dev
   ```

### Deploying PartyKit to Production

1. **Update your `.env` for production**:
   ```env
   VITE_PARTYKIT_BASE_URL=wss://<your-connection-string>.partykit.dev
   PARTYKIT_BASE_URL=wss://<your-connection-string>.partykit.dev
   ```
2. **Deploy PartyKit**:
   ```sh
   cd partykit
   npm run deploy
   ```
   Wait for the domain provisioning to complete.
3. **Update your frontend/backend to use the production WebSocket URL** (as above).

### Troubleshooting
- If you see `Invalid URL` errors, make sure your environment variables are set and that you have restarted your dev servers after editing `.env`.
- Always run the PartyKit dev server from the `partykit` directory.

See also `.env.example` for sample configuration.

## 🧪 Running BDD Tests (Cucumber + Playwright)

This project includes end-to-end BDD (Behavior-Driven Development) tests using [Cucumber.js](https://github.com/cucumber/cucumber-js) and [Playwright](https://playwright.dev/).

### Prerequisites
- All application dependencies installed (see above)
- [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/)

### Install Playwright Browsers
If you haven't already, install Playwright's required browsers:

```bash
pnpm exec playwright install
```

### Running the Tests
1. Start the SvelteKit dev server:
   ```bash
   pnpm run dev
   ```
   (Or use `pnpm run bdd:full` to auto-start the server and run tests.)

2. In a separate terminal, run the BDD tests:
   ```bash
   pnpm run test:bdd
   ```
   This will execute all feature files in `tests/bdd/features/` using step definitions in `tests/bdd/steps/`.

### Test Output & Screenshots
- Test results will be shown in the terminal.
- On failure, a screenshot will be saved to the `screenshots/` directory in the project root (see `tests/bdd/support/hooks.ts`).
- Screenshot filenames are based on the scenario name.

### Customizing/Debugging
- You can run a specific feature file:
  ```bash
  pnpm run test:bdd -- tests/bdd/features/assessment_submission.feature
  ```
- For more verbose output, add `--format progress` or `--format summary`.

### Project Scripts
- `pnpm run test:bdd` – Run all BDD tests
- `pnpm run bdd:full` – Start dev server and run all BDD tests (requires [start-server-and-test](https://github.com/jsdom/start-server-and-test))

For more information, see the `package.json` scripts section.

## 📚 Resources
- [Hack Together: AI Agents Hackathon – Introduction & Getting Started](https://www.youtube.com/watch?v=RNphlRKvmJQ)
- [Hack Together: AI Agents Hackathon – Building Your Agent](https://www.youtube.com/watch?v=Aq30zfbWNSQ)


## 📌 License
Licensed under the Business Source License 1.1.  
See LICENSE file for details.

