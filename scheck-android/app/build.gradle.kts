import java.util.Properties

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
    alias(libs.plugins.hilt)
    alias(libs.plugins.google.services)
}

val ks = Properties().apply {
    rootProject.file("keystore.properties").takeIf { it.exists() }?.inputStream()?.use(::load)
}
fun sec(k: String) = ks.getProperty(k) ?: System.getenv("SCHECK_KS_${k.uppercase()}")

android {
    namespace = "com.scheck.pos"
    compileSdk = 35
    defaultConfig {
        applicationId = "com.scheck.pos"
        minSdk = 26
        targetSdk = 35
        versionCode = (System.getenv("VERSION_CODE") ?: "9").toInt()
        versionName = "2.0.0"
    }
    signingConfigs {
        create("release") {
            sec("storeFile")?.let { storeFile = file(it) }
            storePassword = sec("storePassword")
            keyAlias = sec("keyAlias")
            keyPassword = sec("keyPassword")
        }
    }
    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            signingConfig = signingConfigs.getByName("release")
        }
    }
    bundle {
        language { enableSplit = true }
        density { enableSplit = true }
        abi { enableSplit = true }
    }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    buildFeatures { compose = true; buildConfig = true }
}

dependencies {
    implementation(project(":core"))
    implementation(project(":feature:pos"))
    implementation(project(":feature:inventory"))
    implementation(project(":feature:ecommerce"))
    implementation(libs.activity.compose)
    implementation(libs.navigation.compose)
    implementation(libs.hilt.android)
    implementation(libs.hilt.nav)
    ksp(libs.hilt.compiler)
    implementation(libs.profileinstaller)
    debugImplementation(libs.compose.tooling)
}
