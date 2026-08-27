/**
 * Type declarations for React Native and Expo modules
 * These allow TypeScript to compile even when node_modules aren't installed
 */

declare module 'react-native' {
  import React from 'react';
  
  export interface ViewStyle {
    flex?: number;
    flexDirection?: 'row' | 'column';
    justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch';
    backgroundColor?: string;
    padding?: number;
    paddingHorizontal?: number;
    paddingVertical?: number;
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
    margin?: number;
    marginHorizontal?: number;
    marginVertical?: number;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    width?: number | string;
    height?: number | string;
    position?: 'absolute' | 'relative';
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    overflow?: 'visible' | 'hidden' | 'scroll';
    gap?: number;
    [key: string]: any;
  }

  export interface TextStyle extends ViewStyle {
    color?: string;
    fontSize?: number;
    fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    textAlign?: 'left' | 'center' | 'right';
    lineHeight?: number;
    fontFamily?: string;
  }

  export interface ImageStyle extends ViewStyle {
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  }

  export type StyleProp<T> = T | T[] | null | undefined;

  export const StyleSheet: {
    create<T extends Record<string, ViewStyle | TextStyle | ImageStyle>>(styles: T): T;
    flatten: (style: any) => any;
  };

  export interface ViewProps {
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
  }
  export const View: React.FC<ViewProps>;

  export interface TextProps {
    style?: StyleProp<TextStyle>;
    children?: React.ReactNode;
    numberOfLines?: number;
    onPress?: () => void;
  }
  export const Text: React.FC<TextProps>;

  export interface TouchableOpacityProps extends ViewProps {
    onPress?: () => void;
    activeOpacity?: number;
    disabled?: boolean;
  }
  export const TouchableOpacity: React.FC<TouchableOpacityProps>;

  export interface FlatListProps<T> {
    data: T[] | null;
    renderItem: (info: { item: T; index: number }) => React.ReactElement | null;
    keyExtractor?: (item: T, index: number) => string;
    ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
    ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
    ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
    refreshControl?: React.ReactElement;
    onEndReached?: () => void;
    onEndReachedThreshold?: number;
    showsVerticalScrollIndicator?: boolean;
    contentContainerStyle?: StyleProp<ViewStyle>;
    style?: StyleProp<ViewStyle>;
    keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
    horizontal?: boolean;
    numColumns?: number;
  }
  export function FlatList<T>(props: FlatListProps<T>): React.ReactElement;

  export interface RefreshControlProps {
    refreshing: boolean;
    onRefresh?: () => void;
    tintColor?: string;
    colors?: string[];
  }
  export const RefreshControl: React.FC<RefreshControlProps>;

  export interface ActivityIndicatorProps {
    size?: 'small' | 'large' | number;
    color?: string;
    style?: StyleProp<ViewStyle>;
  }
  export const ActivityIndicator: React.FC<ActivityIndicatorProps>;

  export interface SwitchProps {
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    trackColor?: { false?: string; true?: string };
    thumbColor?: string;
    disabled?: boolean;
  }
  export const Switch: React.FC<SwitchProps>;

  export interface TextInputProps {
    style?: StyleProp<TextStyle>;
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    placeholderTextColor?: string;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    autoCorrect?: boolean;
    returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
    onSubmitEditing?: () => void;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    multiline?: boolean;
  }
  export const TextInput: React.FC<TextInputProps>;

  export interface ScrollViewProps extends ViewProps {
    horizontal?: boolean;
    showsHorizontalScrollIndicator?: boolean;
    showsVerticalScrollIndicator?: boolean;
    contentContainerStyle?: StyleProp<ViewStyle>;
  }
  export const ScrollView: React.FC<ScrollViewProps>;

  export interface ImageProps {
    source: { uri: string } | number;
    style?: StyleProp<ImageStyle>;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  }
  export const Image: React.FC<ImageProps>;

  export interface ModalProps {
    visible?: boolean;
    transparent?: boolean;
    animationType?: 'none' | 'slide' | 'fade';
    onRequestClose?: () => void;
    children?: React.ReactNode;
  }
  export const Modal: React.FC<ModalProps>;

  export const Keyboard: {
    dismiss: () => void;
    addListener: (event: string, callback: () => void) => { remove: () => void };
  };

  export function useColorScheme(): 'light' | 'dark' | null;

  export const Platform: {
    OS: 'ios' | 'android' | 'web';
    Version: number | string;
    select: <T>(specifics: { ios?: T; android?: T; default?: T }) => T;
  };

  export const Dimensions: {
    get: (dim: 'window' | 'screen') => { width: number; height: number };
  };

  export const Linking: {
    openURL: (url: string) => Promise<void>;
    canOpenURL: (url: string) => Promise<boolean>;
  };

  export const Alert: {
    alert: (title: string, message?: string, buttons?: any[]) => void;
  };

  export const Share: {
    share: (content: { message?: string; url?: string; title?: string }) => Promise<any>;
  };
}

declare module 'react-native-safe-area-context' {
  import React from 'react';
  import { ViewStyle, StyleProp } from 'react-native';
  
  export interface SafeAreaViewProps {
    style?: StyleProp<ViewStyle>;
    edges?: ('top' | 'right' | 'bottom' | 'left')[];
    children?: React.ReactNode;
  }
  export const SafeAreaView: React.FC<SafeAreaViewProps>;
  export const SafeAreaProvider: React.FC<{ children?: React.ReactNode }>;
  export function useSafeAreaInsets(): { top: number; right: number; bottom: number; left: number };
}

declare module 'react-native-webview' {
  import React from 'react';
  import { ViewStyle, StyleProp } from 'react-native';
  
