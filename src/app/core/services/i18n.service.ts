import { Injectable, signal, effect, inject } from '@angular/core';

export type Language = 'en' | 'ar';

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private readonly languageSignal = signal<Language>(this.getInitialLanguage());
  public readonly language = this.languageSignal.asReadonly();

  private readonly translations: Translations = {
    // Short and long app name. Use `app.shortName` for tight UI (logo) and
    // `app.name` for full titles and SEO/meta content.
    'app.name': { en: 'Manisik Umrah Booking', ar: 'مناسك الحج والعمرة' },
    'app.shortName': { en: 'Manisik', ar: 'مناسك' },
    // Common UI phrases used across templates
    'common.viewDetails': { en: 'View Details', ar: 'عرض التفاصيل' },
    'aria.viewDetailsFor': { en: 'View details for', ar: 'عرض التفاصيل لـ' },
    'chat.new': { en: 'New Chat', ar: 'محادثة جديدة' },
    'chat.close': { en: 'Close', ar: 'إغلاق' },
    'chat.placeholder': { en: 'Ask something...', ar: 'اسأل شيئًا...' },
    'home.viewAllPackages': { en: 'View All Packages', ar: 'عرض جميع الباقات' },
    'home.trending': {
      en: 'Trending Umrah Packages',
      ar: 'الباقات الأكثر رواجًا',
    },
    'home.trendingDesc': {
      en: 'Choose from our carefully curated packages designed for every budget',
      ar: 'اختر من باقاتنا المختارة بعناية لتناسب جميع الميزانيات',
    },
    'home.howItWorks': { en: 'How It Works', ar: 'كيف تعمل الخدمة' },
    'home.howItWorksDesc': {
      en: 'Book your spiritual journey in 4 simple steps',
      ar: 'احجز رحلتك الروحية في 4 خطوات بسيطة',
    },
    'home.newsletterTitle': {
      en: 'Get Exclusive Umrah Travel Tips & Deals',
      ar: 'احصل على نصائح وصفقات حصرية للعمرة',
    },
    'home.newsletterDesc': {
      en: 'Subscribe to our newsletter and be the first to know about special offers, travel guides, and updates.',
      ar: 'اشترك في نشرتنا الإخبارية لتكون أول من يتلقى العروض والدلائل والتحديثات.',
    },
    // How it works (keys already declared above)
    // Steps
    'home.steps.0.title': {
      en: 'Choose Package/Services',
      ar: 'اختر الباقة/الخدمات',
    },
    'home.steps.0.description': {
      en: 'Browse our curated packages or build your own custom journey',
      ar: 'تصفح باقاتنا المختارة أو أنشئ مسارك المخصص',
    },
    'home.steps.1.title': { en: 'Customize Your Trip', ar: 'خصص رحلتك' },
    'home.steps.1.description': {
      en: 'Select hotels, transport, and dates that work best for you',
      ar: 'اختر الفنادق والنقل والتواريخ المناسبة لك',
    },
    'home.steps.2.title': { en: 'Secure Payment', ar: 'دفع آمن' },
    'home.steps.2.description': {
      en: 'Pay securely with multiple payment options and flexible plans',
      ar: 'ادفع بأمان مع خيارات دفع متعددة وخطط مرنة',
    },
    'home.steps.3.title': { en: 'Receive Confirmation', ar: 'استلم التأكيد' },
    'home.steps.3.description': {
      en: 'Get instant confirmation and all travel documents via email',
      ar: 'احصل على تأكيد فوري وجميع مستندات السفر عبر البريد الإلكتروني',
    },
    // Stats
    'stats.totalBookings': { en: 'Total Bookings', ar: 'إجمالي الحجوزات' },
    'stats.satisfactionRate': { en: 'Satisfaction Rate', ar: 'معدل الرضا' },
    'stats.supportAvailable': { en: 'Support Available', ar: 'الدعم متاح' },
    'stats.destinations': { en: 'Destinations', ar: 'الوجهات' },
    'home.subscribe': { en: 'Subscribe', ar: 'اشترك' },
    'home.subscribing': { en: 'Subscribing...', ar: 'جاري الاشتراك...' },
    'home.newsletterPrivacy': {
      en: 'Your privacy is protected. Unsubscribe anytime.',
      ar: 'خصوصيتك محمية. يمكنك إلغاء الاشتراك في أي وقت.',
    },
    'testimonials.title': { en: 'What Our Pilgrims Say', ar: 'آراء الحجاج' },
    'testimonials.desc': {
      en: 'Real experiences from verified travelers',
      ar: 'تجارب حقيقية من مسافرين موثوقين',
    },
    'faq.title': { en: 'Frequently Asked Questions', ar: 'الأسئلة الشائعة' },
    'faq.desc': {
      en: 'Find answers to common questions about booking your Umrah journey',
      ar: 'اعثر على إجابات للأسئلة الشائعة حول حجز رحلة العمرة',
    },
    'chat.assistant': { en: 'Assistant', ar: 'المساعد' },
    'chat.welcome': {
      en: 'Hello! How can I help you plan your trip today?',
      ar: 'مرحبًا! كيف يمكنني مساعدتك في تخطيط رحلتك اليوم؟',
    },
    'chat.newStarted': {
      en: 'New chat started. How can I help?',
      ar: 'تم بدء محادثة جديدة. كيف أستطيع المساعدة؟',
    },
    'chat.send': { en: 'send', ar: 'ارسل' },
    // Hero slider translations
    'hero.title': {
      en: 'Your Journey to the Holy Land Begins Here',
      ar: 'رحلتك إلى الأرض المقدسة تبدأ من هنا',
    },
    'hero.subtitle': {
      en: 'Book Umrah packages, hotels, and transport - all in one place',
      ar: 'احجز باقات العمرة والفنادق والنقل - كل ذلك في مكان واحد',
    },
    'hero.explore': { en: 'Explore Packages', ar: 'استكشف الباقات' },
    'hero.findHotels': { en: 'Find Hotels', ar: 'ابحث عن الفنادق' },
    // Hero slides content (per-slide keys)
    'hero.slides.0.title': { en: 'Experience Makkah', ar: 'اكتشف مكة' },
    'hero.slides.0.subtitle': { en: 'The Sacred City', ar: 'المدينة المقدسة' },
    'hero.slides.0.description': {
      en: 'Begin your spiritual journey at the holiest site in Islam',
      ar: 'ابدأ رحلتك الروحية في أكثر الأماكن قداسة في الإسلام',
    },
    'hero.slides.1.title': { en: 'Discover Madinah', ar: 'اكتشف المدينة' },
    'hero.slides.1.subtitle': { en: 'The City of Light', ar: 'مدينة النور' },
    'hero.slides.1.description': {
      en: "Visit the Prophet's Mosque and experience tranquility",
      ar: 'زر المسجد النبوي واختبر السكون والطمأنينة',
    },
    'hero.slides.2.title': { en: 'Complete Journey', ar: 'رحلة متكاملة' },
    'hero.slides.2.subtitle': { en: 'Makkah & Madinah', ar: 'مكة والمدينة' },
    'hero.slides.2.description': {
      en: 'All-inclusive packages for a seamless pilgrimage',
      ar: 'باقات شاملة لرحلة حج متكاملة وسلسة',
    },
    // Badges used in hero slides
    'hero.badges.destinations': { en: '50+ Destinations', ar: '50+ وجهة' },
    'hero.badges.yearRound': {
      en: 'Year-Round Packages',
      ar: 'باقات على مدار السنة',
    },
    'hero.badges.pilgrims': {
      en: '10,000+ Pilgrims',
      ar: 'أكثر من 10,000 حاج',
    },
    // CTA keys used in slides
    'hero.cta.book': { en: 'Book Your Journey', ar: 'احجز رحلتك' },
    'hero.cta.explore': { en: 'Explore Packages', ar: 'استعرض الباقات' },
    // Testimonials items
    'testimonials.items.0': {
      en: 'Manisik made my Umrah journey incredibly smooth. From booking to arrival, everything was perfectly organized. The hotel was close to Haram and the support team was always available. Highly recommended!',
      ar: 'جعلت منـاسك رحلة العمرة الخاصة بي سلسة للغاية. من الحجز إلى الوصول، كان كل شيء منظماً بشكل مثالي. الفندق قريب من الحرم وكان فريق الدعم متاحاً دائماً. أنصح به بشدة!',
    },
    'testimonials.items.1': {
      en: "As a first-time pilgrim, I was nervous about planning everything. Manisik's team guided me through every step. The package was affordable and the experience was life-changing. JazakAllah Khair!",
      ar: 'بوصفي حاجًا لأول مرة، كنت قلقًا بشأن التخطيط لكل شيء. أرشدني فريق منـاسك في كل خطوة. كانت الباقة ميسورة التكلفة والتجربة مغيرة للحياة. جزاكم الله خيرًا!',
    },
    'testimonials.items.2': {
      en: "Best Umrah booking platform! The website is easy to use, prices are transparent, and customer service is exceptional. I've booked my third trip with them and will continue to do so.",
      ar: 'أفضل منصة لحجز العمرة! الموقع سهل الاستخدام، الأسعار شفافة، وخدمة العملاء متميزة. حجزت رحلتي الثالثة معهم وسأستمر في ذلك.',
    },

    // FAQ item translations
    'faq.items.0.question': {
      en: 'How do I book an Umrah package?',
      ar: 'كيف أحجز باقة عمرة؟',
    },
    'faq.items.0.answer': {
      en: "Booking is simple! Browse our packages, select your preferred dates and accommodations, fill in your details, and complete the secure payment. You'll receive instant confirmation via email.",
      ar: 'الحجز سهل! تصفح باقاتنا، اختر التواريخ والإقامة المفضلة لديك، املأ بياناتك، وأكمل الدفع الآمن. ستتلقى تأكيدًا فوريًا عبر البريد الإلكتروني.',
    },
    'faq.items.1.question': {
      en: 'What is included in the Umrah packages?',
      ar: 'ما الذي يتضمنه باقات العمرة؟',
    },
    'faq.items.1.answer': {
      en: 'Our packages typically include accommodation, visa processing assistance, transport between cities, and 24/7 customer support. Specific inclusions vary by package tier (Economy, Standard, Premium, VIP).',
      ar: 'تتضمن باقاتنا عادة الإقامة، والمساعدة في معالجة التأشيرات، والنقل بين المدن، ودعم العملاء على مدار الساعة. تختلف التفاصيل بحسب فئة الباقة.',
    },
    'faq.items.2.question': {
      en: 'Can I customize my package?',
      ar: 'هل يمكنني تخصيص باقتي؟',
    },
    'faq.items.2.answer': {
      en: 'Yes! You can build a custom package by selecting individual services like hotels, flights, and transport. Our team can also help you create a personalized itinerary.',
      ar: 'نعم! يمكنك بناء باقة مخصصة باختيار خدمات فردية مثل الفنادق والرحلات والنقل. ويمكن لفريقنا مساعدتك في إنشاء خط سير شخصي.',
    },
    'faq.items.3.question': {
      en: 'What is your cancellation policy?',
      ar: 'ما هي سياسة الإلغاء؟',
    },
    'faq.items.3.answer': {
      en: 'Cancellation policies vary by package and service provider. Generally, we offer free cancellation up to 30 days before departure. Please check specific terms during booking.',
      ar: 'تختلف سياسات الإلغاء حسب الباقة ومقدم الخدمة. عمومًا، نسمح بالإلغاء المجاني حتى 30 يومًا قبل المغادرة. يرجى مراجعة الشروط أثناء الحجز.',
    },
    'faq.items.4.question': {
      en: 'Do you assist with visa applications?',
      ar: 'هل تساعدون في طلبات التأشيرة؟',
    },
    'faq.items.4.answer': {
      en: 'Yes, we provide comprehensive visa assistance including document verification, application submission, and follow-up. Visa fees are typically included in our packages.',
      ar: 'نعم، نقدم مساعدة شاملة في التأشيرات بما في ذلك التحقق من المستندات وتقديم الطلب والمتابعة. عادةً ما تكون رسوم التأشيرة مشمولة في باقاتنا.',
    },
    'faq.items.5.question': {
      en: 'Is travel insurance included?',
      ar: 'هل التأمين على السفر مشمول؟',
    },
    'faq.items.5.answer': {
      en: 'Travel insurance is optional and can be added during booking. We highly recommend it for your peace of mind and protection during your journey.',
      ar: 'التأمين على السفر اختياري ويمكن إضافته أثناء الحجز. نوصي به بشدة لراحة بالك وحمايتك أثناء الرحلة.',
    },
    'faq.items.6.question': {
      en: 'How close are the hotels to Masjid al-Haram?',
      ar: 'ما مدى قرب الفنادق من المسجد الحرام؟',
    },
    'faq.items.6.answer': {
      en: 'We partner with hotels at various distances from the Haram. You can filter by distance during booking. Most of our hotels are within walking distance (100m-2km).',
      ar: 'نتعاون مع فنادق على مسافات مختلفة من الحرم. يمكنك التصفية حسب المسافة أثناء الحجز. معظم فنادقنا على مسافة مريحة سيرًا (100م-2كم).',
    },
    'faq.items.7.question': {
      en: 'What payment methods do you accept?',
      ar: 'ما طرق الدفع المقبولة؟',
    },
    'faq.items.7.answer': {
      en: 'We accept all major credit cards (Visa, Mastercard, Amex), PayPal, bank transfers, and offer flexible installment plans for qualifying bookings.',
      ar: 'نقبل جميع بطاقات الائتمان الرئيسية (فيزا، ماستركارد، أميركان إكسبريس)، باي بال، التحويلات البنكية، ونقدم خطط تقسيط مرنة للحجوزات المؤهلة.',
    },

    // Dashboard translations
    'dashboard.menu.dashboard': { en: 'Dashboard', ar: 'لوحة التحكم' },
    'dashboard.menu.book': { en: 'Book Umrah', ar: 'حجز العمرة' },
    'dashboard.menu.hotels': { en: 'Hotels', ar: 'الفنادق' },
    'dashboard.menu.transport': { en: 'Transport', ar: 'النقل' },
    'dashboard.welcome': {
      en: 'Welcome back, John!',
      ar: 'مرحبًا بعودتك، جون!',
    },
    'dashboard.subtitle': {
      en: 'Your next trip is in 45 days!',
      ar: 'رحلتك القادمة بعد 45 يومًا!',
    },
    'dashboard.upcomingTrips': { en: 'Upcoming Trips', ar: 'الرحلات القادمة' },
    'dashboard.nextTripDate': {
      en: 'Next: Dec 15, 2025',
      ar: 'التالي: 15 ديسمبر 2025',
    },
    'dashboard.totalBookings': { en: 'Total Bookings', ar: 'إجمالي الحجوزات' },
    'dashboard.allTime': { en: 'All time', ar: 'جميع الأوقات' },
    'dashboard.recentActivity': { en: 'Recent Activity', ar: 'النشاط الأخير' },

    // Footer translations (a subset)
    'footer.aboutTitle': { en: 'About Manisik', ar: 'حول منـاسك' },
    'footer.aboutText': {
      en: 'Your trusted partner for spiritual journeys. Making Umrah and Hajj accessible to everyone.',
      ar: 'شريكك الموثوق لرحلات الروحانية. نجعل العمرة والحج في متناول الجميع.',
    },
    'footer.quickLinks': { en: 'Quick Links', ar: 'روابط سريعة' },
    'footer.services': { en: 'Services', ar: 'الخدمات' },
    'footer.support': { en: 'Support', ar: 'الدعم' },
    'footer.contact': { en: 'Contact', ar: 'اتصل بنا' },
    'footer.bottomCopyright': {
      en: '© 2025 Manisik. All rights reserved.',
      ar: '© 2025 منـاسك. جميع الحقوق محفوظة.',
    },
    'common.from': { en: 'From', ar: 'من' },
    'common.perPerson': { en: '/person', ar: '/شخص' },
    'hotel.fromHaram': { en: 'km from Haram', ar: 'كم من الحرم' },
    'nav.home': { en: 'Home', ar: 'الرئيسية' },
    'nav.packages': { en: 'Packages', ar: 'الباقات' },
    'nav.hotels': { en: 'Hotels', ar: 'الفنادق' },
    'nav.transport': { en: 'Transport', ar: 'النقل' },
    'nav.about': { en: 'About', ar: 'من نحن' },
    'nav.bookings': { en: 'My Bookings', ar: 'حجوزاتي' },
    'nav.users': { en: 'Users', ar: 'المستخدمون' },
    'nav.login': { en: 'Login', ar: 'تسجيل الدخول' },
    'nav.logout': { en: 'Logout', ar: 'تسجيل الخروج' },
    'auth.login': { en: 'Login', ar: 'تسجيل الدخول' },
    'auth.register': { en: 'Register', ar: 'إنشاء حساب' },
    'auth.signIn': { en: 'Sign In', ar: 'تسجيل الدخول' },
    'auth.signUp': { en: 'Sign Up', ar: 'إنشاء حساب' },
    'auth.email': { en: 'Email', ar: 'البريد الإلكتروني' },
    'auth.password': { en: 'Password', ar: 'كلمة المرور' },
    'auth.firstName': { en: 'First Name', ar: 'الاسم الأول' },
    'auth.lastName': { en: 'Last Name', ar: 'اسم العائلة' },
    'auth.phone': { en: 'Phone', ar: 'الهاتف' },
    'common.loading': { en: 'Loading...', ar: 'جاري التحميل...' },
    'common.save': { en: 'Save', ar: 'حفظ' },
    'common.cancel': { en: 'Cancel', ar: 'إلغاء' },
    'common.delete': { en: 'Delete', ar: 'حذف' },
    'common.edit': { en: 'Edit', ar: 'تعديل' },
    'common.search': { en: 'Search', ar: 'بحث' },
    'common.filter': { en: 'Filter', ar: 'تصفية' },
    'common.apply': { en: 'Apply', ar: 'تطبيق' },
    'common.reset': { en: 'Reset', ar: 'إعادة تعيين' },
  };

  constructor() {
    effect(() => {
      const lang = this.languageSignal();
      this.applyLanguage(lang);
      this.saveLanguage(lang);
    });

    // Apply initial language
    this.applyLanguage(this.languageSignal());
  }

  translate(key: string): string {
    const translation = this.translations[key];
    if (!translation) {
      return key;
    }
    return translation[this.languageSignal()] || translation.en;
  }

  setLanguage(language: Language): void {
    this.languageSignal.set(language);
  }

  toggleLanguage(): void {
    this.languageSignal.update((current) => (current === 'en' ? 'ar' : 'en'));
  }

  isRTL(): boolean {
    return this.languageSignal() === 'ar';
  }

  private getInitialLanguage(): Language {
    const saved = localStorage.getItem('language') as Language | null;
    if (saved && (saved === 'en' || saved === 'ar')) {
      return saved;
    }
    return 'en';
  }

  private applyLanguage(language: Language): void {
    const html = document.documentElement;
    html.setAttribute('lang', language);
    html.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
  }

  private saveLanguage(language: Language): void {
    localStorage.setItem('language', language);
  }
}
