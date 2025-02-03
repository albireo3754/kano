use tracing::level_filters::LevelFilter;
use tracing_subscriber::EnvFilter;

pub fn init_tracing() {
    let subscriber = tracing_subscriber::fmt::Subscriber::builder()
        .with_level(true)
        .with_env_filter(
            EnvFilter::builder()
                .with_default_directive(LevelFilter::INFO.into())
                .from_env_lossy(),
        )
        .with_file(true)
        .with_line_number(true)
        .with_thread_ids(true)
        .with_target(true)
        .finish();
    tracing::subscriber::set_global_default(subscriber).unwrap();
}
