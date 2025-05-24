import React from "react";

import * as Form from "@/components/ui/Form";
import { IconSymbol } from "@/components/ui/IconSymbol";
import {
  Segments,
  SegmentsContent,
  SegmentsList,
  SegmentsTrigger,
} from "@/components/ui/Segments";
import Stack from "@/components/ui/Stack";
import * as AC from "@bacons/apple-colors";
import { Image } from "expo-image";
import * as SplashScreen from "expo-splash-screen";
import { ComponentProps } from "react";
import {
  OpaqueColorValue,
  StyleSheet,
  Text,
  TextProps,
  View,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from "react-native-reanimated";

import { Glur, GlurryList } from "@/components/example/glurry-modal";
import SpaceDom from "@/components/space-dom";
import TorusDom from "@/components/torus-dom";
import TouchableBounce from "@/components/ui/TouchableBounce";
import ExpoSvg from "@/svg/expo.svg";
import { BlurView } from "expo-blur";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function ProminentHeaderButton({
  children,
  ...props
}: {
  children?: React.ReactNode;
}) {
  return (
    <TouchableBounce sensory onPress={() => {}} {...props}>
      <BlurView
        tint="prominent"
        intensity={80}
        style={{
          borderRadius: 999,
          padding: 8,

          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          overflow: "hidden",
          aspectRatio: 1,
        }}
      >
        {children}
      </BlurView>
    </TouchableBounce>
  );
}

export default function Page() {
  const ref = useAnimatedRef();
  const scroll = useScrollViewOffset(ref);
  const style = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scroll.value, [0, 30], [0, 1], "clamp"),
      transform: [
        { translateY: interpolate(scroll.value, [0, 30], [5, 0], "clamp") },
      ],
    };
  });
  const blurStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scroll.value, [0, 200], [0, 1], "clamp"),
    };
  });
  const shaderStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(
            scroll.value,
            [-200, 0, 800],
            [1, 1.2, 1.7],
            "clamp"
          ),
        },
      ],
    };
  });
  const headerStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scroll.value, [100, 200], [0, 1], "clamp"),
    };
  });

  const [show, setShow] = React.useState(false);
  const { top } = useSafeAreaInsets();
  return (
    <View style={{ flex: 1 }}>
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            height: 96,
            left: 0,
            right: 0,
            zIndex: 2,
          },
        ]}
        pointerEvents={"none"}
      >
        <Glur direction="top" />
      </Animated.View>

      <Animated.View
        style={[
          {
            position: "absolute",

            top: top,
            left: 0,
            right: 0,
            zIndex: 2,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
          },
          headerStyle,
        ]}
      >
        <ProminentHeaderButton
          onPress={() => {
            window.location.reload();
          }}
        >
          <IconSymbol name="viewfinder" size={24} color={AC.label} />
        </ProminentHeaderButton>
        <Link asChild href="/_debug">
          <ProminentHeaderButton>
            <IconSymbol
              name="circle.hexagongrid.fill"
              size={24}
              color={AC.label}
            />
          </ProminentHeaderButton>
        </Link>
      </Animated.View>

      <Animated.View
        style={[StyleSheet.absoluteFill, { zIndex: -1 }, shaderStyle]}
      >
        <TorusDom />
        <SpaceDom
          dom={{
            onLoadEnd(event) {
              // Keep the splash screen open until the DOM content has loaded.
              setTimeout(() => {
                SplashScreen.hideAsync();
              }, 1);
            },
            style: {
              flex: 1,
            },
            contentInsetAdjustmentBehavior: "never",
            automaticallyAdjustContentInsets: false,

            containerStyle: {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: -1,
            },
          }}
          speed={0.2}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
      </Animated.View>
      <Animated.View
        style={[StyleSheet.absoluteFill, { zIndex: -1 }, blurStyle]}
      >
        {/* <View
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: 0.5,
              backgroundColor: AC.secondarySystemGroupedBackground,
            },
          ]}
        /> */}
        <BlurView
          style={{ flex: 1 }}
          tint="systemUltraThinMaterial"
          intensity={80}
        />
      </Animated.View>

      {show && <GlurryList setShow={setShow} />}
      <Stack.Screen
        options={{
          headerLargeTitle: false,
          headerShown: false,
          headerTitle() {
            if (process.env.EXPO_OS === "web") {
              return (
                <Animated.View
                  style={[
                    style,
                    { flexDirection: "row", gap: 12, alignItems: "center" },
                  ]}
                >
                  <Image
                    source={{ uri: "https://github.com/evanbacon.png" }}
                    style={[
                      {
                        aspectRatio: 1,
                        height: 30,
                        borderRadius: 8,
                        borderWidth: 0.5,
                        borderColor: AC.separator,
                      },
                    ]}
                  />
                  <Text
                    style={{
                      fontSize: 20,
                      color: AC.label,
                      fontWeight: "bold",
                    }}
                  >
                    Bacon Components
                  </Text>
                </Animated.View>
              );
            }
            return (
              <Animated.Image
                source={{ uri: "https://github.com/evanbacon.png" }}
                style={[
                  style,
                  {
                    aspectRatio: 1,
                    height: 30,
                    borderRadius: 8,
                    borderWidth: 0.5,
                    borderColor: AC.separator,
                  },
                ]}
              />
            );
          },
        }}
      />
      <Form.List
        ref={ref}
        showsVerticalScrollIndicator={false}
        automaticallyAdjustsScrollIndicatorInsets={true}
        contentInsetAdjustmentBehavior="never"
        navigationTitle="Components"
        style={{ backgroundColor: "transparent" }}
      >
        <View
          style={{
            alignItems: "center",
            gap: 8,
            padding: 16,
            flex: 1,
            minHeight: 500,
            height: 500,
            backgroundColor: "transparent",
          }}
        />

        <Form.Text
          style={{
            paddingHorizontal: 20,
            fontSize: 48,
            fontWeight: "bold",
            letterSpacing: -0.5,
            fontFamily: "Inter_700Bold",
          }}
        >
          <GlitchTextAnimation>{`Enter\nCyberspace`}</GlitchTextAnimation>
        </Form.Text>

        <Form.Section title="Services">
          <Form.HStack style={{ flexWrap: "wrap" }}>
            <Form.Text>Future Software</Form.Text>
            {/* Spacer */}
            <View style={{ flex: 1 }} />
            {/* Right */}
            <Form.Text style={{ flexShrink: 1, color: AC.secondaryLabel }}>
              Apps from future generations, plucked out of cyber space.
            </Form.Text>
          </Form.HStack>
        </Form.Section>

        <Form.Section title="Features">
          <Form.Text
            onPress={() => {
              setShow(true);
            }}
          >
            Choose Model
          </Form.Text>
          <Form.Link href="/icon">Change App Icon</Form.Link>
        </Form.Section>

        <Form.Section>
          <Form.HStack style={{ alignItems: "stretch", gap: 12 }}>
            <TripleItemTest />
          </Form.HStack>
        </Form.Section>

        <Form.Section>
          <Form.Link
            href="https://expo.dev/eas"
            target="_blank"
            systemImage={
              <ExpoSvg
                fill={AC.label}
                style={{ width: 18, height: 18, marginRight: 8 }}
              />
            }
            style={{ color: AC.label, fontWeight: "600" }}
          >
            Deploy on Expo
          </Form.Link>
        </Form.Section>
        <Form.Section>
          <Form.Text
            style={{
              fontFamily: "Source Code Pro",
            }}
            hint="iOS"
          >
            <Text style={{ color: AC.secondaryLabel }}>{`~/ `}</Text>
            npx testflight
          </Form.Text>

          <Form.Text
            style={{
              fontFamily: "Source Code Pro",
            }}
            hint="Web"
          >
            <Text style={{ color: AC.secondaryLabel }}>{`~/ `}</Text>
            eas deploy
          </Form.Text>
        </Form.Section>

        <Form.Section>
          <Form.HStack style={{ gap: 16 }}>
            <View
              style={{
                boxShadow: `0 0px 6px 0px rgba(0, 0, 0, 0.2)`,
                aspectRatio: 1,
                height: 48,
                borderRadius: 999,
              }}
            >
              <Image
                source={{ uri: "https://github.com/evanbacon.png" }}
                style={{
                  flex: 1,
                  aspectRatio: 1,
                  height: 48,
                  borderRadius: 999,
                }}
              />
            </View>
            <View style={{ gap: 4 }}>
              <Form.Text style={Form.FormFont.default}>Evan Bacon</Form.Text>
              <Form.Text style={Form.FormFont.caption}>
                Artist and Developer
              </Form.Text>
            </View>

            <View style={{ flex: 1 }} />

            <IconSymbol
              color={AC.systemPink}
              name="person.fill.badge.plus"
              size={24}
              animationSpec={{
                effect: {
                  type: "pulse",
                },
                repeating: true,
              }}
            />
          </Form.HStack>
        </Form.Section>

        <Form.Section title="Demo" titleHint="10/100">
          <Form.Text hint="May 20, 2025">Release Date</Form.Text>
          <Form.Text hint="3.6 (250)">Version</Form.Text>

          <FormExpandable
            hint="Requires visionOS 1.0 or later and iOS 17.5 or later. Compatible with iPhone, iPad, and Apple Vision."
            preview="Works on this iPhone"
            custom
          >
            Compatibility
          </FormExpandable>
        </Form.Section>
      </Form.List>
    </View>
  );
}

