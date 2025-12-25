import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

import '../config/supabase_config.dart';
import '../models/checkout_session.dart';

/// Service for managing checkout sessions with Supabase
/// Implements both realtime sync AND fallback polling (per GROK suggestion)

class CheckoutService extends ChangeNotifier {
  final SupabaseClient _supabase = Supabase.instance.client;

  CheckoutSession? _currentSession;
  bool _isLoading = false;
  String? _error;
  bool _isConnected = true;

  // Realtime subscription
  RealtimeChannel? _realtimeChannel;

  // Fallback polling timer (per GROK - every 10 seconds)
  Timer? _pollingTimer;

  // Connectivity subscription
  StreamSubscription<ConnectivityResult>? _connectivitySubscription;

  CheckoutSession? get currentSession => _currentSession;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasActiveSession => _currentSession != null;
  bool get isConnected => _isConnected;

  CheckoutService() {
    _initConnectivityListener();
    _startListening();
  }

  /// Initialize connectivity listener
  void _initConnectivityListener() {
    _connectivitySubscription =
        Connectivity().onConnectivityChanged.listen((result) {
      final wasConnected = _isConnected;
      _isConnected = result != ConnectivityResult.none;

      if (!wasConnected && _isConnected) {
        // Reconnected - refresh data
        debugPrint('📶 Network reconnected, refreshing...');
        _fetchLatestPendingCheckout();
      }

      notifyListeners();
    });
  }

  /// Start listening for pending checkouts via realtime + fallback polling
  void _startListening() {
    _setupRealtimeSubscription();
    _startFallbackPolling();
    _fetchLatestPendingCheckout();
  }

