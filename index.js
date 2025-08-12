#!/usr/bin/env node

import "dotenv/config";
import path from "path";
import fs from "fs-extra";
import { OpenAI } from "openai";
import { Command } from "commander";

/**
 * Localiser - AI-powered internationalization tool
 *
 * This tool automatically translates JSON locale files using OpenAI's GPT-4 model.
 * It supports batch translation across multiple languages and namespaces.
 */

class Localiser {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
    });
    this.options = {};
    this.config = {};
    this.stats = {
      languages: { total: 0, completed: 0, failed: 0 },
      namespaces: { total: 0, completed: 0, failed: 0 },
    };

    // Colors for consistent styling
    this.colors = {
      reset: "\x1b[0m",
      bright: "\x1b[1m",
      red: "\x1b[31m",
      green: "\x1b[32m",
      yellow: "\x1b[33m",
      blue: "\x1b[34m",
      magenta: "\x1b[35m",
      cyan: "\x1b[36m",
      gray: "\x1b[90m",
    };
  }

  /**
   * Initialize CLI options and parse arguments
   */
  initializeCLI() {
    const program = new Command();

    program
      .name("localiser")
      .description("AI-powered internationalization tool")
      .version("1.0.0")
      .option("-l, --language <language>", "Target language (e.g., fr, de)", "")
      .option(
        "-n, --namespace <namespace>",
        "Namespace for translation (e.g., home, common)",
        (value) => value.split(",").map((namespace) => namespace.trim())
      )
      .option(
        "-c, --config <config>",
        "Path to configuration file",
        "localiser.json"
      );

    program.parse(process.argv);
    this.options = program.opts();
  }

  /**
   * Load project configuration from JSON file
   * @param {string} configPath - Path to configuration file
   * @returns {Promise<Object>} Configuration object
   */
  async loadProjectConfig(configPath) {
    try {
      this.config = await fs.readJson(configPath);

      return this.config;
    } catch (error) {
      this.log(`Error loading project config: ${error.message}`, "error");
      process.exit(1);
    }
  }

  /**
   * Parse and render colored text with <color>text</color> syntax
   * @param {string} text - Text with color tags
   * @param {boolean} bright - Whether to make text bright
   */
  log(text, bright = false) {
    const brightCode = bright ? this.colors.bright : "";

    // Replace color tags with actual color codes
    const coloredText = text.replace(
      /<(\w+)>(.*?)<\/\1>/g,
      (_, color, content) => {
        const colorCode = this.colors[color] || this.colors.reset;
        return `${brightCode}${colorCode}${content}${this.colors.reset}`;
      }
    );

    console.log(coloredText);
  }

  /**
   * Display combined progress bars for languages and namespaces
   * @param {string} currentLanguage - Current language being processed
   * @param {string} currentNamespace - Current namespace being processed
   */
  showCombinedProgress(currentLanguage, currentNamespace) {
    const langCurrent = this.stats.languages.completed;
    const langTotal = this.stats.languages.total;
    const nsCurrent = this.stats.namespaces.completed;
    const nsTotal = this.stats.namespaces.total;

    const langPercentage = Math.round((langCurrent / langTotal) * 100);
    const nsPercentage = Math.round((nsCurrent / nsTotal) * 100);

    const barLength = 15;
    const langFilledLength = Math.round((langCurrent / langTotal) * barLength);
    const nsFilledLength = Math.round((nsCurrent / nsTotal) * barLength);

    const langBar =
      "█".repeat(langFilledLength) + "░".repeat(barLength - langFilledLength);
    const nsBar =
      "█".repeat(nsFilledLength) + "░".repeat(barLength - nsFilledLength);

    const langSection = `${this.colors.blue}Languages:${this.colors.reset} [${this.colors.green}${langBar}${this.colors.reset}] ${langCurrent}/${langTotal} (${langPercentage}%)`;
    const nsSection = `${this.colors.cyan}Namespaces:${this.colors.reset} [${this.colors.green}${nsBar}${this.colors.reset}] ${nsCurrent}/${nsTotal} (${nsPercentage}%)`;
    const currentSection = `${this.colors.yellow}${currentLanguage}/${currentNamespace}${this.colors.reset}`;

    const progressLine = `${langSection} | ${nsSection} | ${currentSection}`;

    // Clear the entire line and write the new progress
    process.stdout.write(`\r\x1b[K${progressLine}`);
  }

  /**
   * Translate JSON object using OpenAI API
   * @param {Object} jsonObject - JSON object to translate
   * @param {string} targetLang - Target language code
   * @returns {Promise<Object>} Translated JSON object
   */
  async translateJson(jsonObject, targetLang) {
    try {
      const prompt = this.buildTranslationPrompt(jsonObject, targetLang);
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.0,
        max_tokens: 4000,
        response_format: { type: "json_object" },
      });

      const translatedContent = response.choices[0].message.content.trim();
      try {
        const translatedJson = JSON.parse(translatedContent);
        return translatedJson;
      } catch (parseError) {
        this.log(
          `<red>Failed to parse translation response: ${parseError.message}</red>`
        );
      }
    } catch (error) {
      this.log(
        `<red>Translation error for ${targetLang}: ${error.message}</red>`
      );
    }

    return {};
  }

  /**
   * Build translation prompt for OpenAI
   * @param {Object} jsonObject - JSON object to translate
   * @param {string} targetLang - Target language code
   * @returns {string} Formatted prompt
   */
  buildTranslationPrompt(jsonObject, targetLang) {
    return `Translate the following JSON object to ${targetLang}. Keep all keys exactly the same and translate only the string values. Preserve any placeholders like {0}, {1}, {count}, etc. exactly as they are.

Input JSON:
${JSON.stringify(jsonObject, null, 2)}

Return the translated JSON object with the same structure.`;
  }

  /**
   * Get file path for namespace
   * @param {string} directory - Base directory
   * @param {string} namespace - Namespace name
   * @returns {string} Full file path
   */
  getFilePath(directory, namespace) {
    const filePath = path.join(directory, namespace);
    return filePath.endsWith(".json") ? filePath : `${filePath}.json`;
  }

  /**
   * Prompt user for input with a question
   * @param {string} question - Question to ask the user
   * @returns {Promise<string>} User's response
   */
  async promptUser(question) {
    const readline = await import("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase());
      });
    });
  }

  /**
   * Validate that specified namespaces exist in the project configuration
   * @param {Array<string>} inputNamespaces - Namespaces to validate
   * @returns {Object} Validation result with valid namespaces and any errors
   */
  validateNamespaces(inputNamespaces) {
    if (!inputNamespaces || inputNamespaces.length === 0) {
      return { valid: this.config.namespaces, errors: [] };
    }
    const validNamespaces = [];
    const invalidNamespaces = [];

    for (const namespace of inputNamespaces) {
      if (this.config.namespaces.includes(namespace)) {
        validNamespaces.push(namespace);
      } else invalidNamespaces.push(namespace);
    }

    return { valid: validNamespaces, errors: invalidNamespaces };
  }

  /**
   * Process locale files for a specific language
   * @param {string} sourceLanguage - Source language code
   * @param {string} targetLanguage - Target language code
   * @param {Array<string>} namespaces - Specific namespaces to process (pre-validated)
   * @returns {Promise<boolean>} Success status
   */
  async processLocale(sourceLanguage, targetLanguage, namespaces) {
    const sourceLanguageDir = path.join(this.config.directory, sourceLanguage);
    const targetLanguageDir = path.join(this.config.directory, targetLanguage);

    await fs.ensureDir(targetLanguageDir);

    // Use pre-validated namespaces (validation already done in run())
    const validNamespaces =
      namespaces && namespaces.length > 0 ? namespaces : this.config.namespaces;
    const namespaceFiles = validNamespaces.map((ns) => `${ns}.json`);

    for (let i = 0; i < namespaceFiles.length; i++) {
      const file = namespaceFiles[i];
      const namespaceName = file.replace(".json", "");

      this.showCombinedProgress(targetLanguage, namespaceName);

      const success = await this.processNamespaceFile(
        sourceLanguageDir,
        targetLanguageDir,
        file
      );
      if (success) this.stats.namespaces.completed++;
      else this.stats.namespaces.failed++;
    }

    return this.stats.namespaces.completed === this.stats.namespaces.total;
  }

  /**
   * Process a single namespace file
   * @param {string} sourceLanguageDir - Source language directory
   * @param {string} targetLanguageDir - Target language directory
   * @param {string} file - File name to process
   * @returns {Promise<boolean>} Success status
   */
  async processNamespaceFile(sourceLanguageDir, targetLanguageDir, file) {
    const sourceFilePath = this.getFilePath(sourceLanguageDir, file);
    const targetFilePath = this.getFilePath(targetLanguageDir, file);

    if (!fs.existsSync(sourceFilePath)) return false;

    try {
      const sourceContent = await fs.readJson(sourceFilePath);
      const translatedContent = await this.translateJson(
        sourceContent,
        path.basename(targetLanguageDir)
      );

      if (Object.keys(translatedContent).length > 0) {
        await fs.writeJson(targetFilePath, translatedContent, { spaces: 2 });
        return true;
      }
    } catch (_) {}

    return false;
  }

  /**
   * Main execution method
   */
  async run() {
    this.initializeCLI();
    await this.loadProjectConfig(this.options.config);

    const languagesToTranslate = this.options.language
      ? [this.options.language]
      : this.config.languages.filter(
          (lang) => lang !== this.config.sourceLanguage
        );

    // Validate namespaces once and reuse the result
    const { valid: validNamespaces, errors: invalidNamespaces } =
      this.validateNamespaces(this.options.namespace);

    // Initialize statistics
    this.stats.languages.total = languagesToTranslate.length;
    this.stats.namespaces.total = validNamespaces.length;

    this.log("<cyan>🚀 Starting translation process...</cyan>", true);
    this.log(
      `<blue>📝 Source:</blue> <bright>${
        this.config.sourceLanguage
      }</bright> <yellow>→</yellow> <cyan>Target:</cyan> <green>${languagesToTranslate.join(
        ", "
      )}</green>`
    );

    // Prompt user to continue or abort (unless --yes flag is used)
    if (invalidNamespaces.length > 0) {
      this.log(
        `<red>⚠️  Invalid namespaces: ${invalidNamespaces.join(", ")}</red>`
      );
      this.log(
        `<yellow>Available namespaces: ${this.config.namespaces.join(
          ", "
        )}</yellow>`
      );
      const continueChoice = await this.promptUser(
        "❓ Continue with valid namespaces only? (y/n): "
      );
      if (continueChoice !== "y" && continueChoice !== "yes") {
        this.log(`<red>❌ Operation cancelled by user.</red>`);
        process.exit(0);
      }
      this.log(`<green>✅ Continuing with valid namespaces...</green>`);
    }

    this.log(
      `<magenta>📁 Namespaces:</magenta> <green>${validNamespaces.join(
        ", "
      )}</green>`
    );
    console.log();

    for (const language of languagesToTranslate) {
      if (!this.config.languages.includes(language)) {
        this.log(`<red>Unsupported language: ${language}</red>`);
        this.stats.languages.failed++;
        continue;
      }

      const success = await this.processLocale(
        this.config.sourceLanguage,
        language,
        this.options.namespace
      );

      if (success) this.stats.languages.completed++;
      else this.stats.languages.failed++;

      this.showCombinedProgress(language, "completed");
    }

    console.log();
    this.log("<green>🎉 Translation process completed!</green>", true);
  }
}

const localiser = new Localiser();

localiser.run().catch((error) => {
  localiser.log(`<red>Unhandled error: ${error.message}</red>`);
  process.exit(1);
});