// Text animation that animates in the text character by character but first showing a random hash character while typing out.
function GlitchTextAnimation({
  children,
  ...props
}: { children: string } & TextProps) {
  // Return a set of entropy characters that are similar to the original character
  const getEntropyChars = (char: string) => {
    const englishToLatin: Record<string, string> = {
      a: "α",
      b: "β",
      c: "γ",
      d: "δ",
      e: "ε",
      f: "φ",
      g: "γ",
      h: "η",
      i: "ι",
      j: "ϳ",
      k: "κ",
      l: "λ",
      m: "μ",
      n: "ν",
      o: "ο",
      p: "π",
      q: "θ",
      r: "ρ",
      s: "σ",
      t: "τ",
      u: "υ",
      v: "ϐ",
      w: "ω",
      x: "χ",
      C: "Γ",
      D: "Δ",
      F: "Φ",
      G: "Γ",
      J: "Ϗ",
      L: "Λ",
      P: "Π",
      Q: "Θ",
      R: "Ρ",
      S: "Σ",
      V: "ϐ",
      W: "Ω",
      "0": "𝟘",
      "1": "𝟙",
      "2": "𝟚",
      "3": "𝟛",
    };
    for (const charset of [
      "ijl|!¡ƒ†",
      "ceoauøπ∂",
      "CEOAUV",

      // letters of same width
      "abcdefghijklmnopqrstuvwxyzπ∂ƒ†",
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ∆#𝝠𝝠𝝠",
      // numbers
      "0123456789",
    ]) {
      if (charset.includes(char)) {
        const chars = charset.split("").filter((c) => c !== char);

        if (englishToLatin[char]) {
          return [englishToLatin[char], ...chars];
        }
        return chars;
      }
    }

    return ["#", "%", "&", "*"];
  };

  const randomEntropyChar = (char: string) => {
    const chars = getEntropyChars(char);
    return chars[Math.floor(Math.random() * chars.length)];
  };

  // Initialize displayText while preserving whitespace.
  const initialText = Array.from(children, (char) =>
    /\s/.test(char) ? char : randomEntropyChar(char)
  );

  const [displayText, setDisplayText] = React.useState<string[]>(initialText);

  React.useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];
    const timeouts: NodeJS.Timeout[] = [];

    for (let i = 0; i < children.length; i++) {
      // Preserve whitespace characters.
      if (/\s/.test(children[i])) {
        continue;
      }

      // Update the character by cycling through similar entropy characters.
      const interval = setInterval(() => {
        setDisplayText((prev) => {
          if (prev[i] !== children[i]) {
            const newText = [...prev];
            newText[i] = randomEntropyChar(children[i]);
            return newText;
          }
          return prev;
        });
      }, 50);
      intervals.push(interval);

      // Reveal the actual character after a delay based on its position.
      const timeout = setTimeout(() => {
        clearInterval(interval);
        setDisplayText((prev) => {
          const newText = [...prev];
          newText[i] = children[i];
          return newText;
        });
      }, i * 100);
      timeouts.push(timeout);
    }

    return () => {
      intervals.forEach(clearInterval);
      timeouts.forEach(clearTimeout);
    };
  }, [children]);

  return <Text {...props}>{displayText.join("")}</Text>;
}

