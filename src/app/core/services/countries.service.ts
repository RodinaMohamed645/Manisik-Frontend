import { Injectable } from '@angular/core';

export interface Country {
  name: string;
  nameAr: string;
  code: string;
  dialCode: string;
  flag: string;
}

@Injectable({
  providedIn: 'root'
})
export class CountriesService {
  
  private countries: Country[] = [
    // Middle East & North Africa
    { name: 'Egypt', nameAr: 'مصر', code: 'EG', dialCode: '+20', flag: '🇪🇬' },
    { name: 'Saudi Arabia', nameAr: 'السعودية', code: 'SA', dialCode: '+966', flag: '🇸🇦' },
    { name: 'United Arab Emirates', nameAr: 'الإمارات', code: 'AE', dialCode: '+971', flag: '🇦🇪' },
    { name: 'Qatar', nameAr: 'قطر', code: 'QA', dialCode: '+974', flag: '🇶🇦' },
    { name: 'Kuwait', nameAr: 'الكويت', code: 'KW', dialCode: '+965', flag: '🇰🇼' },
    { name: 'Bahrain', nameAr: 'البحرين', code: 'BH', dialCode: '+973', flag: '🇧🇭' },
    { name: 'Oman', nameAr: 'عمان', code: 'OM', dialCode: '+968', flag: '🇴🇲' },
    { name: 'Jordan', nameAr: 'الأردن', code: 'JO', dialCode: '+962', flag: '🇯🇴' },
    { name: 'Lebanon', nameAr: 'لبنان', code: 'LB', dialCode: '+961', flag: '🇱🇧' },
    { name: 'Syria', nameAr: 'سوريا', code: 'SY', dialCode: '+963', flag: '🇸🇾' },
    { name: 'Iraq', nameAr: 'العراق', code: 'IQ', dialCode: '+964', flag: '🇮🇶' },
    { name: 'Palestine', nameAr: 'فلسطين', code: 'PS', dialCode: '+970', flag: '🇵🇸' },
    { name: 'Yemen', nameAr: 'اليمن', code: 'YE', dialCode: '+967', flag: '🇾🇪' },
    { name: 'Morocco', nameAr: 'المغرب', code: 'MA', dialCode: '+212', flag: '🇲🇦' },
    { name: 'Algeria', nameAr: 'الجزائر', code: 'DZ', dialCode: '+213', flag: '🇩🇿' },
    { name: 'Tunisia', nameAr: 'تونس', code: 'TN', dialCode: '+216', flag: '🇹🇳' },
    { name: 'Libya', nameAr: 'ليبيا', code: 'LY', dialCode: '+218', flag: '🇱🇾' },
    { name: 'Sudan', nameAr: 'السودان', code: 'SD', dialCode: '+249', flag: '🇸🇩' },
    
    // Asia
    { name: 'Turkey', nameAr: 'تركيا', code: 'TR', dialCode: '+90', flag: '🇹🇷' },
    { name: 'Iran', nameAr: 'إيران', code: 'IR', dialCode: '+98', flag: '🇮🇷' },
    { name: 'Pakistan', nameAr: 'باكستان', code: 'PK', dialCode: '+92', flag: '🇵🇰' },
    { name: 'India', nameAr: 'الهند', code: 'IN', dialCode: '+91', flag: '🇮🇳' },
    { name: 'Bangladesh', nameAr: 'بنغلاديش', code: 'BD', dialCode: '+880', flag: '🇧🇩' },
    { name: 'Indonesia', nameAr: 'إندونيسيا', code: 'ID', dialCode: '+62', flag: '🇮🇩' },
    { name: 'Malaysia', nameAr: 'ماليزيا', code: 'MY', dialCode: '+60', flag: '🇲🇾' },
    { name: 'Afghanistan', nameAr: 'أفغانستان', code: 'AF', dialCode: '+93', flag: '🇦🇫' },
    { name: 'China', nameAr: 'الصين', code: 'CN', dialCode: '+86', flag: '🇨🇳' },
    { name: 'Japan', nameAr: 'اليابان', code: 'JP', dialCode: '+81', flag: '🇯🇵' },
    { name: 'South Korea', nameAr: 'كوريا الجنوبية', code: 'KR', dialCode: '+82', flag: '🇰🇷' },
    { name: 'Philippines', nameAr: 'الفلبين', code: 'PH', dialCode: '+63', flag: '🇵🇭' },
    { name: 'Thailand', nameAr: 'تايلاند', code: 'TH', dialCode: '+66', flag: '🇹🇭' },
    { name: 'Vietnam', nameAr: 'فيتنام', code: 'VN', dialCode: '+84', flag: '🇻🇳' },
    { name: 'Singapore', nameAr: 'سنغافورة', code: 'SG', dialCode: '+65', flag: '🇸🇬' },
    
    // Europe
    { name: 'United Kingdom', nameAr: 'المملكة المتحدة', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
    { name: 'Germany', nameAr: 'ألمانيا', code: 'DE', dialCode: '+49', flag: '🇩🇪' },
    { name: 'France', nameAr: 'فرنسا', code: 'FR', dialCode: '+33', flag: '🇫🇷' },
    { name: 'Italy', nameAr: 'إيطاليا', code: 'IT', dialCode: '+39', flag: '🇮🇹' },
    { name: 'Spain', nameAr: 'إسبانيا', code: 'ES', dialCode: '+34', flag: '🇪🇸' },
    { name: 'Netherlands', nameAr: 'هولندا', code: 'NL', dialCode: '+31', flag: '🇳🇱' },
    { name: 'Belgium', nameAr: 'بلجيكا', code: 'BE', dialCode: '+32', flag: '🇧🇪' },
    { name: 'Sweden', nameAr: 'السويد', code: 'SE', dialCode: '+46', flag: '🇸🇪' },
    { name: 'Norway', nameAr: 'النرويج', code: 'NO', dialCode: '+47', flag: '🇳🇴' },
    { name: 'Denmark', nameAr: 'الدنمارك', code: 'DK', dialCode: '+45', flag: '🇩🇰' },
    { name: 'Austria', nameAr: 'النمسا', code: 'AT', dialCode: '+43', flag: '🇦🇹' },
    { name: 'Switzerland', nameAr: 'سويسرا', code: 'CH', dialCode: '+41', flag: '🇨🇭' },
    { name: 'Poland', nameAr: 'بولندا', code: 'PL', dialCode: '+48', flag: '🇵🇱' },
    { name: 'Greece', nameAr: 'اليونان', code: 'GR', dialCode: '+30', flag: '🇬🇷' },
    { name: 'Russia', nameAr: 'روسيا', code: 'RU', dialCode: '+7', flag: '🇷🇺' },
    
    // Americas
    { name: 'United States', nameAr: 'الولايات المتحدة', code: 'US', dialCode: '+1', flag: '🇺🇸' },
    { name: 'Canada', nameAr: 'كندا', code: 'CA', dialCode: '+1', flag: '🇨🇦' },
    { name: 'Mexico', nameAr: 'المكسيك', code: 'MX', dialCode: '+52', flag: '🇲🇽' },
    { name: 'Brazil', nameAr: 'البرازيل', code: 'BR', dialCode: '+55', flag: '🇧🇷' },
    { name: 'Argentina', nameAr: 'الأرجنتين', code: 'AR', dialCode: '+54', flag: '🇦🇷' },
    { name: 'Colombia', nameAr: 'كولومبيا', code: 'CO', dialCode: '+57', flag: '🇨🇴' },
    
    // Africa
    { name: 'Nigeria', nameAr: 'نيجيريا', code: 'NG', dialCode: '+234', flag: '🇳🇬' },
    { name: 'South Africa', nameAr: 'جنوب أفريقيا', code: 'ZA', dialCode: '+27', flag: '🇿🇦' },
    { name: 'Kenya', nameAr: 'كينيا', code: 'KE', dialCode: '+254', flag: '🇰🇪' },
    { name: 'Ethiopia', nameAr: 'إثيوبيا', code: 'ET', dialCode: '+251', flag: '🇪🇹' },
    { name: 'Ghana', nameAr: 'غانا', code: 'GH', dialCode: '+233', flag: '🇬🇭' },
    { name: 'Tanzania', nameAr: 'تنزانيا', code: 'TZ', dialCode: '+255', flag: '🇹🇿' },
    { name: 'Senegal', nameAr: 'السنغال', code: 'SN', dialCode: '+221', flag: '🇸🇳' },
    { name: 'Somalia', nameAr: 'الصومال', code: 'SO', dialCode: '+252', flag: '🇸🇴' },
    
    // Oceania
    { name: 'Australia', nameAr: 'أستراليا', code: 'AU', dialCode: '+61', flag: '🇦🇺' },
    { name: 'New Zealand', nameAr: 'نيوزيلندا', code: 'NZ', dialCode: '+64', flag: '🇳🇿' },
  ];

  getCountries(): Country[] {
    return this.countries.sort((a, b) => a.name.localeCompare(b.name));
  }

  getCountryByCode(code: string): Country | undefined {
    return this.countries.find(c => c.code === code);
  }

  getCountryByDialCode(dialCode: string): Country | undefined {
    return this.countries.find(c => c.dialCode === dialCode);
  }

  searchCountries(query: string, isRTL: boolean = false): Country[] {
    const lowerQuery = query.toLowerCase();
    return this.countries.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) ||
      c.nameAr.includes(query) ||
      c.code.toLowerCase().includes(lowerQuery) ||
      c.dialCode.includes(query)
    );
  }
}
