import fs from 'fs';
import { execSync } from 'child_process';

const envFile = fs.readFileSync('.env', 'utf8');
const lines = envFile.split('\n').filter(line => line.trim() !== '' && !line.startsWith('#'));

console.log('Pushing environment variables to Vercel...');

for (const line of lines) {
  const [key, ...rest] = line.split('=');
  const value = rest.join('=');
  
  if (key && value) {
    console.log(`Processing ${key}...`);
    
    // Write value to a temporary file to pipe into Vercel CLI
    fs.writeFileSync('.tmp-env-val', value.trim());
    
    const envs = ['production', 'preview', 'development'];
    for (const env of envs) {
      try {
        // Remove existing first to avoid conflicts (ignore errors if it doesn't exist)
        execSync(`npx vercel env rm ${key} ${env} -y`, { stdio: 'ignore' });
      } catch (e) {
        // Ignore removal errors
      }
      
      try {
        // Add the variable
        execSync(`npx vercel env add ${key} ${env} --yes < .tmp-env-val`, { stdio: 'ignore' });
        console.log(`  âœ“ Added to ${env}`);
      } catch (e) {
        console.log(`  âœ— Failed to add to ${env}`);
      }
    }
  }
}

// Cleanup
if (fs.existsSync('.tmp-env-val')) {
  fs.unlinkSync('.tmp-env-val');
}

console.log('Done pushing environment variables!');
