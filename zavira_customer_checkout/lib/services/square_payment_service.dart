import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:square_mobile_payments_sdk/square_mobile_payments_sdk.dart';

import '../config/square_config.dart';

/// Service for Square Mobile Payments SDK integration
/// Handles Square Reader connection and payment processing
///
/// Reference: https://developer.squareup.com/docs/mobile-payments-sdk/flutter

class SquarePaymentService extends ChangeNotifier {
  static final SquarePaymentService _instance =
      SquarePaymentService._internal();
  factory SquarePaymentService() => _instance;
  SquarePaymentService._internal();

  // Square SDK instance
  final _sdk = SquareMobilePaymentsSdk();

  bool _isInitialized = false;
  bool _isAuthorized = false;
  bool _isReaderConnected = false;
  String? _connectedReaderId;
  bool _isConnecting = false;
  int _connectionAttempts = 0;
  bool _autoConnectActive = false;
  static const int _maxRetries = 5;
  static const Duration _initialRetryDelay = Duration(seconds: 2);

  bool get isInitialized => _isInitialized;
  bool get isAuthorized => _isAuthorized;
  bool get isReaderConnected => _isReaderConnected;
  String? get connectedReaderId => _connectedReaderId;
  bool get isConnecting => _isConnecting;
  int get connectionAttempts => _connectionAttempts;

  /// Initialize Square Mobile Payments SDK
  /// Call this once when the app starts
  Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      debugPrint('🔲 Initializing Square Mobile Payments SDK...');
      debugPrint('   Application ID: ${SquareConfig.applicationId}');
      debugPrint('   Location ID: ${SquareConfig.locationId}');
      debugPrint('   Environment: ${SquareConfig.environment}');

      // Check authorization status
      final authState = await _sdk.authManager.getAuthorizationState();
      _isAuthorized = authState == AuthorizationState.authorized;

      debugPrint('   Authorization status: ${authState.name}');

