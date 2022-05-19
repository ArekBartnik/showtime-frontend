import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";

import { FilePickerResolveValue } from "design-system/file-picker";
import { useIsDarkMode } from "design-system/hooks";
import { Flip, Close, Check } from "design-system/icon";
import { ImagePickerButton } from "design-system/image-picker";
import { PressableScale } from "design-system/pressable-scale";
import { View } from "design-system/view";

type Props = {
  photos: { uri: string }[];
  setPhotos: (photos: { uri: string }[]) => void;
  canPop: boolean;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  takePhoto: () => void;
  cameraPosition: "front" | "back";
  setCameraPosition: (cameraPosition: "front" | "back") => void;
  postPhoto: (param: FilePickerResolveValue) => void;
};

export function CameraButtons({
  photos,
  setPhotos,
  canPop,
  isLoading,
  setIsLoading,
  takePhoto,
  cameraPosition,
  setCameraPosition,
  postPhoto,
}: Props) {
  const isDark = useIsDarkMode();

  return (
    <View tw="flex-row items-center justify-between py-8 px-6">
      {isLoading ? (
        <Animated.View
          entering={SlideInDown}
          exiting={SlideOutDown}
          style={{ zIndex: 1 }}
        >
          <PressableScale
            tw="h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-black"
            onPress={() => {
              setPhotos([]);
              setIsLoading(false);
            }}
          >
            <Close color={isDark ? "#fff" : "#000"} width={24} height={24} />
          </PressableScale>
        </Animated.View>
      ) : (
        <ImagePickerButton
          onPick={(photo) => {
            postPhoto(photo);
          }}
          type="camera"
        />
      )}

      <View tw="h-[83px] w-[83px] items-center justify-center">
        <View tw="absolute">
          <View tw="h-20 w-20 rounded-full bg-black dark:bg-white" />
        </View>

        <View tw="rounded-full border-4 border-white bg-white dark:border-black dark:bg-black">
          <PressableScale
            tw="h-[64px] w-[64px] rounded-full bg-black dark:bg-white"
            onPress={takePhoto}
            disabled={!canPop && photos.length < 9}
          />
        </View>
      </View>

      {isLoading ? (
        <Animated.View
          entering={SlideInDown}
          exiting={SlideOutDown}
          style={{ zIndex: 1 }}
        >
          <View tw="h-12 w-12 items-center justify-center">
            {/* <View tw="absolute">
              <CircularProgress
                size={50}
                strokeWidth={1.5}
                progress={loading}
                showOverlay={false}
                strokeColor="black"
              />
            </View> */}

            <PressableScale
              tw="z-10 h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-black"
              onPress={() => {
                postPhoto({ file: photos[0].uri, type: "image" });
              }}
            >
              <Check color={isDark ? "#fff" : "#000"} width={24} height={24} />
            </PressableScale>
          </View>
        </Animated.View>
      ) : (
        <PressableScale
          tw="h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-black"
          onPress={() =>
            setCameraPosition(cameraPosition === "front" ? "back" : "front")
          }
        >
          <Flip color={isDark ? "#fff" : "#000"} width={24} height={24} />
        </PressableScale>
      )}
    </View>
  );
}
