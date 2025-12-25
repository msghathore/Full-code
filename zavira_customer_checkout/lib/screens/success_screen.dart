import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../config/theme_config.dart';
import '../services/checkout_service.dart';
import '../widgets/glowing_text.dart';
import 'waiting_screen.dart';

/// Success screen - shown after successful payment
/// Displays confirmation, receipt options, and auto-returns to waiting

class SuccessScreen extends StatefulWidget {
  const SuccessScreen({super.key});

  @override
  State<SuccessScreen> createState() => _SuccessScreenState();
}

class _SuccessScreenState extends State<SuccessScreen> {
  bool _receiptSent = false;
  bool _isSendingReceipt = false;
  int _countdown = 15;

  @override
  void initState() {
    super.initState();
    _startCountdown();
  }

  void _startCountdown() {
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted && _countdown > 0) {
        setState(() => _countdown--);
        _startCountdown();
      } else if (mounted && _countdown == 0) {
        _returnToWaiting();
      }
    });
  }

  Future<void> _sendEmailReceipt() async {
    final session = context.read<CheckoutService>().currentSession;
    if (session?.customerEmail == null || session!.customerEmail!.isEmpty) {
      // Show email input dialog
      _showEmailDialog();
      return;
    }

    setState(() => _isSendingReceipt = true);

    try {
      // TODO: Implement email receipt via Supabase Edge Function
      await Future.delayed(const Duration(seconds: 2)); // Simulated

      setState(() {
        _receiptSent = true;
        _isSendingReceipt = false;
      });
    } catch (e) {
      setState(() => _isSendingReceipt = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to send receipt: $e'),
            backgroundColor: ZaviraTheme.rose,
          ),
        );
      }
    }
  }

  void _showEmailDialog() {
    final controller = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: ZaviraTheme.cardBackground,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: ZaviraTheme.borderColor),
        ),
        title: Text(
          'Enter Email',
          style: ZaviraTheme.headingSmall,
        ),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.emailAddress,
          style: ZaviraTheme.bodyLarge,
          decoration: InputDecoration(
            hintText: 'your@email.com',
            hintStyle: ZaviraTheme.bodyLarge.copyWith(
              color: ZaviraTheme.textMuted,
            ),
            filled: true,
            fillColor: ZaviraTheme.black,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: ZaviraTheme.borderColor),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: ZaviraTheme.borderColor),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: ZaviraTheme.emerald, width: 2),
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Cancel',
              style: ZaviraTheme.bodyMedium.copyWith(
                color: ZaviraTheme.textSecondary,
              ),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              // TODO: Update session email and send receipt
              _sendEmailReceipt();
            },
            style: ZaviraTheme.primaryButton,
            child: const Text('Send'),
          ),
        ],
      ),
    );
  }

  void _returnToWaiting() {
    // Clear session and return to waiting
    context.read<CheckoutService>().clearSession();

    Navigator.of(context).pushAndRemoveUntil(
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) =>
            const WaitingScreen(),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return FadeTransition(opacity: animation, child: child);
        },
        transitionDuration: const Duration(milliseconds: 500),
      ),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZaviraTheme.black,
      body: SafeArea(
        child: Consumer<CheckoutService>(
          builder: (context, checkoutService, _) {
            final session = checkoutService.currentSession;

            return Column(
              children: [
                // Header
                Padding(
                  padding: const EdgeInsets.all(32),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const ZaviraLogo(fontSize: 32, animated: false),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: ZaviraTheme.cardBackground,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: ZaviraTheme.borderColor),
                        ),
                        child: Text(
                          'Auto-return in $_countdown s',
                          style: ZaviraTheme.bodySmall,
                        ),
                      ),
                    ],
                  ),
                ),

                // Main content
                Expanded(
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Success checkmark with animation
                        Container(
                          width: 160,
                          height: 160,
                          decoration: BoxDecoration(
                            color: ZaviraTheme.emerald.withOpacity(0.1),
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: ZaviraTheme.emerald,
                              width: 4,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: ZaviraTheme.emerald.withOpacity(0.4),
                                blurRadius: 40,
                                spreadRadius: 10,
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.check,
                            size: 80,
                            color: ZaviraTheme.emerald,
                          ),
                        )
                            .animate()
                            .scale(
                              begin: const Offset(0, 0),
                              end: const Offset(1, 1),
                              duration: 500.ms,
                              curve: Curves.elasticOut,
                            ),

                        const SizedBox(height: 48),

                        // Success message
                        GlowingText(
                          text: 'Payment Successful!',
                          style: ZaviraTheme.headingLarge,
                          glowIntensity: 1.0,
                        ).animate().fadeIn(delay: 300.ms),

                        const SizedBox(height: 16),

                        if (session != null)
                          Text(
                            'Thank you${session.customerName != null ? ", ${session.customerName}" : ""}!',
                            style: ZaviraTheme.bodyLarge.copyWith(
                              color: ZaviraTheme.textSecondary,
                            ),
                          ).animate().fadeIn(delay: 400.ms),

                        const SizedBox(height: 48),

                        // Amount paid
                        if (session != null)
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 32,
                              vertical: 20,
                            ),
                            decoration: BoxDecoration(
                              color: ZaviraTheme.cardBackground,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: ZaviraTheme.borderColor),
                            ),
                            child: Column(
                              children: [
                                Text(
                                  'Amount Paid',
                                  style: ZaviraTheme.bodyMedium.copyWith(
                                    color: ZaviraTheme.textSecondary,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                GlowingText(
                                  text:
                                      '\$${session.grandTotal.toStringAsFixed(2)}',
                                  style: ZaviraTheme.priceLarge.copyWith(
                                    fontSize: 48,
                                  ),
                                  glowColor: ZaviraTheme.emerald,
                                ),
                                if (session.tipAmount > 0) ...[
                                  const SizedBox(height: 8),
                                  Text(
                                    'Including \$${session.tipAmount.toStringAsFixed(2)} tip',
                                    style: ZaviraTheme.bodySmall.copyWith(
                                      color: ZaviraTheme.emerald,
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ).animate().fadeIn(delay: 500.ms).slideY(
                                begin: 0.1,
                                end: 0,
                                duration: 400.ms,
                              ),

                        const SizedBox(height: 48),

                        // Receipt options
                        if (!_receiptSent)
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              // Email receipt button
                              OutlinedButton.icon(
                                onPressed:
                                    _isSendingReceipt ? null : _sendEmailReceipt,
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: ZaviraTheme.white,
                                  side: const BorderSide(
                                      color: ZaviraTheme.borderLight),
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 24,
                                    vertical: 16,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                icon: _isSendingReceipt
                                    ? const SizedBox(
                                        width: 20,
                                        height: 20,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          color: ZaviraTheme.white,
                                        ),
                                      )
                                    : const Icon(Icons.email_outlined),
                                label: Text(
                                  _isSendingReceipt
                                      ? 'Sending...'
                                      : 'Email Receipt',
                                  style: ZaviraTheme.bodyMedium,
                                ),
                              ),

                              const SizedBox(width: 16),

                              // No receipt button
                              OutlinedButton.icon(
                                onPressed: _returnToWaiting,
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: ZaviraTheme.textSecondary,
                                  side: const BorderSide(
                                      color: ZaviraTheme.borderColor),
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 24,
                                    vertical: 16,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                icon: const Icon(Icons.close),
                                label: Text(
                                  'No Receipt',
                                  style: ZaviraTheme.bodyMedium.copyWith(
                                    color: ZaviraTheme.textSecondary,
                                  ),
                                ),
                              ),
                            ],
                          ).animate().fadeIn(delay: 700.ms)
                        else
                          // Receipt sent confirmation
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 24,
                              vertical: 16,
                            ),
                            decoration: BoxDecoration(
                              color: ZaviraTheme.emerald.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                  color: ZaviraTheme.emerald.withOpacity(0.3)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(
                                  Icons.check_circle,
                                  color: ZaviraTheme.emerald,
                                ),
                                const SizedBox(width: 12),
                                Text(
                                  'Receipt sent to your email',
                                  style: ZaviraTheme.bodyMedium.copyWith(
                                    color: ZaviraTheme.emerald,
                                  ),
                                ),
                              ],
                            ),
                          ).animate().fadeIn().scale(
                                begin: const Offset(0.9, 0.9),
                                end: const Offset(1, 1),
                              ),
                      ],
                    ),
                  ),
                ),

                // Footer
                Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    children: [
                      Text(
                        'Thank you for visiting',
                        style: ZaviraTheme.bodyMedium.copyWith(
                          color: ZaviraTheme.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const GlowingText(
                        text: 'Zavira Salon & Spa',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'CormorantGaramond',
                        ),
                        glowIntensity: 0.6,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        '283 Tache Avenue, Winnipeg, MB',
                        style: ZaviraTheme.bodySmall.copyWith(
                          color: ZaviraTheme.textMuted,
                        ),
                      ),
                    ],
                  ),
                ).animate().fadeIn(delay: 800.ms),
              ],
            );
          },
        ),
      ),
    );
  }
}
