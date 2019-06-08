# Realms World Downloader
Download minecraft realms world in the command line.

*Note: only realms world owned by the authenticated user can be downloaded.*

## Requirements
- Node.JS

## Installation
1. Clone this repository using `git clone https://github.com/realms-world-downloader`
2. `cd realms-world-downloader`
3. `npm install`

## Usage
## Interactive Mode
Interactive mode can be used by simply running the command `npm start`. You will be prompted with messages to begin the download.

## Non-Interactive Mode
By passing argumenta at startup, Realms World Downloader will be started in non-interactive mode.

### Arguments

### --email {string} (optional)
The email of the client to authenticate with. Only needs to be specified once so that an access token can be saved for future use. Authentication saved in `client.json`. Remove file to logout and rerun the program with this parameter to log back in.

### --password {string} (optional)
The password of the client to authenticate with. Only needs to be specified once so that an access token can be saved for future use. Authentication saved in `client.json`. Remove file to logout and rerun the program with this parameter to log back in.

### --world {string}
The name of the world to download. Must be exact.

### --directory {string} (optional)
The directory where the world should be downloaded. If omitted, the world will be downloaded to the current working directory.

### --help
Prints the usage guide

## Example
#### First time login
```
$ npm start --email "notch@minecraft.net" --password "M!n3cr4f1" --world "My World" --directory "./downloads"
```

#### Simple download, must have already run Realms World Downloader and logged in at least once already
```
$ npm start --world "My World"
```

## Version
- Version 1.0.0

## Contact
### Logan Crandall
- Homepage: [accidentallycoded.com](https://accidentallycoded.com)
- email: logan@accidentallycoded.com

## License
This software is distributed under the [GNU Public License v3](https://github.com/link00000000/realms-world-downloader/blob/master/LICENSE)
