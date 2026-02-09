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
    console.log(`   - Sources: ${result.sources?.join(', ') || 'None'}`);
    console.log(`   - Total fetched: ${result.total}`);
    console.log(`   - Matched: ${result.matched}`);
    console.log(`   - Modified: ${result.modified}`);
    console.log(`   - Inserted: ${result.upserted}`);
    console.log(`   - DB before: ${result.dbBefore}`);
    console.log(`   - DB after: ${result.dbAfter}`);
    console.log(`   - Net change: ${result.dbAfter - result.dbBefore}`);
    
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
