-- Fix finalize_transaction function permissions to allow anonymous users
-- This is needed because staff checkout may use anon key before staff login

-- Grant execute permission to anon users (for staff checkout page)
GRANT EXECUTE ON FUNCTION finalize_transaction(JSONB) TO anon;

-- Ensure authenticated users also have permission (redundant but explicit)
GRANT EXECUTE ON FUNCTION finalize_transaction(JSONB) TO authenticated;
