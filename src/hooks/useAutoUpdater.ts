import { useEffect } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { ask } from '@tauri-apps/plugin-dialog';
import { relaunch } from '@tauri-apps/plugin-process';

export function useAutoUpdater() {
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const update = await check();
        if (update) {
          console.log(`Update available: ${update.version}`);
          
          // Show a confirmation dialog
          const yes = await ask(
            `Update to ${update.version} is available!\n\nWould you like to download and install it now?`,
            {
              title: 'Update Available',
              kind: 'info'
            }
          );
          
          if (yes) {
            console.log('User chose to install update');
            try {
              await update.downloadAndInstall();
              await relaunch();
            } catch (error) {
              console.error('Failed to install update:', error);
            }
          }
        } else {
          console.log('No updates available');
        }
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    };

    // Check for updates on app startup
    checkForUpdates();

    // Optional: Check for updates periodically (every 4 hours)
    const interval = setInterval(checkForUpdates, 4 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
}