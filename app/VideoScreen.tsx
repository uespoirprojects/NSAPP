import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  FlatList,
  Alert,
  StyleSheet,
  Animated,
} from "react-native";

interface Lesson {
  id: number;
  title: string;
  duration: string;
  completed: boolean;
  videoUrl: string;
}

interface Subject {
  id: number;
  name: string;
  totalLessons: number;
  completedLessons: number;
  lessons: Lesson[];
}

// 🔹 Définir les props du composant avec navigation typée
interface VideoScreenProps {
  navigation: {
    goBack: () => void;
    navigate: (screenName: string, params?: object) => void;
  };
}

const { width } = Dimensions.get("window");
const SIDEBAR_WIDTH = width * 0.75;

// --- Mock Data : on ne garde que Mathematics ---
const mathSubject: Subject = {
  id: 1,
  name: "Mathematics",
  totalLessons: 5,
  completedLessons: 1,
  lessons: [
    {
      id: 101,
      title: "Introduction to Algebra",
      duration: "12:30",
      completed: true,
      videoUrl: "...",
    },
    {
      id: 102,
      title: "Linear Equations",
      duration: "15:45",
      completed: false,
      videoUrl: "...",
    },
    {
      id: 103,
      title: "Quadratic Functions",
      duration: "18:20",
      completed: false,
      videoUrl: "...",
    },
    {
      id: 104,
      title: "Geometry Basics",
      duration: "14:10",
      completed: false,
      videoUrl: "...",
    },
    {
      id: 105,
      title: "Trigonometry Fundamentals",
      duration: "20:15",
      completed: false,
      videoUrl: "...",
    },
  ],
};

// --- Sidebar : liste des vidéos (leçons) ---
interface LessonSidebarProps {
  lessons: Lesson[];
  selectedLessonId: number;
  onSelectLesson: (lesson: Lesson) => void;
  onClose: () => void;
}

const LessonSidebar: React.FC<LessonSidebarProps> = ({
  lessons,
  selectedLessonId,
  onSelectLesson,
  onClose,
}) => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row justify-between items-center p-4 border-b border-brand-grey">
        <Text className="font-poppins-bold text-xl text-brand-black">
          Vidéos du cours
        </Text>
        <TouchableOpacity onPress={onClose} className="p-2">
          <Text className="font-poppins-bold text-xl text-brand-black">✕</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              onSelectLesson(item);
              onClose();
            }}
            className={`p-4 mb-3 mx-4 rounded-lg ${
              item.id === selectedLessonId
                ? "bg-brand-light-blue border-l-4 border-brand-blue"
                : "bg-brand-white-smoke"
            }`}
          >
            <Text
              className={`font-poppins-semibold text-base ${
                item.id === selectedLessonId
                  ? "text-brand-blue"
                  : "text-brand-black"
              }`}
            >
              {item.title}
            </Text>
            <Text className="font-poppins text-sm text-brand-black mt-1">
              {item.duration}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

// --- Main VideoScreen Component ---
const VideoScreen: React.FC<VideoScreenProps> = ({ navigation }) => {
  const subject = mathSubject;

  const [selectedLesson, setSelectedLesson] = useState<Lesson>(
    subject.lessons[0]
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarAnim = useState(new Animated.Value(-SIDEBAR_WIDTH))[0];

  const progressPercentage = useMemo(() => {
    return (subject.completedLessons / subject.totalLessons) * 100;
  }, [subject]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleTakeQuiz = () => {
    Alert.alert(
      "Inscription Requise",
      "Veuillez vous connecter pour suivre votre progression et passer les quiz.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "S'inscrire",
          onPress: () => {
            navigation.navigate("SignUp");
          },
        },
      ]
    );
  };

  const openSidebar = () => {
    setIsSidebarOpen(true);
    Animated.timing(sidebarAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSidebar = () => {
    Animated.timing(sidebarAnim, {
      toValue: -SIDEBAR_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsSidebarOpen(false));
  };

  // ... [tout le code jusqu'à return reste identique] ...

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-brand-grey">
        <TouchableOpacity onPress={handleBackPress} className="p-2 mr-3">
          <Text className="font-poppins-bold text-xl text-brand-black">←</Text>
        </TouchableOpacity>

        <View className="flex-1">
          <Text className="font-poppins-semibold text-lg text-brand-black mb-1">
            {subject.name}
          </Text>
          <Text className="font-poppins text-sm text-brand-black">
            {subject.completedLessons} of {subject.totalLessons} completed
          </Text>
        </View>

        <TouchableOpacity onPress={openSidebar} className="p-2 ml-3">
          <Text className="font-poppins-bold text-xl text-brand-black">☰</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content - PLUS DE COLONNES, juste la vidéo sélectionnée */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Lecteur vidéo */}
        <View
          className="w-full bg-brand-black rounded-lg mb-4 justify-center items-center overflow-hidden"
          style={{ aspectRatio: 16 / 9 }}
        >
          <View className="w-20 h-20 rounded-full bg-white/30 justify-center items-center">
            <Text className="text-2xl text-white font-poppins-bold">▶</Text>
          </View>
        </View>

        {/* Titre et durée de la vidéo sélectionnée */}
        <Text className="font-poppins-semibold text-lg text-brand-black mb-2">
          {selectedLesson.title}
        </Text>
        <Text className="font-poppins text-base text-brand-black mb-4">
          {selectedLesson.duration}
        </Text>

        {/* Sign Up Reminder */}
        <View className="bg-brand-light-blue px-3 py-3 rounded-lg mb-4">
          <Text className="font-poppins text-base text-brand-black leading-6">
            Sign in to track your progress and take quizzes.
          </Text>
        </View>

        {/* Take Quiz Button */}
        <TouchableOpacity
          onPress={handleTakeQuiz}
          className="bg-white border-2 border-brand-blue py-3 rounded-lg justify-center items-center"
        >
          <Text className="font-poppins-semibold text-base text-brand-blue">
            Take Quiz
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Barre de progression du COURS COMPLET (pas de la leçon) */}
      <View className="px-4 py-3 border-t border-brand-grey">
        <Text className="font-poppins-medium text-sm text-brand-black mb-2">
          Course Progress
        </Text>
        <View className="w-full h-2 bg-brand-grey rounded-full overflow-hidden mb-2">
          <View
            className="h-full bg-brand-blue rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </View>
        <Text className="font-poppins text-sm text-brand-black text-right">
          {Math.round(progressPercentage)}%
        </Text>
      </View>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={closeSidebar}
          style={StyleSheet.absoluteFill}
          className="bg-brand-black/50"
        >
          <Animated.View
            style={{
              transform: [{ translateX: sidebarAnim }],
              width: SIDEBAR_WIDTH,
              height: "100%",
            }}
            className="absolute top-0 left-0 bg-white shadow-2xl"
          >
            <LessonSidebar
              lessons={subject.lessons}
              selectedLessonId={selectedLesson.id}
              onSelectLesson={setSelectedLesson}
              onClose={closeSidebar}
            />
          </Animated.View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default VideoScreen;
