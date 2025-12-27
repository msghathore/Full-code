import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../config/theme_config.dart';
import '../services/checkout_service.dart';
import '../services/square_payment_service.dart';
import '../widgets/glowing_text.dart';
import 'tip_selection_screen.dart';

/// Waiting screen shown when no checkout is pending
/// Displays Zavira logo with glow effect and "Waiting for checkout" message

class WaitingScreen extends StatefulWidget {
  const WaitingScreen({super.key});

  @override
  State<WaitingScreen> createState() => _WaitingScreenState();
}

class _WaitingScreenState extends State<WaitingScreen> {
  @override
  void initState() {
    super.initState();
    // Listen for checkout sessions
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final checkoutService = context.read<CheckoutService>();
      checkoutService.addListener(_onCheckoutChanged);
    });
  }

  void _onCheckoutChanged() {
    final checkoutService = context.read<CheckoutService>();
    if (checkoutService.hasActiveSession && mounted) {
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) =>
              const TipSelectionScreen(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(opacity: animation, child: child);
          },
          transitionDuration: const Duration(milliseconds: 500),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZaviraTheme.black,
      body: Consumer<CheckoutService>(
        builder: (context, checkoutService, child) {
          // If there's an active session, navigate to invoice
          if (checkoutService.hasActiveSession) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              _onCheckoutChanged();
            });
          }

          return Center(
            child: SingleChildScrollView(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Logo with glow
                  const ZaviraLogo(fontSize: 72, animated: true)
                      .animate(onPlay: (controller) => controller.repeat())
                      .shimmer(
                        duration: const Duration(seconds: 3),
                        color: ZaviraTheme.white.withOpacity(0.3),
                      ),

                  const SizedBox(height: 48),

                  // Waiting message
                  Text(
                    'Welcome',
                    style: ZaviraTheme.headingMedium,
                  ).animate().fadeIn(duration: const Duration(milliseconds: 800)),

                  const SizedBox(height: 12),

                  Text(
                    'Your checkout will appear here',
                    style: ZaviraTheme.bodyLarge.copyWith(
                      color: ZaviraTheme.textSecondary,
                    ),
                  ).animate().fadeIn(
                        delay: const Duration(milliseconds: 400),
                        duration: const Duration(milliseconds: 800),
                      ),

                  const SizedBox(height: 32),

                  // Animated dots
                  _WaitingIndicator(),

                  const SizedBox(height: 48),

                // Connection status
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 10,
                  ),
                  decoration: BoxDecoration(
                    color: checkoutService.isConnected
                        ? ZaviraTheme.emerald.withOpacity(0.1)
                        : ZaviraTheme.rose.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: checkoutService.isConnected
                          ? ZaviraTheme.emerald.withOpacity(0.3)
                          : ZaviraTheme.rose.withOpacity(0.3),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        checkoutService.isConnected
                            ? Icons.wifi
                            : Icons.wifi_off,
                        color: checkoutService.isConnected
                            ? ZaviraTheme.emerald
                            : ZaviraTheme.rose,
                        size: 18,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        checkoutService.isConnected
                            ? 'Connected'
                            : 'Offline - Reconnecting...',
                        style: ZaviraTheme.bodySmall.copyWith(
                          color: checkoutService.isConnected
                              ? ZaviraTheme.emerald
                              : ZaviraTheme.rose,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Square Reader status
                Consumer<SquarePaymentService>(
                  builder: (context, squareService, child) {
                    return Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 10,
                      ),
                      decoration: BoxDecoration(
                        color: squareService.isReaderConnected
                            ? ZaviraTheme.emerald.withOpacity(0.1)
                            : Colors.orange.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: squareService.isReaderConnected
                              ? ZaviraTheme.emerald.withOpacity(0.3)
                              : Colors.orange.withOpacity(0.3),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            squareService.isReaderConnected
                                ? Icons.credit_card
                                : Icons.credit_card_off,
                            color: squareService.isReaderConnected
                                ? ZaviraTheme.emerald
                                : Colors.orange,
                            size: 18,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            squareService.isReaderConnected
                                ? 'Square Reader Connected'
                                : 'Square Reader Not Connected',
                            style: ZaviraTheme.bodySmall.copyWith(
                              color: squareService.isReaderConnected
                                  ? ZaviraTheme.emerald
                                  : Colors.orange,
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),

                const SizedBox(height: 48),

                // Business info
                Text(
                  '283 Tache Avenue, Winnipeg, MB',
                  style: ZaviraTheme.bodySmall.copyWith(
                    color: ZaviraTheme.textMuted,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '(431) 816-3330',
                  style: ZaviraTheme.bodySmall.copyWith(
                    color: ZaviraTheme.textMuted,
                  ),
                ),
                const SizedBox(height: 24),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  @override
  void dispose() {
    context.read<CheckoutService>().removeListener(_onCheckoutChanged);
    super.dispose();
  }
}

/// Animated waiting indicator with three pulsing dots
class _WaitingIndicator extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(3, (index) {
        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 6),
          child: _AnimatedDot(delay: Duration(milliseconds: index * 200)),
        );
      }),
    );
  }
}

class _AnimatedDot extends StatelessWidget {
  final Duration delay;

  const _AnimatedDot({required this.delay});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 12,
      height: 12,
      decoration: BoxDecoration(
        color: ZaviraTheme.white,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: ZaviraTheme.white.withOpacity(0.5),
            blurRadius: 8,
            spreadRadius: 2,
          ),
        ],
      ),
    )
        .animate(
          onPlay: (controller) => controller.repeat(),
        )
        .scale(
          begin: const Offset(1, 1),
          end: const Offset(1.3, 1.3),
          duration: const Duration(milliseconds: 600),
          delay: delay,
        )
        .then()
        .scale(
          begin: const Offset(1.3, 1.3),
          end: const Offset(1, 1),
          duration: const Duration(milliseconds: 600),
        );
  }
}
