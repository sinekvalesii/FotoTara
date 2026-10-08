package com.scheck.pos.core.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "products", indices = [Index(value = ["barcode"], unique = true)])
data class ProductEntity(
    @PrimaryKey val id: String,
    val barcode: String,
    val name: String,
    val priceCents: Long,
    val stock: Int,
    val dirty: Boolean = false,
)

@Entity(tableName = "sales")
data class SaleEntity(@PrimaryKey val id: String, val cashierUid: String, val totalCents: Long, val createdAt: Long, val synced: Boolean = false)

@Entity(tableName = "sale_lines", primaryKeys = ["saleId", "productId"])
data class SaleLineEntity(val saleId: String, val productId: String, val qty: Int, val priceCents: Long)

@Dao
interface ProductDao {
    @Query("SELECT * FROM products ORDER BY name") fun observeAll(): Flow<List<ProductEntity>>
    @Query("SELECT * FROM products WHERE barcode = :barcode LIMIT 1") suspend fun byBarcode(barcode: String): ProductEntity?
    @Upsert suspend fun upsert(items: List<ProductEntity>)
    @Query("UPDATE products SET stock = stock - :qty WHERE id = :id AND stock >= :qty") suspend fun decrement(id: String, qty: Int): Int
}

@Dao
interface SaleDao {
    @Insert suspend fun insert(sale: SaleEntity)
    @Insert suspend fun insertLines(lines: List<SaleLineEntity>)
    @Query("SELECT * FROM sales WHERE synced = 0") suspend fun unsynced(): List<SaleEntity>
    @Query("SELECT * FROM sale_lines WHERE saleId = :id") suspend fun lines(id: String): List<SaleLineEntity>
    @Query("UPDATE sales SET synced = 1 WHERE id = :id") suspend fun markSynced(id: String)
}

@Database(entities = [ProductEntity::class, SaleEntity::class, SaleLineEntity::class], version = 1)
abstract class ScheckDb : RoomDatabase() {
    abstract fun products(): ProductDao
    abstract fun sales(): SaleDao
}
