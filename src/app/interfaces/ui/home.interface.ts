export interface QuickAction {
  icon: string;
  color: string;
  route?: string;
  titleKey: string;
  descriptionKey: string;
}

// Renamed to HomePackage to avoid colliding with the global Package interface
export interface HomePackage {
  id: number;
  titleKey: string;
  image: string;
  price: number;
  duration: number; // days
  rating: number;
  reviews: number;
  category: string;
  includedKeys: string[];
}

export interface Step {
  icon: string;
  step: string;
  titleKey: string;
  descriptionKey: string;
}

export interface Statistic {
  icon: string;
  value: number;
  suffix: string;
  label: string;
}

export interface Testimonial {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  textKey: string;
  verified: boolean;
}

export interface FAQ {
  questionKey: string;
  answerKey: string;
}
