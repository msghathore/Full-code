import 'package:flutter/material.dart';
import '../config/theme_config.dart';
import '../models/checkout_session.dart';

/// Widget for displaying a single service/product item in the invoice
class ServiceItemRow extends StatelessWidget {
  final CartItem item;
  final bool showDivider;

  const ServiceItemRow({
    super.key,
    required this.item,
    this.showDivider = true,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Service type icon
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: ZaviraTheme.cardBackground,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: ZaviraTheme.borderColor),
                ),
                child: Icon(
                  _getIconForType(item.itemType),
                  color: ZaviraTheme.white,
                  size: 24,
                ),
              ),
              const SizedBox(width: 16),

              // Service name and quantity
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.name,
                      style: ZaviraTheme.bodyLarge.copyWith(
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${_capitalizeType(item.itemType)} × ${item.quantity}',
                      style: ZaviraTheme.bodySmall,
                    ),
                    if (item.discount > 0) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(
                            Icons.local_offer_outlined,
                            size: 14,
                            color: ZaviraTheme.rose,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'Discount: -\$${item.discount.toStringAsFixed(2)}',
                            style: ZaviraTheme.bodySmall.copyWith(
                              color: ZaviraTheme.rose,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),

              // Price
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '\$${item.subtotal.toStringAsFixed(2)}',
                    style: ZaviraTheme.priceSmall,
                  ),
                  if (item.quantity > 1) ...[
                    const SizedBox(height: 4),
                    Text(
                      '@\$${item.price.toStringAsFixed(2)} each',
                      style: ZaviraTheme.bodySmall.copyWith(
                        fontSize: 12,
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
        if (showDivider)
          Divider(
            color: ZaviraTheme.borderColor,
            height: 1,
          ),
      ],
    );
  }

  IconData _getIconForType(String type) {
    switch (type.toLowerCase()) {
      case 'service':
        return Icons.content_cut;
      case 'product':
        return Icons.shopping_bag_outlined;
      case 'gift':
        return Icons.card_giftcard;
      case 'package':
        return Icons.inventory_2_outlined;
      default:
        return Icons.receipt_outlined;
    }
  }

  String _capitalizeType(String type) {
    if (type.isEmpty) return '';
    return type[0].toUpperCase() + type.substring(1).toLowerCase();
  }
}

/// Summary row for subtotals, tax, etc.
class SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isTotal;
  final bool isDiscount;
  final bool isHighlighted;

  const SummaryRow({
    super.key,
    required this.label,
    required this.value,
    this.isTotal = false,
    this.isDiscount = false,
    this.isHighlighted = false,
  });

  @override
  Widget build(BuildContext context) {
    final textColor = isDiscount
        ? ZaviraTheme.rose
        : isHighlighted
            ? ZaviraTheme.emerald
            : ZaviraTheme.textPrimary;

    // Use simple bodyLarge style for total, just bigger and green (no fancy glow)
    final valueStyle = isTotal
        ? ZaviraTheme.bodyLarge.copyWith(
            fontSize: 28,
            fontWeight: FontWeight.w700,
            color: ZaviraTheme.emerald,
          )
        : isHighlighted
            ? ZaviraTheme.priceSmall
            : ZaviraTheme.bodyLarge;

    return Padding(
      padding: EdgeInsets.symmetric(vertical: isTotal ? 16 : 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: isTotal
                ? ZaviraTheme.headingSmall
                : ZaviraTheme.bodyMedium.copyWith(
                    color: ZaviraTheme.textSecondary,
                  ),
          ),
          Text(
            isDiscount ? '-$value' : value,
            style: valueStyle.copyWith(color: textColor),
          ),
        ],
      ),
    );
  }
}
