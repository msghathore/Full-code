# Flutter wrapper
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.**  { *; }
-keep class io.flutter.util.**  { *; }
-keep class io.flutter.view.**  { *; }
-keep class io.flutter.**  { *; }
-keep class io.flutter.plugins.**  { *; }
-dontwarn io.flutter.embedding.**

# Square Mobile Payments SDK
-keep class com.squareup.sdk.** { *; }
-keep class com.squareup.mobilepayments.** { *; }
-dontwarn com.squareup.**

# Supabase / Realtime
-keep class io.supabase.** { *; }
-dontwarn io.supabase.**

# Kotlin Coroutines
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}

# Keep model classes for JSON serialization
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# Keep enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Bluetooth / NFC
-keep class android.bluetooth.** { *; }
-keep class android.nfc.** { *; }
