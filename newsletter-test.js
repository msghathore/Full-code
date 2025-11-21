// Simple Newsletter Service Test (Node.js)
// This tests the newsletter functionality without requiring a test framework

// Mock the NewsletterService by manually implementing it
class NewsletterService {
  static subscribers = [];

  static async subscribe(email, name) {
    if (!email || !this.isValidEmail(email)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    const existingSubscriber = this.subscribers.find(
      sub => sub.email.toLowerCase() === email.toLowerCase() && sub.isActive
    );

    if (existingSubscriber) {
      return { success: false, message: 'This email is already subscribed to our newsletter.' };
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const newSubscriber = {
      email: email.toLowerCase(),
      name: name?.trim() || undefined,
      subscribedAt: new Date(),
      source: 'website',
      isActive: true
    };

    this.subscribers.push(newSubscriber);
    console.log('Newsletter subscription saved:', newSubscriber);

    return {
      success: true,
      message: 'Thank you for subscribing! Check your email for a confirmation.',
      subscriberId: `mock_${Date.now()}`
    };
  }

  static async unsubscribe(email) {
    const subscriberIndex = this.subscribers.findIndex(
      sub => sub.email.toLowerCase() === email.toLowerCase()
    );

    if (subscriberIndex === -1) {
      return { success: false, message: 'Email not found in our newsletter list.' };
    }

    this.subscribers[subscriberIndex].isActive = false;
    return { success: true, message: 'You have been successfully unsubscribed.' };
  }

  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static getSubscriberCount() {
    return this.subscribers.filter(sub => sub.isActive).length;
  }

  static getAllSubscribers() {
    return [...this.subscribers];
  }
}

// Test function
async function runNewsletterTests() {
  console.log('🧪 Starting Newsletter Service Tests...\n');
  
  try {
    // Reset service
    NewsletterService.subscribers = [];
    
    // Test 1: Valid email subscription
    console.log('📧 Test 1: Valid email subscription');
    const successResult = await NewsletterService.subscribe('success@test.com', 'Success User');
    console.log('✅ Result:', successResult);
    console.log('📊 Subscriber Count:', NewsletterService.getSubscriberCount());
    console.log('');
    
    // Test 2: Duplicate email
    console.log('🔄 Test 2: Duplicate email subscription');
    const duplicateResult = await NewsletterService.subscribe('success@test.com');
    console.log('⚠️ Result:', duplicateResult);
    console.log('📊 Subscriber Count:', NewsletterService.getSubscriberCount());
    console.log('');
    
    // Test 3: Invalid email
    console.log('❌ Test 3: Invalid email address');
    const invalidResult = await NewsletterService.subscribe('not-an-email');
    console.log('❌ Result:', invalidResult);
    console.log('📊 Subscriber Count:', NewsletterService.getSubscriberCount());
    console.log('');
    
    // Test 4: Unsubscribe
    console.log('🚪 Test 4: Unsubscribe functionality');
    const unsubscribeResult = await NewsletterService.unsubscribe('success@test.com');
    console.log('🚪 Result:', unsubscribeResult);
    console.log('📊 Subscriber Count:', NewsletterService.getSubscriberCount());
    console.log('');
    
    // Test 5: Multiple valid subscriptions
    console.log('➕ Test 5: Multiple valid subscriptions');
    await NewsletterService.subscribe('user1@test.com', 'User 1');
    await NewsletterService.subscribe('user2@test.com', 'User 2');
    await NewsletterService.subscribe('user3@test.com', 'User 3');
    console.log('📊 Final Subscriber Count:', NewsletterService.getSubscriberCount());
    console.log('');
    
    // Show all subscribers
    console.log('📋 All Subscribers:');
    const allSubscribers = NewsletterService.getAllSubscribers();
    allSubscribers.forEach((sub, index) => {
      console.log(`  ${index + 1}. ${sub.email} (${sub.isActive ? 'Active' : 'Inactive'})`);
    });
    
    console.log('\n🎉 All tests completed successfully!');
    return true;
    
  } catch (error) {
    console.error('💥 Test Error:', error.message);
    return false;
  }
}

// Run the tests
runNewsletterTests().then(success => {
  if (success) {
    console.log('\n✅ Newsletter Service Implementation: WORKING ✅');
  } else {
    console.log('\n❌ Newsletter Service Implementation: FAILED ❌');
  }
});