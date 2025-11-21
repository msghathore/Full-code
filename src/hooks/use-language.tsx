import { createContext, useContext, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

type Language = 'en' | 'fr' | 'es'

type LanguageProviderProps = {
  children: React.ReactNode
  defaultLanguage?: Language
  storageKey?: string
}

type LanguageProviderState = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const initialState: LanguageProviderState = {
  language: 'en',
  setLanguage: () => null,
  t: () => '',
}

const LanguageProviderContext = createContext<LanguageProviderState>(initialState)

const translations = {
  en: {
    // Navigation
    login: 'LOGIN',
    logout: 'LOGOUT',
    welcome: 'WELCOME',

    // Auth
    signUp: 'SIGN UP',
    loginTitle: 'LOGIN',
    signUpTitle: 'SIGN UP',
    accessAccount: 'Access your account',
    createAccount: 'Create your account',
    fullName: 'FULL NAME',
    firstName: 'FIRST NAME',
    lastName: 'LAST NAME',
    birthdate: 'BIRTHDATE',
    email: 'EMAIL',
    password: 'PASSWORD',
    yourName: 'Your name',
    yourFirstName: 'Your first name',
    yourLastName: 'Your last name',
    yourEmail: 'your@email.com',
    passwordPlaceholder: '••••••••',
    loading: 'LOADING...',
    loginBtn: 'LOGIN',
    signUpBtn: 'SIGN UP',
    noAccount: "Don't have an account? Sign up",
    haveAccount: 'Already have an account? Login',
    welcomeBack: 'Welcome back!',
    loginSuccess: 'You have successfully logged in.',
    accountCreated: 'Account created!',
    checkEmail: 'Please check your email to verify your account.',

    // Footer
    services: 'SERVICES',
    company: 'COMPANY',
    support: 'SUPPORT',
    followUs: 'FOLLOW US',
    hair: 'Hair',
    nails: 'Nails',
    skin: 'Skin',
    massage: 'Massage',
    tattoo: 'Tattoo',
    piercing: 'Piercing',
    aboutUs: 'About Us',
    careers: 'Careers',
    blog: 'Blog',
    press: 'Press',
    contact: 'Contact',
    faqs: 'FAQs',
    privacy: 'Privacy',
    terms: 'Terms',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    cookiePolicy: 'Cookie Policy',
    copyright: '© 2025 Zavira Salon & Spa. All rights reserved.',

    // Other common
    bookAppointment: 'BOOK APPOINTMENT',
    reserveExperience: 'Reserve your luxurious experience',
    ourServices: 'Our Services',
    experienceLuxury: 'Experience luxury and excellence',
    viewAllServices: 'View All Services',
    shopOurProducts: 'Shop Our Products',
    premiumBeautyProducts: 'Premium beauty products for home care',
    viewAllProducts: 'View All Products',
    // Services
    hairStyling: 'Hair Styling',
    hairStylingDesc: 'Premium cuts, coloring, and treatments',
    nailCare: 'Nail Care',
    nailCareDesc: 'Manicures, pedicures, and nail art',
    skincare: 'Skincare',
    skincareDesc: 'Facials, treatments, and rejuvenation',
    massageService: 'Massage',
    massageDesc: 'Relaxation and therapeutic massage',
    tattooService: 'Tattoo',
    tattooDesc: 'Custom artwork and body art',
    piercingService: 'Piercing',
    piercingDesc: 'Professional piercing services',
    // Products
    luxuryHairSerum: 'Luxury Hair Serum',
    premiumFaceCream: 'Premium Face Cream',
    nailPolishSet: 'Nail Polish Set',
    hydratingShampoo: 'Hydrating Shampoo',
    antiAgingSerum: 'Anti-Aging Serum',
    makeupBrushSet: 'Makeup Brush Set',
    hairCare: 'Hair Care',
    skinCare: 'Skin Care',
    nailCareCategory: 'Nail Care',
    makeup: 'Makeup',
    // Reviews section
    whatOurClientsSay: 'What Our Clients Say',
    testimonialsFromGuests: 'Testimonials from our valued guests',
    // Review texts
    reviewSarah: 'Absolutely stunning experience! The attention to detail is unmatched.',
    reviewMichael: 'Best salon in town. The staff is professional and the ambiance is luxurious.',
    reviewEmma: 'I feel like royalty every time I visit. Highly recommend!',
    reviewDavid: 'Exceptional service and results. Worth every penny!',
    reviewSophie: 'The spa treatments are heavenly. A true escape from daily life.',
    // French translations
    whatOurClientsSayFr: 'Ce Que Disent Nos Clients',
    testimonialsFromGuestsFr: 'Témoignages de nos précieux invités',
    reviewSarahFr: 'Expérience absolument époustouflante ! L\'attention aux détails est inégalée.',
    reviewMichaelFr: 'Meilleur salon en ville. Le personnel est professionnel et l\'ambiance est luxueuse.',
    reviewEmmaFr: 'Je me sens comme une reine à chaque visite. Hautement recommandé !',
    reviewDavidFr: 'Service et résultats exceptionnels. Ça vaut chaque centime !',
    reviewSophieFr: 'Les soins spa sont paradisiaques. Une véritable évasion de la vie quotidienne.',
  },
  fr: {
    // Navigation
    login: 'CONNEXION',
    logout: 'DÉCONNEXION',
    welcome: 'BIENVENUE',

    // Auth
    signUp: 'S\'INSCRIRE',
    loginTitle: 'CONNEXION',
    signUpTitle: 'S\'INSCRIRE',
    accessAccount: 'Accédez à votre compte',
    createAccount: 'Créez votre compte',
    fullName: 'NOM COMPLET',
    firstName: 'PRÉNOM',
    lastName: 'NOM',
    birthdate: 'DATE DE NAISSANCE',
    email: 'EMAIL',
    password: 'MOT DE PASSE',
    yourName: 'Votre nom',
    yourFirstName: 'Votre prénom',
    yourLastName: 'Votre nom',
    yourEmail: 'votre@email.com',
    passwordPlaceholder: '••••••••',
    loading: 'CHARGEMENT...',
    loginBtn: 'SE CONNECTER',
    signUpBtn: 'S\'INSCRIRE',
    noAccount: 'Pas de compte ? S\'inscrire',
    haveAccount: 'Déjà un compte ? Se connecter',
    welcomeBack: 'Bienvenue !',
    loginSuccess: 'Vous vous êtes connecté avec succès.',
    accountCreated: 'Compte créé !',
    checkEmail: 'Veuillez vérifier votre email pour vérifier votre compte.',

    // Footer
    services: 'SERVICES',
    company: 'ENTREPRISE',
    support: 'SUPPORT',
    followUs: 'SUIVEZ-NOUS',
    hair: 'Cheveux',
    nails: 'Ongles',
    skin: 'Peau',
    massage: 'Massage',
    tattoo: 'Tatouage',
    piercing: 'Piercing',
    aboutUs: 'À propos',
    careers: 'Carrières',
    blog: 'Blog',
    press: 'Presse',
    contact: 'Contact',
    faqs: 'FAQ',
    privacy: 'Confidentialité',
    terms: 'Conditions',
    privacyPolicy: 'Politique de confidentialité',
    termsOfService: 'Conditions d\'utilisation',
    cookiePolicy: 'Politique de cookies',
    copyright: '© 2025 Zavira Salon & Spa. Tous droits réservés.',

    // Other common
    bookAppointment: 'RÉSERVER UN RENDEZ-VOUS',
    reserveExperience: 'Réservez votre expérience luxueuse',
    ourServices: 'Nos Services',
    experienceLuxury: 'Découvrez le luxe et l\'excellence',
    viewAllServices: 'Voir Tous les Services',
    shopOurProducts: 'Achetez Nos Produits',
    premiumBeautyProducts: 'Produits de beauté premium pour les soins à domicile',
    viewAllProducts: 'Voir Tous les Produits',
    // Services
    hairStyling: 'Coiffure',
    hairStylingDesc: 'Coupes premium, colorations et traitements',
    nailCare: 'Soin des Ongles',
    nailCareDesc: 'Manucures, pédicures et nail art',
    skincare: 'Soin de la Peau',
    skincareDesc: 'Soins du visage, traitements et rajeunissement',
    massageService: 'Massage',
    massageDesc: 'Massage de relaxation et thérapeutique',
    tattooService: 'Tatouage',
    tattooDesc: 'Art corporel et œuvres personnalisées',
    piercingService: 'Piercing',
    piercingDesc: 'Services de piercing professionnels',
    // Products
    luxuryHairSerum: 'Sérum Capillaire de Luxe',
    premiumFaceCream: 'Crème Visage Premium',
    nailPolishSet: 'Ensemble Vernis à Ongles',
    hydratingShampoo: 'Shampooing Hydratant',
    antiAgingSerum: 'Sérum Anti-Âge',
    makeupBrushSet: 'Ensemble Pinceaux Maquillage',
    hairCare: 'Soins Capillaires',
    skinCare: 'Soins de la Peau',
    nailCareCategory: 'Soin des Ongles',
    makeup: 'Maquillage',
  },
}

export function LanguageProvider({
  children,
}: Omit<LanguageProviderProps, 'defaultLanguage' | 'storageKey'>) {
  const { i18n } = useTranslation()

  const language = i18n.language as Language
  const setLanguage = (lang: Language) => {
    i18n.changeLanguage(lang)
  }

  const t = (key: string): string => {
    return i18n.t(key)
  }

  const value = {
    language,
    setLanguage,
    t,
  }

  return (
    <LanguageProviderContext.Provider value={value}>
      {children}
    </LanguageProviderContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageProviderContext)

  if (context === undefined)
    throw new Error('useLanguage must be used within a LanguageProvider')

  return context
}