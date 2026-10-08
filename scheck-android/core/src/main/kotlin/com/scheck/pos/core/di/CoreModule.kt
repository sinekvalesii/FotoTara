package com.scheck.pos.core.di

import android.content.Context
import androidx.room.Room
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.scheck.pos.core.data.*
import com.scheck.pos.core.data.local.ScheckDb
import com.scheck.pos.core.domain.*
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import javax.inject.Qualifier
import javax.inject.Singleton

@Qualifier annotation class AppScope

@Module
@InstallIn(SingletonComponent::class)
object CoreProvides {
    @Provides @Singleton fun db(@ApplicationContext c: Context) = Room.databaseBuilder(c, ScheckDb::class.java, "scheck.db").build()
    @Provides fun productDao(db: ScheckDb) = db.products()
    @Provides fun saleDao(db: ScheckDb) = db.sales()
    @Provides @Singleton fun auth(): FirebaseAuth = FirebaseAuth.getInstance()
    @Provides @Singleton fun firestore(): FirebaseFirestore = FirebaseFirestore.getInstance()
    @Provides @Singleton @AppScope fun scope() = CoroutineScope(SupervisorJob() + Dispatchers.IO)
}

@Module
@InstallIn(SingletonComponent::class)
abstract class CoreBinds {
    @Binds abstract fun auth(i: AuthRepositoryImpl): AuthRepository
    @Binds abstract fun products(i: ProductRepositoryImpl): ProductRepository
    @Binds abstract fun sales(i: SaleRepositoryImpl): SaleRepository
}
