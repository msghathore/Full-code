import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';

import '../config/theme_config.dart';
import '../services/checkout_service.dart';
import '../widgets/glowing_text.dart';
import '../widgets/service_item_row.dart';
import '../widgets/tip_selector.dart';
import 'tip_selection_screen.dart';
import 'waiting_screen.dart';

/// Invoice summary screen
/// Shows service breakdown, prices, tax, tip selector, and Continue button
/// Responsive layout: horizontal on tablet landscape, vertical on portrait/smaller screens

class InvoiceScreen extends StatefulWidget {
  const InvoiceScreen({super.key});

  @override
  State<InvoiceScreen> createState() => _InvoiceScreenState();
}

class _InvoiceScreenState extends State<InvoiceScreen> {
  // Samsung/Impeller rendering fix: Force repaint after initial render
  bool _forceRepaint = false;

  @override
  void initState() {
    super.initState();
    debugPrint('📱 InvoiceScreen: initState called');
    // Mark session as viewed
    WidgetsBinding.instance.addPostFrameCallback((_) {
      debugPrint('📱 InvoiceScreen: Marking session as viewed');
      context.read<CheckoutService>().markAsViewed();

      // Samsung/Impeller fix: Force repaint after 100ms to fix invisible text
      Future.delayed(const Duration(milliseconds: 100), () {
        if (mounted) {
          debugPrint('📱 InvoiceScreen: Force repaint triggered');
          setState(() {
            _forceRepaint = true;
          });
        }
      });
    });
  }

