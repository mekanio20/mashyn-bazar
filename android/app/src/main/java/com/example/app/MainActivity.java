package com.example.app;

import android.os.Bundle;
import android.webkit.JavascriptInterface;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // JS tarapdan: window.AndroidApp.exit() — programmany ýapýar ("Hawa" basylanda).
        getBridge().getWebView().addJavascriptInterface(new ExitBridge(), "AndroidApp");
    }

    private class ExitBridge {
        @JavascriptInterface
        public void exit() {
            runOnUiThread(() -> finishAffinity());
        }
    }
}
