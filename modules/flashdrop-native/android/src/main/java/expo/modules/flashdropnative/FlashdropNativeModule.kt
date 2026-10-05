package expo.modules.flashdropnative

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Modulo nativo pequeno do FlashDrop Motoboy:
//  - confere se o app pode "exibir sobre outros apps" e se esta isento da otimizacao de bateria
//  - abre as telas de configuracao certas do Android
//  - traz o app para a frente (usado quando chega pedido novo e o motoboy esta online e livre)
class FlashdropNativeModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private fun canDrawOverlays(): Boolean {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      Settings.canDrawOverlays(context)
    } else {
      true
    }
  }

  private fun isIgnoringBatteryOptimizations(): Boolean {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      val pm = context.getSystemService(Context.POWER_SERVICE) as PowerManager
      pm.isIgnoringBatteryOptimizations(context.packageName)
    } else {
      true
    }
  }

  private fun startSettings(intent: Intent): Boolean {
    return try {
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(intent)
      true
    } catch (e: Exception) {
      false
    }
  }

  private fun openOverlaySettings(): Boolean {
    val intent = Intent(
      Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
      Uri.parse("package:" + context.packageName)
    )
    if (startSettings(intent)) return true
    return startSettings(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION))
  }

  private fun openBatterySettings(): Boolean {
    // Abre a lista de apps sem otimizacao de bateria (nao exige permissao especial).
    if (startSettings(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS))) return true
    val intent = Intent(
      Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
      Uri.parse("package:" + context.packageName)
    )
    return startSettings(intent)
  }

  private fun bringAppToFront(): Boolean {
    return try {
      val intent = context.packageManager.getLaunchIntentForPackage(context.packageName)
      if (intent == null) {
        false
      } else {
        intent.addFlags(
          Intent.FLAG_ACTIVITY_NEW_TASK or
            Intent.FLAG_ACTIVITY_REORDER_TO_FRONT or
            Intent.FLAG_ACTIVITY_SINGLE_TOP
        )
        context.startActivity(intent)
        true
      }
    } catch (e: Exception) {
      false
    }
  }

  override fun definition() = ModuleDefinition {
    Name("FlashdropNative")

    Function("canDrawOverlays") {
      canDrawOverlays()
    }

    Function("isIgnoringBatteryOptimizations") {
      isIgnoringBatteryOptimizations()
    }

    Function("openOverlaySettings") {
      openOverlaySettings()
    }

    Function("openBatterySettings") {
      openBatterySettings()
    }

    Function("bringAppToFront") {
      bringAppToFront()
    }
  }
}
