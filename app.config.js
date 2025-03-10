import 'dotenv/config';
export default{
  "expo": {
    "name": "demo1",
    "slug": "demo1",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "permissions": ["CAMERA_ROLL", "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE", "INTERNET"]

    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "apiKey": process.env.API_KEY,
      "authDomain": process.env.AUTH_DOMAIN,
      "projectId": process.env.PROJECT_ID,
      "storageBucket": process.env.STORAGE_BUCKET,
      "messagingSenderId": process.env.MESSAGING_SENDER_ID,
      "appId": process.env.APP_ID,
      "eas": {
        "projectId": "d3d43abd-460f-4c9c-8972-43dd5914b39b"
      }
    }
    
  }
}
