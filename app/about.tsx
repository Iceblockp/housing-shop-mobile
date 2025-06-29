import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/shared/Header';
import { Container } from '@/components/shared/Container';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Heart,
  Users,
  ShoppingBag,
  Award,
  BoxIcon,
} from 'lucide-react-native';

type Props = {};

const about = (props: Props) => {
  const handleContactPress = (type: 'email' | 'phone' | 'website') => {
    switch (type) {
      case 'email':
        Linking.openURL('mailto:phonyo126@gmail.com');
        break;
      case 'phone':
        Linking.openURL('tel:+959 425743536');
        break;
      case 'website':
        Linking.openURL('https://housing-online-shop-gray.vercel.app/');
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="အကြောင်းအရာ" showBack={true} showNotification={false} />
      <Container>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <ShoppingBag size={60} color={colors.primary} />
            </View>
            <Text style={styles.appName}>HomeShop</Text>
            <Text style={styles.tagline}>
              မိမိအခန်းမှ လိုအပ်သော ပစ္စည်းများကို လွယ်ကူစွာ ဝယ်ယူပါ
            </Text>
          </View>

          {/* About Us Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ကျွန်ုပ်တို့အကြောင်း</Text>
            <Text style={styles.description}>
              HomeShop သည် မုဒိတာ အိမ်ယာ အတွင်း အိမ်သုံးပစ္စည်းများ၊
              အစားအစာများ၊ နှင့် နေ့စဉ်လိုအပ်သော ပစ္စည်းများကို
              အွန်လိုင်းမှတစ်ဆင့် ဝယ်ယူနိုင်သော Online Store တစ်ခုဖြစ်ပါသည်။
            </Text>
            <Text style={styles.description}>
              ကျွန်ုပ်တို့၏ ရည်မှန်းချက်မှာ နေ့စဉ်လိုအပ်သော ပစ္စည်းများကို
              ကိုယ်တိုင်ဝယ်ယူရန် အချိန်မအားလပ်သည့်အခါ အပြင်ထွက်ဖို့ မလိုအပ်ပဲ
              မှာယူနိုင်ရန် ၊ သက်တောင့်သက်သာရှိစေရန် အရည်အသွေးစစ်မှန်သော
              ပစ္စည်းများကို သင့်တင့်သော စျေးနှုန်းဖြင့် အိမ်တံခါးရှေ့အထိ
              ပို့ဆောင်ပေးရန်ဖြစ်ပါသည်။
            </Text>
          </View>

          {/* Features Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              ကျွန်ုပ်တို့၏ ဝန်ဆောင်မှုများ
            </Text>

            <View style={styles.featureItem}>
              <Heart size={24} color={colors.primary} />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>
                  အရည်အသွေးမြင့် ပစ္စည်းများ
                </Text>
                <Text style={styles.featureDescription}>
                  စျေးနှုန်းသင့်တင့်သော ပစ္စည်းများကို ရွေးချယ်ထားပါသည်
                </Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <BoxIcon size={24} color={colors.primary} />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>
                  ပစ္စည်းအသစ် တောင်းဆိုခြင်း
                </Text>
                <Text style={styles.featureDescription}>
                  ရောင်းချနေသော ပစ္စည်းစာရင်းများအပြင်
                  အခြားဝယ်ယူလိုသောပစ္စည်းများ ရှိပါက request page မှတဆင့်
                  တောင်းဆိုနိုင်ပါသည်။ store ဘက်မှ ထိုပစ္စည်းများကို
                  ထည့်သွင်းရောင်းချပေးသွားပါမည်။
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Users size={24} color={colors.primary} />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>၁၂/၇ ဝန်ဆောင်မှု</Text>
                <Text style={styles.featureDescription}>
                  မနက် ၇ နာရီမှ ည ၇ နာရီအတွင်း အကူအညီပေးရန် အသင့်ရှိပါသည်
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <ShoppingBag size={24} color={colors.primary} />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>
                  လျင်မြန်သော ပို့ဆောင်မှု
                </Text>
                <Text style={styles.featureDescription}>
                  မုဒိတာ အိမ်ယာနှင့် မုဒိတာ ဝန်းကျင်သို့ လျင်မြန်စွာ
                  ပို့ဆောင်ပေးပါသည်
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Award size={24} color={colors.primary} />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>အာမခံချက်</Text>
                <Text style={styles.featureDescription}>
                  ပစ္စည်းများအတွက် ၁၀၀% အာမခံချက်ပေးပါသည်
                </Text>
              </View>
            </View>
          </View>

          {/* Contact Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ဆက်သွယ်ရန်</Text>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleContactPress('email')}
            >
              <Mail size={24} color={colors.primary} />
              <View style={styles.contactContent}>
                <Text style={styles.contactTitle}>အီးမေးလ်</Text>
                <Text style={styles.contactValue}>phonyo126@gmail.com</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleContactPress('phone')}
            >
              <Phone size={24} color={colors.primary} />
              <View style={styles.contactContent}>
                <Text style={styles.contactTitle}>ဖုန်းနံပါတ်</Text>
                <Text style={styles.contactValue}>+959 425 743 536</Text>
                <Text style={styles.contactValue}>+959 940 228 599</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.contactItem}>
              <MapPin size={24} color={colors.primary} />
              <View style={styles.contactContent}>
                <Text style={styles.contactTitle}>လိပ်စာ</Text>
                <Text style={styles.contactValue}>
                  မုဒိတာအိမ်ယာ၊ ဗဟိုလမ်းလမ်း၊ မရမ်းကုန်းမြို့နယ်၊ ရန်ကုန်မြို့
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleContactPress('website')}
            >
              <Globe size={24} color={colors.primary} />
              <View style={styles.contactContent}>
                <Text style={styles.contactTitle}>ဝက်ဘ်ဆိုဒ်</Text>
                <Text style={styles.contactValue}>
                  https://housing-online-shop-gray.vercel.app/
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2025 HomeShop. မူပိုင်ခွင့်အားလုံး ကြိုးစားထားပါသည်။
            </Text>
            <Text style={styles.versionText}>ဗားရှင်း 1.0.0</Text>
          </View>
        </ScrollView>
      </Container>
    </SafeAreaView>
  );
};

export default about;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: colors.card,
    marginBottom: 16,
    borderRadius: 12,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textLight,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 24,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: 16,
  },
  description: {
    textAlign: 'justify',
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textLight,
    lineHeight: 24,
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  featureContent: {
    flex: 1,
    marginLeft: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textLight,
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contactContent: {
    flex: 1,
    marginLeft: 16,
  },
  contactTitle: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textLight,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 8,
  },
  versionText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.disabled,
  },
});
