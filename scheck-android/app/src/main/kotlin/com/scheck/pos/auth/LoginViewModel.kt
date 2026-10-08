package com.scheck.pos.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.scheck.pos.core.domain.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed interface SessionState { data object Loading : SessionState; data object SignedOut : SessionState; data class SignedIn(val user: User) : SessionState }

@HiltViewModel
class SessionViewModel @Inject constructor(
    observeUser: ObserveUserUseCase,
    private val signIn: SignInUseCase,
    private val auth: AuthRepository,
    products: ProductRepository,
) : ViewModel() {
    init { products.startSync() }

    val session = observeUser().map { it?.let(SessionState::SignedIn) ?: SessionState.SignedOut }
        .stateIn(viewModelScope, SharingStarted.Eagerly, SessionState.Loading)

    val error = MutableStateFlow<String?>(null)
    val busy = MutableStateFlow(false)

    fun login(email: String, pass: String) = viewModelScope.launch {
        busy.value = true
        error.value = signIn(email, pass).exceptionOrNull()?.let { "Giriş başarısız: ${it.message}" }
        busy.value = false
    }

    fun logout() = viewModelScope.launch { auth.signOut() }
}
