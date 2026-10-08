package com.scheck.pos.core.domain

import kotlinx.coroutines.flow.Flow

interface AuthRepository {
    val currentUser: Flow<User?>
    suspend fun signIn(email: String, password: String): Result<User>
    suspend fun signOut()
}

interface ProductRepository {
    fun observeAll(): Flow<List<Product>>
    suspend fun findByBarcode(barcode: String): Product?
    suspend fun upsert(product: Product)
    fun startSync()
}

interface SaleRepository {
    suspend fun checkout(lines: List<CartLine>, cashierUid: String): SaleResult
}
