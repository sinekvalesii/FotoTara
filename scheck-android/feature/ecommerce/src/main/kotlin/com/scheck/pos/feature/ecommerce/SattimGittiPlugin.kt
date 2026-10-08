package com.scheck.pos.feature.ecommerce

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.scheck.pos.core.domain.Permission
import com.scheck.pos.core.plugin.ScheckPlugin
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import dagger.multibindings.IntoSet
import javax.inject.Inject

/** Pazar yeri entegrasyonu için genişleme noktası (ürün yayınlama, sipariş çekme). */
interface MarketplaceGateway {
    suspend fun publish(productId: String): Result<Unit>
}

class SattimGittiPlugin @Inject constructor() : ScheckPlugin {
    override val route = "sattimgitti"
    override val title = "SattımGitti"
    override val requires = Permission.MANAGE_USERS
    @Composable override fun Content() = Text("SattımGitti entegrasyonu yakında", Modifier.padding(16.dp))
}

@Module
@InstallIn(SingletonComponent::class)
abstract class EcommerceModule {
    @Binds @IntoSet abstract fun plugin(p: SattimGittiPlugin): ScheckPlugin
}
