plugins {
    alias(libs.plugins.android.library)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
    alias(libs.plugins.hilt)
}
android { namespace = "com.scheck.pos.feature.ecommerce" }
dependencies {
    implementation(project(":core"))
    implementation(platform(libs.compose.bom))
    implementation(libs.compose.ui)
    implementation(libs.compose.material3)
    implementation(libs.compose.icons)
    implementation(libs.lifecycle.vm)
    implementation(libs.lifecycle.runtime)
    implementation(libs.hilt.android)
    implementation(libs.hilt.nav)
    ksp(libs.hilt.compiler)

}
