import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const COLORS = {
  bg: "#F4F7FB",
  card: "#FFFFFF",
  navy: "#0F1A33",
  navy2: "#1C2844",
  blue: "#39B7EE",
  blueDark: "#249ED7",
  blueSoft: "#DDF3FD",
  green: "#54C98B",
  greenDark: "#237C50",
  red: "#F06F78",
  redSoft: "#FFF0F1",
  purpleSoft: "#EDE9FF",
  text: "#111A2E",
  text2: "#687287",
  text3: "#9AA4B6",
  line: "#E4EAF2",
  input: "#F2F5F9",
  white: "#FFFFFF",
  shadow: "#22314F",
};

const STORAGE_KEY = "@cora_wealth_local_v1";

const DEFAULT_CATEGORIES = [
  "Comida",
  "Transporte",
  "Hogar",
  "Salud",
  "Entretenimiento",
  "Suscripciones",
  "Compras",
  "Educación",
  "Otros",
];

const TYPE_META = {
  income: { label: "Ingreso", color: COLORS.green, icon: "↓" },
  expense: { label: "Gasto", color: COLORS.red, icon: "↑" },
  saving: { label: "Ahorro", color: COLORS.blue, icon: "✦" },
};

const DAYS = ["L", "M", "M", "J", "V", "S", "D"];

const money = (value) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const numeric = (value) => {
  const clean = String(value ?? "").replace(/[^0-9.]/g, "");
  const parsed = Number.parseFloat(clean);
  return Number.isFinite(parsed) ? parsed : 0;
};

const isoDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

const monthKey = (date = new Date()) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const formatDate = (value) =>
  new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createSeedTransactions = () => [
  { id: makeId(), type: "income", amount: 20000, category: "Salario", note: "Ingreso mensual", date: isoDaysAgo(3) },
  { id: makeId(), type: "expense", amount: 2500, category: "Comida", note: "Supermercado", date: isoDaysAgo(2) },
  { id: makeId(), type: "expense", amount: 2200, category: "Hogar", note: "Servicios y casa", date: isoDaysAgo(5) },
  { id: makeId(), type: "expense", amount: 1200, category: "Transporte", note: "Traslados", date: isoDaysAgo(6) },
  { id: makeId(), type: "expense", amount: 1600, category: "Comida", note: "Comidas fuera", date: isoDaysAgo(8) },
  { id: makeId(), type: "expense", amount: 1200, category: "Entretenimiento", note: "Fin de semana", date: isoDaysAgo(4) },
  { id: makeId(), type: "expense", amount: 900, category: "Suscripciones", note: "Servicios digitales", date: isoDaysAgo(10) },
  { id: makeId(), type: "expense", amount: 900, category: "Compras", note: "Compra personal", date: isoDaysAgo(12) },
  { id: makeId(), type: "saving", amount: 1000, category: "Ahorro", note: "Meta mensual", date: isoDaysAgo(1) },
];

const INITIAL_STATE = {
  onboardingDone: false,
  mood: "Curioso/a",
  goal: "Tener control",
  monthlyIncome: 20000,
  savingsGoal: 4000,
  transactions: createSeedTransactions(),
};

function LogoMark({ compact = false }) {
  return (
    <View style={[styles.logoWrap, compact && { transform: [{ scale: 0.82 }] }]}>
      <View style={styles.logoLeafCenter} />
      <View style={[styles.logoLeafSide, { transform: [{ rotate: "-34deg" }, { translateX: -10 }] }]} />
      <View style={[styles.logoLeafSide, { transform: [{ rotate: "34deg" }, { translateX: 10 }] }]} />
      <View style={styles.logoStem} />
    </View>
  );
}

function Brand({ compact = false }) {
  return (
    <View style={styles.brandRow}>
      <LogoMark compact={compact} />
      <View>
        <Text style={[styles.brandCora, compact && { fontSize: 17 }]}>CORA</Text>
        <Text style={[styles.brandWealth, compact && { fontSize: 17 }]}>WEALTH</Text>
      </View>
    </View>
  );
}

function AnimatedBar({ value, max = 1, color, label, rightText, targetText }) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const percent = Math.max(0, Math.min(value / max, 1));

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: percent * 100,
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, [percent, widthAnim]);

  return (
    <View style={{ marginBottom: 17 }}>
      <View style={styles.barHeader}>
        <Text style={styles.barTitle}>{label}</Text>
        <Text style={styles.barValue}>{rightText} <Text style={styles.barTarget}>/ {targetText}</Text></Text>
      </View>
      <View style={styles.barTrack}>
        <Animated.View
          style={[
            styles.barFill,
            { backgroundColor: color, width: widthAnim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }) },
          ]}
        />
        <Text style={styles.barPercent}>{Math.round(percent * 100)}%</Text>
      </View>
    </View>
  );
}

function PillButton({ label, onPress, active = false }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.pill, active && styles.pillActive]}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function IconCircle({ symbol, color = COLORS.blueSoft, textColor = COLORS.blue, size = 42 }) {
  return (
    <View style={[styles.iconCircle, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
      <Text style={[styles.iconCircleText, { color: textColor }]}>{symbol}</Text>
    </View>
  );
}

function ModalShell({ visible, title, subtitle, onClose, children }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ width: "100%" }}>
          <View style={styles.modalCard}>
            <View style={styles.modalHead}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={styles.modalTitle}>{title}</Text>
                {subtitle ? <Text style={styles.modalSubtitle}>{subtitle}</Text> : null}
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>×</Text>
              </TouchableOpacity>
            </View>
            {children}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function SplashScreen({ onDone }) {
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(25)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 45, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(y, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    const timeout = setTimeout(onDone, 2200);
    return () => clearTimeout(timeout);
  }, [onDone, opacity, scale, y]);

  return (
    <View style={styles.splash}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <Animated.View style={{ alignItems: "center", transform: [{ scale }, { translateY: y }], opacity }}>
        <LogoMark />
        <Text style={styles.splashCora}>CORA</Text>
        <Text style={styles.splashWealth}>WEALTH</Text>
        <Text style={styles.splashTag}>Claridad financiera. Calma total.</Text>
      </Animated.View>
      <Animated.View style={{ opacity, marginTop: 80 }}>
        <View style={styles.splashLine} />
        <Text style={styles.splashLocal}>100% local • tus datos se quedan en tu dispositivo</Text>
      </Animated.View>
    </View>
  );
}

