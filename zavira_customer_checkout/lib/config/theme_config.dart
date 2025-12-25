import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Zavira Salon & Spa Theme Configuration
/// Luxurious modern theme matching the website
/// Black background with white glowing text

class ZaviraTheme {
  // Primary Colors
  static const Color black = Color(0xFF000000);
  static const Color white = Color(0xFFFFFFFF);
  static const Color pureBlack = Color(0xFF000000);

  // Text Colors
  static const Color textPrimary = white;
  static const Color textSecondary = Color(0xFFB3B3B3);
  static const Color textMuted = Color(0xFF666666);

  // Accent Colors (for special elements)
  static const Color emerald = Color(0xFF10B981);
  static const Color violet = Color(0xFF7C3AED);
  static const Color rose = Color(0xFFF43F5E);

  // Glow effect color
  static const Color glowColor = white;

  // Border colors
  static const Color borderColor = Color(0xFF333333);
  static const Color borderLight = Color(0xFF444444);

  // Card background
  static const Color cardBackground = Color(0xFF111111);

  // Text Styles with Glow - using GoogleFonts for proper web loading
  static TextStyle get logoStyle => GoogleFonts.cormorantGaramond(
        fontSize: 48,
        fontWeight: FontWeight.w600,
        color: white,
        letterSpacing: 4,
        shadows: const [
          Shadow(color: Color(0xCCFFFFFF), blurRadius: 10),
          Shadow(color: Color(0x99FFFFFF), blurRadius: 20),
          Shadow(color: Color(0x66FFFFFF), blurRadius: 30),
        ],
      );

  static TextStyle get headingLarge => GoogleFonts.cormorantGaramond(
        fontSize: 36,
        fontWeight: FontWeight.w600,
        color: white,
        letterSpacing: 2,
        shadows: const [
          Shadow(color: Color(0xAAFFFFFF), blurRadius: 8),
          Shadow(color: Color(0x66FFFFFF), blurRadius: 16),
        ],
      );

  static TextStyle get headingMedium => GoogleFonts.cormorantGaramond(
        fontSize: 28,
        fontWeight: FontWeight.w600,
        color: white,
        letterSpacing: 1,
        shadows: const [
          Shadow(color: Color(0x99FFFFFF), blurRadius: 6),
        ],
      );

  static TextStyle get headingSmall => GoogleFonts.cormorantGaramond(
        fontSize: 22,
        fontWeight: FontWeight.w500,
        color: white,
        letterSpacing: 0.5,
      );

  static TextStyle get bodyLarge => GoogleFonts.inter(
        fontSize: 20,
        fontWeight: FontWeight.w400,
        color: white,
        height: 1.5,
      );

  static TextStyle get bodyMedium => GoogleFonts.inter(
        fontSize: 18,
        fontWeight: FontWeight.w400,
        color: white,
        height: 1.5,
      );

  static TextStyle get bodySmall => GoogleFonts.inter(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        color: textSecondary,
        height: 1.4,
      );

  static TextStyle get priceLarge => GoogleFonts.inter(
        fontSize: 42,
        fontWeight: FontWeight.w700,
        color: emerald,
        letterSpacing: 1,
        shadows: const [
          Shadow(color: Color(0x9910B981), blurRadius: 10),
          Shadow(color: Color(0x6610B981), blurRadius: 20),
        ],
      );

  static TextStyle get priceSmall => GoogleFonts.inter(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: emerald,
      );

  static TextStyle get buttonText => GoogleFonts.inter(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: white,
        letterSpacing: 1,
      );

  static TextStyle get labelText => GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: textSecondary,
        letterSpacing: 0.5,
      );

  // Button Styles
  static ButtonStyle get primaryButton => ElevatedButton.styleFrom(
        backgroundColor: white,
        foregroundColor: black,
        padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 20),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        elevation: 0,
        textStyle: GoogleFonts.inter(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          letterSpacing: 1,
        ),
      );

  static ButtonStyle get secondaryButton => OutlinedButton.styleFrom(
        foregroundColor: white,
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        side: const BorderSide(color: borderLight, width: 1),
        textStyle: GoogleFonts.inter(
          fontSize: 18,
          fontWeight: FontWeight.w500,
        ),
      );

  static ButtonStyle get tipButton => OutlinedButton.styleFrom(
        foregroundColor: white,
        backgroundColor: Colors.transparent,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        side: const BorderSide(color: borderLight, width: 1),
      );

  static ButtonStyle get tipButtonSelected => ElevatedButton.styleFrom(
        backgroundColor: emerald,
        foregroundColor: white,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        elevation: 0,
      );

  // Box Decorations
  static BoxDecoration get cardDecoration => BoxDecoration(
        color: cardBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor, width: 1),
      );

  static BoxDecoration get glowingBorder => BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: white.withOpacity(0.3), width: 1),
        boxShadow: [
          BoxShadow(
            color: white.withOpacity(0.1),
            blurRadius: 20,
            spreadRadius: 2,
          ),
        ],
      );

  // ThemeData for MaterialApp
  // Samsung/Impeller fix: Explicit text colors to ensure visibility
  static ThemeData get darkTheme => ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: black,
        primaryColor: white,
        colorScheme: const ColorScheme.dark(
          primary: white,
          secondary: emerald,
          surface: cardBackground,
          error: rose,
          onSurface: white, // Samsung fix: explicit text color
          onPrimary: black,
          onSecondary: white,
        ),
        fontFamily: GoogleFonts.inter().fontFamily,
        // Samsung/Impeller fix: Add explicit text selection and icon themes
        textSelectionTheme: const TextSelectionThemeData(
          cursorColor: white,
          selectionColor: Color(0x44FFFFFF),
          selectionHandleColor: white,
        ),
        iconTheme: const IconThemeData(
          color: white,
          opacity: 1.0, // Explicit opacity for Samsung
        ),
        textTheme: TextTheme(
          displayLarge: headingLarge,
          displayMedium: headingMedium,
          displaySmall: headingSmall,
          bodyLarge: bodyLarge,
          bodyMedium: bodyMedium,
          bodySmall: bodySmall,
          labelLarge: buttonText,
          // Samsung fix: Explicit default text styles
          titleLarge: headingMedium,
          titleMedium: headingSmall,
          titleSmall: bodyLarge,
          labelMedium: labelText,
          labelSmall: labelText,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: primaryButton,
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: secondaryButton,
        ),
        dividerColor: borderColor,
        dividerTheme: const DividerThemeData(
          color: borderColor,
          thickness: 1,
        ),
        // Samsung/Impeller fix: Ensure proper color usage
        appBarTheme: const AppBarTheme(
          backgroundColor: black,
          foregroundColor: white,
          iconTheme: IconThemeData(color: white),
        ),
      );
}
