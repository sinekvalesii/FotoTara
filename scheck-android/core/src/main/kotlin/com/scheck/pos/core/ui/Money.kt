package com.scheck.pos.core.ui

import java.text.NumberFormat
import java.util.Locale

private val tl = NumberFormat.getCurrencyInstance(Locale("tr", "TR"))
fun Long.asTl(): String = tl.format(this / 100.0)