function Onboarding({ initialData, onFinish }) {
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState(initialData.mood || "Curioso/a");
  const [goal, setGoal] = useState(initialData.goal || "Tener control");
  const [income, setIncome] = useState(String(initialData.monthlyIncome || 20000));
  const [savingsGoal, setSavingsGoal] = useState(String(initialData.savingsGoal || 4000));
  const progress = ((step + 1) / 4) * 100;

  const next = () => {
    if (step < 3) {
      setStep((s) => s + 1);
      return;
    }
    onFinish({
      mood,
      goal,
      monthlyIncome: numeric(income) || 20000,
      savingsGoal: numeric(savingsGoal) || 4000,
    });
  };

  const stepOne = (
    <>
      <Text style={styles.onboardTitle}>Antes de los números,{"\n"}¿cómo te sientes con tu dinero hoy?</Text>
      <Text style={styles.onboardSubtitle}>Está bien sentirse así. Reconocerlo es el primer paso para ganar claridad.</Text>
      {["Abrumado/a", "Curioso/a", "Optimista", "Inseguro/a"].map((item, index) => (
        <TouchableOpacity
          key={item}
          style={[styles.optionCard, mood === item && styles.optionCardActive]}
          onPress={() => setMood(item)}
          activeOpacity={0.85}
        >
          <IconCircle
            symbol={["≋", "⊙", "◇", "◇"][index]}
            color={mood === item ? COLORS.blueSoft : "#F5F8FC"}
            textColor={mood === item ? COLORS.blueDark : COLORS.text2}
            size={52}
          />
          <Text style={[styles.optionText, mood === item && { color: COLORS.blueDark }]}>{item}</Text>
          <View style={[styles.radio, mood === item && styles.radioActive]} />
        </TouchableOpacity>
      ))}
    </>
  );

  const stepTwo = (
    <>
      <Text style={styles.onboardTitle}>¿Qué quieres lograr{"\n"}con Cora Wealth?</Text>
      <Text style={styles.onboardSubtitle}>Elegir una prioridad hará que tus decisiones sean más sencillas.</Text>
      {["Tener control", "Ahorrar más", "Salir de deudas", "Planificar mi futuro"].map((item, index) => (
        <TouchableOpacity
          key={item}
          style={[styles.optionCard, goal === item && styles.optionCardActive]}
          onPress={() => setGoal(item)}
          activeOpacity={0.85}
        >
          <IconCircle
            symbol={["⌁", "✦", "↘", "◎"][index]}
            color={goal === item ? COLORS.blueSoft : "#F5F8FC"}
            textColor={goal === item ? COLORS.blueDark : COLORS.text2}
            size={52}
          />
          <Text style={[styles.optionText, goal === item && { color: COLORS.blueDark }]}>{item}</Text>
          <View style={[styles.radio, goal === item && styles.radioActive]} />
        </TouchableOpacity>
      ))}
    </>
  );

  const stepThree = (
    <>
      <Text style={styles.onboardTitle}>Construyamos tu plan{"\n"}con números reales.</Text>
      <Text style={styles.onboardSubtitle}>Estos datos solo se guardarán en este dispositivo y podrás cambiarlos después.</Text>

      <Text style={styles.fieldLabel}>Tus ingresos mensuales aproximados</Text>
      <View style={styles.moneyInput}>
        <Text style={styles.moneySymbol}>$</Text>
        <TextInput
          value={income}
          onChangeText={setIncome}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={COLORS.text3}
          style={styles.moneyInputText}
        />
        <Text style={styles.moneyCurrency}>MXN</Text>
      </View>

      <Text style={styles.fieldLabel}>Tu meta de ahorro inicial</Text>
      <View style={styles.moneyInput}>
        <Text style={styles.moneySymbol}>$</Text>
        <TextInput
          value={savingsGoal}
          onChangeText={setSavingsGoal}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={COLORS.text3}
          style={styles.moneyInputText}
        />
        <Text style={styles.moneyCurrency}>MXN</Text>
      </View>

      <View style={styles.tipBox}>
        <Text style={styles.tipIcon}>✦</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.tipTitle}>Tip de Cora</Text>
          <Text style={styles.tipText}>Prueba primero con una meta pequeña y sostenible. La constancia vale más que la perfección.</Text>
        </View>
      </View>
    </>
  );

  const stepFour = (
    <View>
      <View style={styles.readyBadge}><Text style={styles.readyBadgeText}>¡PERFECTO!</Text></View>
      <Text style={styles.onboardTitle}>Tu espacio para{"\n"}tomar el control.</Text>
      <Text style={styles.onboardSubtitle}>Cora Wealth convierte tus movimientos en una vista simple de tu bienestar financiero.</Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}><Text style={styles.summaryKey}>Cómo te sientes</Text><Text style={styles.summaryValue}>{mood}</Text></View>
        <View style={styles.summaryRow}><Text style={styles.summaryKey}>Prioridad</Text><Text style={styles.summaryValue}>{goal}</Text></View>
        <View style={styles.summaryRow}><Text style={styles.summaryKey}>Ingreso mensual</Text><Text style={styles.summaryValue}>{money(numeric(income))}</Text></View>
        <View style={styles.summaryRow}><Text style={styles.summaryKey}>Meta de ahorro</Text><Text style={styles.summaryValue}>{money(numeric(savingsGoal))}</Text></View>
      </View>

      <View style={styles.onboardFeature}><Text style={styles.featureDot}>•</Text><Text style={styles.featureText}>Registra gastos e ingresos en segundos</Text></View>
      <View style={styles.onboardFeature}><Text style={styles.featureDot}>•</Text><Text style={styles.featureText}>Visualiza tu presupuesto con animaciones</Text></View>
      <View style={styles.onboardFeature}><Text style={styles.featureDot}>•</Text><Text style={styles.featureText}>Todo permanece guardado localmente</Text></View>
    </View>
  );

  return (
    <View style={styles.onboardPage}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.onboardTop}>
        <Brand compact />
        <Text style={styles.scoreBadge}>100%</Text>
      </View>

      <View style={styles.stepArea}>
        <Text style={styles.stepText}>Paso {step + 1} de 4</Text>
        <View style={styles.stepTrack}>
          <View style={[styles.stepFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.onboardScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.onboardCard}>
          {step === 0 && stepOne}
          {step === 1 && stepTwo}
          {step === 2 && stepThree}
          {step === 3 && stepFour}
        </View>
        <TouchableOpacity style={styles.primaryButton} onPress={next} activeOpacity={0.9}>
          <Text style={styles.primaryButtonText}>{step === 3 ? "Entrar a Cora Wealth" : "Continuar"}</Text>
        </TouchableOpacity>
        {step > 0 ? (
          <TouchableOpacity onPress={() => setStep((s) => s - 1)} style={{ padding: 12 }}>
            <Text style={styles.backText}>Regresar</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.onboardFoot}>Tus finanzas son tuyas. Cora solo te ayuda a verlas mejor.</Text>
        )}
      </ScrollView>
    </View>
  );
}