  export interface WebViewProps {
    source: { uri: string } | { html: string };
    style?: StyleProp<ViewStyle>;
    onLoadStart?: () => void;
    onLoadEnd?: () => void;
    onError?: (syntheticEvent: { nativeEvent: { description: string } }) => void;
    javaScriptEnabled?: boolean;
    domStorageEnabled?: boolean;
    allowsFullscreenVideo?: boolean;
    allowsInlineMediaPlayback?: boolean;
    mediaPlaybackRequiresUserAction?: boolean;
    scalesPageToFit?: boolean;
    showsHorizontalScrollIndicator?: boolean;
    showsVerticalScrollIndicator?: boolean;
    decelerationRate?: 'normal' | 'fast' | number;
    startInLoadingState?: boolean;
    renderLoading?: () => React.ReactElement;
  }
  export const WebView: React.FC<WebViewProps>;
}

declare module '@react-navigation/native' {
  import React from 'react';
  
  export interface Theme {
    dark: boolean;
    colors: {
      primary: string;
      background: string;
      card: string;
      text: string;
      border: string;
      notification: string;
    };
  }
  
  export const DefaultTheme: Theme;
  export const DarkTheme: Theme;
  
  export interface NavigationContainerProps {
    theme?: Theme;
    children?: React.ReactNode;
  }
  export const NavigationContainer: React.FC<NavigationContainerProps>;
  
  export function useNavigation<T = any>(): T;
  export function useRoute<T = any>(): T;
  export function useFocusEffect(effect: () => void | (() => void)): void;
  
  export type RouteProp<T, K extends keyof T> = {
    key: string;
    name: K;
    params: T[K];
  };
}

declare module '@react-navigation/bottom-tabs' {
  import React from 'react';
  
  export interface BottomTabNavigationOptions {
    tabBarIcon?: (props: { focused: boolean; color: string; size: number }) => React.ReactNode;
    tabBarLabel?: string | ((props: { focused: boolean; color: string }) => React.ReactNode);
    tabBarActiveTintColor?: string;
    tabBarInactiveTintColor?: string;
    tabBarStyle?: any;
    headerStyle?: any;
    headerTintColor?: string;
    title?: string;
    headerShown?: boolean;
  }
  
  export interface BottomTabScreenProps<T, K extends keyof T> {
    route: { key: string; name: K; params?: T[K] };
    navigation: any;
  }
  
  export function createBottomTabNavigator<T extends Record<string, any>>(): {
    Navigator: React.FC<{
      screenOptions?: BottomTabNavigationOptions | ((props: { route: { name: keyof T } }) => BottomTabNavigationOptions);
      children?: React.ReactNode;
    }>;
    Screen: React.FC<{
      name: keyof T;
      component: React.ComponentType<any>;
      options?: BottomTabNavigationOptions | ((props: { route: { name: keyof T } }) => BottomTabNavigationOptions);
    }>;
  };
}

declare module '@react-navigation/native-stack' {
  import React from 'react';
  
  export interface NativeStackNavigationOptions {
    title?: string;
    headerShown?: boolean;
    headerBackTitle?: string;
    headerStyle?: any;
    headerTintColor?: string;
    presentation?: 'card' | 'modal' | 'transparentModal';
  }
  
  export type NativeStackNavigationProp<T, K extends keyof T = keyof T> = {
    navigate: <N extends keyof T>(name: N, params?: T[N]) => void;
    goBack: () => void;
    push: <N extends keyof T>(name: N, params?: T[N]) => void;
    pop: (count?: number) => void;
    popToTop: () => void;
  };
  
  export function createNativeStackNavigator<T extends Record<string, any>>(): {
    Navigator: React.FC<{
      screenOptions?: NativeStackNavigationOptions;
      children?: React.ReactNode;
    }>;
    Screen: React.FC<{
      name: keyof T;
      component: React.ComponentType<any>;
      options?: NativeStackNavigationOptions | ((props: { route: { params: any } }) => NativeStackNavigationOptions);
    }>;
  };
}

declare module 'expo-status-bar' {
  import React from 'react';
  
  export interface StatusBarProps {
    style?: 'auto' | 'inverted' | 'light' | 'dark';
    backgroundColor?: string;
    hidden?: boolean;
    animated?: boolean;
    translucent?: boolean;
  }
  export const StatusBar: React.FC<StatusBarProps>;
}

declare module '@expo/vector-icons' {
  import React from 'react';
  
  export interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
    onPress?: () => void;
  }
  
  export const Ionicons: React.FC<IconProps> & {
    glyphMap: Record<string, number>;
  };
  
  export const MaterialIcons: React.FC<IconProps>;
  export const FontAwesome: React.FC<IconProps>;
  export const Feather: React.FC<IconProps>;
}

declare module 'expo-haptics' {
  export enum ImpactFeedbackStyle {
    Light = 'light',
    Medium = 'medium',
    Heavy = 'heavy',
  }
  
  export enum NotificationFeedbackType {
    Success = 'success',
    Warning = 'warning',
    Error = 'error',
  }
  
  export function impactAsync(style?: ImpactFeedbackStyle): Promise<void>;
  export function notificationAsync(type?: NotificationFeedbackType): Promise<void>;
  export function selectionAsync(): Promise<void>;
}

declare module 'expo-linking' {
  export function openURL(url: string): Promise<void>;
  export function canOpenURL(url: string): Promise<boolean>;
  export function createURL(path: string, params?: Record<string, string>): string;
}

declare module 'expo-web-browser' {
  export interface WebBrowserResult {
    type: 'cancel' | 'dismiss' | 'opened' | 'locked';
  }
  
  export function openBrowserAsync(url: string): Promise<WebBrowserResult>;
  export function dismissBrowser(): Promise<void>;
}
