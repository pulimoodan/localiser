# Localiser

An AI-powered internationalization tool that automatically translates JSON locale files using OpenAI's GPT-4 model. Localiser supports batch translation across multiple languages and namespaces with a simple CLI interface.

## Features

- 🤖 **AI-Powered Translation**: Uses OpenAI's GPT-4 for high-quality translations
- 📁 **Namespace Management**: Organize translations by namespaces (e.g., home, settings, common)
- 📊 **Real-time Progress**: Visual progress bars showing translation status
- ⚡ **CLI Interface**: Simple command-line interface for easy integration
- 🔧 **Configurable**: Flexible configuration through JSON files

## To Do

- 🗂️ **Dynamic folder structure support**: Now supports lang/namespace.json, lang.json is not supported yet
- 💿 **Optimized translation**: Translate only missing keys in the target language files (add a flag to override existing translations)
- 🤖 **AI Model selection**: Allow users to choose between different OpenAI models (e.g., GPT-3.5, GPT-4) 
- 🎬 **Init command**: Add a command to initialize the project with default configuration json file

Feel free to contribute to the project by submitting issues or pull requests!

## Installation

### Prerequisites

- Node.js (v16 or higher)
- OpenAI API key (Add this to `.env` file of your project)

### Install Globally

```bash
npm install -g @pulimoodan/localiser
```

## Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Project Configuration

Create a `localiser.json` file to configure your translation settings:

```json
{
  "directory": "public/locales",
  "sourceLanguage": "en",
  "languages": ["fr", "es", "de", "it", "pt", "zh", "ja", "ru"],
  "namespaces": ["home", "settings"]
}
```

#### Configuration Options

- `directory`: Path to your locales directory
- `sourceLanguage`: Source language code (e.g., "en")
- `languages`: Array of target language codes to translate to
- `namespaces`: Array of namespace names to translate

## Usage

### Basic Usage

Translate all configured languages and namespaces:

```bash
loaliser
```

### Translate Specific Language

```bash
loaliser --language fr
```

### Translate Specific Namespace

```bash
loaliser --namespace home
```

### Translate Specific Language and Namespace

```bash
loaliser --language fr --namespace home
```

### Custom Configuration File

```bash
localiser --config custom-config.json
```

## CLI Options

| Option        | Short | Description                     | Default                   |
| ------------- | ----- | ------------------------------- | ------------------------- |
| `--language`  | `-l`  | Target language code            | All configured languages  |
| `--namespace` | `-n`  | Specific namespace to translate | All configured namespaces |
| `--config`    | `-c`  | Path to configuration file      | `localiser.json`          |


## Dependencies

- `commander`: CLI argument parsing
- `dotenv`: Environment variable management
- `fs-extra`: Enhanced file system operations
- `openai`: OpenAI API client

## License

ISC License

## Author

pulimoodan

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions, please open an issue on the GitHub repository.
