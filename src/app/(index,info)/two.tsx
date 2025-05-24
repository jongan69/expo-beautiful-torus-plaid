import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from "expo-web-browser";

import React, { useEffect, useState } from "react";
import { ActivityIndicator, Button, StyleSheet, View } from "react-native";

export default function LinkBankScreen() {
  const [hostedLinkUrl, setHostedLinkUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHostedLinkUrl() {
      try {
        const originalRedirectUri = AuthSession.makeRedirectUri();
        const url = new URL(originalRedirectUri);
        const redirectUri = 'https://' + url.host + url.pathname + url.search + url.hash;
        // Whatever prints out here is what needs to be set as Allowed redirect URIs at https://dashboard.plaid.com/developers/api
        // Sandbox User Data: https://plaid.com/docs/auth/coverage/testing/
        console.log(redirectUri);
        const response = await fetch(`/api/plaid-create-link-token?redirectUri=${redirectUri}`);
        const data = await response.json();
        setHostedLinkUrl(data.hosted_link_url);
      } catch (error) {
        console.error("Failed to fetch hosted link url:", error);
      }
    }
    fetchHostedLinkUrl();
  }, []);

  const openPlaidHostedLink = async () => {
    if (hostedLinkUrl) {
      // Use openAuthSessionAsync for best results with Plaid Hosted Link
      const result = await WebBrowser.openAuthSessionAsync(
        hostedLinkUrl,
        "yourapp://hosted-link-complete" // This should match your completion_redirect_uri
      );
      // Optionally handle the result here
      console.log(result);
    }
  };

  if (!hostedLinkUrl) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.centered}>
      <Button title="Connect your bank" onPress={openPlaidHostedLink} />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
