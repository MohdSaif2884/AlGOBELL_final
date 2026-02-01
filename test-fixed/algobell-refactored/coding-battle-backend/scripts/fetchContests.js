#!/usr/bin/env node

/**
 * Fetch Contests Script
 * Manually trigger contest fetching from Kontests API
 */

require('dotenv').config();
const mongoose = require('mongoose');
const contestService = require('../services/contestService');
const config = require('../config');

async function main() {
  try {
    console.log('🚀 Starting contest fetch...\n');
    
    // Connect to MongoDB
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Connected to MongoDB\n');
    
    // Fetch and store contests
    const result = await contestService.fetchAndStoreContests();
    
    console.log('\n📊 Results:');
    console.log(`   - Total fetched: ${result.total}`);
    console.log(`   - Saved: ${result.savedCount}`);
    console.log(`   - Updated: ${result.updatedCount}`);
    
    // Update statuses
    console.log('\n⏳ Updating contest statuses...');
    await contestService.updateContestStatuses();
    console.log('✅ Statuses updated');
    
    console.log('\n✨ Done!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
