### Runnning the extension locally

_I'll assume that you already read the [Webpack docs](https://webpack.js.org) and the [Chrome Extension](https://developer.chrome.com/extensions/getstarted) docs._

1. Check if your Node.js version is >= 6.
2. Clone the repository.
3. Run `npm install`.
4. Add and update `.env.development` with cognito user pool constants.
5. Run `npm run start` for live changes or `npm run build` one time build.
6. Load your extension on Chrome following:
   1. Access `chrome://extensions/`
   2. Check `Developer mode`
   3. Click on `Load unpacked extension`
   4. Select the `dist` folder.
