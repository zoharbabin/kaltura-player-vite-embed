/**
 * Test script for the Kaltura service
 * This script tests the KS generation functionality
 */
import { kalturaService } from './services/kaltura.service';

async function testKsGeneration() {
  try {
    console.log('Testing KS generation...');
    
    // Test with default entry ID
    console.log('Generating KS with default entry ID...');
    const ks = await kalturaService.generateKs();
    console.log('Generated KS:', ks);
    
    // Test with custom entry ID
    console.log('\nGenerating KS with custom entry ID...');
    const customKs = await kalturaService.generateKs({
      entryId: 'custom_entry_id'
    });
    console.log('Generated custom KS:', customKs);
    
    console.log('\nKS generation test completed successfully!');
  } catch (error) {
    console.error('Error during KS generation test:', error);
  }
}

// Run the test
testKsGeneration();