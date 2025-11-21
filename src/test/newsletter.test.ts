// Test for newsletter functionality
import { NewsletterService, NewsletterSubscription } from '../lib/newsletter';

describe('Newsletter Service', () => {
  beforeEach(() => {
    // Reset the service before each test
    (NewsletterService as any).subscribers = [];
  });

  test('should subscribe valid email', async () => {
    const result = await NewsletterService.subscribe('test@example.com');
    
    expect(result.success).toBe(true);
    expect(result.message).toContain('Thank you for subscribing');
    expect(NewsletterService.getSubscriberCount()).toBe(1);
  });

  test('should reject duplicate email', async () => {
    // First subscription
    await NewsletterService.subscribe('duplicate@example.com');
    
    // Second subscription with same email
    const result = await NewsletterService.subscribe('duplicate@example.com');
    
    expect(result.success).toBe(false);
    expect(result.message).toContain('already subscribed');
    expect(NewsletterService.getSubscriberCount()).toBe(1);
  });

  test('should reject invalid email', async () => {
    const result = await NewsletterService.subscribe('invalid-email');
    
    expect(result.success).toBe(false);
    expect(result.message).toContain('valid email');
  });

  test('should handle unsubscribe', async () => {
    await NewsletterService.subscribe('unsubscribe@example.com');
    const result = await NewsletterService.unsubscribe('unsubscribe@example.com');
    
    expect(result.success).toBe(true);
    expect(result.message).toContain('unsubscribed');
  });
});

// Manual test function for development
export async function runNewsletterTests() {
  console.log('🧪 Starting Newsletter Tests...');
  
  try {
    // Reset service
    (NewsletterService as any).subscribers = [];
    
    // Test 1: Valid email subscription
    console.log('📧 Testing valid email subscription...');
    const successResult = await NewsletterService.subscribe('success@test.com', 'Success User');
    console.log('✅ Success Result:', successResult);
    
    // Test 2: Duplicate email
    console.log('🔄 Testing duplicate email...');
    const duplicateResult = await NewsletterService.subscribe('success@test.com');
    console.log('⚠️ Duplicate Result:', duplicateResult);
    
    // Test 3: Invalid email
    console.log('❌ Testing invalid email...');
    const invalidResult = await NewsletterService.subscribe('not-an-email');
    console.log('❌ Invalid Result:', invalidResult);
    
    // Test 4: Unsubscribe
    console.log('🚪 Testing unsubscribe...');
    const unsubscribeResult = await NewsletterService.unsubscribe('success@test.com');
    console.log('🚪 Unsubscribe Result:', unsubscribeResult);
    
    // Final count
    console.log('📊 Final Subscriber Count:', NewsletterService.getSubscriberCount());
    
    console.log('🎉 All tests completed!');
    
  } catch (error) {
    console.error('💥 Test Error:', error);
  }
}

// Auto-run tests if this file is executed directly
if (require.main === module) {
  runNewsletterTests();
}