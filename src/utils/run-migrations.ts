import { connectionSource } from 'src/config/typeorm';
export async function runMigrations() {
  try {
    // Initialize the data source
    await connectionSource.initialize();
    console.log('Data Source has been initialized!');

    // Check for pending migrations
    const pendingMigrations = await connectionSource.showMigrations();
    console.log('pendingMigrations: ', pendingMigrations);

    if (pendingMigrations) {
      const migrations = await connectionSource.runMigrations();
      console.log(`Migrations run: ${migrations.length}`);
    } else {
      console.log('No migrations to run.');
    }

    await connectionSource.destroy(); // Clean up
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1); // Exit with failure
  }
}