  /// Setup Supabase realtime subscription
  void _setupRealtimeSubscription() {
    debugPrint('🔌 Setting up realtime subscription...');

    _realtimeChannel = _supabase
        .channel(SupabaseConfig.realtimeChannel)
        .onPostgresChanges(
          event: PostgresChangeEvent.all,
          schema: 'public',
          table: SupabaseConfig.pendingCheckoutTable,
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'status',
            value: 'pending',
          ),
          callback: (payload) {
            debugPrint('📥 Realtime update received: ${payload.eventType}');

            if (payload.eventType == PostgresChangeEvent.insert ||
                payload.eventType == PostgresChangeEvent.update) {
              final newData = payload.newRecord;
              if (newData != null && newData['status'] == 'pending') {
                _currentSession = CheckoutSession.fromJson(newData);
                _error = null;
                notifyListeners();
              }
            } else if (payload.eventType == PostgresChangeEvent.delete) {
              if (_currentSession?.id == payload.oldRecord?['id']) {
                _currentSession = null;
                notifyListeners();
              }
            }
          },
        )
        .subscribe((status, [error]) {
      debugPrint('📡 Realtime status: $status');
      if (error != null) {
        debugPrint('❌ Realtime error: $error');
      }
    });
  }

  /// Start fallback polling (per GROK suggestion - every 10 seconds)
  void _startFallbackPolling() {
    debugPrint('⏱️ Starting fallback polling every 10 seconds...');

    _pollingTimer?.cancel();
    _pollingTimer = Timer.periodic(SupabaseConfig.pollingInterval, (_) {
      if (_isConnected) {
        _fetchLatestPendingCheckout();
      }
    });
  }

  /// Fetch the latest pending checkout from Supabase
  Future<void> _fetchLatestPendingCheckout() async {
    try {
      final response = await _supabase
          .from(SupabaseConfig.pendingCheckoutTable)
          .select()
          .eq('status', 'pending')
          .order('created_at', ascending: false)
          .limit(1)
          .maybeSingle();

      if (response != null) {
        final newSession = CheckoutSession.fromJson(response);

        // Only update if it's a different session or status changed
        if (_currentSession?.id != newSession.id ||
            _currentSession?.status != newSession.status) {
          _currentSession = newSession;
          _error = null;
          notifyListeners();
        }
      } else if (_currentSession != null &&
          _currentSession!.status == 'pending') {
        // Session was completed or cancelled
        _refreshCurrentSession();
      }
    } catch (e) {
      debugPrint('❌ Error fetching pending checkout: $e');
      _error = 'Failed to fetch checkout data';
      // Don't clear session on error - keep showing last known state
    }
  }

  /// Refresh current session status
  Future<void> _refreshCurrentSession() async {
    if (_currentSession == null) return;

    try {
      final response = await _supabase
          .from(SupabaseConfig.pendingCheckoutTable)
          .select()
          .eq('id', _currentSession!.id)
          .maybeSingle();

      if (response != null) {
        _currentSession = CheckoutSession.fromJson(response);
        notifyListeners();
      } else {
        _currentSession = null;
        notifyListeners();
      }
    } catch (e) {
      debugPrint('❌ Error refreshing session: $e');
    }
  }

  /// Mark session as viewed (when customer sees the invoice)
  Future<void> markAsViewed() async {
    if (_currentSession == null) return;

    try {
      await _supabase.from(SupabaseConfig.pendingCheckoutTable).update({
        'status': 'viewed',
      }).eq('id', _currentSession!.id);

      _currentSession = _currentSession!.copyWithTip(_currentSession!.tipAmount);
      notifyListeners();
    } catch (e) {
      debugPrint('❌ Error marking as viewed: $e');
    }
  }

  /// Update tip amount
  Future<void> updateTip(double tipAmount) async {
    if (_currentSession == null) return;

    _currentSession = _currentSession!.copyWithTip(tipAmount);
    notifyListeners();

    try {
      await _supabase.from(SupabaseConfig.pendingCheckoutTable).update({
        'tip_amount': tipAmount,
      }).eq('id', _currentSession!.id);
    } catch (e) {
      debugPrint('❌ Error updating tip: $e');
    }
  }

  /// Mark session as processing (payment in progress)
  Future<void> markAsProcessing() async {
    if (_currentSession == null) return;

    try {
      await _supabase.from(SupabaseConfig.pendingCheckoutTable).update({
        'status': 'processing',
        'payment_status': 'processing',
      }).eq('id', _currentSession!.id);
    } catch (e) {
      debugPrint('❌ Error marking as processing: $e');
    }
  }

  /// Complete the checkout with payment details
  Future<void> completeCheckout({
    required String paymentMethod,
    required String paymentId,
    required double finalAmount,
  }) async {
    if (_currentSession == null) return;

    try {
      await _supabase.from(SupabaseConfig.pendingCheckoutTable).update({
        'status': 'completed',
        'payment_method': paymentMethod,
        'payment_id': paymentId,
        'payment_status': 'completed',
        'total_amount': finalAmount,
        'completed_at': DateTime.now().toIso8601String(),
      }).eq('id', _currentSession!.id);

      // Keep session for success screen
      _refreshCurrentSession();
    } catch (e) {
      debugPrint('❌ Error completing checkout: $e');
      rethrow;
    }
  }

  /// Cancel the checkout
  Future<void> cancelCheckout() async {
    if (_currentSession == null) return;

    try {
      await _supabase.from(SupabaseConfig.pendingCheckoutTable).update({
        'status': 'cancelled',
      }).eq('id', _currentSession!.id);

      _currentSession = null;
      notifyListeners();
    } catch (e) {
      debugPrint('❌ Error cancelling checkout: $e');
    }
  }

  /// Clear current session (after showing success)
  void clearSession() {
    _currentSession = null;
    notifyListeners();
  }

  /// Manual refresh
  Future<void> refresh() async {
    _isLoading = true;
    notifyListeners();

    await _fetchLatestPendingCheckout();

    _isLoading = false;
    notifyListeners();
  }

  @override
  void dispose() {
    debugPrint('🧹 Disposing CheckoutService...');
    _realtimeChannel?.unsubscribe();
    _pollingTimer?.cancel();
    _connectivitySubscription?.cancel();
    super.dispose();
  }
}
