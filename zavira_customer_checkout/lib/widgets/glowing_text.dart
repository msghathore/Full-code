import 'package:flutter/material.dart';
import '../config/theme_config.dart';

/// Widget for displaying text with a glowing effect
/// Matches the white glow style from the Zavira website

class GlowingText extends StatelessWidget {
  final String text;
  final TextStyle? style;
  final double glowIntensity;
  final Color? glowColor;
  final TextAlign? textAlign;

  const GlowingText({
    super.key,
    required this.text,
    this.style,
    this.glowIntensity = 1.0,
    this.glowColor,
    this.textAlign,
  });

  @override
  Widget build(BuildContext context) {
    final baseStyle = style ?? ZaviraTheme.headingLarge;
    final glow = glowColor ?? ZaviraTheme.glowColor;

    // Calculate glow shadows based on intensity
    final shadows = [
      Shadow(
        color: glow.withOpacity(0.8 * glowIntensity),
        blurRadius: 10 * glowIntensity,
      ),
      Shadow(
        color: glow.withOpacity(0.6 * glowIntensity),
        blurRadius: 20 * glowIntensity,
      ),
      Shadow(
        color: glow.withOpacity(0.4 * glowIntensity),
        blurRadius: 30 * glowIntensity,
      ),
    ];

    return Text(
      text,
      style: baseStyle.copyWith(shadows: shadows),
      textAlign: textAlign,
    );
  }
}

/// Animated glowing text with pulsing effect
class AnimatedGlowingText extends StatefulWidget {
  final String text;
  final TextStyle? style;
  final Color? glowColor;
  final Duration pulseDuration;
  final TextAlign? textAlign;

  const AnimatedGlowingText({
    super.key,
    required this.text,
    this.style,
    this.glowColor,
    this.pulseDuration = const Duration(seconds: 2),
    this.textAlign,
  });

  @override
  State<AnimatedGlowingText> createState() => _AnimatedGlowingTextState();
}

class _AnimatedGlowingTextState extends State<AnimatedGlowingText>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: widget.pulseDuration,
    )..repeat(reverse: true);

    _animation = Tween<double>(begin: 0.7, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return GlowingText(
          text: widget.text,
          style: widget.style,
          glowIntensity: _animation.value,
          glowColor: widget.glowColor,
          textAlign: widget.textAlign,
        );
      },
    );
  }
}

/// Logo text with Zavira branding
class ZaviraLogo extends StatelessWidget {
  final double fontSize;
  final bool animated;

  const ZaviraLogo({
    super.key,
    this.fontSize = 48,
    this.animated = true,
  });

  @override
  Widget build(BuildContext context) {
    final style = ZaviraTheme.logoStyle.copyWith(fontSize: fontSize);

    if (animated) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          AnimatedGlowingText(
            text: 'ZAVIRA',
            style: style,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            'SALON & SPA',
            style: ZaviraTheme.labelText.copyWith(
              letterSpacing: 4,
              fontSize: fontSize * 0.3,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      );
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        GlowingText(
          text: 'ZAVIRA',
          style: style,
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 8),
        Text(
          'SALON & SPA',
          style: ZaviraTheme.labelText.copyWith(
            letterSpacing: 4,
            fontSize: fontSize * 0.3,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}
