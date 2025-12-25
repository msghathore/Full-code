import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../config/theme_config.dart';
import '../services/checkout_service.dart';
import '../widgets/glowing_text.dart';
import 'payment_screen.dart';

/// Tip Selection Screen - First step before payment
/// Shows subtotal and tip options (No Tip, 15%, 18%, 20%, 25%, Custom)

class TipSelectionScreen extends StatefulWidget {
  const TipSelectionScreen({super.key});

  @override
  State<TipSelectionScreen> createState() => _TipSelectionScreenState();
}

class _TipSelectionScreenState extends State<TipSelectionScreen> {
  final TextEditingController _customController = TextEditingController();
  int? _selectedPercentage;
  bool _isCustom = false;

  static const List<int> tipPercentages = [0, 15, 18, 20, 25];

  void _selectPercentage(int percent, double subtotal) {
    setState(() {
      _selectedPercentage = percent;
      _isCustom = false;
      _customController.clear();
    });

    final tipAmount = subtotal * percent / 100;
    context.read<CheckoutService>().updateTip(tipAmount);
  }

  void _enterCustomAmount() {
    setState(() {
      _selectedPercentage = null;
      _isCustom = true;
    });
  }

  void _submitCustomAmount() {
    final text = _customController.text.trim();
    if (text.isEmpty) {
      context.read<CheckoutService>().updateTip(0);
      setState(() => _isCustom = true);
      return;
    }

    final amount = double.tryParse(text);
    if (amount != null && amount >= 0) {
      context.read<CheckoutService>().updateTip(amount);
      setState(() => _isCustom = true);
    }
  }

