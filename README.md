# Localiser

An AI-powered internationalization tool that automatically translates JSON locale files using OpenAI's GPT-4 model. Localiser supports batch translation across multiple languages and namespaces with a simple CLI interface.

## Features

- 🤖 **AI-Powered Translation**: Uses OpenAI's GPT-4 for high-quality translations
- 🌍 **Multi-Language Support**: Translate to multiple target languages simultaneously
- 📁 **Namespace Management**: Organize translations by namespaces (e.g., home, settings, common)
- 📊 **Real-time Progress**: Visual progress bars showing translation status
- ⚡ **CLI Interface**: Simple command-line interface for easy integration
- 🔧 **Configurable**: Flexible configuration through JSON files
- 🎨 **Colored Output**: Beautiful terminal output with color-coded status messages

## Installation

### Prerequisites

- Node.js (v16 or higher)
- OpenAI API key

### Install Locally

```bash
npm install
```

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
node index.js
```

### Translate Specific Language

```bash
node index.js --language fr
```

### Translate Specific Namespace

```bash
node index.js --namespace home
```

### Translate Specific Language and Namespace

```bash
node index.js --language fr --namespace home
```

### Custom Configuration File

```bash
node index.js --config custom-config.json
```

### Global Installation Usage

If installed globally:

```bash
localiser
localiser --language fr
localiser --namespace home
localiser --language fr --namespace home
```

## Project Structure

```
your-project/
├── public/
│   └── locales/
│       ├── en/                 # Source language
│       │   ├── home.json
│       │   └── settings.json
│       ├── fr/                 # Translated languages
│       │   ├── home.json
│       │   └── settings.json
│       ├── es/
│       │   ├── home.json
│       │   └── settings.json
│       └── ...
├── localiser.json             # Configuration file
├── .env                      # Environment variables
└── index.js                  # Main script
```

## Example Locale Files

### Source (en/home.json)

```json
{
  "welcome": "Welcome to our app",
  "description": "This is a sample application",
  "buttons": {
    "save": "Save",
    "cancel": "Cancel"
  }
}
```

### Translated (fr/home.json)

```json
{
  "welcome": "Bienvenue dans notre application",
  "description": "Ceci est un exemple d'application",
  "buttons": {
    "save": "Enregistrer",
    "cancel": "Annuler"
  }
}
```

## CLI Options

| Option        | Short | Description                     | Default                   |
| ------------- | ----- | ------------------------------- | ------------------------- |
| `--language`  | `-l`  | Target language code            | All configured languages  |
| `--namespace` | `-n`  | Specific namespace to translate | All configured namespaces |
| `--config`    | `-c`  | Path to configuration file      | `localiser.json`          |

## Supported Languages

The tool supports any language that OpenAI's GPT-4 can translate. Common language codes include:

- `en` - English
- `fr` - French
- `es` - Spanish
- `de` - German
- `it` - Italian
- `pt` - Portuguese
- `zh` - Chinese
- `ja` - Japanese
- `ru` - Russian
- `ar` - Arabic
- `ko` - Korean
- `nl` - Dutch
- `sv` - Swedish
- `no` - Norwegian
- `da` - Danish

## Error Handling

The tool includes comprehensive error handling:

- **API Errors**: Graceful handling of OpenAI API failures
- **File Errors**: Skips missing files and continues processing
- **Parse Errors**: Handles malformed JSON responses
- **Configuration Errors**: Validates configuration before processing

## Progress Tracking

Real-time progress bars show:

- Overall language translation progress
- Current namespace progress within each language
- Current file being processed

## Security Considerations

- API keys are stored in environment variables
- No sensitive data is logged
- Input validation for all configuration options
- Secure file handling with proper error boundaries

## Dependencies

- `commander`: CLI argument parsing
- `dotenv`: Environment variable management
- `fs-extra`: Enhanced file system operations
- `openai`: OpenAI API client

## Development

### Running Tests

```bash
npm test
```

### Building

```bash
npm run build
```

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
