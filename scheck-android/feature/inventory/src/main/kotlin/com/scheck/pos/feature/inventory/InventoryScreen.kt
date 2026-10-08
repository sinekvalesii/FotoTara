package com.scheck.pos.feature.inventory

import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.Color
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import com.scheck.pos.core.domain.ProductRepository
import com.scheck.pos.core.ui.asTl
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.stateIn
import javax.inject.Inject

const val LOW_STOCK = 5

@HiltViewModel
class InventoryViewModel @Inject constructor(repo: ProductRepository) : ViewModel() {
    val products = repo.observeAll().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())
}

@Composable
fun InventoryScreen(vm: InventoryViewModel = hiltViewModel()) {
    val items by vm.products.collectAsStateWithLifecycle()
    LazyColumn {
        items(items, key = { it.id }) { p ->
            ListItem(
                headlineContent = { Text(p.name) },
                supportingContent = { Text("${p.barcode} • ${p.priceCents.asTl()}") },
                trailingContent = { Text("${p.stock}", color = if (p.stock <= LOW_STOCK) Color.Red else Color.Unspecified) },
            )
        }
    }
}
