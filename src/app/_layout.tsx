import ThemeProvider from "@/components/ui/ThemeProvider";

import { AsyncFont } from "@/components/data/async-font";
import Tabs from "@/components/ui/Tabs";
import { SplashScreen } from "expo-router";
import { Suspense, useEffect } from "react";

import { Inter_700Bold } from "@expo-google-fonts/inter";
import { SourceCodePro_400Regular } from "@expo-google-fonts/source-code-pro";

SplashScreen.preventAutoHideAsync();

function SplashFallback() {
  useEffect(
    () => () => {
      // SplashScreen.hideAsync();
    },
    []
  );
  return null;
}

import * as AC from "@bacons/apple-colors";

export default function Layout() {
  // Keep the splash screen visible while we fetch resources
  return (
    <Suspense fallback={<SplashFallback />}>
      {/* Load fonts in suspense */}
      <AsyncFont src={SourceCodePro_400Regular} fontFamily="Source Code Pro" />
      <AsyncFont src={Inter_700Bold} fontFamily="Inter_700Bold" />
      <ThemeProvider>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: AC.label,
          }}
        >
          <Tabs.Screen
            name="(index)"
            systemImage="moon.stars.fill"
            title="Home"
          />
          <Tabs.Screen name="(info)" systemImage="sparkles" title="Info" />
        </Tabs>
      </ThemeProvider>
    </Suspense>
  );
}
