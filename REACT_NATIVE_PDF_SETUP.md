# React Native PDF Migration Guide

## ✅ What's Done

1. ✅ Installed `react-native-pdf` and `react-native-blob-util`
2. ✅ Created new `PDFViewerNative` component with native PDF rendering
3. ✅ Integrated annotation overlays (text, highlight, signature)
4. ✅ Updated PDF screen to use native viewer

## 🚀 Next Steps: Build Custom Dev Client

Since `react-native-pdf` uses native modules, you **cannot** use Expo Go. You need to build a custom development client.

### Option 1: Using EAS Build (Recommended)

1. **Install EAS CLI** (if not already installed):
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Configure EAS**:
   ```bash
   eas build:configure
   ```

4. **Build Development Client for Android**:
   ```bash
   eas build --profile development --platform android
   ```

5. **Install on Emulator**:
   - Download the APK from the EAS build page
   - Install on your emulator: `adb install path/to/app.apk`

6. **Start Development Server**:
   ```bash
   npm start
   ```

7. **Open in Custom Dev Client**:
   - Open the custom dev client app on your emulator
   - Scan the QR code or enter the URL manually

### Option 2: Local Build (For Testing)

1. **Generate Native Folders**:
   ```bash
   npx expo prebuild
   ```

2. **Build Android APK**:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```

3. **Install on Emulator**:
   ```bash
   adb install app/build/outputs/apk/debug/app-debug.apk
   ```

4. **Start Development Server**:
   ```bash
   npm start
   ```

## 📱 Testing on Emulator

Once you have the custom dev client installed:

1. Open the app on your emulator
2. Navigate to PDFs tab
3. Select a PDF file
4. The native PDF viewer should load with:
   - ✅ Smooth scrolling and zoom
   - ✅ Page navigation
   - ✅ Annotation tools (text, highlight, signature)
   - ✅ Better performance than WebView

## 🔄 Rollback (If Needed)

If you want to revert to the WebView approach:

1. In `app/pdf/[id].tsx`, change:
   ```typescript
   import { PDFViewer } from '@/components/PDFViewer';
   // and use <PDFViewer /> instead of <PDFViewerNative />
   ```

## 📝 Notes

- The native viewer provides **much better performance** for production
- Annotations work the same way - they're stored as overlays
- Page numbers are tracked automatically
- Zoom and pan gestures are native and smooth

## ⚠️ Important

- **Expo Go will NOT work** with this setup
- You **must** use a custom development build
- The build process takes 10-15 minutes the first time
- Subsequent builds are faster due to caching


