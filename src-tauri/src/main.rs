// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // Initialize Sentry for error tracking
    let _guard = sentry::init(sentry::ClientOptions {
        dsn: Some("https://aa863010ee6b4bb2a87712081f3033af@o87060.ingest.us.sentry.io/3236212".parse().unwrap()),
        release: sentry::release_name!(),
        environment: Some(if cfg!(debug_assertions) { "development" } else { "production" }.into()),
        debug: cfg!(debug_assertions),
        auto_session_tracking: true,
        attach_stacktrace: true,
        ..Default::default()
    });

    // Add user context
    sentry::configure_scope(|scope| {
        scope.set_tag("platform", std::env::consts::OS);
        scope.set_tag("arch", std::env::consts::ARCH);
    });

    upcount_lib::run()
}