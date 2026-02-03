# Testing React Native PDF - Quick Guide

## 🚀 Current Status

✅ **Migration Complete:**
- `react-native-pdf` installed
- Native PDF viewer component created
- PDF screen updated to use native viewer

## 📱 Testing Options

### Option 1: Expo Run (Currently Running) ⏳

The command `npx expo run:android` is building your app. This will:
1. Build the Android APK with native modules
2. Install it on your connected emulator/device
3. Start the Metro bundler
4. Launch the app automatically

**What to expect:**
- First build takes 5-10 minutes
- You'll see Gradle downloading dependencies
- The app will launch automatically when ready

**If it fails:**
- Make sure Android emulator is running
- Or connect a physical Android device via USB with USB debugging enabled

### Option 2: EAS Build (Cloud - Recommended for Production)

If local build doesn't work, use EAS Build:

```bash
# 1. Login to Expo
eas login

# 2. Configure EAS
eas build:configure

# 3. Build development client
eas build --profile development --platform android

# 4. Download APK from EAS dashboard and install
adb install path/to/app.apk

# 5. Start dev server
npm start

# 6. Open app and scan QR code
```

### Option 3: Manual Android Studio Build

If you have Android Studio installed:

1. Open `android` folder in Android Studio
2. Wait for Gradle sync
3. Click "Run" button (green play icon)
4. Select your emulator/device
5. App will build and install automatically

## ✅ Testing Checklist

Once the app is running:

1. **Navigate to PDFs tab**
2. **Select a PDF file** (or add one if none exist)
3. **Verify:**
   - ✅ PDF loads quickly
   - ✅ Smooth scrolling
   - ✅ Pinch-to-zoom works
   - ✅ Page navigation works
   - ✅ Annotation tools appear (Text, Highlight, Sign buttons)
   - ✅ Can add text annotations
   - ✅ Can add highlights
   - ✅ Can add signatures
   - ✅ Annotations save correctly

## 🔍 Troubleshooting

### "SDK location not found"
- Install Android Studio
- Set `ANDROID_HOME` environment variable
- Or create `android/local.properties` with:
  ```
  sdk.dir=C:\\Users\\YourName\\AppData\\Local\\Android\\Sdk
  ```

### "No devices found"
- Start Android emulator from Android Studio
- Or connect physical device with USB debugging

### "Build failed"
- Check Android SDK is installed
- Try `npx expo run:android --clear` to clear cache
- Or use EAS Build (Option 2)

## 📝 Next Steps After Testing

If everything works:
1. ✅ Keep using native PDF viewer
2. ✅ Remove old WebView component (optional cleanup)
3. ✅ Ready for production!

If issues:
- Check error messages
- Try EAS Build instead
- Or revert to WebView temporarily

