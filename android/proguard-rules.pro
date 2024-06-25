# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /home/anosam/programs/android-sdk/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile
#-dontwarn
#-ignorewarnings
#-verbose

-dontshrink
-dontskipnonpubliclibraryclasses
-dontskipnonpubliclibraryclassmembers
-optimizationpasses 5
-useuniqueclassmembernames
-keepattributes Exceptions,InnerClasses,Signature,Deprecated,SourceFile,LineNumberTable,LocalVariable*Table,*Annotation*,Synthetic,EnclosingMethod
-keepparameternames
-optimizations !code/simplification/cast,!field/*,!class/merging/*,!code/allocation/variable
-keeppackagenames io.flutter.plugins.**

#By default Google keeps classes of  Activity 、Service ...
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.preference.Preference

-keep class com.pax.poslink2.** { *; }

-keep class okhttp3.** { *; }
-keep class okio.** { *; }

#common
-keep class com.pax.** { *; }  
-keep class com.jcraft.jsch.** { *; }  
-keep class com.google.gson.** { *; }
#linux/windows
-keep class gnu.io.** { *; }
#windows
-keep class com.fazecast.jSerialComm.** { *; }