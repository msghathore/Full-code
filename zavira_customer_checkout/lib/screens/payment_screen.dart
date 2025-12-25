import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../config/theme_config.dart';
import '../services/checkout_service.dart';
import '../services/square_payment_service.dart';
import '../widgets/glowing_text.dart';
import 'success_screen.dart';
import 'invoice_screen.dart';

/// Payment screen - handles Square Reader interaction
/// Shows tap/insert card prompt and processes payment

class PaymentScreen extends StatefulWidget {
  const PaymentScreen({super.key});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  final SquarePaymentService _squareService = SquarePaymentService();

  PaymentState _state = PaymentState.connecting;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _initializePayment();
  }

  Future<void> _initializePayment() async {
    try {
      // Mark as processing
      context.read<CheckoutService>().markAsProcessing();

      setState(() => _state = PaymentState.connecting);

      // Initialize Square SDK
      await _squareService.initialize();

      // Check reader connection
      final isConnected = await _squareService.checkReaderConnection();

      if (!isConnected) {
        // Try to pair reader
        setState(() => _state = PaymentState.pairingReader);
        await _squareService.pairReader();
      }

      // Ready to accept payment
      setState(() => _state = PaymentState.readyToTap);

      // Start payment process
      await _processPayment();
    } catch (e) {
      setState(() {
        _state = PaymentState.error;
        _errorMessage = e.toString();
      });
    }
  }

  Future<void> _processPayment() async {
    final session = context.read<CheckoutService>().currentSession;
    if (session == null) return;

    setState(() => _state = PaymentState.processing);

    try {
      final result = await _squareService.processPayment(
        amountDollars: session.grandTotal,
        referenceId: session.id,
        note: 'Zavira Salon - ${session.cartItems.map((i) => i.name).join(", ")}',
      );

      if (result.success) {
        // Complete checkout in database
        await context.read<CheckoutService>().completeCheckout(
              paymentMethod: 'square_reader',
              paymentId: result.paymentId ?? 'unknown',
              finalAmount: session.grandTotal,
            );

        // Navigate to success
        if (mounted) {
          Navigator.of(context).pushReplacement(
            PageRouteBuilder(
              pageBuilder: (context, animation, secondaryAnimation) =>
                  const SuccessScreen(),
              transitionsBuilder:
                  (context, animation, secondaryAnimation, child) {
                return FadeTransition(opacity: animation, child: child);
              },
              transitionDuration: const Duration(milliseconds: 500),
            ),
          );
        }
      } else {
        setState(() {
          _state = PaymentState.error;
          _errorMessage = result.errorMessage ?? 'Payment failed';
        });
      }
    } catch (e) {
      setState(() {
        _state = PaymentState.error;
        _errorMessage = e.toString();
      });
    }
  }

  void _onCancel() {
    Navigator.of(context).pop();
  }

  void _onRetry() {
    setState(() {
      _state = PaymentState.connecting;
      _errorMessage = null;
    });
    _initializePayment();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ZaviraTheme.black,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.all(32),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const ZaviraLogo(fontSize: 32, animated: false),
                  if (_state != PaymentState.processing)
                    TextButton.icon(
                      onPressed: _onCancel,
                      icon: const Icon(
                        Icons.arrow_back,
                        color: ZaviraTheme.textSecondary,
                      ),
                      label: Text(
                        'Back',
                        style: ZaviraTheme.bodyMedium.copyWith(
                          color: ZaviraTheme.textSecondary,
                        ),
                      ),
                    ),
                ],
              ),
            ),

            // Main content
            Expanded(
              child: Center(
                child: _buildContent(),
              ),
            ),

            // Amount display
            Consumer<CheckoutService>(
              builder: (context, service, _) {
                final session = service.currentSession;
                if (session == null) return const SizedBox.shrink();

                return Container(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    children: [
                      Text(
                        'Amount Due',
                        style: ZaviraTheme.bodyMedium.copyWith(
                          color: ZaviraTheme.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      GlowingText(
                        text: '\$${session.grandTotal.toStringAsFixed(2)}',
                        style: ZaviraTheme.priceLarge.copyWith(fontSize: 56),
                        glowColor: ZaviraTheme.emerald,
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent() {
    switch (_state) {
      case PaymentState.connecting:
        return _buildConnecting();
      case PaymentState.pairingReader:
        return _buildPairingReader();
      case PaymentState.readyToTap:
        return _buildReadyToTap();
      case PaymentState.processing:
        return _buildProcessing();
      case PaymentState.error:
        return _buildError();
    }
  }

  Widget _buildConnecting() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const CircularProgressIndicator(
          color: ZaviraTheme.white,
          strokeWidth: 3,
        ),
        const SizedBox(height: 32),
        Text(
          'Connecting to payment system...',
          style: ZaviraTheme.bodyLarge,
        ),
      ],
    ).animate().fadeIn();
  }

  Widget _buildPairingReader() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 120,
          height: 120,
          decoration: BoxDecoration(
            color: ZaviraTheme.cardBackground,
            shape: BoxShape.circle,
            border: Border.all(color: ZaviraTheme.borderColor, width: 2),
          ),
          child: const Icon(
            Icons.bluetooth_searching,
            size: 56,
            color: ZaviraTheme.violet,
          ),
        )
            .animate(onPlay: (c) => c.repeat())
            .scale(
              begin: const Offset(1, 1),
              end: const Offset(1.1, 1.1),
              duration: 1.seconds,
            )
            .then()
            .scale(
              begin: const Offset(1.1, 1.1),
              end: const Offset(1, 1),
              duration: 1.seconds,
            ),
        const SizedBox(height: 40),
        Text(
          'Connecting to Square Reader',
          style: ZaviraTheme.headingMedium,
        ),
        const SizedBox(height: 16),
        Text(
          'Please ensure the reader is turned on',
          style: ZaviraTheme.bodyMedium.copyWith(
            color: ZaviraTheme.textSecondary,
          ),
        ),
      ],
    ).animate().fadeIn();
  }

  Widget _buildReadyToTap() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Card icon with glow animation
        Container(
          width: 200,
          height: 200,
          decoration: BoxDecoration(
            color: ZaviraTheme.cardBackground,
            shape: BoxShape.circle,
            border: Border.all(
              color: ZaviraTheme.emerald.withOpacity(0.5),
              width: 3,
            ),
            boxShadow: [
              BoxShadow(
                color: ZaviraTheme.emerald.withOpacity(0.3),
                blurRadius: 30,
                spreadRadius: 5,
              ),
            ],
          ),
          child: const Icon(
            Icons.contactless,
            size: 100,
            color: ZaviraTheme.emerald,
          ),
        )
            .animate(onPlay: (c) => c.repeat())
            .scale(
              begin: const Offset(1, 1),
              end: const Offset(1.05, 1.05),
              duration: 1500.ms,
            )
            .then()
            .scale(
              begin: const Offset(1.05, 1.05),
              end: const Offset(1, 1),
              duration: 1500.ms,
            ),

        const SizedBox(height: 48),

        GlowingText(
          text: 'Tap or Insert Card',
          style: ZaviraTheme.headingLarge,
          glowIntensity: 0.8,
        ),

        const SizedBox(height: 16),

        Text(
          'Hold your card near the reader',
          style: ZaviraTheme.bodyLarge.copyWith(
            color: ZaviraTheme.textSecondary,
          ),
        ),

        const SizedBox(height: 48),

        // Reader connection status
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
          decoration: BoxDecoration(
            color: ZaviraTheme.emerald.withOpacity(0.1),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: ZaviraTheme.emerald.withOpacity(0.3)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.check_circle,
                color: ZaviraTheme.emerald,
                size: 18,
              ),
              const SizedBox(width: 8),
              Text(
                'Reader Connected',
                style: ZaviraTheme.bodySmall.copyWith(
                  color: ZaviraTheme.emerald,
                ),
              ),
            ],
          ),
        ),
      ],
    ).animate().fadeIn();
  }

  Widget _buildProcessing() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: 100,
          height: 100,
          child: CircularProgressIndicator(
            color: ZaviraTheme.emerald,
            strokeWidth: 4,
            backgroundColor: ZaviraTheme.borderColor,
          ),
        ),
        const SizedBox(height: 40),
        Text(
          'Processing Payment...',
          style: ZaviraTheme.headingMedium,
        ),
        const SizedBox(height: 16),
        Text(
          'Please do not remove your card',
          style: ZaviraTheme.bodyMedium.copyWith(
            color: ZaviraTheme.textSecondary,
          ),
        ),
      ],
    ).animate().fadeIn();
  }

  Widget _buildError() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 120,
          height: 120,
          decoration: BoxDecoration(
            color: ZaviraTheme.rose.withOpacity(0.1),
            shape: BoxShape.circle,
            border: Border.all(color: ZaviraTheme.rose.withOpacity(0.3), width: 2),
          ),
          child: const Icon(
            Icons.error_outline,
            size: 56,
            color: ZaviraTheme.rose,
          ),
        ),
        const SizedBox(height: 40),
        Text(
          'Payment Failed',
          style: ZaviraTheme.headingMedium.copyWith(
            color: ZaviraTheme.rose,
          ),
        ),
        const SizedBox(height: 16),
        Text(
          _errorMessage ?? 'An error occurred',
          style: ZaviraTheme.bodyMedium.copyWith(
            color: ZaviraTheme.textSecondary,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 40),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            OutlinedButton(
              onPressed: _onCancel,
              style: ZaviraTheme.secondaryButton,
              child: const Text('Back'),
            ),
            const SizedBox(width: 16),
            ElevatedButton(
              onPressed: _onRetry,
              style: ZaviraTheme.primaryButton,
              child: const Text('Try Again'),
            ),
          ],
        ),
      ],
    ).animate().fadeIn();
  }
}

enum PaymentState {
  connecting,
  pairingReader,
  readyToTap,
  processing,
  error,
}
