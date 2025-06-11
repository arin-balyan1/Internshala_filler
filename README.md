# Internshala Application Filler with AI Assistance

An intelligent Node.js automation agent that streamlines the process of applying for internships on Internshala. This project leverages Puppeteer to mimic human interactions, integrates a Generative AI model (Google Gemini) to dynamically answer application questions, and manages resume uploads, significantly reducing manual effort.

## Here is the youtube video link for demostration of my project
[![Internshala Application filler with AI Assistance](https://img.youtube.com/vi/8zhxo5tolf8)](https://www.youtube.com/watch?v=8zhxo5tolf8)

✨ Features
1. Automated Login: Logs into Internshala using provided credentials.

2. Internship Discovery: Navigates to the matching preferences and extracts internship listings.

3. AI-Powered Application Filling:

4. Generates personalized cover letters.

5. Provides compelling answers to "Why should we hire you?" questions.

6. Generates answers for general experience or project-related questions, dynamically pulling context from your resume and the job details.

7. Reduces manual effort by over 80% in filling out applications.

8. Resume Upload: Automatically uploads your PDF resume to the application form.

9. Form Submission: Identifies and clicks the submit button to complete the application.

10. Radio Button Handling: Automatically selects "Yes" or "True" for relevant radio button questions.

10. Stealth Mode: Uses puppeteer-extra-plugin-stealth to evade basic bot detection.

11. MongoDB Integration: Stores user details and tracks submitted applications.

🚀 Technologies Used
1. Node.js: JavaScript runtime environment.

2. Puppeteer: Headless Chrome Node.js API for web automation.

3. Puppeteer-Extra & StealthPlugin: Enhances Puppeteer to avoid bot detection.

4. Google Generative AI (Gemini 1.5 Flash): For generating dynamic, context-aware text responses.

5. pdfreader: Node.js library for extracting text content from PDF resumes.

6. Mongoose: MongoDB object modeling tool for Node.js.

7.MongoDB Atlas: Cloud-hosted database for user and submission data.

8. dotenv: For loading environment variables from a .env file.

9. fs & path: Node.js built-in modules for file system operations.

📂 Project Structure
1. index.js: The main script that orchestrates Puppeteer automation, calls AI for content, and interacts with the database.

2. ai.js: Contains the logic for interacting with the Google Gemini API, including PDF text extraction and prompt engineering for generating cover letters, "Why Hire Me" answers, and generic responses. It exports the generate function.

3. data_base.js: Defines Mongoose schemas and models for MongoDB interaction (User, Submitted Forms, Internshala User).

4. .env: Environment variables for API keys and database URIs.

5. update_cv.pdf: Your resume PDF file (path should be correct).

⚠️ Important Considerations & Disclaimer

Website Changes: Web scraping/automation scripts are fragile. If Internshala's website structure (HTML selectors, IDs, classes) changes, parts of this script may break and require updates.

Rate Limiting & Bot Detection: While puppeteer-extra-plugin-stealth helps, aggressive automation can still be detected and blocked. The delays (setTimeout) are crucial for mimicking human behavior.

AI Output Quality: The quality of AI-generated responses depends heavily on the prompts and the clarity/detail of your resume. Always review the output if possible.

🤝 Contributing
Contributions are welcome! If you find bugs or have ideas for improvements, feel free to open an issue or submit a pull request.


