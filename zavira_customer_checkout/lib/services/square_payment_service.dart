import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

import '../config/square_config.dart';

/// Service for Square Mobile Payments SDK integration
/// Handles Square Reader connection and payment processing
///
/// NOTE: This uses the official Square Mobile Payments SDK Flutter plugin
/// Reference: https://developer.squareup.com/docs/mobile-payments-sdk/flutter

class SquarePaymentService {
  static final SquarePaymentService _instance =
      SquarePaymentService._internal();
  factory SquarePaymentService() => _instance;
  SquarePaymentService._internal();

  bool _isInitialized = false;
  bool _isReaderConnected = false;
  String? _connectedReaderId;

  bool get isInitialized => _isInitialized;
  bool get isReaderConnected => _isReaderConnected;
  String? get connectedReaderId => _connectedReaderId;

  /// Initialize Square Mobile Payments SDK
  /// Call this once when the app starts
  Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      debugPrint('🔲 Initializing Square Mobile Payments SDK...');
      debugPrint('   Application ID: ${SquareConfig.applicationId}');
      debugPrint('   Location ID: ${SquareConfig.locationId}');
      debugPrint('   Environment: ${SquareConfig.environment}');

      // TODO: Uncomment when square_mobile_payments plugin is added
      // await MobilePaymentsSdk.initialize(
      //   applicationId: SquareConfig.applicationId,
      //   environment: SquareConfig.isSandbox
      //       ? MobilePaymentsEnvironment.sandbox
      //       : MobilePaymentsEnvironment.production,
      // );

      _isInitialized = true;
      debugPrint('✅ Square SDK initialized successfully');
    } catch (e) {
      debugPrint('❌ Failed to initialize Square SDK: $e');
      rethrow;
    }
  }

  /// Authorize the SDK with location
  /// Required before connecting to reader or processing payments
  Future<void> authorize() async {
    if (!_isInitialized) {
      await initialize();
    }

    try {
      debugPrint('🔐 Authorizing Square SDK for location...');

      // TODO: Uncomment when square_mobile_payments plugin is added
      // await MobilePaymentsSdk.authorize(
      //   accessToken: 'YOUR_ACCESS_TOKEN', // Get from backend
      //   locationId: SquareConfig.locationId,
      // );

      debugPrint('✅ Square SDK authorized');
    } catch (e) {
      debugPrint('❌ Failed to authorize Square SDK: $e');
      rethrow;
    }
  }

  /// Pair with Square Reader via Bluetooth
  /// The SDK handles the Bluetooth pairing UI
  Future<void> pairReader() async {
    try {
      debugPrint('📱 Starting Square Reader pairing...');

      // TODO: Uncomment when square_mobile_payments plugin is added
      // final result = await MobilePaymentsSdk.startReaderPairing();
      // if (result.isSuccess) {
      //   _isReaderConnected = true;
      //   _connectedReaderId = result.readerId;
      //   debugPrint('✅ Reader paired: $_connectedReaderId');
      // }

      // For now, without the plugin, throw an error
      throw PlatformException(
        code: 'NO_SDK',
        message: 'Square Mobile Payments SDK is not installed. Please add the square_mobile_payments plugin.',
      );
    } catch (e) {
      debugPrint('❌ Failed to pair reader: $e');
      _isReaderConnected = false;
      rethrow;
    }
  }

  /// Check if a reader is connected
  Future<bool> checkReaderConnection() async {
    try {
      // TODO: Uncomment when square_mobile_payments plugin is added
      // final readers = await MobilePaymentsSdk.getConnectedReaders();
      // _isReaderConnected = readers.isNotEmpty;
      // if (_isReaderConnected) {
      //   _connectedReaderId = readers.first.id;
      // }

      return _isReaderConnected;
    } catch (e) {
      debugPrint('❌ Failed to check reader connection: $e');
      return false;
    }
  }

  /// Process a payment using the connected Square Reader
  /// Amount should be in dollars (e.g., 45.50)
  Future<PaymentResult> processPayment({
    required double amountDollars,
    String? referenceId,
    String? note,
  }) async {
    if (!_isReaderConnected) {
      return PaymentResult(
        success: false,
        errorMessage: 'No Square Reader connected',
      );
    }

    // Convert to cents for Square
    final amountCents = (amountDollars * 100).round();

    if (amountCents < SquareConfig.minimumAmountCents) {
      return PaymentResult(
        success: false,
        errorMessage:
            'Minimum payment amount is \$${SquareConfig.minimumAmountCents / 100}',
      );
    }

    try {
      debugPrint('💳 Processing payment: \$$amountDollars ($amountCents cents)');

      // TODO: Uncomment when square_mobile_payments plugin is added
      // final paymentParams = PaymentParameters(
      //   amountMoney: Money(
      //     amount: amountCents,
      //     currency: SquareConfig.currency,
      //   ),
      //   idempotencyKey: referenceId ?? DateTime.now().millisecondsSinceEpoch.toString(),
      //   note: note,
      // );
      //
      // final result = await MobilePaymentsSdk.startPayment(paymentParams);
      //
      // if (result.isSuccess) {
      //   return PaymentResult(
      //     success: true,
      //     paymentId: result.payment?.id,
      //     receiptUrl: result.payment?.receiptUrl,
      //   );
      // } else {
      //   return PaymentResult(
      //     success: false,
      //     errorMessage: result.error?.message ?? 'Payment failed',
      //     errorCode: result.error?.code,
      //   );
      // }

      // For now, without the plugin, return an error
      return PaymentResult(
        success: false,
        errorMessage: 'Square Mobile Payments SDK is not installed. Please add the square_mobile_payments plugin to process real payments.',
        errorCode: 'NO_SDK',
      );
    } on PlatformException catch (e) {
      debugPrint('❌ Payment platform error: ${e.message}');
      return PaymentResult(
        success: false,
        errorMessage: e.message ?? 'Payment failed',
        errorCode: e.code,
      );
    } catch (e) {
      debugPrint('❌ Payment error: $e');
      return PaymentResult(
        success: false,
        errorMessage: e.toString(),
      );
    }
  }

  /// Disconnect from the current reader
  Future<void> disconnectReader() async {
    try {
      // TODO: Uncomment when square_mobile_payments plugin is added
      // await MobilePaymentsSdk.disconnectReader();

      _isReaderConnected = false;
      _connectedReaderId = null;
      debugPrint('📴 Reader disconnected');
    } catch (e) {
      debugPrint('❌ Failed to disconnect reader: $e');
    }
  }
}

/// Result of a payment attempt
class PaymentResult {
  final bool success;
  final String? paymentId;
  final String? receiptUrl;
  final String? errorMessage;
  final String? errorCode;

  PaymentResult({
    required this.success,
    this.paymentId,
    this.receiptUrl,
    this.errorMessage,
    this.errorCode,
  });
}
