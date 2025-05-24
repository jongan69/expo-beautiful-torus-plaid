import * as Form from "@/components/ui/Form";
import Stack from "@/components/ui/Stack";
import * as AC from "@bacons/apple-colors";
import { Link } from "expo-router";
import { Text, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from "react-native-reanimated";

export default function Page() {
  const ref = useAnimatedRef();
  const scroll = useScrollViewOffset(ref);
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scroll.value, [-120, -70], [50, 0], "clamp") },
    ],
  }));

  return (
    <Form.List ref={ref} navigationTitle="Bottom Sheet">
      {process.env.EXPO_OS !== "web" && (
        <Stack.Screen
          options={{
            headerLeft: () => (
              <View
                style={{
                  overflow: "hidden",
                  paddingBottom: 10,
                  marginBottom: -10,
                }}
              >
                <Animated.View style={style}>
                  <Text
                    style={{
                      color: AC.label,
                      fontWeight: "bold",
                      fontSize: 20,
                    }}
                  >
                    Bottom Sheet
                  </Text>
                </Animated.View>
              </View>
            ),
            headerTitle() {
              return <></>;
            },
          }}
        />
      )}

      <Form.Section
        title="Vision"
        footer={
          <Text>
            Help improve Search by allowing Apple to store the searches you
            enter into Safari, Siri, and Spotlight in a way that is not linked
            to you.{"\n\n"}Searches include lookups of general knowledge, and
            requests to do things like play music and get directions.{"\n"}
            <Link style={{ color: AC.link }} href="/two">
              About Search & Privacy...
            </Link>
          </Text>
        }
      >
        <Text>Default</Text>
        <Form.Text hint="Right">Hint</Form.Text>
        <Text
          onPress={() => {
            console.log("Hey");
          }}
        >
          Pressable
        </Text>

        <Text style={{ fontWeight: "bold", color: AC.systemPink }}>
          Custom style
        </Text>
        <Form.Text bold>Bold</Form.Text>

        <View>
          <Text>Wrapped</Text>
        </View>

        {/* Table style: | A   B |*/}
        <Form.HStack>
          <Text style={Form.FormFont.default}>Foo</Text>
          <View style={{ flex: 1 }} />
          <Text style={Form.FormFont.secondary}>Bar</Text>
        </Form.HStack>
      </Form.Section>
    </Form.List>
  );
}
