package com.scheck.pos.core.data

import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.scheck.pos.core.data.local.*
import com.scheck.pos.core.di.AppScope
import com.scheck.pos.core.domain.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import androidx.room.withTransaction
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

private fun ProductEntity.toDomain() = Product(id, barcode, name, priceCents, stock)
private fun Product.toEntity() = ProductEntity(id, barcode, name, priceCents, stock)

@Singleton
class ProductRepositoryImpl @Inject constructor(
    private val dao: ProductDao,
    private val fs: FirebaseFirestore,
    @AppScope private val scope: CoroutineScope,
) : ProductRepository {
    private var started = false

    override fun observeAll() = dao.observeAll().map { l -> l.map { it.toDomain() } }
    override suspend fun findByBarcode(barcode: String) = dao.byBarcode(barcode)?.toDomain()

    override suspend fun upsert(product: Product) {
        dao.upsert(listOf(product.toEntity()))
        fs.collection("products").document(product.id).set(product).await()
    }

    @Synchronized
    override fun startSync() {
        if (started) return
        started = true
        fs.collection("products").addSnapshotListener { snap, _ ->
            val items = snap?.documents?.mapNotNull { d ->
                ProductEntity(
                    id = d.id,
                    barcode = d.getString("barcode") ?: return@mapNotNull null,
                    name = d.getString("name").orEmpty(),
                    priceCents = d.getLong("priceCents") ?: 0,
                    stock = (d.getLong("stock") ?: 0).toInt(),
                )
            } ?: return@addSnapshotListener
            scope.launch { dao.upsert(items) }
        }
    }
}

@Singleton
class SaleRepositoryImpl @Inject constructor(
    private val db: ScheckDb,
    private val fs: FirebaseFirestore,
    @AppScope private val scope: CoroutineScope,
) : SaleRepository {

    override suspend fun checkout(lines: List<CartLine>, cashierUid: String): SaleResult {
        val id = UUID.randomUUID().toString()
        val result = db.withTransaction {
            lines.forEach { l -> if (db.products().decrement(l.product.id, l.qty) == 0) return@withTransaction SaleResult.InsufficientStock(l.product) }
            db.sales().insert(SaleEntity(id, cashierUid, lines.sumOf { it.totalCents }, System.currentTimeMillis()))
            db.sales().insertLines(lines.map { SaleLineEntity(id, it.product.id, it.qty, it.product.priceCents) })
            SaleResult.Success(id)
        }
        if (result is SaleResult.Success) scope.launch { pushPending() }
        return result
    }

    // Offline satışlar yerelde kalır, bağlantı gelince idempotent (saleId) olarak gönderilir.
    suspend fun pushPending() = runCatching {
        db.sales().unsynced().forEach { s ->
            val lines = db.sales().lines(s.id)
            fs.runBatch { b ->
                b.set(fs.collection("sales").document(s.id), mapOf(
                    "cashierUid" to s.cashierUid, "totalCents" to s.totalCents, "createdAt" to s.createdAt,
                    "lines" to lines.map { mapOf("productId" to it.productId, "qty" to it.qty, "priceCents" to it.priceCents) },
                ))
                lines.forEach { b.update(fs.collection("products").document(it.productId), "stock", FieldValue.increment(-it.qty.toLong())) }
            }.await()
            db.sales().markSynced(s.id)
        }
    }
}
