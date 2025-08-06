const GatePass = require('../models/GatePass');

class CleanupService {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
  }

  // Start the cleanup service
  start() {
    if (this.isRunning) {
      console.log('Cleanup service is already running');
      return;
    }

    console.log('Starting cleanup service...');
    this.isRunning = true;

    // Run cleanup immediately
    this.runCleanup();

    // Run cleanup every hour
    this.intervalId = setInterval(() => {
      this.runCleanup();
    }, 60 * 60 * 1000); // 1 hour in milliseconds

    console.log('Cleanup service started - will run every hour');
  }

  // Stop the cleanup service
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Cleanup service stopped');
  }

  // Run the cleanup process
  async runCleanup() {
    try {
      console.log('Running cleanup process...');
      
      // Clean up old pending gate passes (older than 24 hours)
      const deletedCount = await GatePass.cleanupOldPendingPasses();
      
      if (deletedCount > 0) {
        console.log(`✅ Cleanup completed: Removed ${deletedCount} old pending gate passes`);
      } else {
        console.log('✅ Cleanup completed: No old pending gate passes to remove');
      }
      
    } catch (error) {
      console.error('❌ Error during cleanup process:', error);
    }
  }

  // Manual cleanup trigger
  async triggerCleanup() {
    console.log('Manual cleanup triggered');
    await this.runCleanup();
  }

  // Get service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalId: this.intervalId !== null
    };
  }
}

// Create singleton instance
const cleanupService = new CleanupService();

module.exports = cleanupService;