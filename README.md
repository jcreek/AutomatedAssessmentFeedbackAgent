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


## 📚 Resources
- [Hack Together: AI Agents Hackathon – Introduction & Getting Started](https://www.youtube.com/watch?v=RNphlRKvmJQ)
- [Hack Together: AI Agents Hackathon – Building Your Agent](https://www.youtube.com/watch?v=Aq30zfbWNSQ)


## 📌 License
Licensed under the Business Source License 1.1.  
See LICENSE file for details.

