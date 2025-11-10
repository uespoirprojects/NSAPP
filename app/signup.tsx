import { Typography } from "@/components/ui";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/contexts/auth-context";
import { useI18n } from "@/contexts/i18n-context";
import { useTheme } from "@/contexts/theme-context";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { signUp } from "@/services/authService";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignupScreen() {
  const colors = useThemeColors();
  const { t } = useI18n();
  const { effectiveTheme } = useTheme();
  const { setIsAuthenticated, setIsGuest } = useAuth();
  const router = useRouter();

  // Use white border in dark mode, grey in light mode
  const borderColor = effectiveTheme === "dark" ? colors.white : colors.grey;

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [city, setCity] = React.useState("");
  const [province, setProvince] = React.useState("");
  const [dateOfBirth, setDateOfBirth] = React.useState("");
  const [dateOfBirthDate, setDateOfBirthDate] = React.useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    address?: string;
    city?: string;
    province?: string;
    dateOfBirth?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/;

    if (!firstName.trim()) newErrors.firstName = t("signup.firstNameRequired");
    if (!lastName.trim()) newErrors.lastName = t("signup.lastNameRequired");
    if (!emailRegex.test(email.trim()))
      newErrors.email = t("signup.invalidEmail");
    if (!password || password.length < 6)
      newErrors.password = t("signup.passwordMinLength");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    try {
      setIsSubmitting(true);

      // 🔥 Appel à Firebase au lieu de la simulation
      const result = await signUp(email, password, {
        firstName,
        lastName,
        address,
        city,
        province,
        dateOfBirth,
      });

      if (result.success) {
        await setIsAuthenticated(true);
        await setIsGuest(false);
        router.push("/(tabs)/home");
      } else {
        // Afficher l'erreur dans le champ email (ou global)
        setErrors({ email: result.error || t("signup.genericError") });
      }
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({ email: t("signup.genericError") });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.screenBackground }}
      edges={["top", "bottom", "left", "right"]}
    >
    <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
    >
      <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingVertical: 50,
            justifyContent: "center",
            alignItems: "center",
          }}
        showsVerticalScrollIndicator={false}
      >
          <View style={{ width: "100%", maxWidth: 420 }}>
        {/* Heading */}
            <View style={{ marginBottom: 40, alignItems: "center" }}>
              <Typography variant="h1" color={colors.blue}>
                {t("signup.title")}
          </Typography>
              <Text
                style={{
                  color: colors.text,
                  opacity: 0.7,
                  marginTop: 4,
                  textAlign: "center",
                }}
              >
                {t("signup.subtitle")}
          </Text>
        </View>

        {/* Name Inputs */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  color: colors.text,
                  marginBottom: 8,
                  fontFamily: "Poppins-Medium",
                }}
              >
                {t("signup.firstName")}
              </Text>
          <TextInput
                placeholder={t("signup.firstNamePlaceholder")}
                placeholderTextColor={
                  effectiveTheme === "dark" ? colors.whiteSmoke : colors.grey
                }
                value={firstName}
                onChangeText={setFirstName}
                style={{
                  borderWidth: 1,
                  borderColor: errors.firstName ? colors.red : borderColor,
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  color: colors.text,
                  fontFamily: "Poppins-Regular",
                  backgroundColor: colors.cardBackground,
                }}
              />
              {errors.firstName ? (
                <Text
                  style={{
                    color: colors.red,
                    marginTop: 6,
                    fontFamily: "Poppins-Regular",
                  }}
                >
                  {errors.firstName}
                </Text>
              ) : null}
        </View>

            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  color: colors.text,
                  marginBottom: 8,
                  fontFamily: "Poppins-Medium",
                }}
              >
                {t("signup.lastName")}
              </Text>
          <TextInput
                placeholder={t("signup.lastNamePlaceholder")}
                placeholderTextColor={
                  effectiveTheme === "dark" ? colors.whiteSmoke : colors.grey
                }
                value={lastName}
                onChangeText={setLastName}
                style={{
                  borderWidth: 1,
                  borderColor: errors.lastName ? colors.red : borderColor,
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  color: colors.text,
                  fontFamily: "Poppins-Regular",
                  backgroundColor: colors.cardBackground,
                }}
              />
              {errors.lastName ? (
                <Text
                  style={{
                    color: colors.red,
                    marginTop: 6,
                    fontFamily: "Poppins-Regular",
                  }}
                >
                  {errors.lastName}
                </Text>
              ) : null}
        </View>

        {/* Email Input */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  color: colors.text,
                  marginBottom: 8,
                  fontFamily: "Poppins-Medium",
                }}
              >
                {t("signup.email")}
              </Text>
          <TextInput
                placeholder={t("signup.emailPlaceholder")}
                placeholderTextColor={
                  effectiveTheme === "dark" ? colors.whiteSmoke : colors.grey
                }
                value={email}
                onChangeText={setEmail}
            keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  borderWidth: 1,
                  borderColor: errors.email ? colors.red : borderColor,
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  color: colors.text,
                  fontFamily: "Poppins-Regular",
                  backgroundColor: colors.cardBackground,
                }}
              />
              {errors.email ? (
                <Text
                  style={{
                    color: colors.red,
                    marginTop: 6,
                    fontFamily: "Poppins-Regular",
                  }}
                >
                  {errors.email}
                </Text>
              ) : null}
        </View>

        {/* Password Input */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  color: colors.text,
                  marginBottom: 8,
                  fontFamily: "Poppins-Medium",
                }}
              >
                {t("signup.password")}
              </Text>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: errors.password ? colors.red : borderColor,
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 0,
                  backgroundColor: colors.cardBackground,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
          <TextInput
                  placeholder={t("signup.passwordPlaceholder")}
                  placeholderTextColor={
                    effectiveTheme === "dark" ? colors.whiteSmoke : colors.grey
                  }
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    color: colors.text,
                    fontFamily: "Poppins-Regular",
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  style={{ paddingVertical: 8, paddingLeft: 12 }}
                >
                  <IconSymbol
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color={colors.blue}
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text
                  style={{
                    color: colors.red,
                    marginTop: 6,
                    fontFamily: "Poppins-Regular",
                  }}
                >
                  {errors.password}
                </Text>
              ) : null}
        </View>

        {/* Address Input */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  color: colors.text,
                  marginBottom: 8,
                  fontFamily: "Poppins-Medium",
                }}
              >
                {t("signup.address")}
              </Text>
          <TextInput
                placeholder={t("signup.addressPlaceholder")}
                placeholderTextColor={
                  effectiveTheme === "dark" ? colors.whiteSmoke : colors.grey
                }
                value={address}
                onChangeText={setAddress}
                style={{
                  borderWidth: 1,
                  borderColor: errors.address ? colors.red : borderColor,
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  color: colors.text,
                  fontFamily: "Poppins-Regular",
                  backgroundColor: colors.cardBackground,
                }}
              />
              {errors.address ? (
                <Text
                  style={{
                    color: colors.red,
                    marginTop: 6,
                    fontFamily: "Poppins-Regular",
                  }}
                >
                  {errors.address}
                </Text>
              ) : null}
        </View>

        {/* City Input */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  color: colors.text,
                  marginBottom: 8,
                  fontFamily: "Poppins-Medium",
                }}
              >
                {t("signup.city")}
              </Text>
          <TextInput
                placeholder={t("signup.cityPlaceholder")}
                placeholderTextColor={
                  effectiveTheme === "dark" ? colors.whiteSmoke : colors.grey
                }
                value={city}
                onChangeText={setCity}
                style={{
                  borderWidth: 1,
                  borderColor: errors.city ? colors.red : borderColor,
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  color: colors.text,
                  fontFamily: "Poppins-Regular",
                  backgroundColor: colors.cardBackground,
                }}
              />
              {errors.city ? (
                <Text
                  style={{
                    color: colors.red,
                    marginTop: 6,
                    fontFamily: "Poppins-Regular",
                  }}
                >
                  {errors.city}
                </Text>
              ) : null}
        </View>

        {/* Province Input */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  color: colors.text,
                  marginBottom: 8,
                  fontFamily: "Poppins-Medium",
                }}
              >
                {t("signup.province")}
              </Text>
          <TextInput
                placeholder={t("signup.provincePlaceholder")}
                placeholderTextColor={
                  effectiveTheme === "dark" ? colors.whiteSmoke : colors.grey
                }
                value={province}
                onChangeText={setProvince}
                style={{
                  borderWidth: 1,
                  borderColor: errors.province ? colors.red : borderColor,
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  color: colors.text,
                  fontFamily: "Poppins-Regular",
                  backgroundColor: colors.cardBackground,
                }}
              />
              {errors.province ? (
                <Text
                  style={{
                    color: colors.red,
                    marginTop: 6,
                    fontFamily: "Poppins-Regular",
                  }}
                >
                  {errors.province}
                </Text>
              ) : null}
        </View>

        {/* Date of Birth Input */}
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  color: colors.text,
                  marginBottom: 8,
                  fontFamily: "Poppins-Medium",
                }}
              >
                {t("signup.dateOfBirth")}
              </Text>
              {Platform.OS === "web" ? (
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: errors.dateOfBirth ? colors.red : borderColor,
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: colors.cardBackground,
                    flexDirection: "row",
                    alignItems: "center",
                    position: 'relative',
                  }}
                >
                  {/* Web: Styled date input */}
                  {/* @ts-ignore - input type="date" is valid for web */}
                  <input
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    value={dateOfBirthDate ? dateOfBirthDate.toISOString().split('T')[0] : ''}
                    onChange={(e: any) => {
                      if (e.target.value) {
                        const selectedDate = new Date(e.target.value);
                        setDateOfBirthDate(selectedDate);
                        // Format as DD/MM/YYYY
                        const day = String(selectedDate.getDate()).padStart(2, "0");
                        const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
                        const year = selectedDate.getFullYear();
                        setDateOfBirth(`${day}/${month}/${year}`);
                      }
                    }}
                    placeholder={t("signup.dateOfBirthPlaceholder")}
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      backgroundColor: 'transparent',
                      color: dateOfBirth ? colors.text : (effectiveTheme === "dark" ? colors.whiteSmoke : colors.grey),
                      fontFamily: 'Poppins-Regular',
                      fontSize: 16,
                      padding: 0,
                      margin: 0,
                      cursor: 'pointer',
                    }}
                  />
                  <IconSymbol
                    name="calendar-outline"
                    size={22}
                    color={colors.blue}
                    style={{ marginLeft: 8 }}
                  />
                </View>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={{
                      borderWidth: 1,
                      borderColor: errors.dateOfBirth ? colors.red : borderColor,
                      borderRadius: 16,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      backgroundColor: colors.cardBackground,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        color: dateOfBirth ? colors.text : (effectiveTheme === "dark" ? colors.whiteSmoke : colors.grey),
                        fontFamily: "Poppins-Regular",
                        flex: 1,
                      }}
                    >
                      {dateOfBirth || t("signup.dateOfBirthPlaceholder")}
                    </Text>
                    <IconSymbol
                      name="calendar-outline"
                      size={22}
                      color={colors.blue}
                    />
                  </TouchableOpacity>
                  
                  {/* Date Picker for Native Platforms */}
                  {showDatePicker && (
                    Platform.OS === "ios" ? (
                      <View style={{ marginTop: 12 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                          <TouchableOpacity
                            onPress={() => setShowDatePicker(false)}
                            style={{
                              paddingVertical: 8,
                              paddingHorizontal: 16,
                            }}
                          >
                            <Text style={{ color: colors.blue, fontFamily: "Poppins-Medium" }}>
                              {t("common.cancel") || "Cancel"}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              if (dateOfBirthDate) {
                                // Format as DD/MM/YYYY
                                const day = String(dateOfBirthDate.getDate()).padStart(2, "0");
                                const month = String(dateOfBirthDate.getMonth() + 1).padStart(2, "0");
                                const year = dateOfBirthDate.getFullYear();
                                setDateOfBirth(`${day}/${month}/${year}`);
                              }
                              setShowDatePicker(false);
                            }}
                            style={{
                              paddingVertical: 8,
                              paddingHorizontal: 16,
                            }}
                          >
                            <Text style={{ color: colors.blue, fontFamily: "Poppins-Bold" }}>
                              {t("common.done") || "Done"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <DateTimePicker
                          value={dateOfBirthDate || new Date()}
                          mode="date"
                          display="spinner"
                          maximumDate={new Date()}
                          onChange={(event: any, selectedDate?: Date) => {
                            if (selectedDate) {
                              setDateOfBirthDate(selectedDate);
                            }
                          }}
                          style={{ backgroundColor: colors.cardBackground }}
                        />
                      </View>
                    ) : (
                      <DateTimePicker
                        value={dateOfBirthDate || new Date()}
                        mode="date"
                        display="default"
                        maximumDate={new Date()}
                        onChange={(event: any, selectedDate?: Date) => {
                          setShowDatePicker(false);
                          if (event.type === "set" && selectedDate) {
                            setDateOfBirthDate(selectedDate);
                            // Format as DD/MM/YYYY
                            const day = String(selectedDate.getDate()).padStart(2, "0");
                            const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
                            const year = selectedDate.getFullYear();
                            setDateOfBirth(`${day}/${month}/${year}`);
                          }
                        }}
                      />
                    )
                  )}
                </>
              )}
              {errors.dateOfBirth ? (
                <Text
                  style={{
                    color: colors.red,
                    marginTop: 6,
                    fontFamily: "Poppins-Regular",
                  }}
                >
                  {errors.dateOfBirth}
                </Text>
              ) : null}
        </View>

        {/* Sign Up Button */}
            <TouchableOpacity
              onPress={handleSignUp}
              disabled={isSubmitting}
              style={{
                backgroundColor: colors.blue,
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
                marginBottom: 16,
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              <Text
                style={{
                  color: colors.white,
                  fontFamily: "Poppins-Bold",
                  fontSize: 16,
                }}
              >
                {t("signup.signUp")}
              </Text>
        </TouchableOpacity>

        {/* OR Continue with */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 24,
              }}
            >
              <View
                style={{ flex: 1, height: 1, backgroundColor: colors.grey }}
              />
              <Text
                style={{
                  marginHorizontal: 12,
                  color: colors.text,
                  opacity: 0.7,
                  fontFamily: "Poppins-Regular",
                }}
              >
                {t("signup.orSignUp")}
          </Text>
              <View
                style={{ flex: 1, height: 1, backgroundColor: colors.grey }}
              />
        </View>

        {/* Social Buttons */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                gap: 20,
                marginBottom: 32,
              }}
            >
              <TouchableOpacity
                style={{
                  padding: 12,
                  borderWidth: 1,
                  borderColor: colors.grey,
                  borderRadius: 16,
                }}
              >
            <Image
                  source={require("@/assets/icons/google.png")}
                  style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
          </TouchableOpacity>

              <TouchableOpacity
                style={{
                  padding: 12,
                  borderWidth: 1,
                  borderColor: colors.grey,
                  borderRadius: 16,
                }}
              >
            <Image
                  source={require("@/assets/icons/apple.png")}
                  style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
          </TouchableOpacity>

              <TouchableOpacity
                style={{
                  padding: 12,
                  borderWidth: 1,
                  borderColor: colors.grey,
                  borderRadius: 16,
                }}
              >
            <Image
                  source={require("@/assets/icons/facebook.png")}
                  style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Link to Login */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginBottom: 40,
              }}
            >
              <Text
                style={{ color: colors.text, fontFamily: "Poppins-Regular" }}
              >
                {t("signup.hasAccount")}{" "}
              </Text>
              <TouchableOpacity onPress={() => (router.push as any)("/login")}>
                <Text
                  style={{ color: colors.blue, fontFamily: "Poppins-Bold" }}
                >
                  {t("signup.signIn")}
          </Text>
          </TouchableOpacity>
            </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