function Drawer({
  visible,
  onClose,
  onNavigate,
  onAdd,
  onReset,
}) {
  const x = useRef(new Animated.Value(-SCREEN_WIDTH * 0.85)).current;

  useEffect(() => {
    Animated.timing(x, {
      toValue: visible ? 0 : -SCREEN_WIDTH * 0.85,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [visible, x]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.drawerOverlay}>
        <Pressable style={styles.drawerBackdrop} onPress={onClose} />
        <Animated.View style={[styles.drawer, { transform: [{ translateX: x }] }]}>
          <View style={styles.drawerHeader}>
            <Brand />
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.drawerProfile}>
            <View style={styles.avatar}><Text style={styles.avatarText}>CW</Text></View>
            <View>
              <Text style={styles.drawerName}>Mi espacio financiero</Text>
              <Text style={styles.drawerMuted}>Privado • local</Text>
            </View>
          </View>

          <Text style={styles.drawerLabel}>NAVEGACIÓN</Text>
          {[
            ["Home", "⌂"],
            ["Movimientos", "⇄"],
            ["Metas", "◎"],
            ["Calculadora", "▦"],
            ["Perfil", "◯"],
          ].map(([label, icon]) => (
            <TouchableOpacity
              key={label}
              style={styles.drawerItem}
              onPress={() => {
                onNavigate(label);
                onClose();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.drawerIcon}>{icon}</Text>
              <Text style={styles.drawerItemText}>{label}</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.drawerDivider} />

          <TouchableOpacity style={styles.drawerItem} onPress={onAdd}>
            <Text style={styles.drawerIcon}>＋</Text>
            <Text style={styles.drawerItemText}>Agregar movimiento</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.drawerItem, { marginTop: 4 }]}
            onPress={() => {
              onClose();
              onReset();
            }}
          >
            <Text style={[styles.drawerIcon, { color: COLORS.red }]}>↻</Text>
            <Text style={[styles.drawerItemText, { color: COLORS.red }]}>Restablecer demo</Text>
          </TouchableOpacity>

          <View style={styles.drawerBottom}>
            <Text style={styles.drawerBottomText}>Cora Wealth v1.0</Text>
            <Text style={styles.drawerBottomText}>Hecho para tu proyecto de App móviles</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function AddTransactionModal({ visible, onClose, onSave, defaultType = "expense" }) {
  const [type, setType] = useState(defaultType);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Comida");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (visible) {
      setType(defaultType);
      setAmount("");
      setCategory(defaultType === "income" ? "Salario" : defaultType === "saving" ? "Ahorro" : "Comida");
      setNote("");
    }
  }, [defaultType, visible]);

  const save = () => {
    const parsedAmount = numeric(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert("Cantidad faltante", "Escribe una cantidad mayor a 0.");
      return;
    }
    onSave({
      type,
      amount: parsedAmount,
      category: type === "saving" ? "Ahorro" : category,
      note: note.trim() || (type === "income" ? "Ingreso" : type === "saving" ? "Ahorro" : "Gasto"),
      date: new Date().toISOString(),
    });
  };

  return (
    <ModalShell visible={visible} title="Nuevo movimiento" subtitle="Todo queda guardado solo en tu dispositivo." onClose={onClose}>
      <Text style={styles.fieldLabel}>Tipo</Text>
      <View style={styles.segment}>
        {[
          ["expense", "Gasto"],
          ["income", "Ingreso"],
          ["saving", "Ahorro"],
        ].map(([key, label]) => (
          <TouchableOpacity
            key={key}
            onPress={() => setType(key)}
            style={[styles.segmentItem, type === key && { backgroundColor: TYPE_META[key].color }]}
          >
            <Text style={[styles.segmentText, type === key && { color: COLORS.white }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.fieldLabel}>Cantidad</Text>
      <View style={styles.moneyInput}>
        <Text style={styles.moneySymbol}>$</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={COLORS.text3}
          style={styles.moneyInputText}
          autoFocus
        />
        <Text style={styles.moneyCurrency}>MXN</Text>
      </View>

      {type !== "saving" ? (
        <>
          <Text style={styles.fieldLabel}>Categoría</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 3 }}>
            {DEFAULT_CATEGORIES.map((item) => (
              <PillButton key={item} label={item} active={category === item} onPress={() => setCategory(item)} />
            ))}
          </ScrollView>
        </>
      ) : null}

      <Text style={styles.fieldLabel}>Nota</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Ej. café de la mañana"
        placeholderTextColor={COLORS.text3}
        style={styles.textInput}
        maxLength={50}
      />

      <TouchableOpacity style={styles.primaryButton} onPress={save} activeOpacity={0.9}>
        <Text style={styles.primaryButtonText}>Guardar movimiento</Text>
      </TouchableOpacity>
    </ModalShell>
  );
}

function DeleteTransactionModal({ visible, transaction, onClose, onConfirm }) {
  if (!transaction) return null;
  return (
    <ModalShell visible={visible} title="Eliminar movimiento" subtitle="Esta acción no se puede deshacer." onClose={onClose}>
      <View style={styles.deleteCard}>
        <IconCircle
          symbol={transaction.type === "income" ? "↓" : transaction.type === "saving" ? "✦" : "↑"}
          color={transaction.type === "income" ? "#E7F8EF" : transaction.type === "saving" ? COLORS.blueSoft : COLORS.redSoft}
          textColor={transaction.type === "income" ? COLORS.greenDark : transaction.type === "saving" ? COLORS.blueDark : COLORS.red}
          size={52}
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.deleteName}>{transaction.category}</Text>
          <Text style={styles.deleteNote}>{transaction.note}</Text>
        </View>
        <Text style={styles.deleteAmount}>{money(transaction.amount)}</Text>
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={onConfirm} activeOpacity={0.9}>
        <Text style={styles.deleteButtonText}>Sí, eliminar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
        <Text style={styles.secondaryButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </ModalShell>
  );
}

function HomeScreen({ data, openDrawer, openAdd, goTo }) {
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(25)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(rise, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
  }, [fade, rise]);

  const stats = useMemo(() => calculateStats(data), [data]);
  const greeting = "Hola, Francisco"; // branding demo; user can personalize from profile later.

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <Animated.View style={{ flex: 1, opacity: fade, transform: [{ translateY: rise }] }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.homeHeader}>
            <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.hello}>{greeting}</Text>
              <Text style={styles.homeTitle}>Tu hogar financiero</Text>
            </View>
            <TouchableOpacity style={styles.bellButton}>
              <Text style={styles.bellIcon}>♧</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Consistency Tracker</Text>
          <View style={styles.trackerCard}>
            {DAYS.map((day, index) => {
              const checked = [0, 1, 3].includes(index);
              return (
                <View key={`${day}-${index}`} style={styles.dayItem}>
                  <Text style={styles.dayText}>{day}</Text>
                  <View style={[styles.dayCircle, checked && styles.dayCircleActive]}>
                    <Text style={[styles.dayCircleText, checked && { color: COLORS.white }]}>{checked ? "✓" : ""}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.heroCard}>
            <View style={styles.cardTopRow}>
              <View>
                <Text style={styles.cardTitle}>Panorama mensual</Text>
                <Text style={styles.cardSubtitle}>Ingreso total: {money(stats.income)}</Text>
              </View>
              <View style={styles.balanceBadge}>
                <Text style={styles.balanceBadgeLabel}>Disponible</Text>
                <Text style={styles.balanceBadgeValue}>{money(stats.available)}</Text>
              </View>
            </View>

            <AnimatedBar
              value={stats.needs}
              max={stats.needsTarget}
              color="#6FB8EF"
              label="Necesidades 50%"
              rightText={money(stats.needs)}
              targetText={money(stats.needsTarget)}
            />
            <AnimatedBar
              value={stats.wants}
              max={stats.wantsTarget}
              color="#B8C8E3"
              label="Deseos 30%"
              rightText={money(stats.wants)}
              targetText={money(stats.wantsTarget)}
            />
            <AnimatedBar
              value={stats.savings}
              max={stats.savingsTarget}
              color="#5CCB8E"
              label="Ahorro 20%"
              rightText={money(stats.savings)}
              targetText={money(stats.savingsTarget)}
            />
          </View>

          <View style={styles.predictionCard}>
            <View style={styles.predictionHead}>
              <View style={styles.predictionIcon}><Text style={styles.predictionIconText}>✦</Text></View>
              <View>
                <Text style={styles.predictionTitle}>Prediction Capsule</Text>
                <Text style={styles.predictionSubtitle}>Tu panorama financiero futuro.</Text>
              </View>
            </View>
            <Text style={styles.predictionText}>
              Con tus movimientos actuales estás{" "}
              <Text style={{ color: COLORS.greenDark, fontWeight: "800" }}>en camino</Text>{" "}
              para alcanzar tu meta este mes. Mantén bajo control los gastos de deseos.
            </Text>
            <View style={styles.predictionFoot}>
              <Text style={styles.predictionMuted}>Saldo proyectado: <Text style={styles.predictionStrong}>{money(stats.available)}</Text></Text>
              <Text style={styles.predictionMuted}>Nivel: <Text style={[styles.predictionStrong, { color: COLORS.greenDark }]}>Bajo riesgo</Text></Text>
            </View>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Quick Register</Text>
            <TouchableOpacity onPress={() => goTo("Movimientos")}><Text style={styles.linkText}>Ver todo</Text></TouchableOpacity>
          </View>

          <View style={styles.quickRow}>
            {[
              ["☕", "Café", "Gasto"],
              ["◫", "Transporte", "Gasto"],
              ["⌁", "Tacos", "Gasto"],
              ["▣", "Subs", "Gasto"],
            ].map(([icon, label]) => (
              <TouchableOpacity
                key={label}
                style={styles.quickItem}
                onPress={() => openAdd("expense", label === "Transporte" ? "Transporte" : label === "Tacos" ? "Comida" : label === "Subs" ? "Suscripciones" : "Comida")}
                activeOpacity={0.85}
              >
                <View style={styles.quickCircle}><Text style={styles.quickIcon}>{icon}</Text></View>
                <Text style={styles.quickLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.mentorCard} onPress={() => goTo("Calculadora")} activeOpacity={0.9}>
            <Text style={styles.mentorTitle}>Mentor Impulse</Text>
            <Text style={styles.mentorText}>Calculadora local de presupuesto y distribución 50/30/20.</Text>
            <View style={styles.mentorArrow}><Text style={styles.mentorArrowText}>→</Text></View>
          </TouchableOpacity>

          <View style={{ height: 115 }} />
        </ScrollView>
      </Animated.View>

      <BottomBar current="Home" onPress={goTo} />
      <TouchableOpacity style={styles.fab} onPress={() => openAdd("expense")} activeOpacity={0.9}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

function TransactionsScreen({ data, openDrawer, openAdd, onDelete, goTo }) {
  const [filter, setFilter] = useState("all");

  const list = useMemo(() => {
    return [...data.transactions]
      .filter((t) => filter === "all" || t.type === filter)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [data.transactions, filter]);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}>
          <TouchableOpacity onPress={openDrawer} style={styles.backMenu}><Text style={styles.menuIcon}>☰</Text></TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.hello}>Cora Wealth</Text>
            <Text style={styles.homeTitle}>Movimientos</Text>
          </View>
          <TouchableOpacity onPress={() => openAdd("expense")} style={styles.addMini}><Text style={styles.addMiniText}>＋</Text></TouchableOpacity>
        </View>

        <View style={styles.statsStrip}>
          <View><Text style={styles.stripLabel}>Ingresos</Text><Text style={[styles.stripValue, { color: COLORS.greenDark }]}>{money(calculateStats(data).income)}</Text></View>
          <View><Text style={styles.stripLabel}>Gastos</Text><Text style={[styles.stripValue, { color: COLORS.red }]}>{money(calculateStats(data).expense)}</Text></View>
          <View><Text style={styles.stripLabel}>Ahorros</Text><Text style={[styles.stripValue, { color: COLORS.blueDark }]}>{money(calculateStats(data).savings)}</Text></View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
          <PillButton label="Todos" active={filter === "all"} onPress={() => setFilter("all")} />
          <PillButton label="Gastos" active={filter === "expense"} onPress={() => setFilter("expense")} />
          <PillButton label="Ingresos" active={filter === "income"} onPress={() => setFilter("income")} />
          <PillButton label="Ahorros" active={filter === "saving"} onPress={() => setFilter("saving")} />
        </ScrollView>

        {list.length === 0 ? (
          <View style={styles.emptyState}>
            <IconCircle symbol="∅" size={70} color={COLORS.blueSoft} />
            <Text style={styles.emptyTitle}>Sin movimientos</Text>
            <Text style={styles.emptyText}>Agrega tu primer ingreso o gasto para comenzar.</Text>
          </View>
        ) : (
          list.map((item) => (
            <TouchableOpacity key={item.id} style={styles.transactionCard} onLongPress={() => onDelete(item)} activeOpacity={0.85}>
              <IconCircle
                symbol={TYPE_META[item.type].icon}
                color={item.type === "income" ? "#E8F9F0" : item.type === "saving" ? COLORS.blueSoft : COLORS.redSoft}
                textColor={TYPE_META[item.type].color}
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.transactionTitle}>{item.category}</Text>
                <Text style={styles.transactionNote}>{item.note} • {formatDate(item.date)}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.transactionAmount, { color: TYPE_META[item.type].color }]}>
                  {item.type === "expense" ? "-" : item.type === "saving" ? "✦ " : "+"}{money(item.amount)}
                </Text>
                <Text style={styles.transactionHint}>mantén presionado para borrar</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
      <BottomBar current="Movimientos" onPress={goTo} />
      <TouchableOpacity style={styles.fab} onPress={() => openAdd("expense")} activeOpacity={0.9}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

function GoalsScreen({ data, openDrawer, openGoalEditor, goTo }) {
  const stats = calculateStats(data);
  const progress = data.savingsGoal > 0 ? Math.min(stats.savings / data.savingsGoal, 1) : 0;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, { toValue: progress, duration: 900, useNativeDriver: false }).start();
  }, [progress, progressAnim]);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}>
          <TouchableOpacity onPress={openDrawer} style={styles.backMenu}><Text style={styles.menuIcon}>☰</Text></TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.hello}>Tu futuro</Text>
            <Text style={styles.homeTitle}>Metas</Text>
          </View>
          <TouchableOpacity style={styles.addMini} onPress={openGoalEditor}><Text style={styles.addMiniText}>✎</Text></TouchableOpacity>
        </View>

        <View style={styles.goalHero}>
          <View style={styles.goalGlow}><Text style={styles.goalStar}>✦</Text></View>
          <Text style={styles.goalTitle}>Meta de ahorro inicial</Text>
          <Text style={styles.goalValue}>{money(data.savingsGoal)}</Text>
          <Text style={styles.goalCaption}>Llevas {money(stats.savings)} ahorrados</Text>
          <View style={styles.goalTrack}>
            <Animated.View style={[styles.goalFill, { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }]} />
          </View>
          <Text style={styles.goalPercent}>{Math.round(progress * 100)}% completado</Text>
        </View>

        <View style={styles.twoCards}>
          <View style={styles.miniInfoCard}><Text style={styles.miniInfoLabel}>Disponible</Text><Text style={styles.miniInfoValue}>{money(stats.available)}</Text></View>
          <View style={styles.miniInfoCard}><Text style={styles.miniInfoLabel}>Movimientos</Text><Text style={styles.miniInfoValue}>{data.transactions.length}</Text></View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Regla 50 / 30 / 20</Text>
          <Text style={styles.cardSubtitle}>Una guía sencilla para mantener equilibrio.</Text>
          {[
            ["Necesidades", "50%", "Vivienda, comida, transporte y básicos."],
            ["Deseos", "30%", "Entretenimiento, compras y extras."],
            ["Ahorro", "20%", "Metas, fondo de emergencia y futuro."],
          ].map(([a, b, c], i) => (
            <View key={a} style={styles.ruleRow}>
              <View style={[styles.ruleDot, { backgroundColor: [ "#6FB8EF", "#B8C8E3", "#5CCB8E" ][i] }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.ruleTitle}>{a} <Text style={styles.rulePercentText}>{b}</Text></Text>
                <Text style={styles.ruleDesc}>{c}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={openGoalEditor}>
          <Text style={styles.primaryButtonText}>Editar meta de ahorro</Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>
      <BottomBar current="Metas" onPress={goTo} />
    </View>
  );
}

function CalculatorScreen({ data, openDrawer, goTo }) {
  const [income, setIncome] = useState(String(data.monthlyIncome || 20000));
  const value = numeric(income);
  const needs = value * 0.5;
  const wants = value * 0.3;
  const savings = value * 0.2;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}>
          <TouchableOpacity onPress={openDrawer} style={styles.backMenu}><Text style={styles.menuIcon}>☰</Text></TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.hello}>Herramienta</Text>
            <Text style={styles.homeTitle}>Calculadora</Text>
          </View>
          <View style={styles.calcBadge}><Text style={styles.calcBadgeText}>50/30/20</Text></View>
        </View>

        <View style={styles.calculatorCard}>
          <Text style={styles.cardTitle}>¿Cuánto entra al mes?</Text>
          <Text style={styles.cardSubtitle}>Calcula una distribución de referencia sin internet.</Text>
          <View style={styles.moneyInput}>
            <Text style={styles.moneySymbol}>$</Text>
            <TextInput value={income} onChangeText={setIncome} keyboardType="decimal-pad" style={styles.moneyInputText} />
            <Text style={styles.moneyCurrency}>MXN</Text>
          </View>
        </View>

        {[
          ["Necesidades", 50, needs, "#6FB8EF", "Base esencial"],
          ["Deseos", 30, wants, "#B8C8E3", "Calidad de vida"],
          ["Ahorro", 20, savings, "#5CCB8E", "Tu futuro"],
        ].map(([label, pct, amount, color, caption]) => (
          <View key={label} style={styles.calcResult}>
            <View style={[styles.calcIcon, { backgroundColor: `${color}33` }]}><Text style={[styles.calcIconText, { color }]}>%</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.calcResultLabel}>{label} <Text style={styles.calcResultPercent}>{pct}%</Text></Text>
              <Text style={styles.calcResultCaption}>{caption}</Text>
            </View>
            <Text style={styles.calcResultValue}>{money(amount)}</Text>
          </View>
        ))}

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Saldo después del plan</Text>
          <Text style={styles.cardSubtitle}>La idea es que tus tres bloques sumen exactamente tu ingreso.</Text>
          <Text style={styles.bigNumber}>{money(needs + wants + savings)}</Text>
          <Text style={styles.smallMuted}>de {money(value)} distribuidos</Text>
        </View>

        <TouchableOpacity style={styles.mentorCard} onPress={() => goTo("Metas")}>
          <Text style={styles.mentorTitle}>Convierte el cálculo en una meta</Text>
          <Text style={styles.mentorText}>Usa el 20% como referencia para tu ahorro mensual.</Text>
          <View style={styles.mentorArrow}><Text style={styles.mentorArrowText}>→</Text></View>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>
      <BottomBar current="Calculadora" onPress={goTo} />
    </View>
  );
}

function ProfileScreen({ data, openDrawer, onReset, onEditOnboarding, goTo }) {
  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}>
          <TouchableOpacity onPress={openDrawer} style={styles.backMenu}><Text style={styles.menuIcon}>☰</Text></TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.hello}>Tu cuenta local</Text>
            <Text style={styles.homeTitle}>Perfil</Text>
          </View>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}><Text style={styles.profileAvatarText}>F</Text></View>
          <Text style={styles.profileName}>Francisco</Text>
          <Text style={styles.profileCaption}>Tu información vive solo en este dispositivo.</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Preferencias</Text>
          <View style={styles.profileRow}><Text style={styles.profileLabel}>Cómo me siento</Text><Text style={styles.profileValue}>{data.mood}</Text></View>
          <View style={styles.profileRow}><Text style={styles.profileLabel}>Objetivo principal</Text><Text style={styles.profileValue}>{data.goal}</Text></View>
          <View style={styles.profileRow}><Text style={styles.profileLabel}>Ingreso mensual</Text><Text style={styles.profileValue}>{money(data.monthlyIncome)}</Text></View>
          <View style={styles.profileRow}><Text style={styles.profileLabel}>Meta de ahorro</Text><Text style={styles.profileValue}>{money(data.savingsGoal)}</Text></View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={onEditOnboarding}>
          <Text style={styles.primaryButtonText}>Editar mi plan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={onReset}>
          <Text style={styles.secondaryButtonText}>Restablecer datos de demo</Text>
        </TouchableOpacity>

        <View style={styles.localBadge}>
          <Text style={styles.localBadgeIcon}>✓</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.localBadgeTitle}>Modo 100% local</Text>
            <Text style={styles.localBadgeText}>Sin cuentas, sin API, sin servidor y sin base de datos externa.</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
      <BottomBar current="Perfil" onPress={goTo} />
    </View>
  );
}

