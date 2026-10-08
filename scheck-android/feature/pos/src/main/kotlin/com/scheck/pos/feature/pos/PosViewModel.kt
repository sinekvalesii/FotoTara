package com.scheck.pos.feature.pos

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.scheck.pos.core.domain.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

data class PosState(
    val lines: List<CartLine> = emptyList(),
    val message: String? = null,
    val busy: Boolean = false,
) {
    val totalCents get() = lines.sumOf { it.totalCents }
}

@HiltViewModel
class PosViewModel @Inject constructor(
    private val scan: ScanProductUseCase,
    private val checkout: CheckoutUseCase,
    observeUser: ObserveUserUseCase,
) : ViewModel() {
    private val _state = MutableStateFlow(PosState())
    val state = _state.asStateFlow()
    private val user = observeUser().stateIn(viewModelScope, SharingStarted.Eagerly, null)
    private var lastCode = "" to 0L

    fun onBarcode(code: String) {
        val now = System.currentTimeMillis()
        if (lastCode.first == code && now - lastCode.second < 1500) return // kamera tekrar okumasını engelle
        lastCode = code to now
        viewModelScope.launch {
            val p = scan(code) ?: return@launch _state.update { it.copy(message = "Ürün bulunamadı: $code") }
            add(p)
        }
    }

    fun add(p: Product) = _state.update { s ->
        val existing = s.lines.find { it.product.id == p.id }
        val qty = (existing?.qty ?: 0) + 1
        if (qty > p.stock) return@update s.copy(message = "Yetersiz stok: ${p.name}")
        val lines = if (existing == null) s.lines + CartLine(p, 1) else s.lines.map { if (it.product.id == p.id) it.copy(qty = qty) else it }
        s.copy(lines = lines, message = null)
    }

    fun remove(id: String) = _state.update { s ->
        s.copy(lines = s.lines.mapNotNull { if (it.product.id != id) it else if (it.qty > 1) it.copy(qty = it.qty - 1) else null })
    }

    fun pay() {
        val u = user.value ?: return _state.update { it.copy(message = "Oturum yok") }
        if (_state.value.busy) return
        _state.update { it.copy(busy = true) }
        viewModelScope.launch {
            val msg = checkout(_state.value.lines, u).fold(
                onSuccess = { r -> when (r) { is SaleResult.Success -> null; is SaleResult.InsufficientStock -> "Yetersiz stok: ${r.product.name}" } },
                onFailure = { it.message },
            )
            _state.update { if (msg == null) PosState(message = "Satış tamamlandı") else it.copy(busy = false, message = msg) }
        }
    }

    fun dismiss() = _state.update { it.copy(message = null) }
}
