# Prompt 31: Mobile App (React Native)

## Context

The footer (`src/components/Footer.tsx`, lines 279/289) shows Apple App Store and Google Play Store badges with "Coming Soon" labels. A React Native mobile app already exists in `mobile/` but the coin detail screen uses a placeholder chart (`mobile/src/screens/CoinDetailScreen.tsx` line 203: `<View style={styles.chartPlaceholder}>`).

## Current State

```
mobile/
├── App.tsx
├── package.json
├── app.json
├── tsconfig.json
├── src/
│   ├── screens/
│   │   ├── CoinDetailScreen.tsx    ← chartPlaceholder, no real chart
│   │   ├── HomeScreen.tsx
│   │   ├── NewsScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── navigation/

src/components/Footer.tsx       ← "Coming Soon" for both app stores
```

## Task

### Phase 1: Fix the Chart Placeholder

1. **Update `mobile/src/screens/CoinDetailScreen.tsx`** — Replace `<View style={styles.chartPlaceholder}>` with a real interactive price chart

```typescript
// Install: pnpm add react-native-wagmi-charts react-native-reanimated react-native-gesture-handler
// OR: pnpm add victory-native

// Replace the chartPlaceholder view with:
import { LineChart } from "react-native-wagmi-charts";

// Fetch OHLCV data from the API
const { data: priceHistory } = useAPI(
  `/api/v1/ohlcv?symbol=${symbol}&interval=1h&limit=168`,
);

// Render interactive chart with:
// - Touch-to-see-price crosshair
// - Time range selector (1H, 24H, 7D, 30D, 1Y)
// - Green/red based on overall trend
// - Smooth animations
```

### Phase 2: Polish Mobile App

2. **Add pull-to-refresh** across all screens if not already present
3. **Add skeleton loading states** for CoinDetailScreen chart and stats
4. **Add offline caching** — Cache last-fetched data in AsyncStorage for offline viewing
5. **Add push notification support** — Wire up Expo Push Notifications for price alerts

### Phase 3: App Store Preparation

6. **Update `mobile/app.json`** — Ensure all metadata is correct:
   - `expo.name`, `expo.slug`, `expo.version`
   - `expo.ios.bundleIdentifier`
   - `expo.android.package`
   - App icon and splash screen configured

7. **Create app store assets**:
   - `mobile/assets/icon.png` (1024x1024)
   - `mobile/assets/splash.png` (1284x2778)
   - `mobile/assets/adaptive-icon.png` (1024x1024)

8. **Create `mobile/STORE_LISTING.md`** — App store listing copy:
   - Title (30 chars)
   - Subtitle (30 chars)
   - Description (4000 chars)
   - Keywords
   - Category: Finance
   - Privacy policy URL

### Phase 4: Build & Deploy

9. **Add EAS Build configuration** — `mobile/eas.json`

```json
{
  "build": {
    "preview": { "distribution": "internal", "ios": { "simulator": true } },
    "production": { "autoIncrement": true }
  },
  "submit": {
    "production": {
      "ios": { "appleId": "...", "ascAppId": "...", "appleTeamId": "..." },
      "android": { "serviceAccountKeyPath": "./google-play-key.json" }
    }
  }
}
```

### Phase 5: Update Footer

10. **Update `src/components/Footer.tsx`** — Replace "Coming Soon" labels:
    - Apple badge: Link to App Store URL (once published) or keep "Coming Soon" with a note like "Beta available on TestFlight"
    - Google badge: Link to Play Store URL (once published) or keep "Coming Soon" with a note like "Beta available on Google Play"
    - If not publishing yet, change to "Download Beta" with TestFlight/internal test track links

### Phase 6: Tests

11. **Create `mobile/src/__tests__/CoinDetailScreen.test.tsx`** — Test chart rendering with mock data
12. **Create `mobile/src/__tests__/services/api.test.ts`** — Test API service layer

## Packages to Install (in mobile/)

```bash
cd mobile && pnpm add react-native-wagmi-charts react-native-reanimated react-native-gesture-handler @react-native-async-storage/async-storage expo-notifications
```

## Acceptance Criteria

- [ ] CoinDetailScreen shows real interactive price chart (not a placeholder)
- [ ] Chart supports time range switching (1H, 24H, 7D, 30D, 1Y)
- [ ] Touch-to-inspect crosshair works on chart
- [ ] App store metadata and assets prepared
- [ ] EAS build configuration in place
- [ ] Footer updated to reflect app availability status
- [ ] Offline caching works for previously viewed data
