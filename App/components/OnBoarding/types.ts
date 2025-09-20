// components/onboarding/types.ts
export interface FormData {
    nickname: string;
    age: string;
    gender: 'male' | 'female' | 'other' | '';
    weight: string;
    height: string;
}

export interface FormErrors {
    nickname?: string;
    age?: string;
    gender?: string;
    weight?: string;
    height?: string;
}

export interface GenderOption {
    value: 'male' | 'female' | 'other';
    icon: string;
    label: string;
}