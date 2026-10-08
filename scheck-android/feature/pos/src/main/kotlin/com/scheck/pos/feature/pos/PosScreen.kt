package com.scheck.pos.feature.pos

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.scheck.pos.core.ui.asTl

@Composable
fun PosScreen(vm: PosViewModel = hiltViewModel()) {
    val s by vm.state.collectAsStateWithLifecycle()
    val ctx = LocalContext.current
    var camOk by remember { mutableStateOf(ContextCompat.checkSelfPermission(ctx, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) }
    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { camOk = it }
    LaunchedEffect(Unit) { if (!camOk) launcher.launch(Manifest.permission.CAMERA) }
    val snack = remember { SnackbarHostState() }
    LaunchedEffect(s.message) { s.message?.let { snack.showSnackbar(it); vm.dismiss() } }

    Scaffold(
        snackbarHost = { SnackbarHost(snack) },
        bottomBar = {
            Surface(tonalElevation = 3.dp) {
                Row(Modifier.fillMaxWidth().padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text("Toplam: ${s.totalCents.asTl()}", style = MaterialTheme.typography.titleLarge, modifier = Modifier.weight(1f))
                    Button(onClick = vm::pay, enabled = s.lines.isNotEmpty() && !s.busy) { Text("Ödeme Al") }
                }
            }
        },
    ) { pad ->
        Column(Modifier.padding(pad).fillMaxSize()) {
            if (camOk) BarcodeScanner(vm::onBarcode, Modifier.fillMaxWidth().height(220.dp))
            else Text("Barkod okuma için kamera izni gerekli", Modifier.padding(16.dp))
            LazyColumn(Modifier.weight(1f)) {
                items(s.lines, key = { it.product.id }) { l ->
                    ListItem(
                        headlineContent = { Text(l.product.name) },
                        supportingContent = { Text("${l.qty} × ${l.product.priceCents.asTl()}") },
                        trailingContent = {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(l.totalCents.asTl())
                                IconButton(onClick = { vm.remove(l.product.id) }) { Icon(Icons.Default.Remove, "Azalt") }
                            }
                        },
                    )
                    HorizontalDivider()
                }
            }
        }
    }
}