function FormExpandable({
  children,
  hint,
  preview,
}: {
  custom: true;
  children?: React.ReactNode;
  hint?: string;
  preview?: string;
}) {
  const [open, setOpen] = React.useState(false);

  // TODO: If the entire preview can fit, then just skip the hint.

  return (
    <Form.FormItem onPress={() => setOpen(!open)}>
      <Form.HStack style={{ flexWrap: "wrap" }}>
        <Form.Text>{children}</Form.Text>
        {/* Spacer */}
        <View style={{ flex: 1 }} />
        {open && (
          <IconSymbol
            name={open ? "chevron.up" : "chevron.down"}
            size={16}
            color={AC.systemGray}
          />
        )}
        {/* Right */}
        <Form.Text style={{ flexShrink: 1, color: AC.secondaryLabel }}>
          {open ? hint : preview}
        </Form.Text>
        {!open && (
          <IconSymbol
            name={open ? "chevron.up" : "chevron.down"}
            size={16}
            color={AC.systemGray}
          />
        )}
      </Form.HStack>
    </Form.FormItem>
  );
}

function FormLabel({
  children,
  systemImage,
  color,
}: {
  /** Only used when `<FormLabel />` is a direct child of `<Section />`. */
  onPress?: () => void;
  children: React.ReactNode;
  systemImage: ComponentProps<typeof IconSymbol>["name"];
  color?: OpaqueColorValue;
}) {
  return (
    <Form.HStack style={{ gap: 16 }}>
      <IconSymbol name={systemImage} size={28} color={color ?? AC.systemBlue} />
      <Text style={Form.FormFont.default}>{children}</Text>
    </Form.HStack>
  );
}