  void _onContinue() {
    debugPrint('➡️ InvoiceScreen: Continue button pressed, navigating to Tip Selection');
    Navigator.of(context).push(
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) =>
            const TipSelectionScreen(),
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
    debugPrint('📱 InvoiceScreen: build called');

    return Scaffold(
      backgroundColor: ZaviraTheme.black,
      body: Consumer<CheckoutService>(
        builder: (context, checkoutService, child) {
          final session = checkoutService.currentSession;

          debugPrint('📱 InvoiceScreen: Consumer rebuild, session: ${session != null ? "exists" : "null"}');

          // If no session, go back to waiting
          if (session == null) {
            debugPrint('⚠️ InvoiceScreen: No session, navigating back to WaitingScreen');
            WidgetsBinding.instance.addPostFrameCallback((_) {
              if (mounted) {
                Navigator.of(context).pushReplacement(
                  MaterialPageRoute(builder: (_) => const WaitingScreen()),
                );
              }
            });
            return const Center(
              child: CircularProgressIndicator(color: ZaviraTheme.white),
            );
          }

          debugPrint('📱 InvoiceScreen: Rendering session ${session.sessionCode}');
          debugPrint('   - Customer: ${session.customerName}');
          debugPrint('   - Items: ${session.cartItems.length}');
          debugPrint('   - Total: \$${session.grandTotal.toStringAsFixed(2)}');

          final dateFormat = DateFormat('EEEE, MMMM d, yyyy');

          // Samsung/Impeller fix: Wrap with RepaintBoundary to force proper rendering
          // Use explicit Opacity to ensure text is visible on Samsung devices
          return RepaintBoundary(
            child: Opacity(
              opacity: 1.0, // Explicit opacity fixes Samsung rendering bug
              child: SafeArea(
                child: LayoutBuilder(
                  builder: (context, constraints) {
                    // Use horizontal layout on wide screens (tablets in landscape)
                    final isWideScreen = constraints.maxWidth > 800;
                    debugPrint('📱 InvoiceScreen: Width=${constraints.maxWidth}, isWideScreen=$isWideScreen, repaint=$_forceRepaint');

                    if (isWideScreen) {
                      return _buildWideLayout(session, dateFormat, checkoutService);
                    } else {
                      return _buildNarrowLayout(session, dateFormat, checkoutService);
                    }
                  },
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  /// Wide layout for tablets in landscape mode (horizontal split)
  Widget _buildWideLayout(dynamic session, DateFormat dateFormat, CheckoutService checkoutService) {
    return Row(
      children: [
        // Left side - Invoice details
        Expanded(
          flex: 3,
          child: Container(
            padding: const EdgeInsets.all(40),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(session, dateFormat),
                const SizedBox(height: 32),
                _buildCustomerGreeting(session),
                const SizedBox(height: 32),
                Expanded(child: _buildItemsList(session)),
                const SizedBox(height: 24),
                _buildStaffInfo(session),
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
                ),
                const SizedBox(height: 32),
                _buildSummaryCard(session),
                const SizedBox(height: 24),
                Expanded(
                  child: SingleChildScrollView(
                    child: _buildTipSelector(session, checkoutService),
                  ),
                ),
                const SizedBox(height: 24),
                _buildPayButton(session),
              ],
            ),
          ),
        ),
      ],
    );
  }

  /// Narrow layout for portrait mode or smaller screens (vertical scroll)
  Widget _buildNarrowLayout(dynamic session, DateFormat dateFormat, CheckoutService checkoutService) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(session, dateFormat),
          const SizedBox(height: 24),
          _buildCustomerGreeting(session),
          const SizedBox(height: 24),
          // Items list (not expanded in scroll view)
          Container(
            constraints: BoxConstraints(
              maxHeight: MediaQuery.of(context).size.height * 0.35,
            ),
            child: _buildItemsList(session),
          ),
          const SizedBox(height: 16),
          _buildStaffInfo(session),
          const SizedBox(height: 24),
          // Payment summary card
          Text(
            'Payment Summary',
            style: ZaviraTheme.headingMedium,
          ),
          const SizedBox(height: 16),
          _buildSummaryCard(session),
          const SizedBox(height: 24),
          _buildTipSelector(session, checkoutService),
          const SizedBox(height: 24),
          _buildPayButton(session),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildHeader(dynamic session, DateFormat dateFormat) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Flexible(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const ZaviraLogo(fontSize: 32, animated: false),
              const SizedBox(height: 8),
              Text(
                dateFormat.format(session.createdAt),
                style: ZaviraTheme.bodySmall,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
        const SizedBox(width: 12),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: ZaviraTheme.emerald.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: ZaviraTheme.emerald.withOpacity(0.3)),
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
    );
  }

  Widget _buildCustomerGreeting(dynamic session) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (session.customerName != null && session.customerName!.isNotEmpty)
          Text(
            'Thank you, ${session.customerName}',
            style: ZaviraTheme.headingMedium,
          ),
        const SizedBox(height: 8),
        Text(
          'Your Service Summary',
          style: ZaviraTheme.bodyLarge.copyWith(color: ZaviraTheme.textSecondary),
        ),
      ],
    );
  }

  Widget _buildItemsList(dynamic session) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: ZaviraTheme.cardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('Services & Products', style: ZaviraTheme.headingSmall),
          const SizedBox(height: 12),
          const Divider(color: ZaviraTheme.borderColor),
          Flexible(
            child: session.cartItems.isEmpty
                ? Center(
                    child: Text(
                      'No items',
                      style: ZaviraTheme.bodySmall,
                    ),
                  )
                : ListView.builder(
                    shrinkWrap: true,
                    itemCount: session.cartItems.length,
                    itemBuilder: (context, index) {
                      return ServiceItemRow(
                        item: session.cartItems[index],
                        showDivider: index < session.cartItems.length - 1,
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildStaffInfo(dynamic session) {
    if (session.staffName == null) return const SizedBox.shrink();
    return Row(
      children: [
        const Icon(Icons.person_outline, color: ZaviraTheme.textSecondary, size: 20),
        const SizedBox(width: 8),
        Text('Served by ${session.staffName}', style: ZaviraTheme.bodySmall),
      ],
    );
  }

  Widget _buildSummaryCard(dynamic session) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: ZaviraTheme.black,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ZaviraTheme.borderColor),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SummaryRow(label: 'Subtotal', value: '\$${session.subtotal.toStringAsFixed(2)}'),
          if (session.discount > 0)
            SummaryRow(label: 'Discount', value: '\$${session.discount.toStringAsFixed(2)}', isDiscount: true),
          SummaryRow(label: 'GST (${(session.taxRate * 100).toInt()}%)', value: '\$${session.taxAmount.toStringAsFixed(2)}'),
          if (session.tipAmount > 0)
            SummaryRow(label: 'Tip', value: '\$${session.tipAmount.toStringAsFixed(2)}', isHighlighted: true),
          const Divider(color: ZaviraTheme.borderLight, height: 32),
          SummaryRow(label: 'Total', value: '\$${session.grandTotal.toStringAsFixed(2)}', isTotal: true),
        ],
      ),
    );
  }

  Widget _buildTipSelector(dynamic session, CheckoutService checkoutService) {
    return TipSelector(
      subtotal: session.subtotal,
      selectedTip: session.tipAmount,
      onTipChanged: (tip) {
        debugPrint('💰 InvoiceScreen: Tip changed to \$${tip.toStringAsFixed(2)}');
        checkoutService.updateTip(tip);
      },
    );
  }

  Widget _buildPayButton(dynamic session) {
    return SizedBox(
      height: 64,
      child: ElevatedButton(
        onPressed: _onContinue,
        style: ZaviraTheme.primaryButton.copyWith(
          backgroundColor: WidgetStateProperty.all(ZaviraTheme.emerald),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.arrow_forward, color: ZaviraTheme.white, size: 24),
            const SizedBox(width: 12),
            Text(
              'Continue',
              style: ZaviraTheme.buttonText.copyWith(color: ZaviraTheme.white, fontSize: 20),
            ),
          ],
        ),
      ),
    );
  }
}
