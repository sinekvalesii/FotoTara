package com.scheck.pos.core.domain

import javax.inject.Inject

class SignInUseCase @Inject constructor(private val repo: AuthRepository) {
    suspend operator fun invoke(email: String, password: String): Result<User> {
        if (!email.contains('@') || password.length < 6) return Result.failure(IllegalArgumentException("Geçersiz e-posta veya şifre"))
        return repo.signIn(email.trim(), password)
    }
}

class ObserveUserUseCase @Inject constructor(private val repo: AuthRepository) {
    operator fun invoke() = repo.currentUser
}

class ScanProductUseCase @Inject constructor(private val repo: ProductRepository) {
    suspend operator fun invoke(barcode: String) = repo.findByBarcode(barcode)
}

class CheckoutUseCase @Inject constructor(private val sales: SaleRepository) {
    suspend operator fun invoke(lines: List<CartLine>, user: User): Result<SaleResult> = runCatching {
        require(user.role.can(Permission.SELL)) { "Yetkisiz işlem" }
        require(lines.isNotEmpty()) { "Sepet boş" }
        sales.checkout(lines, user.uid)
    }
}

class UpsertProductUseCase @Inject constructor(private val repo: ProductRepository) {
    suspend operator fun invoke(product: Product, user: User): Result<Unit> = runCatching {
        require(user.role.can(Permission.EDIT_STOCK)) { "Yetkisiz işlem" }
        repo.upsert(product)
    }
}
