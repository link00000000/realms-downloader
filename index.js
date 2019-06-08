const { Authentication, Client, Realms } = require("node-mojang-api");
const figlet = require("figlet");
const prompts = require("prompts");
const download = require("progress-download");
const commandLineArgs = require("command-line-args");
const commandLineUsage = require("command-line-usage");
const path = require("path");
const fs = require("fs");

const clientFile = path.join(__dirname, "client.json");
const usage = commandLineUsage([
    {
        header: "Realms World Downloader",
        content: "Download minecraft realms world in the command line."
    },
    {
        header: "Options",
        optionList: [
            {
                name: "email",
                typeLabel: "{underline email}",
                description: "The email of the client to authenticate with. Only needs to be specified once."
            },
            {
                name: "password",
                typeLabel: "{underline password}",
                description: "The password of the client to authenticate with. Only needs to be specified once."
            },
            {
                name: "world",
                typeLabel: "{underline worldName}",
                description: "The name of the world to download."
            },
            {
                name: "directory",
                typeLabel: "{underline downloadDirectory}",
                description: "The directory where the world should be downloaded. If omitted, the world will be downloaded to the current working directory."
            },
            {
                name: "help",
                description: "Print this usage guide."
            }
        ]
    }
]);
const options = commandLineArgs([
    { name: "email", type: String },
    { name: "password", type: String },
    { name: "world", type: String, default: true },
    { name: "directory", type: String },
    { name: "help", type: Boolean }
]);
const interactiveMode = Object.keys(options).length == 0;

if(options.help)
{
    console.log(usage);
    process.exit();
}

let login = async () => {
    return new Promise(async (resolve, reject) => {
        // Checks if valid access token in client file
        try {
            let auth = new Authentication("", "", clientFile);
            if(!await auth.validate())
            {
                try {
                    auth.refresh();
                }
                catch(e)
                {
                    throw e;
                }
            }
            resolve(auth);
        }
        // If no valid access token, prompt login
        catch(e)
        {
            let email, password;
            if(interactiveMode)
            {
                email = (await prompts({
                    type: "text",
                    name: "email",
                    message: "Email:",
                    validate: value => value.match(/.*\@.*\..*/) ? true : "Not a valid email"
                })).email;

                password = (await prompts({
                    type: "password",
                    name: "password",
                    message: "Password:"
                })).password;
            }
            else
            {
                email = options.email;
                password = options.password;
            }

            let auth = new Authentication(email, password, clientFile);
            try {
                await auth.authenticate();
            }
            catch(e)
            {
                reject(e);
            }
            resolve(auth);
        }
    });
}

let getWorld = async (realm) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Gets a filtered list of realms that are owned by the authenticated user
            let ownedWorlds = await realm.getWorlds();
            ownedWorlds = ownedWorlds.filter(item => item.owner == realm.auth.name);
            if(interactiveMode)
            {
                let selectedWorld = await prompts({
                    type: "select",
                    name: "selectedWorld",
                    message: "Select a world",
                    choices: ownedWorlds.map(item => {
                        return {
                            title: item.name,
                            value: item
                        }
                    })
                });
                resolve(selectedWorld.selectedWorld);
            }
            else
            {
                for(var i = 0; i < ownedWorlds.length; ++i)
                {
                    if(ownedWorlds[i].name == options.world)
                    {
                        resolve(ownedWorlds[i]);
                    }
                }
                reject("No owned realms world found with the name: " + options.world);
            }
        }
        catch(e)
        {
            reject(e);
        }
    });
}

let downloadWorld = async (url) => {
    return new Promise(async (resolve, reject) => {
        let downloadLocation;
        if(interactiveMode)
        {
            downloadLocation = (await prompts({
                type: "text",
                name: "downloadLocation",
                message: "Download directory:",
                validate: input => fs.existsSync(path.resolve(input)) ? true : `Directory does not exist (${path.resolve(input)})`,
            })).downloadLocation;
        }
        else
        {
            downloadLocation = options.directory || process.cwd();
        }
        let extractionPath = path.join(downloadLocation, (new Date()).toLocaleString().replace(/\//g, "-"));
        download(url, extractionPath, { extract: true, strip: 1 })
            .then(() => {
                console.log("Extracted to " + path.resolve(extractionPath));
                resolve();
            }, err => {
                reject(err);
        });
    });
}

figlet("Realms Downloader", (err, data) => {
    if(err)
    {
        throw err;
    }
    console.log(data);
});

(async () => {
    let auth = await login();
    let realm = new Realms(auth);
    let world = await getWorld(realm);
    let downloadUrl = await realm.getDownload(world);
    await downloadWorld(downloadUrl);
})();
