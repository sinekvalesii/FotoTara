package com.scheck.pos

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.compose.*
import com.scheck.pos.auth.*
import com.scheck.pos.core.domain.*
import com.scheck.pos.core.plugin.ScheckPlugin
import com.scheck.pos.feature.inventory.InventoryScreen
import com.scheck.pos.feature.pos.PosScreen
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    @Inject lateinit var plugins: Set<@JvmSuppressWildcards ScheckPlugin>
    private val session: SessionViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MaterialTheme {
                when (val s = session.session.collectAsStateWithLifecycle().value) {
                    SessionState.Loading -> Box(Modifier.fillMaxSize()) { CircularProgressIndicator() }
                    SessionState.SignedOut -> LoginScreen(session)
                    is SessionState.SignedIn -> Home(s.user, plugins.filter { s.user.role.can(it.requires) }, session::logout)
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun Home(user: User, plugins: List<ScheckPlugin>, onLogout: () -> Unit) {
    val nav = rememberNavController()
    val current = nav.currentBackStackEntryAsState().value?.destination?.route
    Scaffold(
        topBar = {
            TopAppBar(title = { Text("S-Check • ${user.role}") }, actions = {
                plugins.forEach { p -> TextButton(onClick = { nav.navigate(p.route) }) { Text(p.title) } }
                IconButton(onClick = onLogout) { Icon(Icons.AutoMirrored.Filled.Logout, "Çıkış") }
            })
        },
        bottomBar = {
            NavigationBar {
                NavigationBarItem(current == "pos", { nav.navigate("pos") { launchSingleTop = true } }, { Icon(Icons.Default.PointOfSale, null) }, label = { Text("Satış") })
                if (user.role.can(Permission.VIEW_STOCK))
                    NavigationBarItem(current == "inventory", { nav.navigate("inventory") { launchSingleTop = true } }, { Icon(Icons.Default.Inventory, null) }, label = { Text("Stok") })
            }
        },
    ) { pad ->
        NavHost(nav, "pos", Modifier.padding(pad)) {
            composable("pos") { PosScreen() }
            composable("inventory") { InventoryScreen() }
            plugins.forEach { p -> composable(p.route) { p.Content() } }
        }
    }
}
