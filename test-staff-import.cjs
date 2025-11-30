console.log('Testing StaffApp import...');

try {
  // Test importing the StaffApp component
  const { default: StaffApp } = await import('./src/staff-app.tsx');
  console.log('✅ SUCCESS: StaffApp imported successfully');
  console.log('StaffApp component:', StaffApp);
} catch (error) {
  console.error('❌ ERROR importing StaffApp:', error.message);
  console.error('Stack:', error.stack);
}