package com.scheck.pos.core.data

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.scheck.pos.core.domain.AuthRepository
import com.scheck.pos.core.domain.Role
import com.scheck.pos.core.domain.User
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.mapLatest
import kotlinx.coroutines.tasks.await
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
@OptIn(kotlinx.coroutines.ExperimentalCoroutinesApi::class)
class AuthRepositoryImpl @Inject constructor(
    private val auth: FirebaseAuth,
    private val fs: FirebaseFirestore,
) : AuthRepository {

    override val currentUser = callbackFlow {
        val l = FirebaseAuth.AuthStateListener { trySend(it.currentUser) }
        auth.addAuthStateListener(l)
        awaitClose { auth.removeAuthStateListener(l) }
    }.mapLatest { fu -> fu?.let { User(it.uid, it.email.orEmpty(), roleOf(it.uid)) } }

    override suspend fun signIn(email: String, password: String) = runCatching {
        val fu = auth.signInWithEmailAndPassword(email, password).await().user!!
        User(fu.uid, fu.email.orEmpty(), roleOf(fu.uid))
    }

    override suspend fun signOut() = auth.signOut()

    // Rol yalnızca sunucu tarafında (Firestore kuralları/Admin SDK) atanır; varsayılan en düşük yetki.
    private suspend fun roleOf(uid: String): Role = runCatching {
        Role.valueOf(fs.collection("users").document(uid).get().await().getString("role") ?: "STAFF")
    }.getOrDefault(Role.STAFF)
}
