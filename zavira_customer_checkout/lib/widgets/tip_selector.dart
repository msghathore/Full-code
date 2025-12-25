import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../config/theme_config.dart';
import 'glowing_text.dart';

/// Tip selector widget with preset percentages and custom amount
class TipSelector extends StatefulWidget {
  final double subtotal;
  final double selectedTip;
  final ValueChanged<double> onTipChanged;

  const TipSelector({
    super.key,
    required this.subtotal,
    required this.selectedTip,
    required this.onTipChanged,
  });

  @override
  State<TipSelector> createState() => _TipSelectorState();
}

class _TipSelectorState extends State<TipSelector> {
  final TextEditingController _customController = TextEditingController();
  int? _selectedPercentage;
  bool _isCustom = false;

  static const List<int> tipPercentages = [0, 15, 18, 20, 25];

  @override
  void initState() {
    super.initState();
    _determineSelectedState();
  }

  void _determineSelectedState() {
    if (widget.selectedTip == 0) {
      _selectedPercentage = 0;
      _isCustom = false;
      return;
    }

    // Check if current tip matches any percentage
    for (final percent in tipPercentages) {
      final tipForPercent = widget.subtotal * percent / 100;
      if ((widget.selectedTip - tipForPercent).abs() < 0.01) {
        _selectedPercentage = percent;
        _isCustom = false;
        return;
      }
    }

    // It's a custom amount
    _isCustom = true;
    _selectedPercentage = null;
    _customController.text = widget.selectedTip.toStringAsFixed(2);
  }

  void _selectPercentage(int percent) {
    setState(() {
      _selectedPercentage = percent;
      _isCustom = false;
      _customController.clear();
    });

    final tipAmount = widget.subtotal * percent / 100;
    widget.onTipChanged(tipAmount);
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
      widget.onTipChanged(0);
      return;
    }

    final amount = double.tryParse(text);
    if (amount != null && amount >= 0) {
      widget.onTipChanged(amount);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: ZaviraTheme.cardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              const Icon(
                Icons.favorite_outline,
                color: ZaviraTheme.white,
                size: 24,
              ),
              const SizedBox(width: 12),
              Text(
                'Add a Tip',
                style: ZaviraTheme.headingSmall,
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Show your appreciation for excellent service',
            style: ZaviraTheme.bodySmall,
          ),
          const SizedBox(height: 24),

          // Tip percentage buttons
          Row(
            children: tipPercentages.map((percent) {
              final isSelected = _selectedPercentage == percent && !_isCustom;
              final tipAmount = widget.subtotal * percent / 100;

              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: _TipButton(
                    label: percent == 0 ? 'No Tip' : '$percent%',
                    sublabel: percent == 0 ? '' : '\$${tipAmount.toStringAsFixed(2)}',
                    isSelected: isSelected,
                    onTap: () => _selectPercentage(percent),
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),

          // Custom amount section
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: _isCustom
                  ? ZaviraTheme.emerald.withOpacity(0.1)
                  : ZaviraTheme.cardBackground,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: _isCustom ? ZaviraTheme.emerald : ZaviraTheme.borderColor,
                width: _isCustom ? 2 : 1,
              ),
            ),
            child: Row(
              children: [
                Text(
                  'Custom:',
                  style: ZaviraTheme.bodyMedium,
                ),
                const SizedBox(width: 16),
                Text(
                  '\$',
                  style: ZaviraTheme.bodyLarge.copyWith(
                    color: ZaviraTheme.emerald,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    controller: _customController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    inputFormatters: [
                      FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d{0,2}')),
                    ],
                    style: ZaviraTheme.bodyLarge.copyWith(
                      color: ZaviraTheme.emerald,
                      fontWeight: FontWeight.bold,
                    ),
                    decoration: InputDecoration(
                      hintText: '0.00',
                      hintStyle: ZaviraTheme.bodyLarge.copyWith(
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
                    icon: const Icon(Icons.check_circle, color: ZaviraTheme.emerald),
                    onPressed: _submitCustomAmount,
                  ),
              ],
            ),
          ),
        ],
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
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
        decoration: BoxDecoration(
          color: isSelected
              ? ZaviraTheme.emerald
              : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected
                ? ZaviraTheme.emerald
                : ZaviraTheme.borderLight,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: ZaviraTheme.bodyMedium.copyWith(
                fontWeight: FontWeight.bold,
                color: isSelected ? ZaviraTheme.white : ZaviraTheme.textPrimary,
              ),
            ),
            if (sublabel.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(
                sublabel,
                style: ZaviraTheme.bodySmall.copyWith(
                  color: isSelected
                      ? ZaviraTheme.white.withOpacity(0.8)
                      : ZaviraTheme.textSecondary,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