  void _onContinue() {
    // Navigate to payment screen
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
          if (session == null) {
            return const Center(
              child: CircularProgressIndicator(color: ZaviraTheme.white),
            );
          }

          return SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const ZaviraLogo(fontSize: 24, animated: false),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: ZaviraTheme.emerald.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: ZaviraTheme.emerald.withOpacity(0.3),
                          ),
                        ),
                        child: Text(
                          session.sessionCode,
                          style: ZaviraTheme.bodySmall.copyWith(
                            color: ZaviraTheme.emerald,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 32),

                  // Main content - scrollable for landscape
                  Expanded(
                    child: SingleChildScrollView(
                      child: Center(
                        child: ConstrainedBox(
                          constraints: const BoxConstraints(maxWidth: 800),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                            // Total amount at top
                            Text(
                              'Total',
                              style: ZaviraTheme.bodyMedium.copyWith(
                                color: ZaviraTheme.textSecondary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            GlowingText(
                              text: '\$${session.grandTotal.toStringAsFixed(2)}',
                              style: ZaviraTheme.priceLarge.copyWith(
                                fontSize: 48,
                              ),
                              glowColor: ZaviraTheme.emerald,
                            ),
                            if (session.tipAmount > 0)
                              Text(
                                '\$${session.subtotal.toStringAsFixed(2)} + \$${session.tipAmount.toStringAsFixed(2)} Tip',
                                style: ZaviraTheme.bodySmall.copyWith(
                                  color: ZaviraTheme.textSecondary,
                                ),
                              ),

                            const SizedBox(height: 28),

                            // Tip section header
                            Text(
                              'Add a tip?',
                              style: ZaviraTheme.headingLarge.copyWith(
                                fontSize: 28,
                              ),
                            ),

                            const SizedBox(height: 20),

                            // Tip percentage buttons - Wrap to prevent overflow
                            Wrap(
                              spacing: 8,
                              runSpacing: 12,
                              alignment: WrapAlignment.center,
                              children: tipPercentages.map((percent) {
                                final isSelected =
                                    _selectedPercentage == percent && !_isCustom;
                                final tipAmount =
                                    session.subtotal * percent / 100;

                                return _TipButton(
                                  label: percent == 0
                                      ? 'No Tip'
                                      : '$percent%',
                                  sublabel: percent == 0
                                      ? ''
                                      : '\$${tipAmount.toStringAsFixed(2)}',
                                  isSelected: isSelected,
                                  onTap: () => _selectPercentage(
                                    percent,
                                    session.subtotal,
                                  ),
                                );
                              }).toList(),
                            ),

                            const SizedBox(height: 16),

                            // Custom amount section
                            Container(
                              constraints: const BoxConstraints(maxWidth: 350),
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: _isCustom
                                    ? ZaviraTheme.emerald.withOpacity(0.1)
                                    : ZaviraTheme.cardBackground,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: _isCustom
                                      ? ZaviraTheme.emerald
                                      : ZaviraTheme.borderColor,
                                  width: _isCustom ? 2 : 1,
                                ),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    'Custom:',
                                    style: ZaviraTheme.bodyLarge,
                                  ),
                                  const SizedBox(width: 20),
                                  Text(
                                    '\$',
                                    style: ZaviraTheme.headingSmall.copyWith(
                                      color: ZaviraTheme.emerald,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  SizedBox(
                                    width: 120,
                                    child: TextField(
                                      controller: _customController,
                                      keyboardType:
                                          const TextInputType.numberWithOptions(
                                        decimal: true,
                                      ),
                                      inputFormatters: [
                                        FilteringTextInputFormatter.allow(
                                          RegExp(r'^\d*\.?\d{0,2}'),
                                        ),
                                      ],
                                      style: ZaviraTheme.headingSmall.copyWith(
                                        color: ZaviraTheme.emerald,
                                      ),
                                      decoration: InputDecoration(
                                        hintText: '0.00',
                                        hintStyle:
                                            ZaviraTheme.bodyLarge.copyWith(
                                          color: ZaviraTheme.textMuted,
                                        ),
                                        border: InputBorder.none,
                                        contentPadding: EdgeInsets.zero,
                                      ),
                                      onTap: _enterCustomAmount,
                                      onChanged: (_) => _enterCustomAmount(),
                                      onSubmitted: (_) => _submitCustomAmount(),
                                      onEditingComplete: _submitCustomAmount,
                                    ),
                                  ),
                                  if (_isCustom)
                                    IconButton(
                                      icon: const Icon(
                                        Icons.check_circle,
                                        color: ZaviraTheme.emerald,
                                      ),
                                      onPressed: _submitCustomAmount,
                                    ),
                                ],
                              ),
                            ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Continue button
                  SizedBox(
                    height: 56,
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _onContinue,
                      style: ZaviraTheme.primaryButton.copyWith(
                        backgroundColor:
                            WidgetStateProperty.all(ZaviraTheme.emerald),
                      ),
                      child: Text(
                        'Proceed to payment',
                        style: ZaviraTheme.buttonText.copyWith(
                          fontSize: 18,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
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
    _customController.dispose();
    super.dispose();
  }
}

class _TipButton extends StatelessWidget {
  final String label;
  final String sublabel;
  final bool isSelected;
  final VoidCallback onTap;

  const _TipButton({
    required this.label,
    required this.sublabel,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: 85,
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 10),
        decoration: BoxDecoration(
          color: isSelected ? ZaviraTheme.emerald : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? ZaviraTheme.emerald : ZaviraTheme.borderLight,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: ZaviraTheme.emerald.withOpacity(0.3),
                    blurRadius: 12,
                    spreadRadius: 2,
                  ),
                ]
              : null,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: ZaviraTheme.bodyLarge.copyWith(
                fontWeight: FontWeight.bold,
                color: isSelected ? ZaviraTheme.white : ZaviraTheme.textPrimary,
              ),
              textAlign: TextAlign.center,
            ),
            if (sublabel.isNotEmpty) ...[
              const SizedBox(height: 6),
              Text(
                sublabel,
                style: ZaviraTheme.bodySmall.copyWith(
                  color: isSelected
                      ? ZaviraTheme.white.withOpacity(0.9)
                      : ZaviraTheme.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
