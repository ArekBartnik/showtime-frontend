import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal, Platform } from "react-native";

import Animated, { FadeIn } from "react-native-reanimated";
import { useTailwind } from "tailwindcss-react-native";

import { SafeAreaView } from "app/lib/safe-area";
import { useSafeAreaInsets } from "app/lib/safe-area";
import { yup } from "app/lib/yup";

import { CountryCodePicker, PressableScale, Text, View } from "design-system";
import { Button } from "design-system/button";
import data from "design-system/country-code-picker/country-code-data";
import { useIsDarkMode } from "design-system/hooks";
import { ChevronLeft, Close, Search } from "design-system/icon";
import { Input } from "design-system/input";

import { LoginInputField } from "./login-input-field";

type PhoneNumberPickerProp = {
  handleSubmitPhoneNumber: any;
};

export const PhoneNumberPicker = (props: PhoneNumberPickerProp) => {
  const tailwind = useTailwind();
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("US");

  const selectedCountry = useMemo(() => {
    return data.find((item) => item.code === country);
  }, [country]);

  const phoneNumberValidationSchema = useMemo(
    () =>
      yup
        .object({
          data: yup
            .number()
            .required("Please enter a valid phone number.")
            .typeError("Please enter a valid phone number."),
        })
        .required(),
    []
  );

  const filteredData = useMemo(() => {
    return search
      ? data.filter((item) => {
          return item.name.toLowerCase().includes(search.toLowerCase());
        })
      : data;
  }, [search]);

  return (
    <>
      <Modal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        animationType="slide"
      >
        <SafeAreaView style={tailwind("dark:bg-black")}>
          <Header
            title="Select country"
            close={() => setModalVisible(false)}
            onSearchSubmit={(value) => setSearch(value)}
          />
        </SafeAreaView>
        <CountryCodePicker
          data={filteredData}
          value={country}
          onChange={useCallback((value) => {
            setCountry(value);
            setModalVisible(false);
          }, [])}
        />
      </Modal>
      <LoginInputField
        key="login-phone-number-field"
        validationSchema={phoneNumberValidationSchema}
        label="Phone number"
        placeholder="Enter your phone number"
        keyboardType="numeric"
        signInButtonLabel="Send"
        leftElement={useMemo(() => {
          return (
            <PressableScale
              onPress={() => {
                setSearch("");
                setModalVisible(true);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              tw={`mt-[${Platform.select({
                ios: ".6",
                android: ".25",
                default: "0",
              })}rem] h-7 flex-row items-center justify-center`}
            >
              <Text
                style={{
                  marginTop: Platform.select({
                    ios: 2,
                    android: -4,
                    default: 0,
                  }),
                  marginRight: 1,
                }}
              >
                {selectedCountry?.emoji}
              </Text>
              <Text tw="text-base font-semibold text-gray-600 dark:text-gray-400">
                {selectedCountry?.dial_code}{" "}
              </Text>
            </PressableScale>
          );
        }, [selectedCountry])}
        onSubmit={useCallback(
          (v) => props.handleSubmitPhoneNumber(selectedCountry?.dial_code + v),
          [props, selectedCountry]
        )}
      />
    </>
  );
};

type Props = {
  title?: string;
  close?: () => void;
  onSearchSubmit: (search: string) => void;
};

export function Header({ title, close, onSearchSubmit }: Props) {
  const tailwind = useTailwind();
  const isDark = useIsDarkMode();
  const [showSearch, setShowSearch] = useState(true);
  const searchDebounceTimeout = useRef<any>(null);
  const { top: safeAreaTop } = useSafeAreaInsets();

  const handleSearch = (text: string) => {
    if (searchDebounceTimeout.current) {
      clearTimeout(searchDebounceTimeout.current);
    }
    searchDebounceTimeout.current = setTimeout(() => {
      onSearchSubmit(text);
    }, 40);
  };

  useEffect(() => {
    if (!showSearch) {
      onSearchSubmit("");
    }
  }, [showSearch, onSearchSubmit]);

  return (
    <View
      tw={`mt-[${safeAreaTop}px] w-full flex-row items-center px-4 py-2 dark:bg-black`}
    >
      <View tw="h-12 w-12 items-center justify-center">
        <Button
          onPress={close}
          variant="tertiary"
          tw="h-12 w-12 rounded-full"
          iconOnly={true}
        >
          <ChevronLeft
            width={24}
            height={24}
            color={isDark ? "#fff" : "#000"}
          />
        </Button>
      </View>

      <Animated.View layout={FadeIn} style={tailwind("flex-1 mx-2")}>
        {showSearch ? (
          <Input placeholder="Search" autoFocus onChangeText={handleSearch} />
        ) : (
          <Text tw="font-space-bold px-4 text-lg font-bold dark:text-white">
            {title}
          </Text>
        )}
      </Animated.View>
      <View tw="h-12 w-12 items-center justify-center">
        <Button
          onPress={() => setShowSearch(!showSearch)}
          variant="tertiary"
          tw="h-12 w-12 rounded-full"
          iconOnly={true}
        >
          {showSearch ? (
            <Close width={24} height={24} color={isDark ? "#fff" : "#000"} />
          ) : (
            <Search width={24} height={24} color={isDark ? "#fff" : "#000"} />
          )}
        </Button>
      </View>
    </View>
  );
}