function AboutScreen({ openDrawer, goTo }) {
  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}>
          <TouchableOpacity onPress={openDrawer} style={styles.backMenu}><Text style={styles.menuIcon}>☰</Text></TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.hello}>Proyecto escolar</Text>
            <Text style={styles.homeTitle}>Cora Wealth</Text>
          </View>
        </View>

        <View style={styles.aboutHero}>
          <Brand />
          <Text style={styles.aboutTitle}>Claridad financiera.{"\n"}Calma total.</Text>
          <Text style={styles.aboutText}>Aplicación local de presupuesto personal desarrollada con React Native y Expo Go.</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Elementos incluidos</Text>
          {[
            "Splash Screen animado",
            "Onboarding de 4 pasos",
            "Modales para agregar y eliminar",
            "NavDrawer lateral animado",
            "Animaciones con Animated",
            "Dashboard con gráficos de barras",
            "Calculadora 50/30/20",
            "Persistencia local con AsyncStorage",
            "Sin fetch, APIs o base de datos externa",
          ].map((item) => (
            <View style={styles.checkRow} key={item}>
              <Text style={styles.checkMark}>✓</Text>
              <Text style={styles.checkText}>{item}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => goTo("Home")}>
          <Text style={styles.secondaryButtonText}>Volver al inicio</Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>
      <BottomBar current="Home" onPress={goTo} />
    </View>
  );
}

