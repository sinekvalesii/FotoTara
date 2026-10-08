package com.scheck.pos.core.domain

enum class Role { ADMIN, STAFF }

enum class Permission { SELL, VIEW_STOCK, EDIT_STOCK, MANAGE_USERS, VIEW_REPORTS }

fun Role.can(p: Permission): Boolean = when (this) {
    Role.ADMIN -> true
    Role.STAFF -> p == Permission.SELL || p == Permission.VIEW_STOCK
}

data class User(val uid: String, val email: String, val role: Role)

data class Product(val id: String, val barcode: String, val name: String, val priceCents: Long, val stock: Int)

data class CartLine(val product: Product, val qty: Int) {
    val totalCents get() = product.priceCents * qty
}

sealed interface SaleResult {
    data class Success(val saleId: String) : SaleResult
    data class InsufficientStock(val product: Product) : SaleResult
}
