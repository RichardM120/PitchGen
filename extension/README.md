# Save to PitchGen (Chrome extension)

Right-click any image on ShotDeck, Flim, Film-Grab or anywhere else and send it straight into a pitch's Media library, with the page title as the credit.

## Install (unpacked, for the team)

1. Download this `extension` folder (Code, Download ZIP on GitHub, then unzip).
2. Chrome: `chrome://extensions`, turn on **Developer mode** (top right), **Load unpacked**, choose the `extension` folder.
3. Open PitchGen Studio in a tab and log in with the studio passcode.
4. Click the PitchGen icon in the toolbar, pick the pitch, **Use this pitch**.
5. On any site, right-click an image, **Save to PitchGen: <pitch>**. It appears in that pitch's Media tab.

Works in Chrome, Edge, Brave and Arc. Not Safari.

## How it works

- The image is fetched inside the page's own tab, so sites you are logged into (ShotDeck) work.
- It is posted to PitchGen's `/api/clip` using your Studio login cookie. Nothing else is sent anywhere.
- Credit defaults to the page title; edit it in the Media tab.

## Rights

Frames from other productions are normal in a passcode-protected pitch. Do not publish them on a public link.
