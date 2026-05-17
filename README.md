# Ada: The AI-Powered Programming Tutor 🚀

[![Google Cloud Rapid Agent Hackathon](https://img.shields.io/badge/Hackathon-Google_Cloud_Rapid_Agent-blue.svg)](https://rapid-agent.devpost.com/)
[![Organization](https://img.shields.io/badge/Organization-TopScore_AI-orange.svg)]()
[![Frontend](https://img.shields.io/badge/Frontend-Next.js-black.svg)]()
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688.svg)]()

**Ada** is an immersive, multimodal online platform that teaches programming using autonomous AI agents. Built by **TopScore AI** for the Google Cloud Rapid Agent Hackathon, Ada replaces static tutorials with a dynamic, voice-to-voice AI tutor that sees your code, understands the curriculum, and guides you using the Socratic method.

---

## ✨ Key Features

*   **Multimodal Live AI Tutor:** Connects directly to the Gemini Multimodal Live API (`v1alpha`) via WebSockets. Ada talks to you in real-time, listens to your questions, and "sees" your code editor.
*   **Agentic RAG Engine:** Powered by Google Gemini 1.5 Pro and MongoDB Atlas Vector Search. Ada grounds her answers in verified course materials, ebooks, and technical documentation.
*   **Integrated Coding Playground:** Features a custom UI powered by the StackBlitz/CodeSandbox SDK. Write, run, and preview code directly in the browser while Ada provides real-time, contextual guidance.
*   **Decentralized Multi-Agent Backend:** Utilizes the Google Agent Development Kit (ADK) to route tasks seamlessly between specialized sub-agents (RAG retrieval, syntax linting, and web grounding).

---

## 🏗️ Architecture & Tech Stack

Our engineering philosophy prioritizes performance and clarity: **the simpler the better**. We avoid bloated third-party wrappers, opting to build core systems—especially our identity and authentication frameworks—from the ground up.

### Frontend (Client-Side)
*   **Framework:** Next.js (React)
*   **Live AI Integration:** Native WebSockets connected directly to Gemini Live API.
*   **Audio/Visuals:** Web Audio API for avatar viseme synchronization.
*   **IDE:** StackBlitz / CodeSandbox SDK for the browser-based editor.

### Backend (Orchestration & DevOps)
*   **API:** Python with FastAPI.
*   **Agent Framework:** Google Agent Development Kit (ADK).
*   **Database:** MongoDB Atlas (General storage & Vector Search).
*   **Authentication:** Custom-built OpenID Connect (OIDC) implementation utilizing GitLab Auth. 
*   **CI/CD:** GitLab CI/CD pipelines for automated testing and deployment to Google Cloud.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   Python (3.10+)
*   GitLab Account (for OAuth configuration)
*   MongoDB Atlas Cluster
*   Google Cloud Project with Gemini API and Vertex AI Agent Engine enabled.

### 1. Clone the Repository
```bash
git clone [https://gitlab.com/topscore-ai/ada-tutor-platform.git](https://gitlab.com/topscore-ai/ada-tutor-platform.git)
cd ada-tutor-platform