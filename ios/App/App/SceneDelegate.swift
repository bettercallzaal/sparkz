import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = CAPBridgeViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)

        // Cold start from a trysparkz.com link: the bridge has just loaded the home page,
        // so open the linked page once that load has been queued.
        if let activity = connectionOptions.userActivities.first {
            DispatchQueue.main.async { [weak self] in
                _ = self?.openUniversalLink(activity)
            }
        }
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        // App already running: a tapped trysparkz.com link opens that page in the app.
        if openUniversalLink(userActivity) { return }
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }

    // Universal links (applinks:trysparkz.com in App.entitlements, matched by
    // /.well-known/apple-app-site-association on the site). Only Sparkz's own host is
    // loaded; anything else is left to Capacitor.
    private func openUniversalLink(_ activity: NSUserActivity) -> Bool {
        guard activity.activityType == NSUserActivityTypeBrowsingWeb,
              let url = activity.webpageURL,
              var parts = URLComponents(url: url, resolvingAgainstBaseURL: false),
              let host = parts.host?.lowercased(),
              host == "trysparkz.com" || host == "www.trysparkz.com",
              let bridge = window?.rootViewController as? CAPBridgeViewController,
              let webView = bridge.webView
        else { return false }
        parts.scheme = "https"
        parts.host = "trysparkz.com"
        guard let target = parts.url else { return false }
        webView.load(URLRequest(url: target))
        return true
    }
}
