import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';

import '../config/theme_config.dart';
import '../services/checkout_service.dart';
import '../widgets/glowing_text.dart';
import '../widgets/service_item_row.dart';
import '../widgets/tip_selector.dart';
import 'payment_screen.dart';
import 'waiting_screen.dart';

/// Invoice summary screen
/// Shows service breakdown, prices, tax, tip selector, and Pay Now button

class InvoiceScreen extends StatefulWidget {
  const InvoiceScreen({super.key});

  @override
  State<InvoiceScreen> createState() => _InvoiceScreenState();
}

class _InvoiceScreenState extends State<InvoiceScreen> {
  @override
  void initState() {
    super.initState();
    // Mark session as viewed
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CheckoutService>().markAsViewed();
    });
  }

  void _onPayNow() {
    Navigator.of(context).push(
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) =>
            const PaymentScreen(),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return SlideTransition(
            position: Tween<Offset>(
              begin: const Offset(1, 0),
              end: Offset.zero,
            ).animate(CurvedAnimation(
              parent: animation,
              curve: Curves.easeOutCubic,
            )),
            child: child,
          );
        },
        transitionDuration: const Duration(milliseconds: 400),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZaviraTheme.black,
      body: Consumer<CheckoutService>(
        builder: (context, checkoutService, child) {
          final session = checkoutService.currentSession;

          // If no session, go back to waiting
          if (session == null) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              Navigator.of(context).pushReplacement(
                MaterialPageRoute(builder: (_) => const WaitingScreen()),
              );
            });
            return const SizedBox.shrink();
          }

          final dateFormat = DateFormat('EEEE, MMMM d, yyyy');
          final timeFormat = DateFormat('h:mm a');

          return SafeArea(
            child: Row(
              children: [
                // Left side - Invoice details
                Expanded(
                  flex: 3,
                  child: Container(
                    padding: const EdgeInsets.all(40),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Header
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const ZaviraLogo(fontSize: 36, animated: false),
                                const SizedBox(height: 8),
                                Text(
                                  dateFormat.format(session.createdAt),
                                  style: ZaviraTheme.bodySmall,
                                ),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 8,
                              ),
                              decoration: BoxDecoration(
                                color: ZaviraTheme.emerald.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: ZaviraTheme.emerald.withOpacity(0.3),
                                ),
                              ),
                              child: Text(
                                'Session: ${session.sessionCode}',
                                style: ZaviraTheme.bodySmall.copyWith(
                                  color: ZaviraTheme.emerald,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ).animate().fadeIn(duration: 500.ms),

                        const SizedBox(height: 32),

                        // Customer greeting
                        if (session.customerName != null &&
                            session.customerName!.isNotEmpty)
                          Text(
                            'Thank you, ${session.customerName}',
                            style: ZaviraTheme.headingMedium,
                          ).animate().fadeIn(delay: 200.ms),

                        const SizedBox(height: 8),

                        Text(
                          'Your Service Summary',
                          style: ZaviraTheme.bodyLarge.copyWith(
                            color: ZaviraTheme.textSecondary,
                          ),
                        ).animate().fadeIn(delay: 300.ms),

                        const SizedBox(height: 32),

                        // Service items list
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.all(24),
                            decoration: ZaviraTheme.cardDecoration,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Services & Products',
                                  style: ZaviraTheme.headingSmall,
                                ),
                                const SizedBox(height: 16),
                                const Divider(color: ZaviraTheme.borderColor),

                                // Items list
                                Expanded(
                                  child: ListView.builder(
                                    itemCount: session.cartItems.length,
                                    itemBuilder: (context, index) {
                                      return ServiceItemRow(
                                        item: session.cartItems[index],
                                        showDivider:
                                            index < session.cartItems.length - 1,
                                      ).animate().fadeIn(
                                            delay:
                                                Duration(milliseconds: 400 + index * 100),
                                          );
                                    },
                                  ),
                                ),
                              ],
                            ),
                          ).animate().fadeIn(delay: 400.ms).slideY(
                                begin: 0.05,
                                end: 0,
                                duration: 500.ms,
                              ),
                        ),

                        const SizedBox(height: 24),

                        // Staff member
                        if (session.staffName != null)
                          Row(
                            children: [
                              const Icon(
                                Icons.person_outline,
                                color: ZaviraTheme.textSecondary,
                                size: 20,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                'Served by ${session.staffName}',
                                style: ZaviraTheme.bodySmall,
                              ),
                            ],
                          ).animate().fadeIn(delay: 600.ms),
                      ],
                    ),
                  ),
                ),

                // Right side - Payment summary
                Expanded(
                  flex: 2,
                  child: Container(
                    color: ZaviraTheme.cardBackground,
                    padding: const EdgeInsets.all(40),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          'Payment Summary',
                          style: ZaviraTheme.headingMedium,
                        ).animate().fadeIn(delay: 500.ms),

                        const SizedBox(height: 32),

                        // Summary breakdown
                        Container(
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            color: ZaviraTheme.black,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: ZaviraTheme.borderColor),
                          ),
                          child: Column(
                            children: [
                              SummaryRow(
                                label: 'Subtotal',
                                value:
                                    '\$${session.subtotal.toStringAsFixed(2)}',
                              ),
                              if (session.discount > 0)
                                SummaryRow(
                                  label: 'Discount',
                                  value:
                                      '\$${session.discount.toStringAsFixed(2)}',
                                  isDiscount: true,
                                ),
                              SummaryRow(
                                label: 'GST (${(session.taxRate * 100).toInt()}%)',
                                value:
                                    '\$${session.taxAmount.toStringAsFixed(2)}',
                              ),
                              if (session.tipAmount > 0)
                                SummaryRow(
                                  label: 'Tip',
                                  value:
                                      '\$${session.tipAmount.toStringAsFixed(2)}',
                                  isHighlighted: true,
                                ),
                              const Divider(
                                color: ZaviraTheme.borderLight,
                                height: 32,
                              ),
                              SummaryRow(
                                label: 'Total',
                                value:
                                    '\$${session.grandTotal.toStringAsFixed(2)}',
                                isTotal: true,
                              ),
                            ],
                          ),
                        ).animate().fadeIn(delay: 600.ms),

                        const SizedBox(height: 24),

                        // Tip selector
                        Expanded(
                          child: SingleChildScrollView(
                            child: TipSelector(
                              subtotal: session.subtotal,
                              selectedTip: session.tipAmount,
                              onTipChanged: (tip) {
                                checkoutService.updateTip(tip);
                              },
                            ).animate().fadeIn(delay: 700.ms),
                          ),
                        ),

                        const SizedBox(height: 24),

                        // Pay Now button
                        SizedBox(
                          height: 72,
                          child: ElevatedButton(
                            onPressed: _onPayNow,
                            style: ZaviraTheme.primaryButton.copyWith(
                              backgroundColor:
                                  WidgetStateProperty.all(ZaviraTheme.white),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(
                                  Icons.credit_card,
                                  color: ZaviraTheme.black,
                                  size: 28,
                                ),
                                const SizedBox(width: 16),
                                Text(
                                  'Pay \$${session.grandTotal.toStringAsFixed(2)}',
                                  style: ZaviraTheme.buttonText.copyWith(
                                    color: ZaviraTheme.black,
                                    fontSize: 24,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ).animate().fadeIn(delay: 800.ms).scale(
                              begin: const Offset(0.95, 0.95),
                              end: const Offset(1, 1),
                              duration: 300.ms,
                            ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