function BottomBar({ current, onPress }) {
  const items = [
    ["Home", "⌂"],
    ["Movimientos", "⇄"],
    ["Metas", "◎"],
    ["Perfil", "◯"],
  ];
  return (
    <View style={styles.bottomBar}>
      {items.map(([label, icon]) => {
        const active = current === label;
        return (
          <TouchableOpacity key={label} style={styles.bottomItem} onPress={() => onPress(label)} activeOpacity={0.8}>
            <Text style={[styles.bottomIcon, active && styles.bottomIconActive]}>{icon}</Text>
            <Text style={[styles.bottomLabel, active && styles.bottomLabelActive]}>{label === "Movimientos" ? "Mov." : label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function calculateStats(data) {
  const currentMonth = monthKey(new Date());
  const current = data.transactions.filter((t) => monthKey(t.date) === currentMonth);

  const income = current.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0) || data.monthlyIncome || 0;
  const expense = current.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const savings = current.filter((t) => t.type === "saving").reduce((sum, t) => sum + t.amount, 0);

  const needsCategories = new Set(["Comida", "Transporte", "Hogar", "Salud", "Educación"]);
  const needs = current.filter((t) => t.type === "expense" && needsCategories.has(t.category)).reduce((sum, t) => sum + t.amount, 0);
  const wants = current.filter((t) => t.type === "expense" && !needsCategories.has(t.category)).reduce((sum, t) => sum + t.amount, 0);

  return {
    income,
    expense,
    savings,
    needs,
    wants,
    available: income - expense - savings,
    needsTarget: income * 0.5,
    wantsTarget: income * 0.3,
    savingsTarget: income * 0.2,
  };
}

export default function App() {
  const [booted, setBooted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [data, setData] = useState(INITIAL_STATE);
  const [screen, setScreen] = useState("Home");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [addType, setAddType] = useState("expense");
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [goalEditorVisible, setGoalEditorVisible] = useState(false);
  const [goalInput, setGoalInput] = useState(String(INITIAL_STATE.savingsGoal));

  const boot = () => setBooted(true);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setData(JSON.parse(saved));
        }
      } catch (error) {
        console.log("No se pudo cargar el almacenamiento local", error);
      } finally {
        setHydrated(true);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch((error) =>
      console.log("No se pudo guardar el almacenamiento local", error)
    );
  }, [data, hydrated]);

  const navigate = (target) => {
    if (target === "Home") {
      setScreen("Home");
    } else if (target === "Movimientos") {
      setScreen("Movimientos");
    } else if (target === "Metas") {
      setScreen("Metas");
    } else if (target === "Calculadora") {
      setScreen("Calculadora");
    } else if (target === "Perfil") {
      setScreen("Perfil");
    } else {
      setScreen("Home");
    }
  };

  const finishOnboarding = (values) => {
    setData((prev) => {
      const hasSeedIncome = prev.transactions.some((t) => t.type === "income");
      const transactions = prev.transactions.map((t) =>
        hasSeedIncome && t.type === "income" && t.category === "Salario"
          ? { ...t, amount: values.monthlyIncome }
          : t
      );
      return {
        ...prev,
        ...values,
        onboardingDone: true,
        transactions,
      };
    });
    setScreen("Home");
  };

  const saveTransaction = (item) => {
    setData((prev) => ({
      ...prev,
      transactions: [...prev.transactions, { ...item, id: makeId() }],
    }));
    setAddVisible(false);
    setScreen("Movimientos");
  };

  const openAdd = (type = "expense", category = null) => {
    setAddType(type);
    setAddVisible(true);
  };

  const askDelete = (transaction) => {
    setSelectedTransaction(transaction);
    setDeleteVisible(true);
  };

  const confirmDelete = () => {
    if (!selectedTransaction) return;
    setData((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== selectedTransaction.id),
    }));
    setDeleteVisible(false);
    setSelectedTransaction(null);
  };

  const resetData = () => {
    Alert.alert(
      "Restablecer demo",
      "Se eliminarán tus movimientos actuales y se cargarán los datos de ejemplo de Cora Wealth.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Restablecer",
          style: "destructive",
          onPress: async () => {
            const next = { ...INITIAL_STATE, onboardingDone: true, transactions: createSeedTransactions() };
            setData(next);
            setScreen("Home");
            setDrawerVisible(false);
            try {
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch {}
          },
        },
      ]
    );
  };

  const editOnboarding = () => {
    setData((prev) => ({ ...prev, onboardingDone: false }));
    setScreen("Home");
  };

  const saveGoal = () => {
    const value = numeric(goalInput);
    if (value <= 0) {
      Alert.alert("Meta inválida", "Escribe una cantidad mayor a 0.");
      return;
    }
    setData((prev) => ({ ...prev, savingsGoal: value }));
    setGoalEditorVisible(false);
  };

  if (!booted) {
    return <SplashScreen onDone={boot} />;
  }

  if (!hydrated) {
    return (
      <View style={styles.splash}>
        <ActivityLoading />
      </View>
    );
  }

  if (!data.onboardingDone) {
    return <Onboarding initialData={data} onFinish={finishOnboarding} />;
  }

  let content = null;
  if (screen === "Home") {
    content = <HomeScreen data={data} openDrawer={() => setDrawerVisible(true)} openAdd={openAdd} goTo={navigate} />;
  } else if (screen === "Movimientos") {
    content = <TransactionsScreen data={data} openDrawer={() => setDrawerVisible(true)} openAdd={openAdd} onDelete={askDelete} goTo={navigate} />;
  } else if (screen === "Metas") {
    content = <GoalsScreen data={data} openDrawer={() => setDrawerVisible(true)} openGoalEditor={() => { setGoalInput(String(data.savingsGoal)); setGoalEditorVisible(true); }} goTo={navigate} />;
  } else if (screen === "Calculadora") {
    content = <CalculatorScreen data={data} openDrawer={() => setDrawerVisible(true)} goTo={navigate} />;
  } else if (screen === "Perfil") {
    content = <ProfileScreen data={data} openDrawer={() => setDrawerVisible(true)} onReset={resetData} onEditOnboarding={editOnboarding} goTo={navigate} />;
  } else {
    content = <AboutScreen openDrawer={() => setDrawerVisible(true)} goTo={navigate} />;
  }

  return (
    <>
      {content}

      <Drawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        onNavigate={navigate}
        onAdd={() => {
          setDrawerVisible(false);
          setTimeout(() => openAdd("expense"), 150);
        }}
        onReset={resetData}
      />

      <AddTransactionModal
        visible={addVisible}
        defaultType={addType}
        onClose={() => setAddVisible(false)}
        onSave={saveTransaction}
      />

      <DeleteTransactionModal
        visible={deleteVisible}
        transaction={selectedTransaction}
        onClose={() => {
          setDeleteVisible(false);
          setSelectedTransaction(null);
        }}
        onConfirm={confirmDelete}
      />

      <Modal visible={goalEditorVisible} transparent animationType="fade" onRequestClose={() => setGoalEditorVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHead}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Editar meta de ahorro</Text>
                <Text style={styles.modalSubtitle}>Define el monto que quieres conseguir.</Text>
              </View>
              <TouchableOpacity onPress={() => setGoalEditorVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeText}>×</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.moneyInput}>
              <Text style={styles.moneySymbol}>$</Text>
              <TextInput value={goalInput} onChangeText={setGoalInput} keyboardType="decimal-pad" style={styles.moneyInputText} />
              <Text style={styles.moneyCurrency}>MXN</Text>
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={saveGoal}>
              <Text style={styles.primaryButtonText}>Guardar meta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

function ActivityLoading() {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, [spin]);

  return (
    <View style={{ alignItems: "center" }}>
      <Animated.View style={{ transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }] }}>
        <LogoMark />
      </Animated.View>
      <Text style={styles.loadingText}>Cora Wealth</Text>
      <Text style={styles.loadingSubtext}>Cargando tus datos locales…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: 22, paddingTop: 18 },

  splash: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  splashCora: { marginTop: 18, color: COLORS.navy, fontSize: 34, fontWeight: "900", letterSpacing: 2 },
  splashWealth: { color: COLORS.navy, fontSize: 34, fontWeight: "900", letterSpacing: 2, marginTop: -6 },
  splashTag: { marginTop: 16, fontSize: 16, color: COLORS.blueDark, fontWeight: "700" },
  splashLine: { width: 80, height: 4, borderRadius: 999, backgroundColor: COLORS.blue, alignSelf: "center" },
  splashLocal: { marginTop: 12, color: COLORS.text3, fontSize: 11, textAlign: "center" },

  logoWrap: { width: 62, height: 62, position: "relative", alignItems: "center", justifyContent: "center" },
  logoLeafCenter: {
    position: "absolute",
    width: 20,
    height: 34,
    borderWidth: 3,
    borderColor: COLORS.blue,
    borderRadius: 18,
    transform: [{ rotate: "2deg" }, { translateY: -8 }],
  },
  logoLeafSide: {
    position: "absolute",
    width: 19,
    height: 31,
    borderWidth: 3,
    borderColor: COLORS.blue,
    borderRadius: 18,
    top: 12,
  },
  logoStem: {
    position: "absolute",
    width: 3,
    height: 24,
    borderRadius: 3,
    backgroundColor: COLORS.blue,
    top: 30,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  brandCora: { color: COLORS.navy, fontWeight: "900", fontSize: 18, lineHeight: 18, letterSpacing: 1.4 },
  brandWealth: { color: COLORS.navy, fontWeight: "900", fontSize: 18, lineHeight: 18, letterSpacing: 1.4 },

  onboardPage: { flex: 1, backgroundColor: COLORS.white, paddingTop: 48 },
  onboardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24 },
  scoreBadge: { backgroundColor: "#FFF0A8", color: COLORS.navy, fontWeight: "900", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, fontSize: 17 },
  stepArea: { paddingHorizontal: 24, marginTop: 32 },
  stepText: { color: COLORS.blueDark, textAlign: "center", fontSize: 18, fontWeight: "800", marginBottom: 12 },
  stepTrack: { height: 8, backgroundColor: "#D9F0FB", borderRadius: 999, overflow: "hidden" },
  stepFill: { height: "100%", backgroundColor: COLORS.blue, borderRadius: 999 },
  onboardScroll: { padding: 24, paddingBottom: 30 },
  onboardCard: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 2,
  },
  onboardTitle: { color: COLORS.navy, fontSize: 28, lineHeight: 40, fontWeight: "900", marginTop: 22 },
  onboardSubtitle: { color: COLORS.blueDark, fontSize: 16, lineHeight: 25, marginTop: 16, marginBottom: 18 },
  optionCard: {
    minHeight: 92,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    paddingHorizontal: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  optionCardActive: { borderColor: COLORS.blue, backgroundColor: "#F7FCFF" },
  optionText: { color: COLORS.text, fontSize: 18, marginLeft: 14, flex: 1, fontWeight: "700" },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.line },
  radioActive: { borderColor: COLORS.blue, backgroundColor: COLORS.blue, shadowColor: COLORS.blue, shadowOpacity: 0.25, shadowRadius: 7 },
  fieldLabel: { color: COLORS.text2, fontWeight: "800", marginTop: 14, marginBottom: 9, fontSize: 14 },
  moneyInput: { backgroundColor: COLORS.input, borderRadius: 28, minHeight: 62, flexDirection: "row", alignItems: "center", paddingHorizontal: 17, borderWidth: 1, borderColor: COLORS.line },
  moneySymbol: { color: COLORS.blue, fontSize: 26, fontWeight: "800" },
  moneyInputText: { flex: 1, color: COLORS.navy, fontSize: 22, fontWeight: "800", paddingHorizontal: 12 },
  moneyCurrency: { color: COLORS.text2, fontWeight: "800", fontSize: 15 },
  tipBox: { marginTop: 20, backgroundColor: COLORS.blueSoft, borderRadius: 20, padding: 16, flexDirection: "row", alignItems: "flex-start" },
  tipIcon: { color: COLORS.blueDark, fontSize: 21, marginRight: 10 },
  tipTitle: { color: COLORS.navy, fontWeight: "900", marginBottom: 3 },
  tipText: { color: COLORS.text2, lineHeight: 20, fontSize: 13 },
  readyBadge: { alignSelf: "flex-start", backgroundColor: COLORS.blueSoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginTop: 22 },
  readyBadgeText: { color: COLORS.blueDark, fontWeight: "900", fontSize: 11, letterSpacing: 1.2 },
  summaryCard: { backgroundColor: "#F7F9FC", borderRadius: 22, padding: 16, marginTop: 10, marginBottom: 16 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  summaryKey: { color: COLORS.text2, fontSize: 14 },
  summaryValue: { color: COLORS.navy, fontWeight: "900", fontSize: 14, maxWidth: "56%", textAlign: "right" },
  onboardFeature: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  featureDot: { color: COLORS.blue, fontSize: 24, marginRight: 8 },
  featureText: { color: COLORS.text2, fontSize: 14, flex: 1 },
  primaryButton: { backgroundColor: COLORS.blue, borderRadius: 32, minHeight: 60, alignItems: "center", justifyContent: "center", marginTop: 20, shadowColor: COLORS.blue, shadowOpacity: 0.22, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  primaryButtonText: { color: COLORS.white, fontSize: 17, fontWeight: "900" },
  backText: { color: COLORS.blueDark, fontWeight: "800", textAlign: "center" },
  onboardFoot: { color: COLORS.text3, textAlign: "center", lineHeight: 20, marginTop: 14, fontSize: 12 },

  homeHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  menuButton: { width: 44, height: 44, borderRadius: 15, backgroundColor: COLORS.white, alignItems: "center", justifyContent: "center", marginRight: 11, shadowColor: COLORS.shadow, shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  menuIcon: { color: COLORS.navy, fontSize: 24, fontWeight: "900" },
  hello: { color: COLORS.text2, fontSize: 14, marginBottom: 2 },
  homeTitle: { color: COLORS.navy, fontWeight: "900", fontSize: 25, lineHeight: 30, textTransform: "capitalize" },
  bellButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.white, alignItems: "center", justifyContent: "center", shadowColor: COLORS.shadow, shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  bellIcon: { color: COLORS.navy, fontSize: 22 },
  sectionTitle: { color: COLORS.navy, fontWeight: "900", fontSize: 19, marginTop: 6, marginBottom: 10 },
  trackerCard: { backgroundColor: COLORS.white, borderRadius: 28, paddingHorizontal: 10, paddingVertical: 16, flexDirection: "row", justifyContent: "space-around", marginBottom: 18 },
  dayItem: { alignItems: "center" },
  dayText: { color: COLORS.text2, fontSize: 12, fontWeight: "800", marginBottom: 8 },
  dayCircle: { width: 39, height: 39, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "#E7E9EE" },
  dayCircleActive: { backgroundColor: "#5EAEF0" },
  dayCircleText: { color: COLORS.text3, fontWeight: "900" },

  heroCard: { backgroundColor: COLORS.white, borderRadius: 28, padding: 18, marginBottom: 15, shadowColor: COLORS.shadow, shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 7 }, elevation: 2 },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 },
  cardTitle: { color: COLORS.navy, fontSize: 18, fontWeight: "900" },
  cardSubtitle: { color: COLORS.text2, fontSize: 14, marginTop: 4 },
  balanceBadge: { alignItems: "flex-end" },
  balanceBadgeLabel: { color: COLORS.text3, fontSize: 11, fontWeight: "700" },
  balanceBadgeValue: { color: COLORS.navy, fontWeight: "900", fontSize: 15, marginTop: 3 },
  barHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 7 },
  barTitle: { color: COLORS.navy, fontWeight: "800", fontSize: 14 },
  barValue: { color: COLORS.navy, fontWeight: "900", fontSize: 13 },
  barTarget: { color: COLORS.text3, fontWeight: "700" },
  barTrack: { height: 38, backgroundColor: "#F0F2F6", borderRadius: 8, overflow: "hidden", justifyContent: "center" },
  barFill: { position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 8 },
  barPercent: { color: COLORS.navy, fontWeight: "900", fontSize: 12, textAlign: "right", paddingRight: 10 },

  predictionCard: { backgroundColor: "#CFE6FC", borderRadius: 28, padding: 20, marginBottom: 17 },
  predictionHead: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  predictionIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#DDF2FF", alignItems: "center", justifyContent: "center", marginRight: 11 },
  predictionIconText: { color: COLORS.blueDark, fontSize: 22 },
  predictionTitle: { color: COLORS.navy, fontSize: 17, fontWeight: "900" },
  predictionSubtitle: { color: COLORS.text2, fontSize: 13, marginTop: 2 },
  predictionText: { color: COLORS.navy2, fontSize: 15, lineHeight: 23 },
  predictionFoot: { flexDirection: "row", justifyContent: "space-between", marginTop: 18, flexWrap: "wrap", gap: 7 },
  predictionMuted: { color: COLORS.text2, fontSize: 12 },
  predictionStrong: { color: COLORS.navy, fontWeight: "900" },

  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  linkText: { color: COLORS.blueDark, fontWeight: "900", fontSize: 13 },
  quickRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  quickItem: { width: (SCREEN_WIDTH - 44 - 18) / 4 - 4, alignItems: "center" },
  quickCircle: { width: 62, height: 62, borderRadius: 31, backgroundColor: COLORS.white, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#EFF2F6" },
  quickIcon: { fontSize: 22, color: "#8BA8CC" },
  quickLabel: { color: COLORS.text2, fontWeight: "700", fontSize: 12, marginTop: 7 },
  mentorCard: { backgroundColor: "#F8FAFC", borderWidth: 1.5, borderStyle: "dashed", borderColor: "#CED5DF", borderRadius: 22, padding: 18, marginTop: 6, position: "relative" },
  mentorTitle: { color: COLORS.text2, fontWeight: "900", fontSize: 16 },
  mentorText: { color: COLORS.text3, marginTop: 5, lineHeight: 19, maxWidth: "88%" },
  mentorArrow: { position: "absolute", right: 14, top: 18, width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.white, alignItems: "center", justifyContent: "center" },
  mentorArrowText: { color: COLORS.blueDark, fontSize: 20, fontWeight: "900" },

  bottomBar: { position: "absolute", left: 20, right: 20, bottom: 18, height: 72, borderRadius: 34, backgroundColor: COLORS.white, flexDirection: "row", alignItems: "center", justifyContent: "space-around", shadowColor: COLORS.shadow, shadowOpacity: 0.10, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8, paddingHorizontal: 7 },
  bottomItem: { alignItems: "center", justifyContent: "center", minWidth: 54 },
  bottomIcon: { fontSize: 22, color: COLORS.text2 },
  bottomIconActive: { color: COLORS.blue },
  bottomLabel: { fontSize: 10, color: COLORS.text2, fontWeight: "700", marginTop: 3 },
  bottomLabelActive: { color: COLORS.blue, fontWeight: "900" },
  fab: { position: "absolute", bottom: 46, left: SCREEN_WIDTH / 2 - 28, width: 56, height: 56, borderRadius: 28, backgroundColor: "#53A8F0", alignItems: "center", justifyContent: "center", shadowColor: "#53A8F0", shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 7, zIndex: 20 },
  fabText: { color: COLORS.white, fontSize: 31, lineHeight: 31, fontWeight: "300" },

  pageHeader: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  backMenu: { width: 44, height: 44, borderRadius: 15, backgroundColor: COLORS.white, alignItems: "center", justifyContent: "center", marginRight: 11, shadowColor: COLORS.shadow, shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  addMini: { width: 44, height: 44, borderRadius: 16, backgroundColor: COLORS.blue, alignItems: "center", justifyContent: "center" },
  addMiniText: { color: COLORS.white, fontSize: 26, fontWeight: "300" },
  statsStrip: { flexDirection: "row", justifyContent: "space-between", backgroundColor: COLORS.white, borderRadius: 20, padding: 15, marginBottom: 12 },
  stripLabel: { color: COLORS.text3, fontSize: 11, fontWeight: "700" },
  stripValue: { color: COLORS.navy, fontWeight: "900", fontSize: 14, marginTop: 3 },
  pill: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, paddingHorizontal: 14, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", marginRight: 8 },
  pillActive: { backgroundColor: COLORS.blueSoft, borderColor: COLORS.blue },
  pillText: { color: COLORS.text2, fontWeight: "800", fontSize: 12 },
  pillTextActive: { color: COLORS.blueDark },
  transactionCard: { backgroundColor: COLORS.white, borderRadius: 22, padding: 14, flexDirection: "row", alignItems: "center", marginTop: 10, shadowColor: COLORS.shadow, shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 1 },
  transactionTitle: { color: COLORS.navy, fontSize: 15, fontWeight: "900" },
  transactionNote: { color: COLORS.text3, fontSize: 11, marginTop: 4 },
  transactionAmount: { fontSize: 14, fontWeight: "900" },
  transactionHint: { color: COLORS.text3, fontSize: 8, marginTop: 5, maxWidth: 100, textAlign: "right" },
  emptyState: { backgroundColor: COLORS.white, borderRadius: 28, padding: 30, alignItems: "center", marginTop: 18 },
  emptyTitle: { color: COLORS.navy, fontSize: 19, fontWeight: "900", marginTop: 15 },
  emptyText: { color: COLORS.text2, textAlign: "center", lineHeight: 20, marginTop: 6 },

  goalHero: { backgroundColor: "#D9EDFF", borderRadius: 28, padding: 23, alignItems: "center", overflow: "hidden" },
  goalGlow: { width: 62, height: 62, borderRadius: 31, backgroundColor: COLORS.white, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  goalStar: { color: COLORS.blue, fontSize: 27 },
  goalTitle: { color: COLORS.text2, fontWeight: "800", fontSize: 14 },
  goalValue: { color: COLORS.navy, fontWeight: "900", fontSize: 35, marginTop: 4 },
  goalCaption: { color: COLORS.text2, fontSize: 13, marginTop: 4 },
  goalTrack: { width: "100%", height: 15, backgroundColor: COLORS.white, borderRadius: 999, overflow: "hidden", marginTop: 20 },
  goalFill: { height: "100%", backgroundColor: COLORS.green, borderRadius: 999 },
  goalPercent: { color: COLORS.navy, fontWeight: "900", fontSize: 12, marginTop: 8 },
  twoCards: { flexDirection: "row", gap: 10, marginTop: 12 },
  miniInfoCard: { flex: 1, backgroundColor: COLORS.white, borderRadius: 20, padding: 15 },
  miniInfoLabel: { color: COLORS.text3, fontSize: 11, fontWeight: "700" },
  miniInfoValue: { color: COLORS.navy, fontWeight: "900", fontSize: 18, marginTop: 4 },
  infoCard: { backgroundColor: COLORS.white, borderRadius: 24, padding: 18, marginTop: 12 },
  ruleRow: { flexDirection: "row", marginTop: 16 },
  ruleDot: { width: 11, height: 11, borderRadius: 6, marginTop: 4, marginRight: 10 },
  ruleTitle: { color: COLORS.navy, fontWeight: "900" },
  rulePercentText: { color: COLORS.blueDark },
  ruleDesc: { color: COLORS.text2, fontSize: 12, lineHeight: 18, marginTop: 2 },

  calculatorCard: { backgroundColor: COLORS.white, borderRadius: 25, padding: 18 },
  calcBadge: { backgroundColor: COLORS.purpleSoft, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  calcBadgeText: { color: "#6457A8", fontSize: 11, fontWeight: "900" },
  calcResult: { backgroundColor: COLORS.white, borderRadius: 22, padding: 15, marginTop: 10, flexDirection: "row", alignItems: "center" },
  calcIcon: { width: 44, height: 44, borderRadius: 15, alignItems: "center", justifyContent: "center", marginRight: 11 },
  calcIconText: { fontSize: 19, fontWeight: "900" },
  calcResultLabel: { color: COLORS.navy, fontSize: 15, fontWeight: "900" },
  calcResultPercent: { color: COLORS.blueDark },
  calcResultCaption: { color: COLORS.text3, fontSize: 11, marginTop: 3 },
  calcResultValue: { color: COLORS.navy, fontSize: 16, fontWeight: "900" },
  bigNumber: { color: COLORS.blueDark, fontSize: 32, fontWeight: "900", marginTop: 12 },
  smallMuted: { color: COLORS.text3, marginTop: 2, fontSize: 12 },

  profileCard: { backgroundColor: COLORS.white, borderRadius: 26, padding: 22, alignItems: "center" },
  profileAvatar: { width: 74, height: 74, borderRadius: 37, backgroundColor: COLORS.blueSoft, alignItems: "center", justifyContent: "center" },
  profileAvatarText: { color: COLORS.blueDark, fontWeight: "900", fontSize: 30 },
  profileName: { color: COLORS.navy, fontWeight: "900", fontSize: 22, marginTop: 10 },
  profileCaption: { color: COLORS.text3, textAlign: "center", marginTop: 4, lineHeight: 18 },
  profileRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F0F2F5" },
  profileLabel: { color: COLORS.text2 },
  profileValue: { color: COLORS.navy, fontWeight: "900", maxWidth: "50%", textAlign: "right" },
  secondaryButton: { minHeight: 56, borderRadius: 28, borderWidth: 1.2, borderColor: COLORS.line, alignItems: "center", justifyContent: "center", marginTop: 11, backgroundColor: COLORS.white },
  secondaryButtonText: { color: COLORS.navy, fontWeight: "900" },
  localBadge: { backgroundColor: "#EAF9F1", borderRadius: 20, padding: 14, marginTop: 14, flexDirection: "row" },
  localBadgeIcon: { color: COLORS.greenDark, fontWeight: "900", fontSize: 21, marginRight: 10 },
  localBadgeTitle: { color: COLORS.greenDark, fontWeight: "900" },
  localBadgeText: { color: COLORS.text2, lineHeight: 18, fontSize: 12, marginTop: 3 },

  aboutHero: { backgroundColor: COLORS.white, borderRadius: 28, padding: 22, marginBottom: 12 },
  aboutTitle: { color: COLORS.navy, fontWeight: "900", fontSize: 31, lineHeight: 39, marginTop: 28 },
  aboutText: { color: COLORS.text2, lineHeight: 22, fontSize: 15, marginTop: 14 },
  checkRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  checkMark: { color: COLORS.greenDark, fontSize: 18, width: 26, fontWeight: "900" },
  checkText: { color: COLORS.text2, flex: 1, lineHeight: 20 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(13, 22, 40, 0.42)", justifyContent: "flex-end", alignItems: "center" },
  modalCard: { backgroundColor: COLORS.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, borderRadius: 30, padding: 20, width: "100%", maxHeight: "90%" },
  modalHead: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10 },
  modalTitle: { color: COLORS.navy, fontSize: 22, fontWeight: "900" },
  modalSubtitle: { color: COLORS.text2, lineHeight: 19, fontSize: 12, marginTop: 4 },
  closeButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F4F6F9", alignItems: "center", justifyContent: "center" },
  closeText: { color: COLORS.text2, fontSize: 25, lineHeight: 25, fontWeight: "300" },
  segment: { flexDirection: "row", backgroundColor: COLORS.input, borderRadius: 20, padding: 4 },
  segmentItem: { flex: 1, paddingVertical: 11, alignItems: "center", borderRadius: 16 },
  segmentText: { color: COLORS.text2, fontWeight: "900", fontSize: 12 },
  textInput: { backgroundColor: COLORS.input, borderWidth: 1, borderColor: COLORS.line, borderRadius: 18, minHeight: 52, paddingHorizontal: 15, color: COLORS.navy, fontWeight: "700" },
  deleteCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#F9FAFC", borderRadius: 20, padding: 14, marginTop: 8 },
  deleteName: { color: COLORS.navy, fontWeight: "900", fontSize: 15 },
  deleteNote: { color: COLORS.text3, fontSize: 11, marginTop: 3 },
  deleteAmount: { color: COLORS.navy, fontWeight: "900", marginLeft: 8 },
  deleteButton: { minHeight: 56, borderRadius: 28, backgroundColor: COLORS.red, alignItems: "center", justifyContent: "center", marginTop: 14 },
  deleteButtonText: { color: COLORS.white, fontWeight: "900" },

  drawerOverlay: { flex: 1, flexDirection: "row" },
  drawerBackdrop: { flex: 1, backgroundColor: "rgba(13, 22, 40, 0.42)" },
  drawer: { position: "absolute", left: 0, top: 0, bottom: 0, width: SCREEN_WIDTH * 0.84, backgroundColor: COLORS.white, paddingTop: 54, paddingHorizontal: 18, shadowColor: COLORS.shadow, shadowOpacity: 0.24, shadowRadius: 20, shadowOffset: { width: 8, height: 0 }, elevation: 14 },
  drawerHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 22 },
  drawerProfile: { backgroundColor: COLORS.bg, borderRadius: 20, padding: 14, flexDirection: "row", alignItems: "center", marginBottom: 25 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.blueSoft, alignItems: "center", justifyContent: "center", marginRight: 11 },
  avatarText: { color: COLORS.blueDark, fontWeight: "900" },
  drawerName: { color: COLORS.navy, fontWeight: "900", fontSize: 13 },
  drawerMuted: { color: COLORS.text3, marginTop: 3, fontSize: 11 },
  drawerLabel: { color: COLORS.text3, fontSize: 10, fontWeight: "900", letterSpacing: 1.2, marginBottom: 7 },
  drawerItem: { flexDirection: "row", alignItems: "center", paddingVertical: 13, paddingHorizontal: 9, borderRadius: 15 },
  drawerIcon: { width: 30, color: COLORS.blueDark, fontSize: 21, textAlign: "center", marginRight: 7 },
  drawerItemText: { color: COLORS.navy, fontSize: 15, fontWeight: "800" },
  drawerDivider: { height: 1, backgroundColor: COLORS.line, marginVertical: 13 },
  drawerBottom: { position: "absolute", left: 18, right: 18, bottom: 28, borderTopWidth: 1, borderTopColor: COLORS.line, paddingTop: 13 },
  drawerBottomText: { color: COLORS.text3, fontSize: 10, marginTop: 2 },

  iconCircle: { alignItems: "center", justifyContent: "center" },
  iconCircleText: { fontSize: 20, fontWeight: "900" },
  loadingText: { color: COLORS.navy, fontSize: 21, fontWeight: "900", marginTop: 18 },
  loadingSubtext: { color: COLORS.text3, fontSize: 12, marginTop: 5 },
});

