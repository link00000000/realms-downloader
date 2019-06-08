const { Authentication, Client, Realms } = require("node-mojang-api");
const figlet = require("figlet");
const prompts = require("prompts");
const download = require("progress-download");
const path = require("path");
const fs = require("fs");

const clientFile = path.join(__dirname, "client.json");

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
            let email = await prompts({
                type: "text",
                name: "email",
                message: "Email:",
                validate: value => value.match(/.*\@.*\..*/) ? true : "Not a valid email"
            });

            let password = await prompts({
                type: "password",
                name: "password",
                message: "Password:"
            });

            let auth = new Authentication(email.email, password.password, clientFile);
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
        catch(e)
        {
            reject(e);
        }
    });
}

let downloadWorld = async (url) => {
    return new Promise(async (resolve, reject) => {
        let downloadLocation = await prompts({
            type: "text",
            name: "downloadLocation",
            message: "Download directory:",
            validate: input => fs.existsSync(path.resolve(input)) ? true : `Directory does not exist (${path.resolve(input)})`,
        });
        let extractionPath = path.join(downloadLocation.downloadLocation, (new Date()).toLocaleString().replace(/\//g, '-'));
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
