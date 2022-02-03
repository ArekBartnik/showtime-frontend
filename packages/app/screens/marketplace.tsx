import { View, Text } from "design-system";
import { withColorScheme } from "app/components/memo-with-theme";

const MarketplaceScreen = withColorScheme(() => {
  return (
    <View tw="p-4">
      <Text variant="text-xl" tw="font-bold text-black dark:text-white">
        Discover
      </Text>
      <View tw="h-3" />
      <Text tw="font-semibold text-gray-600 dark:text-gray-400">
        🚧 Coming soon
      </Text>
    </View>
  );
});

export { MarketplaceScreen };
