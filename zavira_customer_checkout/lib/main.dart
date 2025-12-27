import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:permission_handler/permission_handler.dart';

import 'config/supabase_config.dart';
import 'config/theme_config.dart';
import 'services/checkout_service.dart';
import 'services/square_payment_service.dart';
import 'screens/waiting_screen.dart';

/// Request Bluetooth permissions required for Square Reader
/// CRITICAL: Must be called BEFORE invoking any Square Reader methods
/// Android 12+ requires runtime permission for BLUETOOTH_CONNECT and BLUETOOTH_SCAN
/// Returns true if all permissions granted, false otherwise
Future<bool> _requestBluetoothPermissions() async {
  // Skip Bluetooth permissions on web - they're not supported
  if (kIsWeb) {
    debugPrint('🌐 Running on web - skipping Bluetooth permissions');
    return false; // Permissions not available on web
  }

  debugPrint('🔐 Requesting Bluetooth permissions...');

  // Request permissions (only on mobile platforms)
  final Map<Permission, PermissionStatus> statuses = await [
    Permission.bluetoothConnect,
    Permission.bluetoothScan,
  ].request();

  // Log results
  statuses.forEach((permission, status) {
    if (status.isGranted) {
      debugPrint('✅ ${permission.toString()} granted');
    } else if (status.isDenied) {
      debugPrint('❌ ${permission.toString()} denied');
    } else if (status.isPermanentlyDenied) {
      debugPrint('⛔ ${permission.toString()} permanently denied');
    }
  });

  // Check if all required permissions are granted
  final allGranted = statuses.values.every((status) => status.isGranted);

  if (!allGranted) {
    debugPrint('⚠️ Not all Bluetooth permissions granted. Square Reader may not work.');

    // Check if any are permanently denied
    final permanentlyDenied = statuses.values.any((s) => s.isPermanentlyDenied);
    if (permanentlyDenied) {
      debugPrint('⛔ Some permissions permanently denied.');
      debugPrint('   User must enable them in Settings > Apps > Zavira Checkout > Permissions');
      // Note: We could call openAppSettings() here, but it's better to let the user
      // continue and show a UI message instead of forcing them to settings immediately
    }
  }

  return allGranted;
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Lock to landscape for tablet
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.landscapeLeft,
    DeviceOrientation.landscapeRight,
  ]);

  // Hide status bar for immersive experience
  await SystemChrome.setEnabledSystemUIMode(
    SystemUiMode.immersiveSticky,
  );

  // Initialize Supabase
  await Supabase.initialize(
    url: SupabaseConfig.url,
    anonKey: SupabaseConfig.anonKey,
    realtimeClientOptions: const RealtimeClientOptions(
      eventsPerSecond: 10,
    ),
  );

  // Request Bluetooth permissions for Square Reader
  // This MUST be done before any Square Reader methods are called
  await _requestBluetoothPermissions();

  // Initialize Square Payment Service
  final squareService = SquarePaymentService();

  // Only initialize Square SDK on mobile (not web)
  if (!kIsWeb) {
    try {
      await squareService.initialize();
      debugPrint('✅ Square SDK initialized successfully');
    } catch (e) {
      debugPrint('⚠️ Square SDK initialization failed: $e');
      debugPrint('   App will continue but Square Reader may not work');
    }
  } else {
    debugPrint('🌐 Running on web - Square SDK initialization skipped');
  }

  debugPrint('✅ App initialization complete');

  runApp(ZaviraCustomerCheckoutApp(squareService: squareService));
}

class ZaviraCustomerCheckoutApp extends StatelessWidget {
  final SquarePaymentService squareService;

  const ZaviraCustomerCheckoutApp({
    super.key,
    required this.squareService,
  });

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => CheckoutService()),
        ChangeNotifierProvider.value(value: squareService),
      ],
      child: MaterialApp(
        title: 'Zavira Checkout',
        debugShowCheckedModeBanner: false,
        theme: ZaviraTheme.darkTheme,
        home: const WaitingScreen(),
      ),
    );
  }
}
