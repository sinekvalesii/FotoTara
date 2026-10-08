package com.scheck.pos.core.plugin

import androidx.compose.runtime.Composable
import com.scheck.pos.core.domain.Permission

/** Yeni özellikler bu arayüzü uygulayıp Hilt ile @IntoSet olarak kaydolur. */
interface ScheckPlugin {
    val route: String
    val title: String
    val requires: Permission
    @Composable fun Content()
}
