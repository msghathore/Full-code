/// Model for pending checkout session data
/// Matches the Supabase pending_checkout table structure

class CartItem {
  final String itemId;
  final String name;
  final double price;
  final int quantity;
  final String itemType;
  final double discount;

  CartItem({
    required this.itemId,
    required this.name,
    required this.price,
    required this.quantity,
    required this.itemType,
    this.discount = 0,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      itemId: json['item_id'] ?? '',
      name: json['name'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      quantity: json['quantity'] ?? 1,
      itemType: json['item_type'] ?? 'service',
      discount: (json['discount'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'item_id': itemId,
      'name': name,
      'price': price,
      'quantity': quantity,
      'item_type': itemType,
      'discount': discount,
    };
  }

  double get subtotal => (price * quantity) - discount;
}

class CheckoutSession {
  final String id;
  final String sessionCode;
  final List<CartItem> cartItems;
  final double subtotal;
  final double discount;
  final double taxRate;
  final double taxAmount;
  final double tipAmount;
  final double totalAmount;
  final String? customerName;
  final String? customerEmail;
  final String? customerPhone;
  final String? appointmentId;
  final String? staffId;
  final String? staffName;
  final String status;
  final String? paymentMethod;
  final String? paymentId;
  final String? paymentStatus;
  final DateTime createdAt;
  final DateTime? expiresAt;
  final String businessName;
  final String businessAddress;
  final String businessPhone;

  CheckoutSession({
    required this.id,
    required this.sessionCode,
    required this.cartItems,
    required this.subtotal,
    required this.discount,
    required this.taxRate,
    required this.taxAmount,
    required this.tipAmount,
    required this.totalAmount,
    this.customerName,
    this.customerEmail,
    this.customerPhone,
    this.appointmentId,
    this.staffId,
    this.staffName,
    required this.status,
    this.paymentMethod,
    this.paymentId,
    this.paymentStatus,
    required this.createdAt,
    this.expiresAt,
    required this.businessName,
    required this.businessAddress,
    required this.businessPhone,
  });

  factory CheckoutSession.fromJson(Map<String, dynamic> json) {
    List<CartItem> items = [];
    if (json['cart_items'] != null) {
      if (json['cart_items'] is List) {
        items = (json['cart_items'] as List)
            .map((item) => CartItem.fromJson(item as Map<String, dynamic>))
            .toList();
      }
    }

    return CheckoutSession(
      id: json['id'] ?? '',
      sessionCode: json['session_code'] ?? '',
      cartItems: items,
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      discount: (json['discount'] ?? 0).toDouble(),
      taxRate: (json['tax_rate'] ?? 0.05).toDouble(),
      taxAmount: (json['tax_amount'] ?? 0).toDouble(),
      tipAmount: (json['tip_amount'] ?? 0).toDouble(),
      totalAmount: (json['total_amount'] ?? 0).toDouble(),
      customerName: json['customer_name'],
      customerEmail: json['customer_email'],
      customerPhone: json['customer_phone'],
      appointmentId: json['appointment_id'],
      staffId: json['staff_id'],
      staffName: json['staff_name'],
      status: json['status'] ?? 'pending',
      paymentMethod: json['payment_method'],
      paymentId: json['payment_id'],
      paymentStatus: json['payment_status'],
      createdAt: DateTime.parse(
          json['created_at'] ?? DateTime.now().toIso8601String()),
      expiresAt: json['expires_at'] != null
          ? DateTime.parse(json['expires_at'])
          : null,
      businessName: json['business_name'] ?? 'Zavira Salon & Spa',
      businessAddress:
          json['business_address'] ?? '283 Tache Avenue, Winnipeg, MB, Canada',
      businessPhone: json['business_phone'] ?? '(431) 816-3330',
    );
  }

  /// Calculate total with tip (tip can be adjusted by customer on tablet)
  double get grandTotal => totalAmount + tipAmount;

  /// Check if session is still valid (not expired)
  bool get isValid {
    if (expiresAt == null) return true;
    return DateTime.now().isBefore(expiresAt!);
  }

  /// Copy with new tip amount
  CheckoutSession copyWithTip(double newTip) {
    return CheckoutSession(
      id: id,
      sessionCode: sessionCode,
      cartItems: cartItems,
      subtotal: subtotal,
      discount: discount,
      taxRate: taxRate,
      taxAmount: taxAmount,
      tipAmount: newTip,
      totalAmount: totalAmount,
      customerName: customerName,
      customerEmail: customerEmail,
      customerPhone: customerPhone,
      appointmentId: appointmentId,
      staffId: staffId,
      staffName: staffName,
      status: status,
      paymentMethod: paymentMethod,
      paymentId: paymentId,
      paymentStatus: paymentStatus,
      createdAt: createdAt,
      expiresAt: expiresAt,
      businessName: businessName,
      businessAddress: businessAddress,
      businessPhone: businessPhone,
    );
  }
}