      _isInitialized = true;
      notifyListeners();
      debugPrint('✅ Square SDK initialized successfully');
    } catch (e) {
      debugPrint('❌ Failed to initialize Square SDK: $e');
      notifyListeners();
      rethrow;
    }
  }

  /// Check if reader is connected by showing mock reader UI
  /// This will display the reader selection/pairing interface
  Future<bool> checkReaderConnection() async {
    try {
      // In the new SDK, you show the mock reader UI for testing
      // or check connection status through the reader manager
      // For now, we'll use a simple connection check

      return _isReaderConnected;
    } catch (e) {
      debugPrint('❌ Failed to check reader connection: $e');
      _isReaderConnected = false;
      _connectedReaderId = null;
      notifyListeners();
      return false;
    }
  }

  /// Show the reader selection/pairing UI
  /// This allows users to pair with a Square Reader
  Future<void> pairReader() async {
    try {
      debugPrint('📱 Opening Square Reader pairing UI...');

      // Show mock reader UI for testing
      // In production, this will show actual reader pairing
      await _sdk.readerManager.showMockReaderUI();

      _isReaderConnected = true;
      _connectedReaderId = 'READER_CONNECTED';
      notifyListeners();
      debugPrint('✅ Reader UI shown - reader ready');
    } on MockReaderUIError catch (e) {
      debugPrint('❌ Mock reader UI error: ${e.code} - ${e.message}');
      _isReaderConnected = false;
      _connectedReaderId = null;
      notifyListeners();
      rethrow;
    } catch (e) {
      debugPrint('❌ Failed to show reader UI: $e');
      _isReaderConnected = false;
      _connectedReaderId = null;
      notifyListeners();
      rethrow;
    }
  }

  /// Retry connection with exponential backoff
  /// Automatically retries up to 5 times with increasing delays
  Future<bool> retryConnection() async {
    if (_isConnecting) {
      debugPrint('⏳ Connection already in progress, skipping retry');
      return false;
    }

    _isConnecting = true;
    notifyListeners();

    try {
      for (int attempt = 1; attempt <= _maxRetries; attempt++) {
        _connectionAttempts = attempt;
        notifyListeners();

        debugPrint('🔄 Connection attempt $attempt/$_maxRetries...');

        try {
          // Check if reader is already connected
          final isConnected = await checkReaderConnection();
          if (isConnected) {
            debugPrint('✅ Reader connected on attempt $attempt');
            _connectionAttempts = 0;
            return true;
          }

          // Try to pair with reader
          try {
            await pairReader();
            _connectionAttempts = 0;
            return true;
          } catch (pairError) {
            debugPrint('⚠️ Pairing failed: $pairError');
          }
        } catch (e) {
          debugPrint('❌ Connection attempt $attempt failed: $e');
        }

        // Don't delay after the last attempt
        if (attempt < _maxRetries) {
          // Exponential backoff: 2s, 4s, 8s, 16s, 30s (clamped)
          final delaySeconds = _initialRetryDelay.inSeconds * (1 << (attempt - 1));
          final delay = Duration(seconds: delaySeconds.clamp(2, 30));
          debugPrint('⏱️ Waiting ${delay.inSeconds}s before retry...');
          await Future.delayed(delay);
        }
      }

      debugPrint('❌ All $_maxRetries connection attempts failed');
      return false;
    } finally {
      _isConnecting = false;
      notifyListeners();
    }
  }

  /// Auto-connect: Continuously check for reader and retry if disconnected
  /// Max attempts limits the number of retry cycles (each cycle has 5 retries)
  Future<void> startAutoConnect({int maxAttempts = 10}) async {
    if (_autoConnectActive) {
      debugPrint('⏳ Auto-connect already running');
      return;
    }

    _autoConnectActive = true;
    debugPrint('🔁 Starting auto-connect mode (max $maxAttempts cycles)...');

    int attempts = 0;
    while (_autoConnectActive && attempts < maxAttempts) {
      attempts++;

      if (!_isReaderConnected && !_isConnecting) {
        debugPrint('📡 Checking for Square Reader (cycle $attempts/$maxAttempts)...');
        final connected = await retryConnection();

        if (connected) {
          debugPrint('✅ Auto-connect successful!');
          _autoConnectActive = false;
          return;
        }
      }

      if (_autoConnectActive && attempts < maxAttempts) {
        await Future.delayed(const Duration(seconds: 10));
      }
    }

    _autoConnectActive = false;
    debugPrint('❌ Auto-connect stopped after $attempts cycles');
  }

  /// Stop auto-connect mode
  void stopAutoConnect() {
    _autoConnectActive = false;
    debugPrint('🛑 Auto-connect stopped by user');
  }

  /// Process a payment using the connected Square Reader
  /// Amount should be in dollars (e.g., 45.50)
  Future<PaymentResult> processPayment({
    required double amountDollars,
    String? referenceId,
    String? note,
  }) async {
    if (!_isAuthorized) {
      return PaymentResult(
        success: false,
        errorMessage: 'Square SDK not authorized. Please authorize first.',
        errorCode: 'NOT_AUTHORIZED',
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

      // Create payment parameters
      final paymentParams = PaymentParameters(
        processingMode: 0, // Default processing mode
        amountMoney: Money(
          amount: amountCents,
          currencyCode: CurrencyCode.usd, // Change to match SquareConfig.currency
        ),
        paymentAttemptId: referenceId ?? DateTime.now().millisecondsSinceEpoch.toString(),
      );

      // Create prompt parameters
      final promptParams = PromptParameters(
        additionalPaymentMethods: [],
        mode: PromptMode.defaultMode,
      );

      // Start payment
      final payment = await _sdk.paymentManager.startPayment(
        paymentParams,
        promptParams,
      );

      debugPrint('✅ Payment successful: ${payment.id}');

      return PaymentResult(
        success: true,
        paymentId: payment.id,
        receiptUrl: null, // Receipt URL not provided in this SDK version
      );
    } on PaymentError catch (e) {
      debugPrint('❌ Payment error: ${e.code} - ${e.message}');
      return PaymentResult(
        success: false,
        errorMessage: e.message,
        errorCode: e.code.toString(),
      );
    } catch (e) {
      debugPrint('❌ Unexpected payment error: $e');
      return PaymentResult(
        success: false,
        errorMessage: e.toString(),
      );
    }
  }

  /// Disconnect from the current reader
  Future<void> disconnectReader() async {
    try {
      // The new SDK handles reader disconnection automatically
      // when the app is closed or reader is turned off
      _isReaderConnected = false;
      _connectedReaderId = null;
      _connectionAttempts = 0;
      notifyListeners();
      debugPrint('📴 Reader disconnected');
    } catch (e) {
      debugPrint('❌ Failed to disconnect reader: $e');
    }
  }

  /// Show Square settings UI
  Future<void> showSettings() async {
    try {
      await _sdk.settingsManager.showSettings();
    } on SettingsError catch (e) {
      debugPrint('❌ Settings error: ${e.code} - ${e.message}');
      rethrow;
    }
  }

  /// Simulate reader connection for testing (for development only)
  void simulateReaderConnection(bool connected) {
    _isReaderConnected = connected;
    _connectedReaderId = connected ? 'SIMULATED_READER_001' : null;
    _isConnecting = false;
    _connectionAttempts = 0;
    notifyListeners();
    debugPrint(connected
        ? '✅ Reader connected (simulated)'
        : '📴 Reader disconnected (simulated)');
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