function SegmentsTest() {
  return (
    <View style={{ flex: 1 }}>
      <Segments defaultValue="account">
        <SegmentsList>
          <SegmentsTrigger value="account">Account</SegmentsTrigger>
          <SegmentsTrigger value="password">Password</SegmentsTrigger>
        </SegmentsList>

        <SegmentsContent value="account">
          <Form.Text style={{ paddingVertical: 12 }}>Account Section</Form.Text>
        </SegmentsContent>
        <SegmentsContent value="password">
          <Form.Text style={{ paddingVertical: 12 }}>
            Password Section
          </Form.Text>
        </SegmentsContent>
      </Segments>
    </View>
  );
}

function TripleItemTest() {
  return (
    <>
      <HorizontalItem title="Streak" badge="650" subtitle="Days" />

      <View
        style={{
          backgroundColor: AC.separator,
          width: 0.5,
          maxHeight: "50%",
          minHeight: "50%",
          marginVertical: "auto",
        }}
      />

      <HorizontalItem
        title="Developer"
        badge={
          <IconSymbol
            name="person.text.rectangle"
            size={28}
            weight="bold"
            animationSpec={{
              effect: {
                type: "pulse",
              },
              repeating: true,
            }}
            color={AC.secondaryLabel}
          />
        }
        subtitle="Evan Bacon"
      />

      <View
        style={{
          backgroundColor: AC.separator,
          width: 0.5,
          maxHeight: "50%",
          minHeight: "50%",
          marginVertical: "auto",
        }}
      />

      <HorizontalItem title="Version" badge="3.6" subtitle="Build 250" />
    </>
  );
}

function HorizontalItem({
  title,
  badge,
  subtitle,
}: {
  title: string;
  badge: React.ReactNode;
  subtitle: string;
}) {
  return (
    <View style={{ alignItems: "center", gap: 4, flex: 1 }}>
      <Form.Text
        style={{
          textTransform: "uppercase",
          fontSize: 10,
          fontWeight: "600",
          color: AC.secondaryLabel,
        }}
      >
        {title}
      </Form.Text>
      {typeof badge === "string" ? (
        <Form.Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: AC.secondaryLabel,
          }}
        >
          {badge}
        </Form.Text>
      ) : (
        badge
      )}

      <Form.Text
        style={{
          fontSize: 12,
          color: AC.secondaryLabel,
        }}
      >
        {subtitle}
      </Form.Text>
    </View>
  );
}
